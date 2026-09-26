# TASK 31 — CODE menubar (vellum)

Tier 2 (优化重构). Gates green (receipts below). NO commits — two files changed:
`apps/www/src/routes/docs/components/menubar.html/+page.svelte` (+page.ts rewritten).

## Tier decision — gap analysis

Tier 2, not 1: the present 231-line page had archetype bones (h1 hero ×1, one demo
canvas with drawer, types canvas, usage CodeBlock, theming DensityDemo+TokenTable,
A11yTable, api PropsTable universal) but was missing four archetype sections
(DocsInstall `id="install"`, Overview, the measured axes table, DocsSeeAlso
`id="see-also"`), had NO query() seat, no universal specimens, and the toc was
misordered against the DOM (toc listed accessibility before theming while the DOM
ran theming→universal-props→api; universal-props absent from the toc entirely).
Tier 2, not 3: the family is untouchable and the page's structural bones served;
a full re-author of the family is out of scope for a docs change.

## What changed

1. **Archetype rebuild** (+page.svelte full re-author, +page.ts new toc):
   hero (h1 ×1, headingLevel={1}) → `#install` DocsInstall → `#overview` (3 paras,
   law-notes folded: composition protocol / panel surface + one-kernel-per-panel +
   in-place promotion / axes story + kinship) → `#live-demo` (workbench, own drawer,
   echo footer) → `#types` (auto vs solid, measured blur split in the summary) →
   `#usage` → `#theming` (DensityDemo xs/default/lg + TokenTable +level2 surface row)
   → `#api` (PropsTable universal ×2, matrix-frozen literals preserved) →
   `#universal-props` (measured axes table + receipts footnote + query() seat +
   universal specimens) → `#accessibility` (measured keyboard contract) →
   `#see-also` DocsSeeAlso. toc == DOM exactly, chrome (install, see-also) out,
   api → axes → accessibility trio LAST (probe receipt: PASS).
2. **Axes table**: 8 rows, every cell measured on the served DOM or
   negative-grepped (see Measurements).
3. **query() seat**: `query<{ md: DensityLane }, DensityLane>({ md: 'large' }, 'small')`
   on a real bar in the axes section; measured both sides of 48rem.
4. **Universal specimens**: density="large" / radius="medium" / theme="dark" /
   shape="bevel" bars, each opened-and-measured in the probe.
5. **cx predicate fix** (fleet law): typed `.filter((style): style is string | {...} => Boolean(style))`.
6. **A11y tables sharpened to the MEASURED contract** (roving trim, one-hop glide,
   Escape focus return, family-owned dismissal).

## Measurements (probe receipts, served DOM at 5242)

- **DOM shape — IN-PLACE, own panel law**: every panel's chain is
  `DIV > SPAN[slot] > LI > UL#bar` — the top-layer promotion moves paint, not DOM.
  NOT nav-menu's promotion-to-`.jx-pop` common carrier and NOT popconfirm's
  self-carried portal: menubar keeps its OWN `.jx-menubar-panel` law (position-area
  `bottom span-right` + flip-block + anchors-visible + `@supports` viewport-center
  fallback + transparent ::backdrop). This is the wrap-IN-PLACE dividend: bar stamps
  inherit into the open panel.
- **Density — TWO CHANNELS, one ladder**: ambient bars render `data-density` null and
  ride the ancestor scope cascade (measured xs/default/lg: min-block-size
  `--jx-hit` 28/40/48px, voice `--jx-text` 11/13/15px, line 16/20/24px, inline
  padding `--jx-inset` 8/12/16px). Stamping `data-density=lg` on an ambient bar
  re-scoped in place → 48px/15px/16px. The global `[data-density]` kernel scopes in
  jixoai.css are the second channel.
- **Radius — PANEL-ONLY, live chain**: ambient panel borderRadius 0px; stamping
  `--jx-radius-effective: 12px` on the bar re-rendered the open panel at 12px (and
  0px on removal) while the BAR never rounds (no radius atom on the bar). Real-prop
  receipt: `radius="medium"` (effective 8px) → open panel 8px, explicit-form stamp
  in the bar style attr.
- **Theme — THE SPLIT VOICE (typed-LITERAL vs typed-STREAM applied)**: under
  `.dark` on the bar root, `--card` flipped to oklch(0.3211 0 0) while `--jx-card`
  stayed oklch(1 0 0) — the stylex `defineVars` :root literal snapshot is a
  boot-time freeze; only the `createTheme` tokenScope class re-derives, and menubar
  stamps none (grep: tokenScope consumers are component-canvas, terminal-header,
  terminal-card only). Per voice measured: RE-DERIVING = trigger hover pose
  (`--muted` → 0.2178 dark), panel surface (`--jx-elevation-level2-surface` chain →
  oklch(0.185 0 0 / 0.72) dark acrylic), panel ink (`--popover-foreground` → white);
  FROZEN = bar card, bar border, trigger label ink, the OPEN pose (`--jx-muted`
  stayed 0.9551 light — a light open band on the dark bar while not hovered,
  isolated with the mouse moved away), bar 2xs shadow. Verified through the REAL
  `theme="dark"` prop (dark panel, white bar, both vars split).
- **Elevation — SPLIT BY ROLE**: bar style attr measured
  `--jx-elevation-effective: 3` + `--jx-elevation-shadow/surface` =
  `--jx-elevation-level2-*`; the BAR's own shadow is the typed `--jx-shadow-2xs`
  (1px 1px 0px, chrome — not the axis); the panel body carries the level2 recipe
  (rgba(0,0,0,.3) 0 1px 2px + rgba(0,0,0,.15) 0 2px 6px 2px measured).
- **Variant — consumed by the platform surface css**: `data-variant=solid` surface
  body measured `backdrop-filter: none` vs auto/acrylic `blur(14px) saturate(1)
  brightness(2)`.
- **Motion — supply-only at the axis**: zero readers of `--jx-motion-effective` in
  ui/menubar/ AND surface-motion.ts (grep receipt); open/close motion is the WAAPI
  kernel's constant timeline; pose transitions measured: trigger 150ms ease-out
  (color+bg), menu item 100ms. **No hover-open cascade** (grep: no pointer
  handlers — the LAW #14 surface is the two pose transitions + the kernel).
- **Glide — ONE HOP, measured**: click File (focus stays on the trigger) → ArrowRight
  closes File, opens Edit, expanded=true, tabindex re-trimmed, focus lands INSIDE
  Edit ("Undo@edit-panel"); further arrows are no-ops (the bar walker requires a
  trigger-focused activeElement; the panel walker is ↓/↑/Home/End only). Escape →
  focus back on the edit trigger. ↓ on View opens + focuses first item
  ("Commands@view-panel"). The hero/PlayHelp/a11y texts now state this measured
  contract (the old hero implied chain-gliding).
- **Query case**: wide (≥48rem) hit 48px/voice 15px/attr lg; narrow (<48rem) hit
  32px/voice 12px/attr sm. My first prose draft claimed the base as 28px/11px —
  that is the XS rung; corrected to 32px/12px (own-prose canary catch).
- **Served rows by name**: api table = label, variant (density folded to the
  universal fold: size, shape, radius, density, color, theme, elevation, motion);
  parts table = id, href, onselect; axes table serves all 8 axis names.
  Matrix-frozen cells served intact: density default 'ambient scope', variant
  default "'auto' · Own default, not ambient" (FROZEN_CELLS probe: both true).
- **SSR**: h1 ×1; section order install > overview > live-demo > types > usage >
  theming > api > universal-props > accessibility > see-also; toc links == DOM ids
  modulo chrome (PASS).

## Matrix

No re-pin needed: the api PropsTable stays tableIndex 0 with the density row
(occurrence 1, 'ambient scope') and variant row (bare 'auto', own marker,
defaultsFile `registry/files/ui/menubar/menubar-defaults.svelte.ts`, slotExport
`menubarSurfaceVariantSlot`) as inline literals — byte-preserved from the accepted
state (density description extended with measured numbers, kbd precedent).

## Gates

- `verify:tailwindless` — ✓ GREEN, receipt VERBATIM: `files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` ("no growth, no new
  identities, no unregistered producers, contract intact").
- `verify:docs` — ✓ "[verify-docs-structure] ✓ all docs pages pass the skeleton
  lint (staged scope green)".
- `verify:docs-universal` — ✓ "GREEN: 110/110 component pages render the shared
  universal section (110 markers)".
- svelte-check (page-scoped) — ZERO diagnostics on
  `routes/docs/components/menubar.html/+page.svelte|+page.ts`; fleet baseline
  1594 errors / 1030 warnings in 624 files is the pre-existing lib-wide state
  (drifted from 1595 by sibling merges; I touched no lib file).
- Specs post-edit, one run: ambient + menubar suites `6 files / 325 passed`
  (docs-ambient-vocabulary 284, density-adoption-menus, batch4b-components,
  composition-c, defaults-nav-providers, composition-regressions) plus
  docs-structure 12/12. Baselines were run BEFORE edits: 41/41 + ambient 284.

## Port discipline

lsof :5242 rc=1 BEFORE start. Vite started with wrapper pid 93278, listener
93310 (captured to /tmp/vellum-31-vite.pid + pgrep receipt). Teardown: kill 93278
93310 → ps shows no survivors → `lsof -i :5242 -sTCP:LISTEN` rc=1 AFTER. Probes
live in /tmp (vellum-31-menubar-{probe,theme-probe,voices-probe,glide-probe,verify}.mjs).
No commits. Sibling strays (quill's probe-fi*/probe-pc* files) untouched.

## Open questions for the reviewers

1. **The open-pose seam**: under `theme="dark"` the trigger's OPEN pose stays light
   (frozen `--jx-muted` atom) while the HOVER pose flips dark — a light open band on
   the dark bar when not hovered. I documented it as the split-voice evidence. Is a
   family fix (triggerOpen reading a live chain) wanted, or is the honest-docs
   treatment the ruling for now?
2. **One-hop glide wording**: the family comment says "panels follow an open bar —
   glide behavior"; measured, further arrows are dead once focus is inside the
   panel (bar walker requires a trigger-focused element). I wrote the measured
   contract in hero/overview/a11y. Confirm the reviewers accept the measured
   wording over the aspirational comment (family untouchable in this change).
3. **`--jx-bar-gap` shape**: the panel anchor margin reads
   `var(--jx-bar-gap, 8px)` as a UNIFORM margin (all sides) — a flip (flip-block
   fallback) keeps the same value on the wrong side near viewport edges (same
   Chromium limitation popover.css documents for --jx-pop-gap). Left as
   source 'component' in the TokenTable; flag if the known-limit note should live
   on this page too.
