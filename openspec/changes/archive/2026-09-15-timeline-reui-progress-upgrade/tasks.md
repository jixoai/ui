# Tasks

## W1 — the fill auto basis correction

- [x] 1.1 `contextCanvasCss(host)` in press-effect-runtime.ts: nearest
  theme-scope ancestor (self included; unscoped → root element first),
  computed `--background` parsed OPAQUE via `@jixoai/color-utils`
  (`parseColor` + `oklchToRgb` — the site's oklch tokens; the
  dependency joins press-button's registryDependencies) → canvas;
  fallback `contextIsDark ? '#000000' : '#ffffff'`.
  `resolveFill(undefined)`
  and `solidFill`'s default base switch to it; `contextBaseCss`
  retires (export deleted if consumer-free — ledger-recorded).
- [x] 1.2 The W1 probe REWRITTEN to the new basis — WRITE
  `openspec/changes/2026-09-15-timeline-reui-progress-upgrade/research/w1/fill-scope-token-probe.mjs`,
  then RUN `node openspec/changes/2026-09-15-timeline-reui-progress-upgrade/research/w1/fill-scope-token-probe.mjs`
  (CHROME_PATH preset inside, dev server on 5199), expected ALL
  PASS, exit 0 ×3: light stage + dark opaque decorative
  band (the gallery case) → LIGHT token fill; dark scope → dark;
  unscoped → root token (white/black only on a non-token page);
  slash-alpha: `/ 1`|`/ 100%`|absent → proceed, `/ none`|< 1|
  unparsable → fallback (three branches each probed); live
  class/attr flips
  re-resolve; rainbow same battery.
- [x] 1.3 effects/press-button docs copy: the fill channel's auto
  description states the scope-token basis.

## W2 — scroll-area chrome parameters

- [x] 2.1 scroll-area.css: `--jx-scroll-thumb-radius` (default 0px)
  replaces the hard capsule; `radius` prop (number | 'full') stamps
  the var; `width` prop ('auto' | 'thin' | 'wide', default 'auto')
  stamps `data-width`; tier table paints `--jx-scroll-track-w`
  (8/12/16).
- [x] 2.2 Flush + edge anchor: TRACK edge insets → 0 (both axes);
  the THUMB keeps its edge-side flank at the resting 2px inside the
  flush track (`inset-inline-end: 2px` y / `inset-block-end: 2px` x)
  and the hover/drag growth narrows the INNER flank 2px → 0 only
  (growth strictly INTO content, +2px; resting 4/8/12, hover/drag
  6/10/14; RTL mirrors logically).
- [x] 2.3 The chrome probe EXTENDED — WRITE `openspec/changes/2026-09-15-timeline-reui-progress-upgrade/research/w2/scroll-chrome-params-probe.mjs`,
  then RUN `node openspec/changes/2026-09-15-timeline-reui-progress-upgrade/research/w2/scroll-chrome-params-probe.mjs` (dev server
  on 5199), expected ALL PASS, exit 0 ×3: radius 0
  default + configured px + 'full'; tier track widths 8/12/16 and
  resting thumb 4/8/12 (hover 6/10/14) measured; track flush computed
  (`inset-*-end: 0`); hover growth — the edge-side flank coordinate
  unchanged to the device pixel, cross size grows strictly inward;
  drag pin holds widened; idle fade + four pins re-asserted.
- [x] 2.4 scroll-area docs demo: the radius × width matrix stage.
- [x] 2.5 registry.json scroll-area props updated; mirror synced.

## W3 — timeline: the reui contract + fractional path

- [x] 3.1 The value contract in timeline.svelte: `defaultValue` = 1,
  `value`, `onValueChange`; decimal-safe internal `$state`; item
  context (step defaulting to DOM order + 1, `data-completed`
  attribute paint when `step <= current`).
- [x] 3.2 Geometry: the STOPS table `stops: { step, arc }[]` in
  TimelineSpineGeometry (the DEDUPED milestone table; arc = the
  owning node's cumulative polyline length — 0 at the first milestone
  on the unique-first-step ladder, non-zero only on a duplicated
  first step; the chord `runLength` RETIRES from dasharray
  consumers — scroll stroke + beam ride `pathLength =
  stops.at(-1).arc`); the progress stroke paints under the value
  contract with STEP-SPACE dashoffset arithmetic (sub-first value →
  length 0; gap interpolation
  across declared step gaps); CSS transition on the dashoffset
  (reduced-motion none); scroll mode owns the stroke — the value
  inline dashoffset is NOT painted under `animation='scroll'`; view
  composes.
- [x] 3.3 Parts: `TimelineHeader` (new file, parity);
  `TimelineDot` `children` inside the node (icon pattern), slots and
  variants untouched; index.ts exports; timeline.css completed-state
  token paint (dots/titles/times).
- [x] 3.4 Unit tests — ADD `apps/www/test/timeline-value.spec.ts`,
  run `pnpm -C apps/www exec vitest run test/timeline-value.spec.ts
  --maxWorkers=1` (www is OUTSIDE the pnpm workspace —
  `-C apps/www`, never `--filter`), expected all green:
  uncontrolled/controlled/decimal semantics; completed thresholds
  (1.5 → item 1 on, 2 off); pending wins over completed; step
  constraints (duplicate drop + warn); arc math at 1/1.5/last and
  inside a declared gap (2,5 @ 3.5); the duplicate-first-step
  fixture (1,1,2: value 0.5 → length 0, value 1 → arc(node2) — the
  owner mapping asserted, sub-first clamps to 0);
  polyline-vs-chord fixture; transition + reduced-motion; the
  explicit-fill regression `solidFill('rgba(255, 255, 255, 0.35)')`
  composites unchanged, plus the HOSTLESS token-base assertion
  (`solidFill(color)` with no base reads the document-root token —
  jsdom `--background` stubbed — falling to white with no document).
- [x] 3.5 The progress probe — WRITE `openspec/changes/2026-09-15-timeline-reui-progress-upgrade/research/w3/timeline-progress-probe.mjs`,
  then RUN `node openspec/changes/2026-09-15-timeline-reui-progress-upgrade/research/w3/timeline-progress-probe.mjs` (dev server on
  5199), expected ALL PASS, exit 0 ×3: `value={1.5}` stroke tip at the node1→node2 midpoint (±1px
  path-length sampling); tween animates dashoffset (two-frame delta
  > 0); scroll ownership re-asserted (inline dashoffset absent under
  `animation='scroll'`); the duplicate-first-step probe arm (a live
  (1,1,2) fixture: value 0.5 → zero-length stroke, value 1 → tip at
  node 2's center, ±1px).
- [x] 3.6 Keepers regression: `pnpm -C apps/www exec vitest run
  test/timeline-spine.spec.ts test/timeline-value.spec.ts
  --maxWorkers=1` green after the upgrade (the standing spine
  battery: namespacing, presets, floor, RTL, density, pending —
  today timeline-spine alone = 10 passed; timeline-value is 3.4's
  ADD).

## W4 — docs

- [x] 4.1 timeline.html major upgrade: the TWELVE official reui
  families, one docs stage each (the official full titles are
  research/reui-family-inventory.md's source of truth; docs short
  names are display aliases; each stage's aria-label follows the
  inventory's frozen mapping table) + our
  four highlight demos (slots matrix · presets · geometry snippet ·
  decimal tween + controlled stepper), props table with the value
  contract. Docs lint green: `pnpm verify:docs`.
- [x] 4.2 The demos probe — WRITE `openspec/changes/2026-09-15-timeline-reui-progress-upgrade/research/w4/timeline-demos-probe.mjs`,
  then RUN `node openspec/changes/2026-09-15-timeline-reui-progress-upgrade/research/w4/timeline-demos-probe.mjs` (dev server on
  5199), expected ALL PASS, exit 0 ×3: the stepper buttons change
  `data-completed` counts; the tween's dashoffset varies over two
  sampled frames; all twelve family stages mount — one
  `[data-jx-canvas-stage]` per family whose aria-label equals the
  inventory mapping table's `docs stage aria-label` column, verified
  row by row (c-timeline-1 through 12).

## Closure

- [x] 5.1 Mirror byte-equal (www ⇄ registry), payload parity tests,
  registry.json complete (new files + props); `verify:mirror` green.
- [x] 5.2 The standing battery, against the FROZEN baseline — RUN at
  repo root: `pnpm
  verify:meta && pnpm verify:standards && pnpm verify:deps && pnpm
  verify:docs && pnpm verify:mirror && pnpm verify:stylex-payload`
  all GREEN; then the two baseline comparisons against
  research/baseline-failure-set.md (its acceptance protocol):
  `pnpm -C apps/www exec vitest run test/ --maxWorkers=1` — expected
  exit 1 with the failing-suite set a SUBSET of the frozen 12 and
  `failed ≤ 45`; `cd packages/vite-plugin && npm test --
  --maxWorkers=1` — expected exit 1 with the failing-file set a
  SUBSET of the frozen two (`test/icons/library/example-hmos.test.ts`
  + `test/plugin.test.ts`), failed FILES `≤ 2` (FILE granularity; if
  the lib-mode case greens but the file fails elsewhere, the frozen
  file updates in the same commit). Any NEW suite/file or higher
  count reds the closure; a strictly smaller set updates the frozen
  file in the same commit.
- [x] 5.3 No-bump: the W1 probe battery's non-fixture assertions
  unchanged outside the change's blast radius; the migration ledger
  — WRITE
  `openspec/changes/2026-09-15-timeline-reui-progress-upgrade/research/migration-ledger.md`,
  check `rg -c "contextBaseCss|capsule|standoff" openspec/changes/2026-09-15-timeline-reui-progress-upgrade/research/migration-ledger.md`
  (≥ 3 hits) — records every retirement (`contextBaseCss`, the hard
  capsule, the track standoff).
- [x] 5.4 vision subagent walkthrough + experience pass on the
  upgraded pages (the Owner's acceptance step); findings addressed or
  honestly recorded.
