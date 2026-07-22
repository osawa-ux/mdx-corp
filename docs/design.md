---
design_signoff: 2026-07-02
---

# MDX株式会社 サイト デザインガイド / 意思決定記録

> **design_signoff**: 2026-07-02 施主（院長）検収済（主目的=採用の施主決定＋紺基調ダークテーマの意思決定記録に基づく。loop-engineering P1c の検収記録。方針転換時は再検収＝日付更新）

> **継承宣言**: 本書は vault `70_SOP/design-base.md`（第1層: a11y・レイアウト・フォーム安全・破壊操作の UI 普遍原則）を継承する第2層サイト固有 design である（vault path は `python ~/.claude/skills/_shared/resolve_vault.py --join "70_SOP/design-base.md"` で解決し、絶対パスは書かない）。本サイトは医療サービス提供サイトではない（コーポレート＋採用）ため、design-base の医療入力ミス低減章は適用対象外。ただし a11y・フォーム安全（Contact フォーム）・破壊操作の各章は適用する。安全系（a11y / フォーム安全）が本書と矛盾した場合は design-base を優先する。
>
> **正本の勝敗**: トークン・実装の正本は実コード（`styles.css` の CSS custom properties）。本書は意思決定記録＋解説であり、値が食い違った場合はコードが勝ち、本書を追従更新する。

最終更新: 2026-07-04（継承宣言・正本宣言追記）（2026-07-02: 求人特化パッケージ: テンプレ統一・求人SEO/LLMO仕上げ・品質修正 LCP/コントラスト/モバイルメニュー・design.md 更新）
対象: `index.html` / `careers.html` / `styles.css` / `script.js`（トップページ）
公開: GitHub Pages（https://mdx-inc.co.jp）

このドキュメントは、2026-06-30 のデザインupdate（トップを3本柱主役へ刷新＋動的演出＋紺基調ダークテーマ化）の
背景・方針・実装・調整ポイントをまとめた正本。次回の更新はここを起点にする。

---

## 0. 2026-07-15 editorial 刷新（go-live 済・院長承認）

> 2026-07-02 施主検収以降の**方針転換の追従記録**。院長プレビュー承認のうえ 2026-07-15 に本番公開済み（master `a855bac` / GitHub Pages・`mdx-inc.co.jp` live 確認済）。**design_signoff 更新: 2026-07-15**。

- **トップを「物語主役の editorial LP」へ刷新**（旧: 分節の多い B2B ダーク → 新: 当事者発ストーリー・情報圧縮）。`index.html` 全面刷新＋homepage 専用 `styles.editorial.css` 新規（他ページは `styles.css` 継続・動的演出/アニメは editorial 側 `.reveal` に集約）。
- **カラー基調＝紺 `#0f1a30`＋シアン `#0ea5e9` は不変**（§4 のトークン有効。warm 案は検討過程で不採用・`--edt-*` を styles.editorial.css 末尾で紺+シアンに上書き）。
- **新 IA（ヘッダー/フッター・全10ページ統一）**: 事業`#pillars` / 運営ポータル`#portals` / 会社`#company` / FAQ`#faq` / お問い合わせ`#contact` / 採用情報`/careers.html`。**旧アンカー `#strengths`/`#services`/`#flow` は廃止**（§5 旧構成は superseded）。
- **新トップ構成**: Header → Hero(物語・「最終判断は人間」引用・現場の痛み→仕組み→運営定着) → 運営ポータル proof → 3本柱`#pillars` → 採用`#recruit` → 会社概要`#company` → FAQ`#faq` → お問い合わせ`#contact` → Footer。
- **運営ポータルは医療・介護4件のみ**（在宅クリニック/訪問看護/訪問歯科/居宅介護支援）。**相続税理士ナビは物語一貫性のため非掲出**（院長決定）。
- **about.html に「情報戦略部」セクション追加**（「MDXの専門性と強み」直後）: 元SE・元国家公務員など多様な経歴の当事者=実装チームを集合的に訴求（**氏名非掲載**・SE採用配慮で「医療事務や」削除）。
- E-E-A-T（創業者=現役在宅医 大澤 基／代表=大澤 直子）は §7.5 のまま維持。SEO/JSON-LD/meta/GA4/Formspree 保持。
- コミット鎖: `7086e50`→`15dd084`→`d96cbff`→`a855bac`。残: 削除セクションの長尾KW減を Search Console 観察／他ページの editorial 化は任意の別タスク。

---

## 1. 目的

- **アプリ開発・業務自動化・ポータルサイト開発の「3本柱」を全面に押し出す**（旧: 6領域を並列に並べ柱がぼやけていた）。
- BtoB（中小企業・医療/介護事業者）の信頼を得つつ、先進性・テック感を出す。
- 静的サイト（HTML/CSS/JS、依存ライブラリなし）の制約内で実現する。
- **2026-07-02 施主決定: 本サイトの主目的は採用（求人）。顧客獲得（リード獲得）は主目的から外す（問い合わせ経路は維持するが最適化投資はしない）。**
- 求職者（採用）を**第1オーディエンス**とする。採用力強化のため、トップページからの採用導線・careers.html のコンテンツ充足（選考フロー・FAQ・AI環境訴求）を継続的に整備する。

---

## 2. 競合調査（2026-06-30・実アクセス17社）

3カテゴリを subagent で並列調査。

- 国内モダンAI/DX: Laboro.AI / LIG / Lightblue / AVILEN / JAPAN AI
- 国内 業務自動化・ポータル受託: スプリングボード / NOVEL / ワークスアイディ / WEBEDGE / MICHIRU / GeNEE
- 海外トップエージェンシー: Instrument / Huge / Phenomenon / Ramotion / Fireart / Clay

### 横断して効いていた勝ちパターン
1. **Heroコピーは「何が変わるか（状態変化）」型**（手段の列挙でなく顧客起点）。
2. **サービスは3〜6軸に限定、3本柱ならカード3枚横並び**（10並べない）。
3. **配色は二極（ダーク系 or 白+グレー）＋アクセント1色**。中途半端なグレーは避ける。
4. **信頼はロゴカルーセル＋実績数値（必ず時点明記）＋認証バッジ**。初期は顔出し・業種別事例・プロセス図で代替。
5. **CTAは会話起点**（"Let's talk" / 無料相談）＋sticky/常時可視。2択（相談+資料DL）が標準化。
6. フェーズ型CSSタブ・ロゴ無限カルーセル・FAQアコーディオンは **JS無し**（`:checked` / `<details>`）で実現可。

---

## 3. 確定したデザイン方針（施主決定）

| 項目 | 決定 | 経緯 |
|---|---|---|
| トップ構成 | **3本柱を主役・6領域は「対応領域」へ格下げ** | 6領域は廃止せず下位に保持 |
| サービス命名 | **MDXブランドを冠する**（MDX App / MDX Flow / MDX Portal） | MICHIRU型 |
| 配色 | **紺(ネイビー)メインのダークテーマ＋シアン1色アクセント** | ライト→ニアブラック→「真っ黒は見づらい」→**紺**に確定 |
| 動き | **上品＋もう一段リッチ**（チカチカ回避・reduced-motion必須） | |

### コピー
- Hero見出し: 「現場の繰り返しを、仕組みに変える。」（状態変化型）
- Hero eyebrow: `Apps, Automation & Portals.`（英語タグライン）
- CTA: 「無料で相談する」（会話起点）

---

## 4. カラートークン（`styles.css` :root）

紺基調ダークテーマ。アクセントはシアン1色（増やさない）。

| 変数 | 値 | 用途 |
|---|---|---|
| `--color-bg` / `--color-primary` | `#0f1a30` | ベース背景（深いネイビー） |
| `--color-bg-sub` | `#13203a` | セクション交互の明るい層 |
| `--color-bg-dark` | `#0b1424` | 濃い層（trust-banner等） |
| `--color-surface` | `#16263f` | カード面 |
| `--color-surface-hover` | `#1c3050` | カード/入力hover・フォーム入力欄 |
| `--color-text` | `#e6e8ee` | 本文（背景比 ~12.5:1） |
| 見出し | `#f5f7fa` | section-title等（~14:1） |
| `--color-text-light` | `#9aacc4` | 補足（~5.2:1・青み寄り） |
| `--color-accent` / `--color-accent-dark` | `#0ea5e9` / `#0284c7` | CTA・数値・カード上部ライン・進行バー・フォーカス枠 |
| `--color-border` | `rgba(255,255,255,0.08)` | 境界線 |

**コントラスト**: 主要テキストはすべて WCAG AA(4.5:1)以上を確認済み。
placeholder は装飾用途で低めだが許容。カルーセル文字（.carousel-label / .carousel-item）と .required バッジは AA 準拠に修正済み（2026-07-02）。純黒/チャコールは残していない。

---

## 5. セクション構成（index.html）

> **⚠️ 2026-07-15 superseded**: 下記は editorial 刷新**前**の旧トップ構成。現行トップの構成は **§0（2026-07-15 editorial 刷新）** を参照。以下は履歴として残置。

Header(sticky) → Hero → trust-banner → **3本柱(#pillars: MDX App/Flow/Portal)** → ロゴカルーセル(自社運営ポータル) →
About(会社概要・数値) → Philosophy → Strengths → Approach → **対応領域(#services: 旧6領域)** → 運営ポータル →
Customers → Cases → Flow(支援の流れ) → Company(会社情報) → **FAQ(`<details>`)** → **Recruit(採用情報 #recruit)** → Contact(フォーム) → Footer

---

## 6. 動的演出（script.js / styles.css）

すべて transform/opacity 中心・依存なし。reduced-motion と no-js で安全に縮退。

| 演出 | トリガー | 実装 | 検証 |
|---|---|---|---|
| スクロール連動 staggerフェードイン | IntersectionObserver | `.reveal`→`.is-visible`、delay 0.07s刻み | ✅ |
| Hero 見出し行 stagger | ロード | `span.hero-line`を生成、`.hero-loaded`で順次 | ✅ |
| Hero 背景グロー | 常時 | `@keyframes hero-glow` 14s（radial-gradient揺れ） | ✅ |
| Hero 装飾ブロック浮遊 | 常時 | `@keyframes float-1/2/3` | ✅ |
| 3本柱カード hover | hover | 浮き上がり＋アクセントライン伸長＋アイコン微動 | ✅ |
| CTAボタン 光沢スイープ | hover | `::after`グラデが左→右 | ✅ |
| section-label 下線伸長 | reveal | `::after` scaleX(0→1) | ✅ |
| スクロール進行バー | scroll(rAF) | `#scroll-progress-bar`（accentグラデ） | ✅ |
| ヘッダー scrolled 引き締め | scroll | `.scrolled` | ✅ |
| 数値カウントアップ "3" | IntersectionObserver | 0→3 / easeOutQuad / 800ms | ⚠️ 下記 |

### ⚠️ 既知の未確認点
- **カウントアップ**: ヘッドレス(Playwright)では発火を確認できず。表示値は常に正しく「3」。
  実ブラウザの自然スクロールでは動く可能性が高いが未確証。要・実機目視。気になる場合は IO 条件を再調整するか、
  演出が小さい（0→3）ため撤去も選択肢。

### アクセシビリティ
- `@media (prefers-reduced-motion: reduce)`：全アニメ（グロー・浮遊・カルーセル・stagger・光沢・進行バー・カウントアップ）を停止し最終状態で即表示。CSS＋JS `matchMedia` 両面。
- `<html class="no-js">`：JS無効でも `.reveal/.hero-content/.hero-line` を `opacity:1` 表示（本文が消えない）。
- 参考: prefers-reduced-motion 有効ユーザーは概ね1〜5%（医療・高齢層で高め）のため対応必須と判断。

---

## 7. 運用上の約束（重要）

- **実績数値・クライアントロゴの捏造をしない**。ロゴカルーセルは実在の自社運営ポータル（在宅クリニックナビ等）のみ。
  本物の導入実績が出たら `index.html` の `.carousel-track`（2セット複製）を差し替える（HTMLコメントに手順あり）。
- 医療表現は節度を保ち、MDXは **IT/DX企業**として表現（3本柱を主役、医療・介護は対応領域の一つ）。
- SEO/OGP/JSON-LD/GA4(G-MZTNZ1G68S)/Formspree(xreydklq)/favicon は非破壊で維持。
- アセット参照に `?v=YYYYMMDD` を付与（再訪ユーザーの旧キャッシュ対策）。**デザイン変更時はこの版数を更新する**。
- **カラートークンの意味を変更するときは、全 HTML（サブページ埋め込み style 含む）の `var(--color-*)` 使用箇所を横断 grep して確認する**（2026-07-02 careers.html 視覚崩壊事故の再発防止）。

---

## 7.5 SEO / LLMO 設計（2026-06-30 Phase 1 実装）

競合・SEO・LLMO 3軸の調査（subagent並列）に基づく方針。詳細根拠は調査ログ参照。

**アーキテクチャ**: ハブ＆スポーク（トピッククラスター）。`works.html`=ハブ、`/works/{slug}.html`=個別事例（スポーク）。**厚い事例のみ個別化**（薄い量産はサイト評価を下げるため禁止）。サブディレクトリ配下はCSS/JS/canonical/OGPを**ルート絶対パス**で参照。

**SEO**: 各ページ固有 title/description・自己参照canonical・パンくず・OGP・画像width/height/alt・sitemap全件。JSON-LD は `Organization`(共通)＋`Service`＋ページ毎に `BreadcrumbList`＋`TechArticle`(事例)＋`FAQPage`。

**LLMO**: `/llms.txt`（会社要約＋サービス＋事例リンク、事実と数値のみ）。robots.txt で検索系AIクローラ（OAI-SearchBot/Claude-SearchBot/PerplexityBot）を Allow、学習系（GPTBot/Google-Extended）は現状Allow（ブロックは要施主協議）。各ページ冒頭100字を「業種×課題×手法×成果」の倒立ピラミッド完結文に。`dateModified` を入れ四半期更新。

**E-E-A-T（施主決定）**: about.html で「**創業者＝在宅医療の現役医師（大澤 基）**」を打ち出す（医療DXの最強E-E-A-T）。**会社概要の代表者欄は登記通り「大澤 直子（代表取締役）」を維持**し、創業者行として大澤 基（医師）を併記。個別事例は「医療機関向け」匿名フレーム。

**成果数値の方針**: 実測値のみ測定方法つきで掲載。無い場合は捏造せず「狙い」を定性で記述。技術的事実（ルール数/テスト数）は出典あれば可。収益/価格は非掲載。

## 7.6 Phase 2 計画（横展開・未着手）

- 個別ページ追加（厚い順）: ポータル共通基盤（ジオコーディング品質の技術ストーリー）／訪問看護指示書・主治医意見書チェック／資料→記事自動化／統合労務SaaS（税・決済の具体は除外）／SCS
- works.html を一覧フィルタ付きハブに昇格、各スポークと双方向内部リンク
- サービスのピラーページ（/services/medical-dx 等）は任意で後日
- 各事例 OGP個別画像・WebP化、Search Console でインデックス確認→薄いページは noindex 判断
- **個別ページは手書き散文のみ**（repo設定ファイルにPHI/スタッフ名/secrets実在＝ダンプ禁止）。配布前に2段レビュー必須。

## 7.7 採用（Recruit）設計（2026-07-02 P1 実装）

### 情報アーキテクチャ
「会社を知る → 人を知る → 環境を知る → 採用について」の4ブロック型を目標とする。
P1 では次を実装済み: トップ採用導線（nav + Recruit セクション）・選考フロー・FAQ・最終更新日表示・AI環境訴求文の整理（募集要項テーブルの基本項目は従来から掲載済み・P1 では無変更）。

### 差別化訴求
AI活用環境（Claude / Gemini は会社が用意し全スタッフが日常業務で使用）を第一級の採用訴求とする。「全スタッフが使用」「会社が用意」は 2026-07-02 に施主が事実確認済み＝掲載可（根拠のない全数量化・貸与主張を書かない原則自体は維持）。
IT業界経験者を必須としつつ、AIツール未経験でも実務の中で習得できる環境を明示する。

### ガード
- 実績数値は実測のみ・時点明記
- スタッフ実名・写真は本人同意必須
- 医療・クリニック・患者表現は不使用（IT/DX企業として表現）
- 未確定の待遇は決定まで掲載しない。2026-07-02 施主確認で確定・掲載済み: 賞与あり / 試用期間6か月 / 出社勤務（リモートなし）/ 年間休日130日 / 面談1回・オンライン可。**募集期限のみ未定・非掲載**

### P2: JobPosting 構造化データ（2026-07-02 実装済）
- careers.html に JobPosting JSON-LD を実装。**現状1職種のため careers.html 自体が「1求人1URL」の個別ページ**（Google要件充足）。複数職種化する際に /careers/ ハブ&スポークへ分割する。
- 実装値: title=IT・業務改善スタッフ / datePosted=2026-07-02（**掲載日**。ページ可視は「掲載日／最終更新日」を併記し、datePosted は掲載日に固定＝鮮度偽装を避ける）/ employmentType=FULL_TIME / baseSalary=月給30〜35万円 / jobLocation=〒224-0057 横浜市都筑区川和町2330-2（**2026-07-22 施主go で 2330 → 2330-2 に訂正**。登記住所および index/about/works/privacy の会社概要と一致）
- **validThrough は意図的に省略**（募集期限未定。Google公式「期限がない・不明な場合は含めない」に準拠。募集終了時はページから JobPosting を削除する）
- 構造化データの値は必ずページ可視テキストと一致させる（Google要件）
- Indeed は 2025-07 以降クローリング縮小のため engage 併用を検討（未着手）

---

## 8. 今後の調整ポイント / TODO

- [ ] カウントアップの実機発火を確認（or 撤去判断）
- [ ] 実績ロゴ・実績数値（時点明記）が用意できたら信頼セクション強化
- [ ] お問い合わせ種別セレクトに MDX App/Flow/Portal を追加検討
- [ ] 各3本柱の個別詳細ページ（現状はトップ内アンカー）
- [ ] reduced-motion 実機（OS設定ON）での停止確認
- [x] 採用: JobPosting JSON-LD 実装（2026-07-02）
- [ ] 採用: engage 併用判断（Indeed 2025-07 以降縮小対応）
- [ ] 採用: 「数字で見るMDX」追加（実測値のみ・時点明記）
- [ ] 採用: 社員インタビュー（本人同意必須）
- [ ] 採用: 採用専用 OGP 画像の作成
- [x] 採用: 待遇項目を掲載（2026-07-02 施主確認: 賞与あり・試用期間6か月・出社勤務・年間休日130日）。募集期限のみ未定・非掲載
- [x] 採用: 文言強化（2026-07-02 施主確認: 全スタッフ使用・会社が用意＝事実 / 面談1回・オンライン可）
- [ ] 採用: 書類確認の返信目安（○営業日以内）の施主決定後に選考フローへ追記
- [x] 採用: 試用期間中の待遇を明示（2026-07-02 施主回答: 給与3%減額。careers.html 募集要項に記載済）
- [x] 採用: 年間休日130日の内訳を記載（土日祝・年末年始12/29〜1/3・会社カレンダー。根拠=MDX正職員就業規則 第22条〔Drive 正本〕＋施主回答＋既存掲載の踏襲〔土日祝・130日〕）
- [x] 採用: 試用期間中の給与以外の条件は本採用と同一（2026-07-02 施主確認）。「その他の条件は変わりません」を注記に復活済
- [ ] 採用: JobPosting のリッチリザルト検証（GSC / リッチリザルトテスト）を反映後に実施
- [x] 採用: 勤務時間は掲載の 9:00〜18:00（休憩13:00〜14:00）が正（2026-07-02 施主確認）
- [x] テンプレ統一: careers/privacy/disclaimer の header nav・footer を index.html 同世代に統一（2026-07-02）
- [x] 求人SEO: careers.html title/meta に「横浜」追加・BreadcrumbList JSON-LD 追加（2026-07-02）
- [x] SEO: privacy/disclaimer に OGP メタ一式 + BreadcrumbList JSON-LD 追加（2026-07-02）
- [x] SEO: works.html に BreadcrumbList JSON-LD 追加（2026-07-02）
- [x] SEO: index.html に Service JSON-LD（3本柱）追加（2026-07-02）
- [x] LLMO: llms.txt に採用セクション追記（2026-07-02）
- [x] 品質: LCP 改善 — hero h1 第1行を即描画（opacity:1 初期値）に変更（2026-07-02）
- [x] 品質: コントラスト3箇所 AA 修正（carousel-label/carousel-item → #8fa3c0 約6.99:1 / .required → #0b1424 on accent 約6.44:1）（2026-07-02）
- [x] 品質: モバイルメニュー背景を不透明化（rgba→#0f1a30）+ body スクロールロック追加（2026-07-02）
- [x] index.html logo href="#" → "index.html" に修正（2026-07-02）

### 保留（求人特化方針のため。2026-07-02）

以下は顧客獲得最適化に分類されるため、2026-07-02 施主決定の「本サイト主目的＝採用」方針のもと実装を保留とする:

- 価格の型（プラン表示・費用感の明示）
- 資料ダウンロード導線の追加
- 実測値信頼帯の掲載（測定方法付き数値強化）
- #cases セクションへの外部リンク追加
- フォーム種別の簡素化（BtoB用と採用用の分離等）
- 創業者写真の掲載（about.html）
- 地域キーワード（横浜）のトップページ title/description への適用
