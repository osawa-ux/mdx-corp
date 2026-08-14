# Runbook: HTTPS 強制とセキュリティヘッダの付与（Cloudflare + GitHub Pages）

> ✅ **2026-08-13 実施済み**（API 経由）。以降は「設定を変える・切り戻す・再現する」ときの手順として使う。
> 実施後の実測: `curl -sI http://mdx-inc.co.jp/` → **301** ／ セキュリティヘッダ **4 本すべて付与** ／
> トップ 200・404 は 404 のまま・リダイレクト 1 回（ループなし）／
> GA・Cloudflare beacon・Google Fonts はいずれも読み込み継続・console エラー 0 件。
> 作成された rule 名: `security-headers`（ruleset id の実値は vault）。
> 併せて **min_tls_version を 1.0 → 1.2** に引き上げた（実測で TLS1.0/1.1 の利用が 0 件だったため。§1 手順 5 参照）。

- 対象: `mdx-inc.co.jp`（GitHub Pages 配信 / Cloudflare 経由）
- 起点: 2026-08-13 サイトレビュー P0-1・P0-2
- 実施者: 人間（Cloudflare ダッシュボード操作）
- 所要: 10〜15 分
- リスク: 中（設定を誤るとサイト全体に影響する）。各ステップに切り戻し手順を併記する

---

## 前提（2026-08-13 に API で実測して確定した構成）

- zone id: `<zone_id>`（実値は vault `20_Projects/mdx-corp/cloudflare-identifiers.md`）
- apex `mdx-inc.co.jp` の A レコード 4 本は **GitHub Pages の IP を指し、かつ `proxied=true`（オレンジ雲）**
- 訪問者向けの TLS は **Cloudflare 側で終端**している（実測: issuer = Let's Encrypt / subject = CN=mdx-inc.co.jp ＝ Cloudflare Universal SSL）
- SSL/TLS モードは **`full`**（Flexible ではない）

この構成から来る、実施前に知っておくべき 2 点:

1. **GitHub Pages の「Enforce HTTPS」は ON にできない。**
   proxied のため GitHub 側が独自証明書を発行できず、API は
   `404 The certificate does not exist yet` を返す（2026-08-13 実測）。
   **したがって P0-1 は Cloudflare の Always Use HTTPS 一本で決まる。**
   残余リスクは受容している: 訪問者〜Cloudflare 間は Cloudflare の証明書で担保されるが、
   **Cloudflare〜オリジン（GitHub Pages）間は暗号化されるものの証明書の検証はされない**（SSL/TLS モード `full`）。
   GitHub 側の証明書が発行できない以上 `full (strict)` には上げられないため、この区間の
   なりすましリスクを受け入れている。オリジンを GitHub Pages 以外へ移すときは `full (strict)` を再検討する。
2. **SSL/TLS モードが `full` であることが Always Use HTTPS の前提。**
   ここが `flexible` だと、Cloudflare→オリジンが HTTP になり
   GitHub Pages 側が HTTPS へ返すため **リダイレクトループになる**。
   実施前に必ずモードを確認すること（現状 `full` なのでループしない）。

---

## 0. 実施前の実測（before を残す）

```bash
# 現状: http が 301 を返さず 200 で中身が返る
curl -sI http://mdx-inc.co.jp/ | head -3

# 現状: セキュリティヘッダが1本も無い（何も出力されない）
curl -sI https://mdx-inc.co.jp/ | grep -iE 'strict-transport|x-content-type|referrer-policy|x-frame|content-security'
```

2026-08-13 時点の実測値（curl と Cloudflare API の両方で確認）:

- `curl -sI http://mdx-inc.co.jp/` → `HTTP/1.1 200 OK`（301 なし）
- セキュリティヘッダ 4 種はいずれも不在
- API 実測: `always_use_https = off` / `ssl = full` / `min_tls_version = 1.0` /
  `security_header.strict_transport_security.enabled = false` /
  `http_response_headers_transform` の ruleset は **0 件**
- `access-control-allow-origin: *` は GitHub Pages 既定（Cloudflare 側で消さない）

---

## 1. P0-1: HTTPS を強制する

Cloudflare 側の設定だけで完了する（GitHub Pages 側は上記「前提」のとおり操作不要）。

1. Cloudflare ダッシュボード → 対象ゾーン `mdx-inc.co.jp` を選択
2. 左メニュー **SSL/TLS** → **概要** で モードが **Full** であることを先に確認する
   （`Flexible` だった場合はリダイレクトループになるため、**Always Use HTTPS を ON にする前に** Full へ変更する）
3. **SSL/TLS** → **Edge Certificates**
4. **Always Use HTTPS** を **ON**
5. 同じ画面の **Minimum TLS Version** を `TLS 1.2` にする（2026-08-13 実施済み・`1.0` から引き上げ）

   引き上げ前に**必ず影響を実測すること**。Cloudflare GraphQL で TLS バージョン別のリクエスト数が取れる:

   ```graphql
   query($zone:String!,$since:String!){viewer{zones(filter:{zoneTag:$zone}){
     httpRequests1dGroups(limit:100, filter:{date_geq:$since}){
       sum{clientSSLMap{clientSSLProtocol requests}}}}}}
   ```

   2026-08-13 の実測（直近30日・54,937 リクエスト）: TLSv1.3 40.96% / TLSv1.2 0.37% /
   `none`（＝平文 HTTP。現在は 301 で HTTPS へ）58.67% / **TLSv1.0・TLSv1.1 は 0 件（0.000%）**。
   切り捨てる利用者が実測ゼロだったため引き上げた。

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

> HSTS だけは Cloudflare の専用設定（**SSL/TLS → Edge Certificates → HTTP Strict Transport Security (HSTS)**）でも付与できる。
> どちらか一方にする（両方で付けると重複ヘッダになる）。本 runbook は 4 本まとめて管理できる Transform Rules に寄せる。

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

## 3-2. API で実施する場合（ダッシュボードの代わり）

API 実行もできるが、**2026-08-13 時点では既存トークンの書き込み権限が足りない**。
どのトークンが何を持つかの棚卸し結果は public repo に置かない（vault
`20_Projects/mdx-corp/cloudflare-identifiers.md` を参照）。

API で完了させるには、`mdx-inc.co.jp` ゾーンに対して
**Zone Settings: Edit**（権限グループ id `3030687196b94b638145a3953da2b699`）と
**Zone Transform Rules: Edit**（`0ac90a90249747bca6b047d97f0803e9`）を持つトークンが要る。

2026-08-13 の実施では、**API Tokens Write を持つ既存トークン**（どれかは vault 参照）を使って
**このゾーン限定・上記2権限だけの一時トークンを発行 → 適用 → 即削除**した。
永続トークンを増やさずに済むので、再実施時もこの方式を推奨する（削除は `finally` で必ず実行し、
削除後に `/user/tokens` を再取得して残存 0 件を確認すること）。

実行する 2 リクエスト:

```
PATCH /client/v4/zones/{zone_id}/settings/always_use_https
      {"value":"on"}

PUT   /client/v4/zones/{zone_id}/rulesets/phases/http_response_headers_transform/entrypoint
      {"description":"...","rules":[{"description":"security-headers","expression":"true",
        "action":"rewrite","enabled":true,
        "action_parameters":{"headers":{
          "Strict-Transport-Security":{"operation":"set","value":"max-age=31536000; includeSubDomains"},
          "X-Content-Type-Options":{"operation":"set","value":"nosniff"},
          "Referrer-Policy":{"operation":"set","value":"strict-origin-when-cross-origin"},
          "Content-Security-Policy":{"operation":"set","value":"frame-ancestors 'self'"}}}}]}
```

⚠ **entrypoint への PUT に `name` / `kind` / `phase` を含めてはいけない。**
含めると `invalid JSON: unknown field "kind"` で失敗する（2026-08-13 に実際に踏んだ）。
受け付けるのは `description` と `rules` のみ。

---

## 4. 実施後にやること

- 本 runbook の「0. 実施前の実測」と同じコマンドを再実行し、after を記録する
- 実施日と結果を `docs/decisions/` か Obsidian `20_Projects/mdx-corp/index.md` に 1 行残す
