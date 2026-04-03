# Search Console・GA4 初期運用メモ

MDX株式会社コーポレートサイト（mdx-inc.co.jp）の公開後1か月間の運用ガイドです。

---

## 初日にやること

### Search Console

- [ ] Domain property（`mdx-inc.co.jp`）で登録されているか確認
  - Domain property を使う理由：http / https / www あり・なし をすべてまとめて管理できる
  - URL-prefix は個別URLごとの管理になるため、小規模サイトでは不要
- [ ] 所有権確認が完了しているか確認（緑チェックが出ていればOK）
- [ ] サイトマップを送信
  - 左メニュー「サイトマップ」→ `https://mdx-inc.co.jp/sitemap.xml` を入力して送信
- [ ] トップページの URL 検査を実行
  - 上部の検索バーに `https://mdx-inc.co.jp/` を入力
  - 「インデックス登録をリクエスト」を押す
  - 他のページ（privacy.html 等）は初日にやらなくてよい

### GA4

- [ ] GA4 のタグが設置されているか確認
  - index.html の `<head>` 内に `gtag.js` または Google Tag Manager のスニペットがあるか
  - 見つからない場合はタグ未設置のため追加が必要
- [ ] リアルタイムレポートで自分のアクセスが見えるか確認
  - GA4 → レポート → リアルタイム を開く
  - 別タブで `https://mdx-inc.co.jp` にアクセスする
  - 1〜2分以内にリアルタイムにユーザー「1」が表示されればOK
- [ ] まったく表示されない場合はタグ設置漏れ・測定IDの不一致を疑う

---

## 1週間以内に見ること

### Search Console

- [ ] サイトマップのステータスが「成功」になっているか
  - 左メニュー「サイトマップ」→ ステータス列を確認
- [ ] インデックスされたページ数を確認
  - 左メニュー「ページ」→「インデックスに登録済み」の件数
  - トップページが1件でも登録されていれば正常
- [ ] エラーや警告が出ていないか確認
  - 「ページ」画面の上部にエラー件数が表示される
  - 0件なら問題なし
- [ ] 検索パフォーマンスで表示回数が出始めているか確認
  - 左メニュー「検索パフォーマンス」
  - 表示回数が1以上あれば Google に認識されている
  - まだ0でも公開1週間なら焦らなくてよい

### GA4

- [ ] 過去7日間のレポートでアクセスが記録されているか
  - レポート → エンゲージメント → ページとスクリーン
  - 自分のアクセスだけでも数件記録されていればOK
- [ ] アクセスがゼロのまま → タグ設置・測定ID・フィルタ設定を再確認

---

## 1か月以内に見ること

### Search Console

- [ ] 主要ページがインデックスされているか確認
  - トップページ、careers.html が登録されていることを確認
  - privacy.html / disclaimer.html はインデックスされなくても問題なし
- [ ] 検索パフォーマンスの傾向を確認
  - 表示回数・クリック数が少しでも増加傾向にあるか
  - 検索クエリ（どんなキーワードで表示されたか）を確認
- [ ] 「ウェブに関する主な指標」を確認
  - 左メニュー「エクスペリエンス」→「ウェブに関する主な指標」
  - 「不良」が出ていたら表示速度やレイアウトの改善を検討

### GA4

- [ ] 月間のページビュー数・ユーザー数を確認
  - レポート → エンゲージメント → 概要
  - 数十〜数百程度でも、公開初月としては正常
- [ ] どのページが見られているか確認
  - トップページがほとんどでも初月は問題なし
- [ ] 流入元（参照元）を確認
  - レポート → 集客 → トラフィック獲得
  - Direct / Organic Search / Referral などの割合を把握

---

## 初日はやらなくてよいこと

- キーワード順位の細かい分析
- ページごとの高度なSEO改善
- 被リンク分析
- 離脱率・回遊率の議論
- データが少ない段階での結論出し
- 他社との順位比較

公開初月は「登録されているか」「計測できているか」「エラーがないか」の3点だけ確認すれば十分です。

---

## 異常と判断すべき兆候

| 状況 | 対応 |
|---|---|
| 1週間経ってもインデックス0件 | URL検査で再リクエスト。robots.txt でブロックしていないか確認 |
| サイトマップのステータスが「エラー」 | sitemap.xml の形式・URLが正しいか確認 |
| GA4 のリアルタイムに何も出ない | gtag.js の設置漏れ・測定IDの不一致を確認 |
| Search Console に「セキュリティの問題」が出る | 即座に確認・対応（マルウェア等の可能性） |
| 表示回数はあるがクリック数がゼロ | 初月はよくあること。タイトル・説明文を改善する余地あり |

---

---

## Search Console API ツール (自動化)

`tools/search_console_submit.py` を使うと、sitemap 再送信と URL Inspection を CLI から実行できます。

### 事前設定

#### 1. Google Cloud 側

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成（既存でもOK）
2. 「APIとサービス」→「ライブラリ」から以下を有効化
   - **Google Search Console API**
3. 認証方式を選ぶ（下記いずれか）

#### 2a. OAuth 2.0（ローカル実行向け・推奨）

1. 「APIとサービス」→「認証情報」→「OAuth クライアントID を作成」
   - アプリケーションの種類: **デスクトップアプリ**
2. JSON ファイルをダウンロードし、プロジェクトルートに `credentials.json` として配置
3. 初回実行時にブラウザが開き Google アカウントで認証
4. 認証後 `token.json` が自動生成され、以降は再認証不要

#### 2b. サービスアカウント（GitHub Actions 向け）

1. 「APIとサービス」→「認証情報」→「サービスアカウントを作成」
2. キーを JSON 形式でダウンロード
3. Search Console → 設定 → ユーザーと権限 → 該当サービスアカウントのメールアドレスを **所有者** として追加
4. 環境変数 `GOOGLE_APPLICATION_CREDENTIALS` にキーファイルのパスを指定

#### 3. 環境変数

```bash
cp .env.example .env
# .env を編集して設定値を確認
```

#### 4. Python 依存インストール

```bash
pip install -r requirements.txt
```

### 実行コマンド

```bash
# sitemap.xml を再送信
python tools/search_console_submit.py submit-sitemap

# 特定URLの Inspection
python tools/search_console_submit.py inspect --url https://mdx-inc.co.jp/

# デフォルトURL (トップ + careers + privacy + disclaimer) をまとめて Inspection
python tools/search_console_submit.py inspect-defaults

# 一括実行: sitemap再送信 → Inspection → 結果まとめ
python tools/search_console_submit.py submit-and-check

# 結果を JSON に保存
python tools/search_console_submit.py submit-and-check --json results.json
```

### よくあるエラー

| エラー | 原因 | 対処 |
|---|---|---|
| HTTP 401 | トークン期限切れ | `token.json` を削除して再実行 |
| HTTP 403 | アクセス権なし | Search Console でアカウントが所有者かフルユーザーか確認 |
| HTTP 404 | プロパティ未登録 or URL不一致 | `.env` の `SEARCH_CONSOLE_SITE_URL` を確認 |
| HTTP 429 | API 呼び出し上限 | 時間をおいて再実行（自動リトライあり） |
| `credentials.json` が見つからない | OAuth 設定漏れ | Google Cloud Console からダウンロードして配置 |

### 自動化できる範囲と手動作業の切り分け

#### API で自動化できること

| 操作 | コマンド | 説明 |
|---|---|---|
| Sitemap 再送信 | `submit-sitemap` | sitemap.xml を GSC に再送信 |
| インデックス状態確認 | `inspect` / `inspect-defaults` | 各URLの登録状況・canonical・クロール日時を取得 |
| 一括実行 | `submit-and-check` | 上記をまとめて実行し結果を要約 |
| CI/CD 連携 | GitHub Actions | HTML/sitemap変更時に自動実行 |

#### 人間がGSC画面で手動実行する必要がある操作

| 操作 | 理由 |
|---|---|
| **「インデックス登録をリクエスト」** | URL Inspection API は状態確認のみ。登録リクエスト送信は GSC の URL検査画面からのみ可能 |
| **プロパティの所有権確認** | DNS / HTMLタグ / Google Analytics 等による初回検証が必要 |
| **ユーザー・権限管理** | GSC 設定画面で手動操作 |
| **手動ペナルティの解除申請** | セキュリティの問題 → 再審査リクエストは画面のみ |
| **検索パフォーマンスの詳細分析** | クエリ・CTR・順位のトレンド分析は GSC 画面が最適 |

### GitHub Actions での自動実行

`.github/workflows/search-console-submit.yml` が用意済みです。

有効化するには:
1. サービスアカウントのキー JSON の内容をコピー
2. GitHub リポジトリ → Settings → Secrets → `GOOGLE_SA_KEY_JSON` として登録
3. master への push 時に自動実行される（HTML / sitemap.xml の変更時のみ）

手動実行: Actions タブ → Search Console Submit → Run workflow

---

## 参考リンク

- Search Console: https://search.google.com/search-console
- Search Console API ドキュメント: https://developers.google.com/webmaster-tools/v1/api_reference_index
- URL Inspection API: https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
- GA4: https://analytics.google.com
- OGP 確認: https://www.opengraph.xyz
- サイトマップ: https://mdx-inc.co.jp/sitemap.xml
