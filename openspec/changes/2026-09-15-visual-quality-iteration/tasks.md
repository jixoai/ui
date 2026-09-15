# Tasks — 2026-09-15-visual-quality-iteration

Workstreams are independent enough for parallel subagents; each carries its
own probe/screenshot receipts into this change's `research/` directory.
Standing gates for EVERY task: focused tests green (`pnpm --filter <pkg>
exec vitest run <file>` — exec form, never `test --`), www + plugin suites
green before the gate review, `openspec validate
2026-09-15-visual-quality-iteration --strict`, `rg -n 'jxoai'` self-sweep,
explicit-path `git add` only, and any task touching registry files lands
its mirror sync + manifest update in the same commit (task 5.4 closes the
change-wide parity proof).

## W1 — the fill channel's scope law (press-effect-runtime)

- [ ] 1.1 Implement the scope ladder in `contextIsDark` (nearest ancestor
  scope → OS-only-when-unscoped) + the walk-up effective-canvas resolution
  in the auto path of `resolveFill`; retire the `Canvas` keyword; add the
  ancestor-chain scope observer (`attributeFilter: ['class',
  'data-theme']`) with cleanup
- [ ] 1.2 jsdom ladder battery: scope beats root beats OS; no-scope → OS;
  gradient-stage walk-up; explicit fills untouched; BOTH observer
  mutation kinds (class flip AND data-theme flip) re-resolve;
  walk-up boundaries — semi-transparent (alpha < 1) ancestors are
  SKIPPED until an opaque one is found, and a REPARENTED host
  re-walks its new chain
- [ ] 1.3 Browser pixel probe: light stage + `emulateMedia dark` → light
  sweep (the Owner's symptom inverted); dark stage + OS light → dark;
  live class flip and data-theme flip re-resolve without re-mount;
  rainbow same channel
- [ ] 1.4 Docs: effects page shimmer/rainbow demos keep working in both
  stage themes on an OS-dark machine (screenshot receipts)

## W2 — the mermaid backdrop (subtraction ink)

- [ ] 2.1 `backdrop` prop (default on) + the subtractive veil
  implementation (backdrop-filter blur + contrast/brightness chain, ZERO
  background ink on the veil layer; radius, padding, token-law border);
  the opaque theme-ground fill retires from the dark path except as the
  `@supports not (backdrop-filter)` floor; `backdrop={false}` →
  transparent
- [ ] 2.2 Contrast probe per the fixed acceptance: WCAG ratio, labels
  ≥ 4.5:1 vs node fill; fill, border, and connector strokes ≥ 3:1 vs
  the veil ground sampled adjacent to each object (2px past the node
  border; midpoint of the longest edge connector), pinned Chromium 2×
  screenshot sampling on the dark-pinned demo; any pair below
  threshold fails; derived-palette lift (through its own tokens) only
  if measurement demands, recorded
- [ ] 2.3 Tests: unit (prop matrix: effective theme × backdrop ×
  supports), probe (veil computed style on/off/unsupported —
  `background` transparent on the veil layer), screenshot receipts
  (light page + dark pin, on/off)
- [ ] 2.4 Docs: mermaid section gains the backdrop demo + prop row

## W3 — the timeline drawn spine

- [ ] 3.1 The spine layer: whole-list SVG as a `grid-area: 1/1` sibling in
  the one-cell grid host (source order under items, `pointer-events:
  none`, `isolation: isolate` on the list root; the decorative SVG
  carries `aria-hidden="true"`), ResizeObserver + childList + density
  re-measure, axis/direction/interlaced/RTL coordinate transform; the
  geometry payload contract (node centers in list-root coordinates,
  metadata, path data, density scale) exported and documented for
  custom spine snippets; a DOM-snapshot test locks the structural
  landing points (the grid host, the semantic list `<ol role="list">`,
  rest attributes on the root)
- [ ] 3.2 The presets: plain / dashed (dot-edge phase anchor,
  stroke-dashoffset) / beam (stroked gradient, width, soft edges,
  reduced-motion freeze) + scroll-progress as stroke draw; the two
  standing abspos exemptions RETIRE (beam → inside the SVG layer;
  scroll-progress channel → the stroke draw) — css-architecture
  exemption list updated with the retirement recorded
- [ ] 3.3 The no-JS floor: per-item CSS line pre-hydration, upgrade swap
  on hydration; floor receipt = real `javaScriptEnabled: false`
  screenshot
- [ ] 3.4 The seam migration: `spine` prop replaces `line(i)` (breaking);
  `line(i)` residue source-scan canary (two-directional fixture);
  registry.json + docs rewrite
- [ ] 3.5 Probe battery: continuity across the axis × direction × RTL
  matrix; dash phase; beam width; scroll-progress draw; floor upgrade;
  screenshot receipts per variant

## W4 — the scroll-area family

- [ ] 4.1 `scroll-area-kit` lib item SPLIT BY CONCERN: the shared CORE
  (verdict, thumb geometry, theme-scope resolution — zero paint, zero
  ARIA) + the hand-drawn INTERACTION ADAPTER (idle fade, hover grow,
  drag pin, keyboard, thumb a11y) + the native CAPABILITY STYLES
- [ ] 4.2 `scroll-area` rework: always hand-drawn, capsule thumb,
  token-law look, both axes; `variant` retires (source-scan canary);
  the four testable pins (region focus-within, thumb focus, drag,
  hover) each suspend the idle fade + thumb stays in the accessibility
  tree with live `aria-valuenow` (probe-asserted)
- [ ] 4.3 `native-scroll-area` item: platform bar + capability styles
  (gutter stable, scoped color-scheme, scrollbar-width tiers,
  overscroll-behavior); NO drawn thumb, NO custom scrollbar ARIA
  (probe-asserted absent)
- [ ] 4.4 Probe battery: verdict correctness (content fits/overflows,
  membership mutation), thumb geometry ratio, keyboard scroll, pins;
  screenshot receipts light/dark both axes; registry.json entries +
  docs pages for all three items + BOTH new items in the
  clean-consumer harness (`verify-shadcn-add.mjs` case for the
  component, the lib-item install-proof lane for the kit)

## W5 — the anchor sweep + ride-alongs

- [ ] 5.1 Flip the four inverted `position-area` sites to spec semantics
  (surface-occupies-the-named-region grammar); corrected side × align
  mapping tables land in the components' source; extend
  `scripts/verify-popover-area-align.mjs` to the four surfaces with
  thresholds + swapped-map negative control + baseline-diff screenshots
- [ ] 5.2 The eight enumerated css paths (press-button, mermaid,
  timeline, scroll-area, menubar, dropdown-menu, tooltip, float-button)
  migrate headers to the canonical five-layer statement; the migration
  ledger records them
- [ ] 5.3 `buildId`/`generatorVersion`: bump IFF generator inputs
  changed; the no-bump branch proves itself (input diff empty +
  manifest regenerated byte-identical); either branch recorded in the
  receipts
- [ ] 5.4 MIRROR/PAYLOAD CLOSURE for every registry item this change
  touches (modified components + the two new items): sync each to the
  `apps/www/src/lib/**` mirror, update mirror-manifest.json,
  `verify:mirror` green, `shadcn build` + payload parity
  (`registry/payload/stylex/payload-manifest.json` regenerated,
  SHA-verified), `verify:deps` green, and the two real-install
  clean-consumer cases from 4.4 green — the source-to-mirror and
  source-to-payload invariants both hold (mirror-sync spec)

## Gate

- [ ] G1 Codex change-doc review (herdr, gpt-5.6-terra xhigh) — iterate
  until PASS ≥ 8.0
- [ ] G2 Codex implementation review against the receipts — iterate until
  PASS ≥ 8.0; then archive + push
