# TASK 23 — REVIEW card-grid (1st of 2, scribe)

- **Reviewer**: scribe · 2026-09-22 · independence law held (marginalia's 2nd comes after; no cross-read performed)
- **Target**: vellum's page integrated at `f3685819` — `apps/www/src/routes/docs/components/card-grid.html/` + `card-grid.docs.ts`
- **VERDICT: NEEDS-WORK (light)** — 1 MAJOR (a "measured" sentence that does not reproduce), 1 MINOR (an empty Description cell), 1 NIT (no dark specimen); every other claim verified TRUE digit-exact. The layout/theme/motion/size/EXTRA core is the best-verified of the batch — the work is one sentence + one curation entry away from closure.

## Per-claim verdicts

### 1. The LAYOUT two-halves density split — VERIFIED TRUE (both halves)
- **Self inert**: gap = `tokens['--jx-space-20']` (card-grid.stylex.ts:34); `--space-20: calc(var(--jx-unit) * 5)` (jixoai.css:1467 — the identity exactly as claimed); `--jx-unit` declared **exactly once** (`:root`, jixoai.css:1233 — no rung scope re-bases it). Live ladder: **20px column-gap at 2xs/xs/sm/default/lg** (attribute-stamped, row-gap constant too).
- **Tenants real**: the section-card header ladder by the same stamp — padding **`8px 12px` xs · `8px 12px` sm · `12px 16px` default · `12px 20px` lg** — the dispatch's 12/12/16/20 is the **paddingInline** arm (`calc(--jx-inset + --jx-unit)`, section-card.stylex.ts:43), digit-exact. The two-halves story holds: the grid's own geometry never moves; the tenants re-base through the rung scopes.

### 2. Size = the heading contrast case — VERIFIED TRUE
- §11 echo lands **verbatim** in SSR (`--jx-grid-min: 320px; --jx-size-effective: 14px; font-size: var(--jx-size-effect…` — the carriers JOIN with the family's own --jx-grid-min stamp) and the root computes **exactly 14px**. Tenants keep their fixed voices (the Card title's font constant across the stamps — and the card family's own comment declares its padding "frozen" by design).

### 3. Theme = bridge-only — mechanism VERIFIED, but **no live specimen (finding 3)**
The page mounts **no dark specimen** (0 `.dark` grids served). I verified the mechanism by stamping the class the component writes on a live root: `--muted` flips (`oklch(0.9551 0 0)` → `oklch(0.2178 0 0)`, the raw layer) while `--jx-muted` stays frozen (`oklch(0.9551 0 0)`, the alias); the grid's ground is transparent (nothing theme-able to move) and the Card tenant **keeps its light paint** under the bridge (border/bg identical). The row's prose claims are true — but every peer page (button-group, color-picker, carousel, descriptions) carries a live dark specimen, and this row is the one a reader cannot see demonstrated.

### 4. Motion = the family's own IO-armed rule — VERIFIED TRUE (after a LAW #15-grade probe correction)
Source: `--jx-card-i` stamped nth-child 2..8 (=1..7, the ≤8 cap), the cascade `calc(var(--jx-card-i, 0) * 70ms)` on opacity 320ms / transform 420ms, the hidden pose keyed on `html.js` + `:not(.is-entered)`, the reduced-motion kill, and the IO arm (threshold 0, first intersection → `.is-entered` → disconnect; reduced/no-IO → immediate). End-to-end: my first two probe rounds read **0 entered grids** — my own scroll-loop raced the IO; the honest interaction (scrollIntoView + settle) arms it: **entered=true, opacity 1, transform none**. Zero `-effective` readers in the family ✓ (the axis carriers unread).

### 5. EXTRA — VERIFIED TRUE from served bytes
Family table = **4 rows: min, foot, class, children** — **no rest row** (the family spreads nothing; the served count matches, not just the source hypothesis). Universal 8; axes table 8.

### 6. Standard
Tier 2 archetype order holds (overview → usage → subgrid-law → types → accessibility → theming → axes → api); toc **8/8** (9 anchors incl. #main), 0 dead, order == DOM; **1 h1**; token tables render their Source cells (the task-21 structural arm live on this page's two structural tables — 0 empty there); card-grid.spec **14 tests** + docs-ambient-vocabulary 283 — **297/297 solos, exit 0**.

## Findings (severity-tagged)

1. **[MAJOR — falsified measurement sentence]** The query demo claims "**measured tenant padding 12px ↔ 16px across the key**" — NOT REPRODUCIBLE. Full-tree probe of the query grid at 1280 vs 600: density flips `default → sm` (the stamp works), but **0 of 19 nodes change any computed style** — the Card tenants' chrome is structural-fixed by the card family's own design (card.stylex's head band rides fixed `--space-*`; its comment says the body padding is "frozen"). Nothing consumes the rung-rebased channels in this demo. The 12↔16 story is TRUE for **section-card tenants** (the header ladder, verified above) — the fix is one sentence + optionally the specimen: swap the query demo's tenants to SectionCard (whose header genuinely steps 12↔16 across 48rem), or reword to the stamp-flip truth ("the root's data-density flips default ↔ small; a section-card tenant's header padding would step 16 ↔ 12 — the Card tenant shown rides its own frozen chrome"). Same class as image's 1st-review MAJOR: a "measured" sentence must reproduce or go.
2. **[MINOR — the description-field arm of W-next #3, page-side]** The `foot` row's **Description cell renders EMPTY** (served bytes; the curation has overrides for min/children/class but no `foot` entry — `description ?? ''` renders blank). Proposed wording from the family's own header comment: "Declares the THIRD shared row — the zone-trio cards' FEET align at the band bottoms; false = head/body only." One curation entry heals it.
3. **[NIT]** No `theme="dark"` specimen (see claim 3) — the bridge-only row is true but un-demonstrated; a fourth panel in the axes canvas would close the gap.
4. **[NONE]** No blockers beyond finding 1; no divergence risk — all other numbers digit-exact.

## Gate receipts

| Gate | Result |
|---|---|
| card-grid.spec + docs-ambient-vocabulary solos | **297/297** (exit 0) |
| verify:docs-universal | — (not run this pass: the page is under review, unchanged since integration f3685819; vellum's integration gates stand; my solos + probes + SSR are this review's evidence) |
| Live probes | gap 20px ×5 rungs; header ladder 8/12 · 12/16 · 12/20 arms; size echo verbatim + 14px; bridge (--muted flip / alias frozen / tenant light paint); motion armed on scroll (opacity 1, transform none); query density default↔sm |
| Raw SSR | 200; 1 h1; toc 8/8, 0 dead; 4+8+8+7 tables; 1 empty cell (finding 2); size echo verbatim in bytes |

## Process evidence

- Port **5243**: lsof empty before; PID `15572` killed → lsof **empty**, no ps residue, server log clean. **No commits, no pushes.**
- Independence law held: no cross-read performed (marginalia's 2nd comes after).
- Probe honesty: three probe rounds corrected my OWN rig before any finding was filed (a `cs` hoisting bug, the fast-scroll race vs the IO arming, a stale tenant selector) — the MAJOR survived all corrections; the layout/theme/motion claims survived too.
- Artifacts: probes `/tmp/scribe-23-probe{1..9}.mjs` + logs; SSR `/tmp/scribe-23-ssr.html`; solo logs `/tmp/scribe-23-{solos,dev}.log`.
