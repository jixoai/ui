# D2 fixture manifest — the override law under StyleX, mechanically

> Frozen at design time (2026-09-13, Gate-1 r3). Every row pins:
> markup, import order, selector, property, EXPECTED computed value
> (symbolic, resolved to literals inside the spike at build time —
> the SYMBOL is frozen here). Runs on build O1 (lawful: stylex layers
> AFTER `utilities`) for pass assertions, and on O2 (misconfig
> simulation: stylex layers BEFORE `utilities`) where the row says
> "O2-INV" — the EXPECTED inversion is the assertion (detectability
> proof, not a pass state).

## Shared setup (spike/coexist)

- TW4 entry `app.css`: `@import 'tailwindcss'` + the repo's canonical
  `@layer theme, base, components, utilities;` statement, then jixoai
  token vars (`--primary: oklch(...)`, `--jx-inset: 12px`, dark block,
  `[data-density='lg']` block) — a MINIMAL but byte-honest replica of
  the repo's current layer/entry structure.
- StyleX: `useCSSLayers: { prefix: 'stylex', after: ['utilities'] }`
  (O1) / `{ before: ['utilities'] }` (O2).
- Kernel element K = `<div data-kernel-root>` carrying stylex paint
  `padding: var(--jx-inset)` + `background: var(--primary)`.
- Import order inside app.css is FROZEN: tailwindcss → theme vars →
  layer statement. Both builds' emitted layer statements are grepped
  into the receipt (the LogRocket `@import`-first pitfall is itself a
  recorded probe).

## Fixtures

| id | markup (essence) | selector under test | property | EXPECTED | builds |
|---|---|---|---|---|---|
| D2-01 core-i | K + consumer `class="p-[42px]"` | `.p-\[42px\]` vs stylex atomic | padding | 42px (consumer utility WINS) | O1 pass; O2-INV: 12px |
| D2-02 core-ii | `.jx-pure` subtree + `<input class="jx-input">` + consumer utility on same input | unlayered alias `.jx-input` | alias-owned property (padding-top, pinned to Part A value) | alias value WINS over both utility and stylex layer | O1; O2 |
| D2-03 core-iii | switch replica: stylex static paint + unlayered `:where(input:checked ~ .rail)` repaint | the carve-out rule | background (checked) / background (unchecked) | checked: carve-out value; unchecked: consumer `bg-red-500` WINS over stylex static | O1; O2 |
| D2-04 core-iv | `data-jx-print="hide"` + `class="flex"`; `data-jx-canvas-scroll` + `overflow-auto max-h-[32rem]` | the print whitelist | display / overflow+max-block-size | print: none / visible+none; screen: flex / auto (whitelist inert outside print) | O1; O2 |
| D2-05 negative-v | consumer utility attempts to override Tier-2 alias (mirror of D2-02) | same | same | utility LOSES (negative asserted, not assumed) | O1 |
| D2-06 !important | K + `.consumer-force{padding:42px!important}` authored css | consumer rule | padding | 42px (!important beats stylex layer) | O1 |
| D2-07 same-layer order | `class="p-[10px] p-[20px]"` (one string) | TW's own emitted pair | padding | EXACTLY today's TW-only behavior (byte-compare built css order of the two rules; computed == today's value) | O1 |
| D2-08 inline channel | K-parent `style="--jx-glass-radius:14px"`; stylex paint consumes `var(--jx-glass-radius,10px)` on backdrop-filter | inline custom property vs defineVars default | blur radius | 14px for that subtree; 10px outside | O1; O2 |
| D2-09 custom-prop precedence | defineVars probe `--x-probe` + `:root --probe`; createTheme class override on a subtree | var scopes | color | subtree: theme-override value; outside: root default — nearest scope wins, BOTH recorded | O1 |
| D2-10 dark+density | `.dark` + `[data-density='lg']` wrapping K | scope blocks | color + padding | dark token color ∧ lg-rung padding simultaneously | O1 |
| D2-11 reduced-motion | `animate-pulse` + unlayered `:where(...prefers-reduced-motion...)` kill | the kill rule | animation-name | none under emulation; pulse without | O1 |
| D2-12 forced-colors | kernel + consumer paints under forced-colors emulation | UA forced values | pinned property list (from Part C law, listed in spike) | recorded parity with today's degradation (no stylex-caused delta) | O1 |
| D2-13 print-sim exclusion | `[data-jx-print-sim]` block behind `@media not print` | sim selector | its property | under REAL print emulation: sim rule NOT applying | O1 |
| D2-14 surface-kernel (Gate-1 r3 addition) | `.jx-tip.jx-surface::after` unlayered NATURAL-specificity override (notch-mask) over the jx-surface law, with stylex paint on the surface element | the enumerated override | pseudo box-shadow (notch ink) | override WINS over (a) stylex-layered paint (b) components layer — layered < unlayered; specificity preserved (0-2-1, NOT :where-zeroed) — asserted via :where-sensitivity micro-fixture: same rule with :where() wrapper must LOSE | O1; O2 |
| D2-15 terminal-header foreign case (Gate-1 r3 addition) | `.jx-nav .jx-pop.jx-subpanel*` enumerated override over the popover primitive's panel law | the enumerated selector | panel padding (pinned) | override WINS over popover law paint and over utilities; enumerated-selector discipline (sheet-header list) is the preserved contract | O1 |

## Frozen corpus tie-ins

- The floating-surface corpus family is FROZEN as **popover** (not
  dialog): the tooltip/popover notch-mask family is the enumerated
  surface-kernel case in css-architecture; dialog defers to the
  follow-up change.
- D2-02/D2-05 use the REAL `.jx-input` alias block copied verbatim
  from jx-pure.css Part A into the spike (byte-referenced), not an
  invented replica.

## Failure semantics

Core rows (01–04) + surface-kernel rows (14–15): any FAIL ⇒ D2 FAIL.
Extended rows: any FAIL ⇒ D2 FAIL unless the failure is a pre-declared
O2-INV inversion (those assert detectability). LIMITATION rows follow
the D1 rule.
