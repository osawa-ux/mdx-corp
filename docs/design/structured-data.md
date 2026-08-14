# 構造化データの設計メモ

対象: `index.html` / `about.html` / `careers.html` / `works.html` / `works/*.html` の `application/ld+json`。

## 実装している型

| ページ | 型 |
|---|---|
| index | `Organization` / `Service`×3 / `FAQPage`(5問) |
| about | `Organization` / `BreadcrumbList` |
| careers | `BreadcrumbList` / `JobPosting` / `FAQPage`(9問) |
| works・works/* | `BreadcrumbList` ほか |
| 404 | なし（`noindex, follow`） |

## `Organization.sameAs` に何を載せるか

**判定基準: その URL が MDX株式会社を一意に指すことを、実ブラウザで確認できたものだけ載せる。**
候補サイトの多くが JS レンダリングのため、`curl` の HTTP 200 だけでは判定できない（フォームの
シェルだけ返ってくる）。必ずレンダリング後の DOM で商号・法人番号・所在地を確認する。

### 採用したもの

- 国税庁法人番号公表サイト `https://www.houjin-bangou.nta.go.jp/henkorireki-johoto.html?selHouzinNo=3020001151960`
  - 2026-08-13 実ブラウザ検証: title「ＭＤＸ株式会社の情報」／法人番号 3020001151960 ／
    所在地 神奈川県横浜市都筑区川和町２３３０－２ を確認。サイトの会社概要と一致。

### 検証して不採用にしたもの（2026-08-13）

- **gBizINFO** `https://info.gbiz.go.jp/hojin/ichiran?hojinBangou=3020001151960`
  … HTTP 200 だが、レンダリング後は**空の検索フォーム**で当社を指さない。
- **`github.com/osawa-ux`** … `GET /users/osawa-ux` が `type: User` / `name` `company` `bio` すべて未設定。
  個人アカウントであり会社の公式プロフィールではない。
- **note** … 当社名義のアカウントが存在しない。

## `JobPosting` の注意

- **表示テキストと JSON-LD の不一致は虚偽広告リスク**（repo CLAUDE.md 運用ガード 2）。
  `baseSalary` / `employmentType` / 必須条件に加えて **`jobBenefits` も保護対象として扱う**。
  給与・賞与・手当は「金額」だけでなく**支給条件**（例: 賞与の在籍要件、通勤手当の通勤手段）まで
  表示側と揃えること。条件を落とした要約を書かない。
- 日付フィールド（`datePosted` / `validThrough`）の運用は `docs/runbooks/job-posting-refresh.md`。
- `validThrough` は月末に丸める運用とする（2026-08-13 設定値 `2026-11-30` は「3か月先を月末に丸めた」もの）。

## `FAQPage` の注意

- **回答テキストはページ上の可視テキストと完全一致させる**。要約・言い換えを入れない
  （Google は不一致を構造化データの違反として扱う）。生成は HTML から機械抽出する。
- 効果の見積もりは割り引くこと。Google は 2023 年に FAQ リッチリザルトの表示対象を絞っており、
  一般企業サイトで検索結果に FAQ が出ることは期待しない。**AI 検索・LLM による引用のしやすさ**を
  主目的とする。
