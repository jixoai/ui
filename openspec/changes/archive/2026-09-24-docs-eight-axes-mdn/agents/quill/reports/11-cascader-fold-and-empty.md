# Report 11 — quill: Part A cascader fold + Part B empty CODE (task 11)

- agent: quill · date: 2026-09-22 · parts: cascader fixed-paint TokenTable
  fold (marginalia's MINOR) + empty.html archetype repair (tier 2)
- dev server: wrapper PID 89136 / vite 89166, killed by PID, `lsof :5241`
  empty after

## Part A — cascader fixed-paint fold (marginalia's MINOR)

Root cause confirmed at the component level (not mine to fix):
`token-table.svelte:105-106` — `sourceLabel` maps only density/component/
color; `'structural'` returns `''`. And the `description` field of
`TokenEntry` is never rendered anywhere in the row loop. So cascader's 7
fixedTokens rows (all `source: 'structural'`) rendered a Source header + 7
empty Source cells + zero description text.

Page-side fold (the badge ladder model — facts ride the Default cells, the
`source` field dropped so the `tokens.some((t) => t.source)` guard removes
the Source column entirely):

| before (7 rows) | after (6 rows) |
|---|---|
| `--jx-unit` / `--space-6` / `--space-10` (3 rows, dead descriptions) | merged: `--jx-unit` + `--space-6 / --space-10`, each Default cell carrying the values AND what reads them |
| `--jx-text-base` ("the most complete" — marginalia) | **kept as its own row**, the T_base-vs-`--jx-text` distinction verbatim in the rendered Default cell: "0.8125rem (13px) — the select's mono body voice: the ruler's T_base constant, NOT the density channel --jx-text; no rung rescales it" |
| `--text-label-lg` / `--track-10` (2 rows) | merged into one row |
| `--jx-hairline`, `--jx-radius` | kept, facts folded |

**Receipt (served-page parse, after)**: headers `['Token', 'Default']` — no
Source column; 6 rows; **0 empty Source cells**; "T_base constant" present in
a rendered cell. Before-state arithmetic (mechanical): 7 rows ×
`source:'structural'` → `sourceLabel` '' ×7 = 7 empty Source cells + the
header. The built dist carries the same state (fresh build, exit 0).

## Part B — empty CODE

- pre-flight: `grep test/` — no ambient/e2e pins on empty (only the
  docs-structure skeleton + the ambient-vocabulary meta-side carrier); meta
  = 13 props (5 content + 8 axes); census batch D.
- family read first: empty.svelte + empty.stylex.ts (the whole paint) +
  defaults (all eight slots, no-own).

### Tier: 2 优化重构 — justified

Bones: hero, the demo canvas with the illustration/actions playground, the
composition demo. Gaps: no Overview, hand-written props table, thin
universal-props card, no per-axis table/query/install/see-also, order ≠ §2.
Kept everything; filled the gaps.

### Diff

1. `empty.html/+page.svelte` — archetype order: hero → install →
   **Overview** (the state-machine ruling + the leaf-family receipt + the
   frozen-pole sentence) → usage → live canvas (kept) → the composition demo
   → **Props** (generated meta + new curation) → **The eight axes on empty**
   → accessibility (kept) → see-also. Removed: types/theming/universal-props
   (folded).
2. `+page.ts` — ToC re-derived (6 ids; survivors usage/api/accessibility).
3. `props-table/docs/empty.docs.ts` (NEW) — prose for the 5 content props.
   No EXTRA lane (nothing shadows an axis name).

### The axis story (grep receipts → rows)

- grep: zero effective-carrier readers in ui/empty/ — size, shape, radius,
  color, elevation, motion are supply-only rows in the negative-grep form.
- **density CONSUMED** via the named rung: the atoms read --jx-stack /
  --jx-inset / --jx-text / --jx-line / --jx-gap — the scope re-bases them
  (probe below). Number lane inert (declaring-element).
- **theme: THE FROZEN POLE** — grep: zero raw-token reads (every voice is the
  stylex :root emission + theme-free kernel channels); a resolved dark stamps
  .dark and NOTHING flips. The third measured pole after checkbox (full-flip)
  and cascader (ring-only).
- elevation nuance: the art's shadow is --jx-shadow-2xs — a fixed recipe
  token, not the §7 pair.
- composed-consumer receipt (negative): no component mounts Empty anywhere in
  ui/ or routes — a leaf; composition is consumer-side (illustration/actions
  snippets).

### EXTRA arithmetic (built dist)

meta 13 − axis-named 8 = **5 rendered main rows** (title/description/
illustration/actions/class — extras 0); universal 8; marker ×1; ToC 6/6
unique; the 吃也供 term is not used on the page (no broadcast claim in prose
— the supply rows are negative receipts), so no gloss obligation.

### Probe (7/7 TRUE, /tmp/quill-11-axis-probe.mjs)

| claim | probe | result |
|---|---|---|
| density rungs repaint | sm padding 16px vs lg 32px (inset×2); title type 12px vs 15px (--jx-text sm/lg) | TRUE |
| number-lane counterpart | data-density sm/lg on the figure roots; carriers in the style attrs (SSR) | TRUE |
| theme frozen pole | light vs `theme="dark"` figures: background, border, title color, title size — byte-identical; `.dark` present only on the dark one | TRUE |
| query() case | two-generic form served; `data-density="sm"`/32px→ figure h 114 at 1440px; base `"lg"`/185px at 600px (< 40rem) — caption direction verbatim | TRUE |

## Gates

| gate | result | evidence |
|---|---|---|
| affected specs solo BEFORE | 330/330 (docs-structure + docs-ambient-vocabulary + props-table-meta-drift) | /tmp/quill-11-specs-b.log |
| affected specs solo AFTER | 330/330 | /tmp/quill-11-specs-f.log |
| `npm run build` | exit 0 (breadcrumb stayed fixed) | /tmp/quill-11-build.log |
| `verify:docs-universal` | GREEN 110/110 (fresh dist) | /tmp/quill-11-du-f.log |
| `verify:docs` | GREEN (fresh dist) | /tmp/quill-11-vd-f.log |
| `verify:tailwindless` | GREEN, receipt verbatim unmoved | files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 |
| svelte-check | fleet 1650 → 1647 (−3 sibling cleanup, not mine); empty.html **1** error — the standing cx idiom (57:28→105:28 after the rewrite; the cx helper was briefly dropped in the rewrite and restored — one intermediate 30-error state caught and fixed before any gate ran); cascader.html 1 (same idiom) | /tmp/quill-11-sc.log, -sc2.log |

## Process receipt

Dev server wrapper 89136 / vite 89166 killed by PID; `ps` gone; `lsof :5241`
empty (exit 1). Probe + SSR captures + gate logs in /tmp only. My diff:
cascader.html/+page.svelte (the fold), empty.html/+page.svelte + +page.ts +
props-table/docs/empty.docs.ts (Part B). No commits, no push.
Measurement-only — no visual judgment entered any verdict.
