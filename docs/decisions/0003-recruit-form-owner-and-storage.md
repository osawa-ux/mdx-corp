---
status: accepted
date: 2026-08-20
decision-makers: 院長
published: true
---
# 0003: 応募フォームの所有アカウントと置き場所を確定する（ADR-0001 案C の実装前提を supersede）

## Context and Problem Statement

ADR-0001 は「オーナー権限の移管は Google 仕様上できない」ことを受けて**案C＝作り直し**を採用した。その案C の記述は置き場所を **`@mdx-inc.co.jp` の共有ドライブ**と書いていた。2026-08-19〜20 に実装しようとしたところ、その前提が 2 点とも成り立たないことが実測で判明した。

### 判明した事実（2026-08-19〜20 実測）

1. **`mdx-inc.co.jp` は横浜ホームクリニックのテナントとは別テナントである。**
   院長の super-admin アカウントで管理コンソール（`admin.google.com/ac/domains/manage`）を開いて実測。クリニック側テナント（顧客ID `C03278tp0`・組織名「横浜ホームクリニック」）のドメイン一覧は `yokohama-home.jp`（プライマリ）/ `yokohama-home.jp.guest.google`（ゲスト）/ `yokohama-home.jp.test-google-a.com`（テストエイリアス）の 3 件のみで、**`mdx-inc.co.jp` は含まれない**。
   - ⚠ この判定に**至らなかった**測り方も記録する。「同一 DWD クライアントが両ドメインの subject で impersonate できるか」は**判別力がない**。mail-ops の `docs/dwd_setup.md` が「同じ Client ID + scope を 3 Workspace の管理コンソールで繰り返し登録する」運用を明記しており、別テナント 3 件でも同じ結果になるため。メールヘッダによる内外判定も、陽性対照（同一ドメイン内メール）が同じヘッダを持つため判別力なしと確定した。
2. **共有ドライブ内のフォームでは「ファイルのアップロード」設問を作れない。**
   UI では選択肢がグレーアウトし、Forms API は `Creation of file_upload question not supported` を返す。**切り分け**: 同一アカウント（`info@mdx-inc.co.jp`）の**マイドライブ**に作った検証用フォームでは同項目が**有効**だった。したがって原因はエディションでもテナントでもなく**置き場所**である。
   旧フォームには「履歴書・職務経歴書」（最大 5 件・10MB）のアップロード設問があるため、**共有ドライブと機能パリティは両立しない**。

### 院長決定（2026-08-20・2 回明示）

MDX株式会社は横浜ホームクリニックの MS法人であり、院長が株式を 100% 保有する実質的支配者である。**今後の MDX 系のフォーム・ドライブは `osawa@yokohama-home.jp` で運用し、`@yokohama-home.jp` 全体に共有する。** 委託関係に関する法務論点は顧問の西村先生に相談済みで決着している。

## Considered Options

- **案C-1: `@mdx-inc.co.jp` の共有ドライブ（ADR-0001 の当初案）** — 上記 2 により履歴書アップロード設問を置けない。採用しない。
- **案C-2: `info@mdx-inc.co.jp` のマイドライブ** — 履歴書設問は置ける。ただし院長決定により採用しない。
- **案C-3: `osawa@yokohama-home.jp` のマイドライブ（採用）** — 履歴書設問を置け、`yokohama-home.jp` 全体への共有で院内の運用に載る。所有は無償個人アカウントではなく **Workspace アカウント**であり、ADR-0001 が解こうとした本来の問題（無償アカウント所有）は解消する。

## Decision Outcome

選択: **案C-3**。

- 応募フォームは `osawa@yokohama-home.jp` 所有・**マイドライブ**に置く（共有ドライブは使わない）。
- 共有は `yokohama-home.jp` ドメイン全体に**閲覧者**、回答者は**リンクを知っている全員**。
- **ADR-0001 の Decision Outcome のうち「@mdx-inc.co.jp の共有ドライブ」という置き場所の指定は本 ADR で supersede する。** ADR-0001 が示した「無償個人アカウント所有をやめる」という目的自体は維持する。

### Consequences

- Good: 履歴書アップロードを含め、旧フォームと**機能パリティを保ったまま**移行できた。
- Good: 設問投入は Forms API で完結でき、再作成・検証をコードで回せる。
- Bad: **共有ドライブではないため、所有者アカウントが失われると同種の事故が再発しうる**。ADR-0001 が共有ドライブを求めた理由（退職・アカウント削除への耐性）は解消していない。`osawa@` は代表者個人のアカウントであり role アカウントではない。
- Bad: 「MDX の応募者データを横浜ホームクリニックのテナントに置く」構成になった。法務論点は決着済み（上記）だが、**構成としてこうなっていること自体は記録に残す**。
- Bad: `privacy.html` の「委託」表記の再判断（ADR-0001 実施順序6）は、**Google との関係についての判断であって本 ADR では変えていない**。別途対応が要る。

## Confirmation

ADR-0001 のオラクル①「新フォームの `driveId` が非空（＝共有ドライブ配下）」は本決定により**成立しないため supersede**する。置き換え後のオラクル:

| # | 判定 | 実行方法 | 2026-08-20 の結果 |
|---|---|---|---|
| ① | 新フォームの所有者が **Workspace アカウント**であること（無償個人アカウントでない） | `GET drive/v3/files/<formId>?fields=owners` | `osawa@yokohama-home.jp` を確認・合格 |
| ② | 旧フォーム ID が repo 全体と本番ページから 0 件 | `git grep -c <旧formId>` / 本番 `careers.html` を curl して grep | repo・本番とも 0 件・合格 |
| ③ | 旧フォーム・旧スプレッドシートが削除済み（ゴミ箱も空） | `GET drive/v3/files/<id>` が 404 | **未実行**（削除前提ゲート (a)(b) が未成立のため） |
| ④ | 未同意で応募リンクが押せないこと | ブラウザで `#apply-consent` を切り替え `#apply-link` の `href` / `aria-disabled` を assertion | 合格（未同意=href なし+`true` → 同意で URL+`false` → 解除で復帰） |

なお **Forms API v1 は回答先スプレッドシートを設定できない**（Discovery Document 2026-08-16 版で `Form.linkedSheetId` が `readOnly: true` / "Output only"、`Request` に destination 系の操作が存在しないことを実測）。回答先の紐づけは UI かコンテナバインド Apps Script が必要で、この 1 点は自動化できない。
