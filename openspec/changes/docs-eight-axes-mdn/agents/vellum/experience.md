# vellum — experience log

## Techniques (mine)
- **Axis-honesty probe (keep for every page):** after coding a page's
  per-axis table, run a Playwright computed-style probe against the
  dev server that asserts EACH row's claim — carrier strings in the
  style attr, computed font-size/corner/hit values, attr stamps
  (data-density, .dark class), query() resolution across a viewport
  flip and back, and the marker/row counts. 17/17 beat "looks right".
  Scratch script: /tmp/vellum-alert-axis-probe.mjs (pattern: locator
  by title text → one evaluate returning all facts → boolean checks).
- **Measure the token ladders, don't trust old tables:** the old page
  quoted `--jx-hit` as "28/32/40/48" — measured truth is
  24/28/32/40/48 (2xs→lg). Any number a page quotes, measure once and
  annotate "(measured rungs)".
- **Custom reference tables via `PropsTable props={rows}` with
  `title=""`:** the concept page's idiom for per-axis/lane tables —
  zero new machinery, and title="" suppresses the h4 so the page
  keeps exactly ONE data-jx-props-table-universal marker.
- **query() doc pattern:** `query<{ sm: DensityLane }>({ sm: 'small' },
  'large')` — the explicit generic pins case values to the lane (the
  bare literal infers plain strings and fails assignment).

## Highlights found in others' pages
- (none yet — round 1; reviews come next)

## Mistakes to avoid
- **The archetype has no Usage slot, but the docs-site SPEC hard-
  requires exactly one `Usage` H2 on every page** (verify:docs FAILS,
  not warns, on 0 or 2). The live-example section must be titled
  "Usage". Cost me one red gate + one rebuild.
- **Source comments lie about behavior.** alert.svelte claims size
  "moves the whole notice: title, body and the × affordance scale" —
  the atoms are rem-anchored; only the root font-size moves. Never
  transcribe family comments into doc prose without a computed-style
  check.
- **query() media keys are MIN-WIDTH.** `{ sm: X }` applies AT ≥40rem;
  the base applies below. My first demo had the ladder inverted and
  only the viewport-flip probe caught it.
- **`rg -rn` is the replace trap** — I did it to myself once this
  task; matched text turned into "n" and looked like `var(n, 0px)`
  css. `rg -n` only.
- **Dev-server wrapper PIDs orphan their vite grandchild**: killing
  the dev.mjs PID left vite listening on :5242. Always
  `lsof -i :<port> -sTCP:LISTEN` after the kill, and kill whatever
  still holds the port by its own PID.
- **A stale dist makes gate baselines meaningless** — the dev server
  refreshed apps/www/dist mid-session, so my "baseline" verify:docs
  actually linted my own intermediate draft. Run the fresh
  `npm run build` before believing any dist-based gate number.

## Upgrades applied back to my pages
- (none yet — will re-run this checklist across avatar/button-group/
  … as their tasks come up: measured token ladders, Usage-H2 law,
  query() min-width direction, axis probe before report)
