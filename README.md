# MDX株式会社 コーポレートサイト

MDX株式会社の静的コーポレートサイト。
BtoB向けに、医療・介護DX支援・ポータル運営・IT/AI活用支援・業務改善・データ活用・SCS事業の6領域を紹介するサイトです。

**公開URL:** https://mdx-inc.co.jp/

## 使用技術

- HTML / CSS / JavaScript（フレームワークなし）
- GitHub Pages（ホスティング）
- Formspree（問い合わせフォーム）
- Google Fonts（Noto Sans JP）
- Python（Search Console API ツール）

## ファイル構成

```
mdx-corp/
├── index.html              # メインページ（全セクション含む）
├── careers.html            # 採用情報ページ
├── privacy.html            # プライバシーポリシー
├── disclaimer.html         # 免責事項
├── styles.css              # 全ページ共通スタイル
├── script.js               # フォーム送信・ナビ・アニメーション
├── sitemap.xml             # サイトマップ（Search Console用）
├── robots.txt              # クロール制御
├── favicon.ico             # favicon（16x16 / 32x32）
├── favicon.svg             # favicon（SVG版）
├── apple-touch-icon.png    # Apple Touch Icon（180x180）
├── CNAME                   # GitHub Pages カスタムドメイン設定
├── .env.example            # 環境変数テンプレート
├── requirements.txt        # Python 依存ライブラリ
├── assets/
│   └── ogp/
│       ├── ogp.png         # OGP画像（1200x630）
│       └── ogp.svg         # OGP画像元データ
├── tools/
│   └── search_console_submit.py  # Search Console API ツール
├── docs/
│   ├── seo-operations.md         # SEO運用ガイド・APIツール設定手順
│   └── site-launch-checklist.md  # 公開後チェックリスト
└── .github/
    └── workflows/
        └── search-console-submit.yml  # 自動sitemap再送信
```

## 主要事業（6領域）

| # | 事業名 | 概要 |
|---|---|---|
| 01 | 医療・介護DX支援 | 現場に寄り添うIT導入・定着支援 |
| 02 | ポータルサイト運営 | 業界特化型ポータルの企画・運営 |
| 03 | IT・AI活用支援 | AI導入・業務自動化・実装・保守 |
| 04 | 業務改善・デジタル基盤整備 | フォーム・管理画面・ワークフロー整備 |
| 05 | データ活用・可視化支援 | 散在する情報を判断に使える形へ |
| 06 | SCS事業 | セキュリティ対応支援・評価・改善 |

## よく更新する箇所

| 変更内容 | ファイル | 場所 |
|---|---|---|
| 会社情報（所在地・設立・代表者） | `index.html` | `#company` テーブル内 |
| お問い合わせ先メール | `index.html` / `privacy.html` | 会社情報テーブル / お問い合わせ窓口 |
| 事業内容の文言 | `index.html` | `#services` セクション |
| Formspree フォームID | `script.js` | 先頭付近の `FORMSPREE_FORM_ID` |
| OGP画像 | `assets/ogp/ogp.png` | head内の `og:image` パスは変更不要 |
| privacy / disclaimer 更新日 | 各HTML | `.policy-updated` の日付テキスト |
| 採用情報の募集要項 | `careers.html` | 募集要項テーブル |
| 採用応募フォーム | `careers.html` | Google フォームへのリンク |

## Formspree 設定

フォームIDは `script.js` の1箇所のみ：

```javascript
var FORMSPREE_FORM_ID = 'xreydklq';
```

- Formspree ダッシュボード: https://formspree.io
- 通知先メールの変更: ダッシュボード → Workflow → Email

### テスト送信手順

1. サイトのお問い合わせフォームからテスト送信
2. 「お問い合わせを受け付けました」が表示されるか確認
3. Formspree ダッシュボードの Submissions に届いているか確認
4. 通知先メールに届いているか確認

## Search Console API ツール

sitemap 再送信と URL Inspection を CLI から実行できます。

### セットアップ

```bash
pip install -r requirements.txt
cp .env.example .env
# .env を編集、credentials.json を配置
```

### 実行コマンド

```bash
# sitemap 再送信
python tools/search_console_submit.py submit-sitemap

# デフォルトURL (全4ページ) を検査
python tools/search_console_submit.py inspect-defaults

# 一括実行: sitemap再送信 → Inspection → 結果まとめ
python tools/search_console_submit.py submit-and-check
```

詳細な設定手順は [docs/seo-operations.md](docs/seo-operations.md) を参照してください。

## GitHub Pages 運用

- **ブランチ:** `master` の `/`（root）から配信
- **カスタムドメイン:** `mdx-inc.co.jp`（GitHub Pages Settings で設定済み）
- **HTTPS:** Enforce HTTPS 有効
- **DNS:** お名前.com で A レコード（GitHub Pages IP × 4）+ CNAME（www → osawa-ux.github.io）
- **メール:** Google Workspace（info@mdx-inc.co.jp）設定済み・MXレコード反映済み
- **CNAME ファイル:** 削除厳禁（カスタムドメインが外れる）

## 更新手順

```bash
# 1. 最新を取得
git pull

# 2. ファイルを編集

# 3. コミット & プッシュ
git add <変更ファイル>
git commit -m "変更内容の説明"
git push

# 4. 2〜3分後にサイトで反映を確認

# 5. (任意) Search Console に sitemap 再送信
python tools/search_console_submit.py submit-and-check
```

## 公開後の確認ポイント

- [ ] フォームからテスト送信 → メールが届くか
- [ ] スマホで表示崩れがないか
- [ ] favicon がブラウザタブに表示されるか
- [ ] OGP画像が正しく表示されるか（https://www.opengraph.xyz で確認）
- [ ] privacy.html / disclaimer.html / careers.html のリンクが動作するか
- [ ] Search Console でエラーがないか

詳細なチェックリストは [docs/site-launch-checklist.md](docs/site-launch-checklist.md) を参照してください。

## 採用ページ

- **応募フォーム:** Google フォーム（外部リンク）
- **フォーム通知:** Google フォーム側で設定（Formspreeとは別管理）
- **NG表現:** 医療・クリニック・患者などの表現は使用しない（IT/DX企業として表現）

## 注意事項

- `CNAME` ファイルは削除しないこと（カスタムドメインが外れる）
- Formspree は Pro プラン（月5,000件）に課金済み
- OGP画像を差し替えた場合、SNS側のキャッシュ反映に時間がかかる
- `sitemap.xml` にページを追加した場合、Search Console で再送信する
- `credentials.json` / `token.json` は `.gitignore` で除外済み — リポジトリにコミットしないこと
