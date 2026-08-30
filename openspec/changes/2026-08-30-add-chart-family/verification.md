# Verification: add-chart-family

## Baseline (2026-08-30)

- No chart item in registry.json (93 items); no `/r/chart.json`; no
  chart docs page.

## Gate evidence

1. `npm run verify:all` green (mirror, deps, hook-law, laws, surface,
   budgets).
2. `public/r/chart.json` exists; registry.json count 94. ACCEPTANCE
   GATE: the A change's data-driven clean-install harness has a
   registered chart case — fresh Vite consumer, install from generated
   `public/r/`, import the canonical entry, BUILD; this build is the
   success proof (a bare `shadcn add` resolution is diagnostic only).
   Homepage: chart appears only if deliberately added to the featured
   projection.
3. Glyph-math unit suite green (scale, braille packing, dasharray,
   degenerate inputs).
4. Browser probe: `role=img` + aria-label present; visually-hidden
   table mirrors the series; reduced-motion paints static.
5. Docs page: skeleton-compliant (docs-demo-standard lint), demos
   render both themes, add-command copy yields
   `https://ui.jixoai.com/r/chart.json`.
