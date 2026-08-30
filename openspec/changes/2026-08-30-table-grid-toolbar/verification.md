# Verification: table-grid-toolbar

## Baseline (2026-08-30)

- table page: paint + card-mode demos only; no sort/filter/selection/
  toolbar recipes. transfer/tour/descriptions/statistic: single-form
  demos.

## Gate evidence

1. `npm run verify:all` green; docs-structure lint accepts all five
   touched pages.
2. Browser probes: aria-sort toggles; select-all indeterminate; row
   actions open; column popover toggles visibility; tour non-modal
   leaves scroll free; countdown ticks; descriptions responsive
   columns collapse at the narrow frame.
3. `followups.md` lists any missing table APIs discovered (each with
   the recipe that needed it); no silent workarounds in demo code.
