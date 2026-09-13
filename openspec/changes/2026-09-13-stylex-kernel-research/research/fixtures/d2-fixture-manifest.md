# D2 fixture manifest — the override law under StyleX, mechanically

> Frozen at design time (2026-09-13; Gate-1 r4 corrections: rows
> 02/05/07/12/14/15 rewritten against the REAL repo CSS, selector
> literals + source anchors + computed literals pinned; ledger F4).
> Every row pins: markup essence, the concrete selector, the
> property, the EXPECTED computed value (literal), media state, and
> the source anchor (file:line — verified TODAY by
> research/fixtures/validate-manifests.mjs, exit 1 on any drift).
> Runs on build O1 (lawful: stylex layers AFTER `utilities`) for pass
> assertions, and O2 (misconfig: layers BEFORE `utilities`) where
> marked O2-INV — the EXPECTED inversion is the assertion.

## Shared setup (spike/coexist)

- TW4 entry `app.css`: `@import 'tailwindcss'` + the repo's canonical
  `@layer theme, base, components, utilities;` statement, then the
  REAL jixoai token vars copied byte-referenced (the `:root` block's
  `--primary`/`--jx-gap`/`--jx-inset`/`--jx-hit` lines, `.dark` block,
  `[data-density='lg']` block) and the REAL unlayered `.jx-control`
  alias block (jx-pure.css:265-277, alias slot) — minimal but
  byte-honest replica of the repo's layer/entry structure.
- StyleX: `useCSSLayers: { prefix: 'stylex', after: ['utilities'] }`
  (O1) / `{ before: ['utilities'] }` (O2).
- Kernel element K = `<div data-kernel-root>` carrying stylex paint
  `padding: var(--jx-inset)` + `background: var(--primary)`.
- Import order inside app.css FROZEN: tailwindcss → token vars →
  layer statement; both builds' emitted layer statements grepped into
  the receipt (the `@import`-first pitfall is itself a recorded
  probe).
- Root sizing: 16px root font, NO density scope — **SYNTHETIC TOKEN
  ENV (frozen, Gate-1 r5)**: the spike's app.css carries EXACTLY
  `:root { --jx-gap: 0.5rem; --jx-inset: 0.75rem; --jx-hit: 2.5rem; }`
  — a MINIMAL environment, deliberately NOT the full theme's density
  ladder (the full theme resolves `--jx-gap`/`--jx-inset` through
  `:where(:root:not([data-density]), [data-density='default'])` →
  density-default vars, jixoai.css:2133-2157 — DIFFERENT literals).
  Rows below state their literals against this synthetic env; where a
  literal depends on the REAL theme, the row's binding criterion is
  CONTROL-BUILD EQUALITY (an identical TW-only build, no stylex,
  records the value; PASS ⟺ coexist computed === control computed).

## Fixtures

| id | markup (essence) | selector under test (source anchor) | property | EXPECTED (computed literal) | builds |
|---|---|---|---|---|---|
| D2-01 core-i | K + consumer `class="p-[42px]"` | `.p-\[42px\]` vs stylex atomic | padding | 42px (consumer utility WINS) | O1 pass; O2-INV: 12px |
| D2-02 core-ii | `.jx-pure` subtree + `<input class="jx-control">` + consumer `class="jx-control p-[42px]"` | unlayered alias `.jx-control` (jx-pure.css:265-280) | padding | 8px 12px (the alias `padding: var(--jx-gap, 0.5rem) var(--jx-inset, 0.75rem)` under the SYNTHETIC env; consumer utility LOSES). SECONDARY (control-build equality, real jixoai.css token blocks imported): precedence must ALSO hold with the control build's recorded literal (the full theme resolves --jx-gap/--jx-inset through the density-default block, jixoai.css:2133-2157 — literal differs, precedence is the invariant) | O1; O2 |
| D2-03 core-iii | switch replica — the spike authors EXACTLY (unlayered, zero-specificity): `:where(.switch-host:has(input:checked)) .rail { background: rgb(255, 0, 0); }` over a stylex-static-painted `.rail` | the carve-out rule (text frozen above) | background (checked) / background (unchecked) | checked: rgb(255, 0, 0) (carve-out WINS over stylex static); unchecked + consumer `bg-red-500`: rgb(239, 68, 68) (TW4 default red-500 = #ef4444; binding criterion = control-build equality) — consumer WINS over stylex static | O1; O2 |
| D2-04 core-iv | `data-jx-print="hide"` + `class="flex"`; `data-jx-canvas-scroll` + `overflow-auto max-h-[32rem]` | the print whitelist | display / overflow + max-block-size | print emulation: none / visible + none; screen: flex / auto (whitelist inert outside print) | O1; O2 |
| D2-05 negative-v | same element as D2-02, consumer `p-[42px]` | `.jx-control` vs `.p-\[42px\]` | padding | 8px 12px — consumer utility LOSES (negative asserted) | O1 |
| D2-06 !important | K + `.consumer-force{padding:42px!important}` authored css | consumer rule | padding | 42px (!important beats stylex layer) | O1 |
| D2-07 same-layer order | `class="p-[10px] p-[20px]"` (one string) | TW's emitted pair | padding | CONTROL-BUILD EQUALITY (frozen protocol): build the identical markup TW-ONLY (no stylex in the build) at pinned TW 4.3.3, record its computed padding P_tw in the receipt; PASS iff coexist computed === P_tw (and P_tw non-initial). No ad-hoc expectation is invented | O1 |
| D2-08 inline channel | K-parent `style="--jx-glass-radius:14px"`; stylex paint consumes `var(--jx-glass-radius,10px)` on backdrop-filter | inline custom property vs defineVars default | blur radius | 14px for that subtree; 10px outside | O1; O2 |
| D2-09 custom-prop precedence | defineVars probe `--x-probe` + `:root --probe`; createTheme class override on a subtree | var scopes | color | subtree: the theme-override literal (pinned `#00ff00`); outside: the root default literal (pinned `#0000ff`) — nearest scope wins, BOTH asserted | O1 |
| D2-10 dark+density | `.dark` + `[data-density='lg']` wrapping K (real token blocks imported; spike sets `--brand-hue: 330`; `.dark --primary` = oklch(0.7044 0.1872 calc(var(--brand-hue) - 4)), jixoai.css:194; lg rung = `--jx-gap: var(--jx-density-inline-gap-lg)` / `--jx-inset: var(--jx-density-inline-inset-lg)`, jixoai.css:261-285) | `.dark` block + `:where([data-density='lg'])` block | color + padding | CONTROL-BUILD EQUALITY (binding): under the same toggles, coexist computed color === control computed dark color ∧ coexist computed padding === control computed lg padding; AND both CHANGE away from their light/default-rung values in the same batch (anchors block-verified in validate-manifests.mjs as D2-10-dark / D2-10-lg) | O1 |
| D2-11 reduced-motion | `animate-pulse` + unlayered `:where(...prefers-reduced-motion...)` kill | the kill rule | animation-name | none under emulation; pulse without | O1 |
| D2-12 forced-colors | `.jx-pure` + `input[type='checkbox']` (real Part C law copied: jx-pure.css:2255-2264) | `@media (forced-colors: active)` block | appearance / background-image | appearance: auto AND background-image: none — identical computed pair in the coexist build (parity with the TW-only control build; no stylex-caused delta) | O1 |
| D2-13 print-sim exclusion | the spike authors EXACTLY: `@media not print { [data-jx-print-sim] .sim-probe { background: rgb(18, 52, 86); } }` | the sim rule (text frozen above) | background | screen: rgb(18, 52, 86); REAL print emulation: NOT rgb(18, 52, 86) AND equal to the control build's print-emulation computed value (control-build equality binding) | O1 |
| D2-14 surface-kernel (real rule) | tip replica: element with classes `jx-tip jx-surface` + the real `.jx-tip-shadow` child | `.jx-tip.jx-surface::after` (tooltip.css:37-41, unlayered, specificity 0,2,1) | content (primary) / mask-image on `.jx-tip-shadow` (secondary) | content: none — the law's ::after fallback is disabled; under `@supports (anchor-name: --jx-tip-fallback)` the `.jx-tip[data-arrow] .jx-tip-shadow` carries mask-image: var(--jx-surface-ring, none) (the notch rides the SHADOW CHILD, not a pseudo box-shadow); :where-sensitivity micro-fixture: the same override wrapped in :where() LOSES (content falls back to the law's paint — proves the natural specificity is load-bearing) | O1; O2 |
| D2-15 terminal-header foreign case (real rules) | nav replica: `.jx-nav` + panel with classes `jx-pop jx-subpanel` carrying INLINE `position-area: bottom span-left` | `.jx-nav .jx-pop.jx-subpanel` AND `.jx-nav .jx-pop.jx-subpanel.jx-subpanel-mega` (terminal-header.css:154+, unlayered natural specificity) | --jx-panel-pad / --jx-pop-pad / --jx-pop-pad-inline / position-area / ::backdrop | --jx-panel-pad resolves 4px (mega: 6px); --jx-pop-pad and --jx-pop-pad-inline resolve 4px; computed position-area = `bottom span-right` (the enumerated !important beats the inline style); `.jx-nav .jx-pop.jx-subpanel::backdrop` background: transparent | O1 |

## Frozen corpus tie-ins

- The floating-surface corpus family is FROZEN as **popover** (not
  dialog): the tooltip/popover notch-mask family is the enumerated
  surface-kernel case in css-architecture; dialog defers to the
  follow-up change.
- D2-02/D2-05/D2-12 copy REAL blocks from jx-pure.css (`.jx-control`
  alias block, the forced-colors Part C block) — anchors above,
  verified by validate-manifests.mjs; D2-14/D2-15 copy the REAL
  tooltip/terminal-header override rules.

## Failure semantics

Core rows (01–04) + surface-kernel rows (14–15): any FAIL ⇒ D2 FAIL.
Extended rows: any FAIL ⇒ D2 FAIL unless a pre-declared O2-INV
inversion (those assert detectability). LIMITATION rows follow the
D1 rule. Pinned literals may be re-derived ONLY if validate-manifests
fails at spike time (repo drifted) — then a ledger entry is REQUIRED
before proceeding.
