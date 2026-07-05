---
status: proposed        # proposed | rejected | accepted | deprecated | superseded by NNNN
date: 1970-01-01        # ← 決定日(YYYY-MM-DD)に置換。非日付を入れると GitHub Pages(Jekyll) の date フィルタが build を落とす（2026-07-05 mdx-corp 障害）ため valid な仮日付にしている
decision-makers: 院長   # regulated 決定は人間の承認者を必ず記録（監査可能性）
published: false        # このテンプレ自体は決定記録でないため公開しない（コピーして実 ADR を作成）。実 ADR では削除するか true に
---
# NNNN: <決定を表す短いタイトル>

## Context and Problem Statement
<背景・制約・何が問題か。規制/算定要件が絡む場合は根拠資料（法令・通知・一次資料）へのリンクを必須にする>

## Considered Options
- 案A
- 案B

## Decision Outcome
選択: 案A。理由: <ドライバーとの対応>

### Consequences
- Good: ...
- Bad: ...（負の帰結も必ず書く）

## Confirmation
<この決定が守られていることをどう検証するか（テスト/レビュー/lint）>
