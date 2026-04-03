#!/usr/bin/env python3
"""
Google Search Console API ツール

sitemap 再送信と URL Inspection を CLI で実行する。
MDX株式会社コーポレートサイト (mdx-inc.co.jp) 向けに作成。
サイト固有値は .env / 環境変数で管理し、他サイトへの流用も可能。

認証方式:
  - 優先: OAuth 2.0 ユーザー認証 (ローカル実行向け)
    初回のみブラウザ認証、以降は token.json を再利用
  - 代替: サービスアカウント (GitHub Actions 向け)
    環境変数 GOOGLE_APPLICATION_CREDENTIALS にキーファイルパスを指定

使い方:
  python tools/search_console_submit.py submit-sitemap
  python tools/search_console_submit.py inspect --url https://mdx-inc.co.jp/
  python tools/search_console_submit.py inspect-defaults
  python tools/search_console_submit.py submit-and-check
  python tools/search_console_submit.py submit-and-check --json results.json
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# 依存ライブラリのインポート (不足時に分かりやすいメッセージを出す)
# ---------------------------------------------------------------------------
try:
    from dotenv import load_dotenv
except ImportError:
    print("エラー: python-dotenv がインストールされていません")
    print("  pip install python-dotenv")
    sys.exit(1)

try:
    from google.oauth2 import service_account
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("エラー: Google API ライブラリがインストールされていません")
    print("  pip install google-api-python-client google-auth-oauthlib google-auth-httplib2")
    sys.exit(1)

# ---------------------------------------------------------------------------
# 設定
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

# .env を読み込み (プロジェクトルート)
load_dotenv(PROJECT_ROOT / ".env")

SITE_URL = os.getenv("SEARCH_CONSOLE_SITE_URL", "https://mdx-inc.co.jp/")
SITEMAP_URL = os.getenv("SEARCH_CONSOLE_SITEMAP_URL", "https://mdx-inc.co.jp/sitemap.xml")

# URL Inspection のデフォルト対象
_default_urls = os.getenv(
    "INSPECT_DEFAULT_URLS",
    "https://mdx-inc.co.jp/,https://mdx-inc.co.jp/careers.html",
)
DEFAULT_INSPECT_URLS = [u.strip() for u in _default_urls.split(",") if u.strip()]

# OAuth 関連パス
OAUTH_CREDENTIALS_FILE = os.getenv(
    "OAUTH_CREDENTIALS_FILE",
    str(PROJECT_ROOT / "credentials.json"),
)
TOKEN_FILE = os.getenv("TOKEN_FILE", str(PROJECT_ROOT / "token.json"))

# API スコープ
SCOPES = [
    "https://www.googleapis.com/auth/webmasters",          # Search Console
    "https://www.googleapis.com/auth/webmasters.readonly",  # 読み取り
]

# リトライ設定
MAX_RETRIES = 3
RETRY_BACKOFF = 2  # 秒 (指数バックオフの基数)


# ---------------------------------------------------------------------------
# 認証
# ---------------------------------------------------------------------------
def get_credentials():
    """認証情報を取得する。サービスアカウント → OAuth の順で試行。"""

    # --- サービスアカウント ---
    sa_key = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if sa_key and Path(sa_key).exists():
        print("[認証] サービスアカウントを使用")
        return service_account.Credentials.from_service_account_file(
            sa_key, scopes=SCOPES
        )

    # --- OAuth 2.0 ---
    creds = None

    # 既存トークンの読み込み
    if Path(TOKEN_FILE).exists():
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    # トークンが無効 or 期限切れ → リフレッシュ or 再認証
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("[認証] トークンをリフレッシュ中...")
            try:
                creds.refresh(Request())
            except Exception as e:
                print(f"[認証] リフレッシュ失敗: {e}")
                creds = None

        if not creds:
            if not Path(OAUTH_CREDENTIALS_FILE).exists():
                print("エラー: 認証情報ファイルが見つかりません")
                print(f"  期待されるパス: {OAUTH_CREDENTIALS_FILE}")
                print()
                print("以下のいずれかを設定してください:")
                print("  1. OAuth: Google Cloud Console から credentials.json をダウンロードし、")
                print(f"     {OAUTH_CREDENTIALS_FILE} に配置")
                print("  2. サービスアカウント: 環境変数 GOOGLE_APPLICATION_CREDENTIALS に")
                print("     キーファイルのパスを設定")
                sys.exit(1)

            print("[認証] ブラウザで Google 認証を行います...")
            flow = InstalledAppFlow.from_client_secrets_file(
                OAUTH_CREDENTIALS_FILE, SCOPES
            )
            creds = flow.run_local_server(port=0)

        # トークン保存
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())
        print(f"[認証] トークンを保存しました: {TOKEN_FILE}")

    print("[認証] OAuth 2.0 ユーザー認証を使用")
    return creds


def build_service(creds, api="webmasters", version="v3"):
    """Google API クライアントを構築する。"""
    return build(api, version, credentials=creds, cache_discovery=False)


# ---------------------------------------------------------------------------
# API 呼び出しのリトライラッパー
# ---------------------------------------------------------------------------
def api_call_with_retry(func, *args, **kwargs):
    """一時的エラー (429, 500, 503) をリトライする。"""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return func(*args, **kwargs)
        except HttpError as e:
            status = e.resp.status
            if status in (429, 500, 503) and attempt < MAX_RETRIES:
                wait = RETRY_BACKOFF ** attempt
                print(f"  [リトライ] HTTP {status} — {wait}秒後に再試行 ({attempt}/{MAX_RETRIES})")
                time.sleep(wait)
                continue
            raise


# ---------------------------------------------------------------------------
# サブコマンド: submit-sitemap
# ---------------------------------------------------------------------------
def cmd_submit_sitemap(args):
    """sitemap.xml を Search Console に再送信する。"""
    print("=" * 60)
    print("Sitemap 再送信")
    print("=" * 60)
    print(f"  プロパティ:  {SITE_URL}")
    print(f"  Sitemap URL: {SITEMAP_URL}")
    print()

    creds = get_credentials()
    service = build_service(creds)

    try:
        api_call_with_retry(
            service.sitemaps().submit(
                siteUrl=SITE_URL,
                feedpath=SITEMAP_URL,
            ).execute
        )
        print("[成功] sitemap.xml を再送信しました")
    except HttpError as e:
        _handle_http_error(e, "sitemap 再送信")
        return False

    # 送信後のステータス確認
    print()
    print("送信済みサイトマップの状態:")
    try:
        result = api_call_with_retry(
            service.sitemaps().get(
                siteUrl=SITE_URL,
                feedpath=SITEMAP_URL,
            ).execute
        )
        print(f"  パス:       {result.get('path', '-')}")
        print(f"  最終送信日: {result.get('lastSubmitted', '-')}")
        print(f"  URL数:      {result.get('contents', [{}])[0].get('submitted', '-')}")
        print(f"  警告数:     {result.get('warnings', '0')}")
        print(f"  エラー数:   {result.get('errors', '0')}")
    except HttpError:
        print("  (ステータス取得はスキップ — 再送信は完了しています)")

    return True


# ---------------------------------------------------------------------------
# サブコマンド: inspect
# ---------------------------------------------------------------------------
def run_inspection(service, url):
    """1件の URL Inspection を実行し、結果を返す。"""
    print(f"\n  URL: {url}")

    try:
        result = api_call_with_retry(
            service.urlInspection().index().inspect(
                body={
                    "inspectionUrl": url,
                    "siteUrl": SITE_URL,
                }
            ).execute
        )
    except HttpError as e:
        _handle_http_error(e, f"URL Inspection ({url})")
        return None

    inspection = result.get("inspectionResult", {})
    index_status = inspection.get("indexStatusResult", {})
    crawl = index_status.get("crawledAs", "-")
    verdict = index_status.get("verdict", "-")
    coverage = index_status.get("coverageState", "-")
    indexing = index_status.get("indexingState", "-")
    canonical = index_status.get("googleCanonical", "-")
    user_canonical = index_status.get("userCanonical", "-")
    last_crawl = index_status.get("lastCrawlTime", "-")
    robots = index_status.get("robotsTxtState", "-")

    print(f"  判定:             {verdict}")
    print(f"  カバレッジ:       {coverage}")
    print(f"  インデックス状態: {indexing}")
    print(f"  クロール方法:     {crawl}")
    print(f"  最終クロール:     {last_crawl}")
    print(f"  robots.txt:       {robots}")
    print(f"  Google canonical: {canonical}")
    print(f"  User canonical:   {user_canonical}")

    return {
        "url": url,
        "verdict": verdict,
        "coverageState": coverage,
        "indexingState": indexing,
        "crawledAs": crawl,
        "lastCrawlTime": last_crawl,
        "robotsTxtState": robots,
        "googleCanonical": canonical,
        "userCanonical": user_canonical,
    }


def cmd_inspect(args):
    """指定URLの URL Inspection を実行する。"""
    urls = [args.url] if hasattr(args, "url") and args.url else DEFAULT_INSPECT_URLS

    print("=" * 60)
    print("URL Inspection")
    print("=" * 60)
    print(f"  プロパティ: {SITE_URL}")
    print(f"  対象URL数:  {len(urls)}")

    creds = get_credentials()
    service = build_service(creds, api="searchconsole", version="v1")

    results = []
    for url in urls:
        result = run_inspection(service, url)
        if result:
            results.append(result)
        # quota 配慮: 連続呼び出しの間隔を空ける
        if len(urls) > 1:
            time.sleep(1)

    return results


def cmd_inspect_single(args):
    """単一URLの inspection。"""
    return cmd_inspect(args)


def cmd_inspect_defaults(args):
    """デフォルトURLをまとめて inspection。"""
    # url 属性を持たない args を渡して DEFAULT_INSPECT_URLS を使わせる
    args.url = None
    return cmd_inspect(args)


# ---------------------------------------------------------------------------
# サブコマンド: submit-and-check
# ---------------------------------------------------------------------------
def cmd_submit_and_check(args):
    """sitemap 再送信 → デフォルトURL inspection → 結果まとめ。"""
    print("=" * 60)
    print("Submit & Check (一括実行)")
    print("=" * 60)
    print()

    # 1. Sitemap 再送信
    sitemap_ok = cmd_submit_sitemap(args)

    print()
    print("-" * 60)

    # 2. URL Inspection
    args.url = None
    inspection_results = cmd_inspect(args)

    # 3. まとめ
    print()
    print("=" * 60)
    print("結果まとめ")
    print("=" * 60)
    print(f"  Sitemap 再送信: {'成功' if sitemap_ok else '失敗'}")
    if inspection_results:
        for r in inspection_results:
            status = "OK" if r["verdict"] == "PASS" else r["verdict"]
            print(f"  {r['url']}: {status} ({r['coverageState']})")
    else:
        print("  URL Inspection: 結果なし")

    # JSON 保存
    if hasattr(args, "json") and args.json:
        output = {
            "sitemap_submitted": sitemap_ok,
            "site_url": SITE_URL,
            "sitemap_url": SITEMAP_URL,
            "inspections": inspection_results or [],
        }
        output_path = Path(args.json)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print(f"\n  結果を保存しました: {output_path}")

    return sitemap_ok and bool(inspection_results)


# ---------------------------------------------------------------------------
# エラーハンドリング
# ---------------------------------------------------------------------------
def _handle_http_error(e, context="API呼び出し"):
    """HttpError を利用者向けメッセージに変換する。"""
    status = e.resp.status
    detail = ""
    try:
        body = json.loads(e.content)
        detail = body.get("error", {}).get("message", "")
    except (json.JSONDecodeError, AttributeError):
        detail = str(e)

    print(f"\n[エラー] {context} が失敗しました (HTTP {status})")

    messages = {
        401: "認証情報が無効です。token.json を削除して再認証してください。",
        403: "権限がありません。Search Console でこのプロパティへのアクセス権を確認してください。\n"
             "  サービスアカウントの場合、Search Console の設定 → ユーザーと権限 で\n"
             "  該当アカウントを「所有者」として追加する必要があります。",
        404: "プロパティまたはURLが見つかりません。\n"
             f"  SEARCH_CONSOLE_SITE_URL の値を確認してください: {SITE_URL}",
        429: "API の呼び出し上限に達しました。しばらく待ってから再試行してください。",
    }

    if status in messages:
        print(f"  {messages[status]}")
    else:
        print(f"  {detail}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Google Search Console API ツール — sitemap再送信 & URL Inspection",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用例:
  python tools/search_console_submit.py submit-sitemap
  python tools/search_console_submit.py inspect --url https://mdx-inc.co.jp/
  python tools/search_console_submit.py inspect-defaults
  python tools/search_console_submit.py submit-and-check
  python tools/search_console_submit.py submit-and-check --json results.json
        """,
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # submit-sitemap
    subparsers.add_parser(
        "submit-sitemap",
        help="sitemap.xml を Search Console に再送信する",
    )

    # inspect
    p_inspect = subparsers.add_parser(
        "inspect",
        help="指定URLの URL Inspection を実行する",
    )
    p_inspect.add_argument(
        "--url", required=True,
        help="検査対象の URL",
    )

    # inspect-defaults
    subparsers.add_parser(
        "inspect-defaults",
        help="デフォルトURL (トップ, careers) をまとめて検査する",
    )

    # submit-and-check
    p_combo = subparsers.add_parser(
        "submit-and-check",
        help="sitemap再送信 → URL Inspection → 結果まとめ",
    )
    p_combo.add_argument(
        "--json",
        help="結果をJSONファイルに保存するパス",
    )

    args = parser.parse_args()

    commands = {
        "submit-sitemap": cmd_submit_sitemap,
        "inspect": cmd_inspect_single,
        "inspect-defaults": cmd_inspect_defaults,
        "submit-and-check": cmd_submit_and_check,
    }

    success = commands[args.command](args)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
