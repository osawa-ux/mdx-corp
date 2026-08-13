# Runbook: 求人掲載（JobPosting）の月次リフレッシュ

- 対象: `careers.html`（表示テキスト）と同ファイル内の `JobPosting` 構造化データ
- 起点: 2026-08-13 サイトレビュー P1-4
- 頻度: **月1回**（募集を継続している間）
- 所要: 5 分

## なぜやるか

Google しごと検索は、掲載終了日（`validThrough`）が無い求人や `datePosted` が古い求人の露出を絞る。
募集中なのに掲載が沈むのを防ぐため、月次で日付を更新する。

## 手順

1. `careers.html` の `JobPosting` を開き、次を更新する
   - `datePosted` — 再掲載した日（`YYYY-MM-DD`）
   - `validThrough` — 掲載期限（通常は 3 か月先）
2. **同じ変更で表示テキストも必ず揃える**（`.careers-hero-updated` の行）
   - 「掲載日」= `datePosted`
   - 「掲載期限」= `validThrough`
   - 「最終更新日」= 実際に編集した日
   - ※ 表示と JSON-LD の不一致は虚偽広告リスクになる（repo CLAUDE.md の運用ガード 2）
3. `sitemap.xml` の `careers.html` の `lastmod` を同じ日付にする
4. commit → push（`master` への push は即本番公開）
5. push 後 2 分待って `https://mdx-inc.co.jp/careers.html` を開き、表示が更新されているか確認する

## 確認

```bash
# JSON-LD が壊れていないか（3 ブロックすべて parse できること）
python - <<'PY'
import io, re, json
s = io.open("careers.html", encoding="utf-8").read()
for i, m in enumerate(re.finditer(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)):
    json.loads(m.group(1)); print("ok", i)
PY
```

Google のリッチリザルトテスト（https://search.google.com/test/rich-results）に `https://mdx-inc.co.jp/careers.html` を入れ、`JobPosting` が検出され警告が出ていないことを確認する。

## 募集を終了するとき

- `validThrough` を終了日に設定する（削除しない）
- ページ本文にも募集終了の旨を明記する
- 求人が完全に終了したら `JobPosting` ブロックごと削除するのではなく、まず `validThrough` を過去日にして
  Google 側の掲載が落ちるのを確認してから削除する

## 触ってはいけないもの

給与・固定残業代・試用期間・賞与・応募条件の**金額と条件文言**、および `JobPosting` の
`baseSalary` / `employmentType` / 必須条件に対応するフィールドは社労士確認済みの値。
変更には院長の事前確認が必要（repo CLAUDE.md の運用ガード 2）。本 runbook で触るのは**日付フィールドのみ**。
