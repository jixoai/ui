# Tasks: add-chart-family

Prerequisites: A (verify:deps gate, featured projection, clean-install
harness) and B (dev /r/ serving) land first; C's docs law is consumed at
integration only. NO dependency on F (form family). registry.json entry is REPORTED by this change's
agent and applied by the integrator (batch order A → F → chart → H).

## 1. Family authoring (folder law)

- [ ] 1.1 `registry/files/ui/chart/` skeleton: `chart.svelte` (family
      context), `chart-bar.svelte`, `chart-sparkline.svelte`,
      `chart-line.svelte`, `chart-donut.svelte`, `chart.css`,
      `index.ts` (pure barrel).
- [ ] 1.2 Data → glyph math as pure functions ( exported from the
      folder for tests): scale-to-ramp, braille packing, dasharray
      segment math — unit-testable, no DOM.
- [ ] 1.3 css law compliance: colocated `chart.css`, `@layer
      components`, `:where()` selectors, `data-jx-chart-*` semantic
      hooks, tokens only.

## 2. Registry + build

- [ ] 2.1 registry.json item (type registry:ui, deps: icons where
      imported, jixoai-theme) + `shadcn build` emits
      `public/r/chart.json`.
- [ ] 2.2 Mirror manifest re-record; `verify:mirror`,
      `verify:deps` (new gate), `verify:hook-law` green.

## 3. Docs + demos

- [ ] 3.1 Docs page `docs/components/chart.html` per the
      docs-demo-standard skeleton: bar / sparkline / line / donut /
      stat-card composition demos; props table; a11y notes (the table
      fallback demoed).
- [ ] 3.2 The parity page (+ any surface checks) gains the chart
      family rows if applicable.

## 4. Tests

- [ ] 4.1 Unit: glyph math (value→ramp mapping, braille cell packing,
      dasharray totals = circumference, zero/negative/NaN input
      guards).
- [ ] 4.2 Browser: a11y name present, table fallback hidden-but-real,
      reduced-motion static render (playwright-core pattern per the
      www skill — headless false for visible assertions if needed).

## Verification

- `npm run verify:all` green; `curl dev /r/chart.json` → 200 (needs
  site-polish dev serving or the build output).
- Docs page demos render in both themes; values hand-checked against
  input arrays.
- `npx shadcn add @jixoai/chart` resolves in the scratch consumer.
