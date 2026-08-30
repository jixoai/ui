# Proposal: add-chart-family — terminal-native charts, zero dependencies

## Why

Charts are the largest component gap: every market leader treats them
as core (reui: 25 chart demos + chart blocks; shadcn official: a
`/charts` library with a seven-type taxonomy and the declared
philosophy "We do not wrap Recharts"; shadcnblocks: 15 chart-group
blocks), and jixoai-ui ships none. The terminal idiom is also a
moat: block-character bars (`▁▂▃▅█`), braille line cells, and ring
donuts rendered in the brand's OKLCH voice have no competitor
implementation — Magic UI's "Terminal" is a typing animation, not a
chart host.

## What Changes

- New registry family `chart` under `registry/files/ui/chart/`
  (folder law): four composed parts + a barrel:
  - `ChartBar` — horizontal bars on the text grid: Unicode block fill
    (`▁▂▃▅█` half-cell ramp, value-proportional), label lane +
    value lane, brand-hue fill with the variant grammar (fill/tonal/
    outline) for intensity; `data-jx-chart-*` hooks.
  - `ChartSparkline` — one-line inline trend (block or braille cells)
    for stat rows; no axes, honest min/max endpoints.
  - `ChartLine` — SVG polyline on the jx token surface (hairline grid,
    brand stroke, dot markers, optional area fill at 12% tonal);
    axes as authored slots, never guessed.
  - `ChartDonut` — SVG ring via stroke-dasharray segments in the OKLCH
    palette ramp (brand hue + neutrals; hue injection stays the
    consumer's job); center snippet slot for the total.
- Zero runtime dependencies (no Recharts/Chart.js) — static data
  rendering only, matching the site's "Zero runtime deps" law.
- Accessibility contract: each chart is `role="img"` with a REQUIRED
  accessible name, plus an opt-in visually-hidden data table fallback
  (`<table>` mirror of the series).
- Reduced-motion law: entrance = the shared surface fade (no per-bar
  staggered WAAPI), static under `prefers-reduced-motion`.
- Demos + docs page under the docs-demo-standard skeleton
  (bar/sparkline/line/donut + a stat-card composition demo).
- Registry: one item `chart` (folder with four part files + index) —
  add-command `npx jixoai-ui add chart`.

## Layering

- `registry/files/ui/chart/**` (new) + `registry.json` (new item) +
  `shadcn build`.
- `apps/www` mirror + docs page + catalog auto-derives (per
  registry-install-integrity).
- css via the colocated `<name>.css` law (`@layer components` +
  `:where()`), colors only through tokens (`--brand-hue`, `--jx-tonal`,
  neutrals) — no hardcoded hex.
- `verify:laws` / `verify:surface` extended expectations (new surface
  family enters the 47/47 check set).

## Risks

- Text-metric charts depend on mono font metrics — block glyphs must
  be measured in the ghostty/JetBrains Mono context; the component
  locks `font-family` to the mono token.
- Scope guard: no tooltips/interaction/animation systems in v1 —
  static rendering + a11y table; interaction is a recorded future
  change.
