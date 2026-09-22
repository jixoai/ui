# Task 17 — input-group (CODE) · quill · 2026-09-22

**Verdict: LANDED (working tree; no commits).** Tier 2: the skeleton was
complete and render-pinned, so the work was the measured axes layer — the
per-axis table, the corrected consumption claims, the meta-driven root table,
and Overview. Family untouched (three mirrors `cmp`-identical).

## Diff

| File | Change |
|---|---|
| `apps/www/src/routes/docs/components/input-group.html/+page.svelte` | + Overview; universal-props → **the eight axes** (per-axis table + measured demos + query case + mixed TokenTable); root props table → generated meta + curation (parts tables stay hand); theming folded into axes; the cx predicate applied (0 errors); the W3-era FALSE claim removed |
| `apps/www/src/routes/docs/components/input-group.html/+page.ts` | ToC: +overview, +axes; theming folded; DOM-order faithful |
| `apps/www/src/lib/ui/props-table/docs/input-group.docs.ts` | NEW curation: 7 root rows (incl. the `data-density` legacy escape hatch as a main row — the attribute name, not an axis collision) |

## The drift found and corrected (the coordinator's warning, confirmed)

The W3-era universal summary claimed **"The family CONSUMES size and color:
the native element never receives them (the §1 native collision rule)"** — the
greps disprove the consumption half: **zero `-effective` readers in
ui/input-group/**. The sentence had mistaken the §1 forwarding rule (the
native element never sees the attributes — TRUE) for axis consumption (a
css-read question — FALSE for size and color). The per-axis table states both
halves separately; the old universal demo panels (size={14}, radius="medium"
with movement-implying captions) were replaced by measured ones.

Also corrected: the old theming TokenTable listed `--jx-line` as consumed —
the family reads no `--jx-line` (measured reads: `--jx-hit`, `--jx-inset`,
`--jx-text`, `--jx-gap`); the input part is chromeless (0 padding — the
inset pads the addon lane).

## The measurement story (probe PASS)

- **Density = CONSUMED + PROVIDED, measured**: the shell atoms read the
  rung-re-based channels (`--jx-hit` minHeight, `--jx-inset` addon padding,
  `--jx-text` type, `--jx-gap` gap — input-group.stylex.ts:34-59), and the
  lg rung moves the shell 40px → 48px high, type 13px → 15px. PROVIDED: the
  resolved tier is inherit-then-provide to the subtree (the r11 eager-capture
  contract, pinned by test/defaults-form-families.spec.ts:332) — addon
  children adopt the group's opinion. `data-density="lg"` greppable in the
  raw SSR; the auto control stamps nothing.
- **Theme = MIXED BY EMISSION FORM, measured — both sides of one bezel**: the
  addon SEAM (raw css `var(--border)`, :63/:66) flips oklch(0 0 0) →
  oklch(1 0 0) under the stamped .dark, and the well shadow flips to the
  white recipe (rgba(255,255,255,0.12) inset) — while the shell's BASE BEZEL
  (`tokens['--jx-border']`, the defineVars alias) stays frozen at the
  :root-resolved light value (oklch(0 0 0) both islands). Var-chain receipt
  on the root: `--border` flips, `--jx-border` identical — the substitution
  site decides, and here the split is visible on ONE element pair (seam vs
  bezel).
- **Size/shape/radius/color/elevation = supply-only** (zero readers each;
  the well shadow is the input family's WELL tier recipe — a fixed pair, not
  the §7 consumption pair; the shell's transition reads the kernel presets
  `--motion-150`/`--motion-ease-out` verbatim with the prefers-reduced-motion
  kill — LAW #14).

## EXTRA arithmetic

Meta = 15 props; 8 ambient axes → generated section; root table = **7 rows**
(label, disabled, data-density, role, class, children, rest), all curated.
The part tables (addon/input) stay hand — component-specific. SSR parse:
universal marker ×1; the meta table renders label/disabled rows.

## Pins honored (form-family-docs-pages renders THIS page)

Exactly one 'usage' heading (verified in SSR: 1); canvas stages 12 (≥3);
docks 46 (≥3); h1 ×1. No frozen-matrix rows existed for this route (the
34-entry matrix has no input-group entries), so the meta switch orphaned
nothing.

## Gates

| Gate | Result |
|---|---|
| test pins grep (before first edit) | 8 files found; the render-smoke + family + provider pins honored |
| affected specs solo BEFORE | 7 files: 6 passed + 1 **load-jitter timeout** (form-family smoke, 5.9s wall) — cleared solo 3/3 before any edit; attributed, not mine |
| svelte-check | page **0 errors** (cx predicate; 1 pre-existing usageLive warning — the canvas pattern's known cost); family warnings pre-existing, untouched |
| dev-smoke :5241 | 200; PID 7860 killed; `lsof :5241` empty before AND after |
| SSR raw bytes | order install → overview → demo → usage → examples → a11y → axes → api → see-also; 1 h1; stamps greppable; FALSE claim gone |
| probe | PASS (density 40→48px/13→15px; seam flips, bezel frozen, var chain receipt) |
| build | exit 0 |
| verify:tailwindless | GREEN — receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs-universal | GREEN 110/110 |
| verify:docs | staged scope green |
| affected specs solo AFTER | **7 files, 453/453** (the sibling's color-picker failures resolved at their integration) |

No commits made. Report file: `agents/quill/reports/17-input-group.md`.
