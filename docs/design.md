# MDX株式会社 サイト デザインガイド / 意思決定記録

最終更新: 2026-06-30
対象: `index.html` / `styles.css` / `script.js`（トップページ）
公開: GitHub Pages（https://mdx-inc.co.jp）

このドキュメントは、2026-06-30 のデザインupdate（トップを3本柱主役へ刷新＋動的演出＋紺基調ダークテーマ化）の
背景・方針・実装・調整ポイントをまとめた正本。次回の更新はここを起点にする。

---

## 1. 目的

- **アプリ開発・業務自動化・ポータルサイト開発の「3本柱」を全面に押し出す**（旧: 6領域を並列に並べ柱がぼやけていた）。
- BtoB（中小企業・医療/介護事業者）の信頼を得つつ、先進性・テック感を出す。
- 静的サイト（HTML/CSS/JS、依存ライブラリなし）の制約内で実現する。

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
placeholder・カルーセル文字は装飾用途で低めだが許容。純黒/チャコールは残していない。

---

## 5. セクション構成（index.html）

Header(sticky) → Hero → trust-banner → **3本柱(#pillars: MDX App/Flow/Portal)** → ロゴカルーセル(自社運営ポータル) →
About(会社概要・数値) → Philosophy → Strengths → Approach → **対応領域(#services: 旧6領域)** → 運営ポータル →
Customers → Cases → Flow(支援の流れ) → Company(会社情報) → **FAQ(`<details>`)** → Contact(フォーム) → Footer

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

## 8. 今後の調整ポイント / TODO

- [ ] カウントアップの実機発火を確認（or 撤去判断）
- [ ] 実績ロゴ・実績数値（時点明記）が用意できたら信頼セクション強化
- [ ] お問い合わせ種別セレクトに MDX App/Flow/Portal を追加検討
- [ ] 各3本柱の個別詳細ページ（現状はトップ内アンカー）
- [ ] reduced-motion 実機（OS設定ON）での停止確認
