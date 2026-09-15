# Tasks — 2026-09-15-visual-quality-iteration

Workstreams are independent enough for parallel subagents; each carries its
own probe/screenshot receipts. Standing gates for EVERY task: focused tests
green (`pnpm --filter <pkg> exec vitest run <file>` — exec form, never
`test --`), www + plugin suites green before the gate review, `openspec
validate 2026-09-15-visual-quality-iteration --strict`, `rg -n 'jxoai'`
self-sweep, explicit-path `git add` only.

## W1 — the fill channel's scope law (press-effect-runtime)

- [ ] 1.1 Implement the scope ladder in `contextIsDark` (nearest ancestor
  scope → OS-only-when-unsccoped) + the walk-up effective-canvas resolution
  in the auto path of `resolveFill`; retire the `Canvas` keyword; add the
  ancestor-chain class observer with cleanup
- [ ] 1.2 jsdom ladder battery: scope beats root beats OS; no-scope → OS;
  gradient-stage walk-up; explicit fills untouched
- [ ] 1.3 Browser pixel probe: light stage + `emulateMedia dark` → light
  sweep (the Owner's symptom inverted); dark stage + OS light → dark;
  live scope flip re-resolves; rainbow same channel
- [ ] 1.4 Docs: effects page shimmer/rainbow demos keep working in both
  stage themes on an OS-dark machine (screenshot receipts)

## W2 — the mermaid backdrop

- [ ] 2.1 `backdrop` prop (default on) + the veil implementation
  (backdrop-filter blur + theme-background-derived tint, radius, padding,
  border); opaque fill retires from the dark path; `@supports not
  (backdrop-filter)` floor
- [ ] 2.2 Contrast calibration: probe min-contrast over diagram nodes
  against the tinted ground; lift node fills only if the measurement says
  so
- [ ] 2.3 Tests: unit (prop matrix: effective theme × backdrop × supports),
  probe (veil computed style on/off/unsupported), screenshot receipts
  (light page + dark pin, on/off)
- [ ] 2.4 Docs: mermaid section gains the backdrop demo + prop row

## W3 — the timeline drawn spine

- [ ] 3.1 The spine layer: whole-list SVG overlay, ResizeObserver +
  item-locator measurement, axis/direction/interlaced/RTL coordinate
  transform, z-order under dots/content
- [ ] 3.2 The presets: plain / dashed (dot-edge phase anchor,
  stroke-dashoffset) / beam (stroked gradient, width, soft edges,
  reduced-motion freeze) + scroll-progress as stroke draw
- [ ] 3.3 The no-JS floor: per-item CSS line pre-hydration, upgrade swap
  on hydration
- [ ] 3.4 The seam migration: `spine` prop replaces `line(i)` (breaking);
  custom-spippet geometry payload contract; registry.json + docs rewrite
- [ ] 3.5 Probe battery: continuity across the axis × direction × RTL
  matrix; dash phase; beam width; scroll-progress draw; floor upgrade;
  screenshot receipts per variant

## W4 — the scroll-area family

- [ ] 4.1 `scroll-area-kit` lib item: verdict, thumb geometry, state
  machine (idle fade / hover grow / drag pin / focus+AT pin), a11y
  contract; family-neutral, zero paint
- [ ] 4.2 `scroll-area` rework: always hand-drawn, capsule thumb, token-law
  look, both axes; `variant` retires (source scan canary)
- [ ] 4.3 `native-scroll-area` item: platform bar + capability styles
  (gutter stable, scoped color-scheme, scrollbar-width tiers,
  overscroll-behavior)
- [ ] 4.4 Probe battery: verdict correctness (content fits/overflows,
  membership mutation), thumb geometry ratio, keyboard scroll, AT pin;
  screenshot receipts light/dark both axes; registry.json entries + docs
  pages for all three items

## W5 — the anchor sweep + ride-alongs

- [ ] 5.1 Flip the four inverted `position-area` sites to spec semantics;
  placement-matrix probe + baseline-diff screenshots per surface
- [ ] 5.2 Family sheets touched by W1–W4 migrate headers to the canonical
  five-layer statement; the migration ledger records them
- [ ] 5.3 `buildId`/`generatorVersion` bump if generator inputs changed;
  payload regen + manifest verification

## Gate

- [ ] G1 Codex change-doc review (herdr, gpt-5.6-terra xhigh) — iterate
  until PASS ≥ 8.0
- [ ] G2 Codex implementation review against the receipts — iterate until
  PASS ≥ 8.0; then archive + push
