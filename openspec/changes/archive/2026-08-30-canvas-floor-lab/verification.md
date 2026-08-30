# Verification: canvas-floor-lab

## Baseline (2026-08-30)

- canvas h2 leaks into every outline; DensityDemo ×4 on the canvas
  page; 46/77 dead sourceUrls; 8 pages fake source; tree pane on 45
  two-file pages; no theme/density toggles.

## Gate evidence

1. `npm run verify:all` green incl. docs-structure (scoped lint) and
   the no-github-href / ?raw-only sweeps.
2. ToC probe: no canvas-internal headings on any of the 72 pages.
3. Derived-link probe: every sourceUrl resolves HTTP 200 on GitHub.
4. Lab probe (browser): effect/variant/size changes sync the snippet;
   reset restores; projection row tracks state; reduced-motion static.
5. Visual: pilot pages × {light,dark} × {comfortable,compact} — 20
   screenshots into the audit shots dir; `verify:surface` 47/47.
