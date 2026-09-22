# Task 19 — REVIEW color-picker (2nd of 2) · quill · 2026-09-22

**Verdict: PASS — page #18 closes.** Every marginalia receipt re-derived
independently (grep + live probe); one MINOR verified and completed
page-side (one header sentence, disclosed below); the NIT is archive-only.
Independence law held until these findings were filed.

## Files reviewed

`apps/www/src/routes/docs/components/color-picker.html/+page.svelte` (+page.ts) ·
`props-table/docs/color-picker.docs.ts` · the re-pinned
`docs-ambient-vocabulary.matrix.json` · the PILOTS snapshots
(canvas-same-source). Family untouched — four mirrors `cmp`-identical.

## Re-derivations — all five marginalia receipts HOLD

**(1) stamped-never-consumed, re-falsified**: my own grep — zero
`-effective` readers in ui/color-picker/. Live: the color="error" axes
panel's root style attr is **byte-exact** — `--jx-color-effective:
var(--jx-color-error)` — while its border (oklch(0 0 0)), well shadow
(rgba(0,0,0,0.12) inset) and caret are identical to the unstamped control.
The number-form grammar is stampCarriers' oklch-formula path (code-cited;
named-form measured live). Stamped, unread — confirmed.

**(2) the ruler equation**: declared per rung scope
(`--jx-color-lane: max(var(--jx-hit), calc(var(--jx-icon) + var(--jx-inset) * 2 + 2px))`,
jixoai.css :503/:2644/:2697/:2750/:2819) and **measured live by stamping
data-density on a panel**: xs 34px/11px · sm 36px/12px · default 46px/13px ·
lg 58px/15px — exactly 34/36/46/58 + 11/12/13/15. Reset-to-1 is the named
rung's `--jx-density-coefficient: 1` reset (stampCarriers) × the scope's
coefficient-multiplied channels.

**(3) three-class theme split + drift + hue hygiene, measured**: dark island
on the served page — `--primary` computes **oklch(0.6489 0.237 238) →
oklch(0.7044 0.1872 calc(238 − 4))**: the live −4° dark drift, and the caret
follows it. Swatch border (--border) flips oklch(0 0 0) → oklch(1 0 0); well
shadow black → white inset recipe (rgba(255,255,255,0.12)); the trigger's
stylex-alias border stays oklch(0 0 0) both islands (frozen). Hue hygiene:
grep finds NO absolute hue in the page's theme prose — the only literal
colors are the picker's VALUE samples (the instrument's data, legal); theme
hues derive from --brand-hue at runtime.

**(4) matrix re-pin honest**: exactly 2 color-picker entries
(table[1] density#1 + size#1, batch A, marker scope) carrying the task-16
re-pin note — hand table[0] rows retired with the hand table, the axes table
carries the tracked rows, and the generated family table's own-marker variant
is documented as not-AST-pinnable (leaves the matrix). The variant invariant
test (definePaintSlot 'ambient zone') passes against the curation's
restored literal. Docs-ambient solo: green.

**(5) EXTRA arithmetic SETTLED — marginalia right, scribe's report described
a transient**: my parse of the committed meta: **24 raw entries, zero
duplicate keys** (value, format, name, label, error, disabled, variant,
showSwatch, showValue, lane, id, class + 8 axes + data-density,
aria-invalid, aria-describedby, rest). The rendered account:
**24 − 8 (axes → generated section) − 4 (curation `hide: true` — id,
'data-density', class, rest: the checkbox heritage precedent) = 12 main
rows**, verified in the SSR parse (exactly the 12, the hidden four absent).
Scribe's "27−3" cannot describe the committed meta — a transient from an
intermediate generation (pre-final entry set with a smaller hide set);
marginalia's 24/0-duplicates is the meta's settled truth. Archive records
both; the ledger number is 12.

## Findings

- **MINOR (drift #10) — verified, completed page-side**: the family's own
  props comments still claim "CONSUMED by the family" for size and color
  (color-picker.svelte:169/:180, registry-mirrored — family-out-of-scope).
  The page header DID flag the retirement but named only the old page's
  claim, not the living comment. Fixed: the header now carries an explicit
  STALE-COMMENT FLAG naming color-picker.svelte's size/color interface block
  as the retired claim's last living copy. Family file untouched (mirrors
  hold).
- **NIT (archive)**: the chain-head correction is recorded in this report
  and the SSR parse; nothing on the page changes.

## Standard checks

- **Tier/archetype**: tier 2 realized — archetype order hero → install →
  overview → usage → demo → types → catalogue → api → axes → a11y →
  see-also; ToC 8/8 matching DOM sections; 1 h1.
- **query() case**: **1280px → well 58px / type 15px ↔ 600px → 36px / 12px**,
  both directions, live (matchMedia agreement read alongside).
- **PILOTS green solo**: canvas-same-source — the color-picker types + axes
  extraction snapshots pass (`components/color-picker.html` in the pilot
  list); full affected set solo: **9 files, 520/520**
  (--testTimeout=30000 under sibling load).
- **Raw-SSR bytes**: universal marker ×1; meta main table renders the 12
  curated rows; generated universal section 8; axes table 8.
- **PROBE-READINESS / declaring-element**: the number-coefficient inertness
  row cites the declaring-element law (the coefficient composes at :root;
  the wrapper never re-declares) — consistent with my own stamp-read of
  stampCarriers/normalizeDensityLane.
- **One-h1**: exactly 1. **a11y floor**: no hit-surface gap (the honest
  keyboard-limits row documents the pointer-only pad/rail with the value
  field + swatch + Swatches paths). **LAW #14**: reduced-motion kill named.

## Gate tails

| Gate | Result |
|---|---|
| svelte-check | color-picker page **0 diagnostics**; docs.ts 0 |
| dev-smoke :5241 | 200; PID 62213 killed; `lsof :5241` empty before AND after |
| verify:tailwindless | GREEN — receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs-universal | GREEN 110/110 |
| verify:docs | staged scope green |
| affected specs solo (9 files incl. PILOTS) | **520/520** |
| build | exit 0, no prerender 500s (the tree's carousel conversion landed) |
| mirrors | 4 family files `cmp`-identical; family untouched |

No commits made. My delta this task: one page-header sentence (the
STALE-COMMENT FLAG) in color-picker.html/+page.svelte.

**CLOSURE DECLARED: color-picker passes — page #18.**
