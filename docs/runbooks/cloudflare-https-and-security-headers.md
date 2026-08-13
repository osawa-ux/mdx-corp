# Runbook: HTTPS 強制とセキュリティヘッダの付与（Cloudflare + GitHub Pages）

- 対象: `mdx-inc.co.jp`（GitHub Pages 配信 / Cloudflare 経由）
- 起点: 2026-08-13 サイトレビュー P0-1・P0-2
- 実施者: 人間（Cloudflare ダッシュボード操作）
- 所要: 10〜15 分
- リスク: 中（設定を誤るとサイト全体に影響する）。各ステップに切り戻し手順を併記する

---

## 0. 実施前の実測（before を残す）

```bash
# 現状: http が 301 を返さず 200 で中身が返る
curl -sI http://mdx-inc.co.jp/ | head -3

# 現状: セキュリティヘッダが1本も無い（何も出力されない）
curl -sI https://mdx-inc.co.jp/ | grep -iE 'strict-transport|x-content-type|referrer-policy|x-frame|content-security'
```

2026-08-13 時点の実測値:

- `curl -sI http://mdx-inc.co.jp/` → `HTTP/1.1 200 OK`（301 なし）
- セキュリティヘッダ 4 種はいずれも不在
- `access-control-allow-origin: *` は GitHub Pages 既定（Cloudflare 側で消さない）

---

## 1. P0-1: HTTPS を強制する

### 1-1. Cloudflare 側

1. Cloudflare ダッシュボード → 対象ゾーン `mdx-inc.co.jp` を選択
2. 左メニュー **SSL/TLS** → **Edge Certificates**
3. **Always Use HTTPS** を **ON**
4. 同じ画面の **Minimum TLS Version** が `TLS 1.0` のままなら `TLS 1.2` に上げる（任意・推奨）

### 1-2. GitHub Pages 側

1. `https://github.com/osawa-ux/mdx-corp` → **Settings** → **Pages**
2. **Enforce HTTPS** に **チェックを入れる**
   - チェックできない場合は証明書の発行待ち。数十分〜24時間おいて再度確認する

### 1-3. 確認

```bash
curl -sI http://mdx-inc.co.jp/ | head -3
# 期待: HTTP/1.1 301 Moved Permanently + location: https://mdx-inc.co.jp/

curl -sI http://www.mdx-inc.co.jp/ | head -3
# 期待: 301（https 側へ）
```

### 1-4. 切り戻し

**Always Use HTTPS** を OFF に戻す。反映は数十秒。

---

## 2. P0-2: セキュリティヘッダを付与する

GitHub Pages は独自レスポンスヘッダを付けられないため、**Cloudflare の Transform Rules（Response Header Modification）** で付与する。

### 2-1. 設定手順

1. Cloudflare ダッシュボード → 対象ゾーン → **Rules** → **Transform Rules**
2. **Modify Response Header** タブ → **Create rule**
3. Rule name: `security-headers`
4. **If incoming requests match...** → **All incoming requests**
5. **Then...** → **Set static** を 4 回追加し、以下を入力する

| Header name | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | `frame-ancestors 'self'` |

6. **Deploy** を押す

### 2-2. 確認

```bash
curl -sI https://mdx-inc.co.jp/ | grep -iE 'strict-transport|x-content-type|referrer-policy|content-security'
# 期待: 4 行すべてが出力される
```

ブラウザで https://mdx-inc.co.jp/ を開き、表示崩れ・コンソールエラーが無いことも確認する。

### 2-3. 切り戻し

Transform Rules の該当ルールを **無効化（トグル OFF）** する。ルール削除より先に無効化で切り分ける。

---

## 3. 重要な注意（やらないこと）

- **`Content-Security-Policy` を `frame-ancestors` 以外に広げない。**
  本サイトは Google Analytics（`www.googletagmanager.com` / `www.google-analytics.com`）、
  Cloudflare Web Analytics（`static.cloudflareinsights.com`）、
  Google Fonts（`fonts.googleapis.com` / `fonts.gstatic.com`）を読み込んでいる。
  `default-src` や `script-src` を付けると**これらが全てブロックされ、計測とフォントが止まる**。
  full CSP を入れる場合は `Content-Security-Policy-Report-Only` で 1〜2 週間観測してから昇格する。

- **HSTS の `preload` を付けない。**
  preload リストは登録の取り消しに数か月かかる。サブドメインを含めた全ホストが恒久的に HTTPS
  であることを確認できるまでは `max-age` + `includeSubDomains` のみとする。

- **`access-control-allow-origin: *` を消しに行かない。** GitHub Pages 既定であり、静的サイトでは実害がない。

---

## 4. 実施後にやること

- 本 runbook の「0. 実施前の実測」と同じコマンドを再実行し、after を記録する
- 実施日と結果を `docs/decisions/` か Obsidian `20_Projects/mdx-corp/index.md` に 1 行残す
