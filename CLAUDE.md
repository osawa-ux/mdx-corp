@~/corp-site-internal/site/CLAUDE.full.md
<!-- 上の import は兄弟 clone にある全文版を読む。clone が無い PC では読まれないだけで、以下の縮小版のルールは効く。 -->

# CLAUDE.md — mdx-corp（公開 repo・縮小版）

MDX株式会社 公式サイト（`mdx-inc.co.jp`）の静的ソース。この repo は public。

## 運用ガード（編集前に必ず適用）

- `master` への反映がそのまま本番公開になる（GitHub Pages が master の root を直接配信。反映まで約 30〜60 秒）。
- 変更は feature branch → PR → merge で行う。master に直接 commit / push しない。
- repo 直下の `CNAME` と `.github/workflows/` 配下は触らない。変更が必要になったら変更せず、代表者に報告して停止する。
- 共通の `styles.css` / `script.js` を変えると全ページに波及する。変更が 1 ページ内で閉じているかを確認し、反映後に実ページで表示を確認するところまでを 1 タスクとする。
- 掲載する内容には、非公開側の全文版（1 行目の import 先）にだけ書いてある指定がある。全文版を読めない環境では、新しいサービス名・事例・ポータルの追加と、会社の表現方針に関わる文言の変更をせず、代表者に確認する。
- careers.html の給与・条件など労働条件の数値と文言は保護対象。言い回しの修正は可、金額と条件の変更は事前に代表者へ確認する。変更時は表示側と JSON-LD の両方を揃える。

## Jekyll の注意

- Jekyll が有効。`.nojekyll` を置かない。
- HTML / Markdown の冒頭に `---` 行を置かない。本文に `{{ }}` や `{% %}` をリテラルで書かない（Liquid として解釈されビルドが失敗する）。
- ビルドに失敗すると、エラー表示なしに直前の成功版が配信され続ける。HTTP 200 だけで成功と判断せず、Pages の build 状態（`gh api repos/osawa-ux/mdx-corp/pages/builds/latest`）の commit と公開 URL の内容一致まで確認する。
- サイト表示に不要なファイル（文書・スクリプト・設定類）を root に追加するときは `_config.yml` の `exclude:` に登録する。

## 内部文書の置き場

- この repo は public。内部向けの文書（ADR・runbook・運用手順・アカウントや設定の実名）はここに置かない。非公開 repo `mdx-corp/corp-site-internal` に置く。
- secret・個人情報をどのファイルにも書かない。
- `init-new-repo-claude` はこの repo では再実行しない。再実行すると `docs/decisions` の骨格が復活し、公開されてしまう。

## docs 構成

`docs/decisions` を含む `docs/` 配下はこの repo に置かない（上記の非公開 repo にある）。`docs/` を作り直さない。

## Obsidian 連携の最小ルール

作業メモ・判断の記録は、この repo ではなく外部のノート側に残す。vault の絶対パスをこのファイルに書かない。

## 開発コマンド

- build: なし。静的 HTML サイトで、ローカルの build コマンドは無い。master への反映で GitHub Pages が自動で Jekyll ビルド・配信する。確認は Pages の build 状態と公開 URL の内容一致で行う。
- test / lint: なし。
- 実行しない: `python tools/search_console_submit.py submit-and-check`（Search Console API へ実送信する運用スクリプト。本番の状態を変えるためローカルでは実行しない）。
