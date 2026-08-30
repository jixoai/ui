# Verification: site-polish

## Gate evidence

1. `npm run verify:all` — green with the new `verify:docs-structure`
   in the loop.
2. Dev-serve probe: `curl --noproxy '*' localhost:5201/r/registry.json`
   → 200 `application/json`; `/r/date-picker.json` → 200.
3. Built-site probe: `grep -rl '>undefined<' apps/www/dist/docs` → no
   files.
4. Toast burst probe (dev, real browser): five pushed toasts render
   four visible + a `+N queued` chip; visible titles are "Deployed #N".
5. Parity/blueprints/probe pages carry `noindex`; parity page has site
   chrome and an intro paragraph.
6. Blueprint overflow probe (5.2) green; gallery visually re-checked.

## Baseline captures (2026-08-30, pre-fix)

- date-picker page: literal `display locale · value: undefined`.
- Dev `/r/*.json` → 404 + SPA fallback HTML (size 418581).
- Toast burst: visible toasts titled "queued 2..5 / older ones wait
  their turn".
- `/parity.html` bare grid, no chrome, no noindex.
- Blueprint toc-engine tile: "→ the line" overlapping "#below weight
  0"; list-item tile clipped at right edge.
- audit-pages.md: 41/79 pages flagged — dialog+sheet gutted, 18
  duplicate Usage, 8 missing openings, heading leakage on
  result/section-card/alert-dialog/component-canvas/popconfirm/tour,
  5 lowercase titles, avatar page's four `/favicon.png` demo srcs 404
  (SPA-fallback HTML served; site icon itself is fine), carousel
  playground focusability unverified.
