# tasks — ui-plugin-followup (residual work)

## A. Architecture completion (priority: high)

- [ ] A1: DOM-AST isomorphism gate — the parity gate gains element
       tag/attribute/order/cardinality assertions BEFORE computed-style
       comparison (per vocabulary row, posture-scoped, class-attribute
       scoped: jx-html-* ignored, non-standard must match)
- [ ] A2: Face icon variable layering — --jx-icon-calendar/clock move
       from unlayered :root to @layer theme { :root { ... } } in
       jx-pure.css so the plugin's @layer theme vars can override them
       via import order
- [ ] A3: Three-budget baselines — record B-source (jixoai+jx-pure
       gzip), B-face (compiled face rules in canonical pipeline),
       B-consumer (full consumer bundle delta for one component);
       thresholds = baseline +5%; gates wired into CI
- [ ] A4: native-contract-fusion Codex closure — the V2 fusion change
       gets its own formal Codex review round (the r0-r5 closure was
       for ui-plugin-package; the fusion needs its own sign-off)

## B. Component migration (priority: medium)

- [ ] B1: Composite select — internal input/lane adopts jx-html-input;
       dropdown chevron connects to --jx-icon-chevron slot
- [ ] B2: Combobox — internal input adopts jx-html-input; trigger
       chevron connects to --jx-icon-chevron slot
- [ ] B3: Date-picker — calendar trigger connects to --jx-icon-calendar;
       internal input adopts jx-html-input
- [ ] B4: Color-picker — internal swatch adopts jx-html-color;
       pipette already rides .jx-color-shell::after (wrapper)
- [ ] B5: Tags-input — internal input adopts jx-html-input
- [ ] B6: Number-input — internal input adopts jx-html-input;
       steppers remain component-specific (platform stepper law)

## C. Plugin hardening (priority: medium)

- [ ] C1: opentype.js externalization — configure tsdown to keep the
       dynamic import('opentype.js') as external in dist (currently
       bundles 369KB; it's a build-time-only dep, never ships to the
       consumer's browser — just reduces the plugin package size)
- [ ] C2: HMR callback cleanup — the vite plugin's refresh path
       re-registers watcher callbacks without clearing old ones;
       add disposal/cleanup on provider re-creation
- [ ] C3: WOFF2 real round-trip test — current tests pass TTF bytes
       named .woff2; add a test with a real WOFF2 font file through
       the full decompress→parse→extract pipeline
- [ ] C4: Geometry consistency gate — lucide SVG paths exist in
       providers/lucide.ts, lib/icons.ts, and CSS data URIs (three
       copies); add a test that verifies they haven't diverged
- [ ] C5: Safety checker consumer config — JxUIPluginOptions gains
       an optional `safety?: SafetyCheckerConfig` field so consumers
       can replace the default warn-mode checker
- [ ] C6: tsdown define warning — fix the invalid define config that
       produces a build warning (non-functional but noisy)

## D. Publishing readiness (priority: low, pre-release)

- [ ] D1: package.json private → remove or set to false when ready
       to publish to npm
- [ ] D2: Consumer documentation — README for @jixoai/ui-plugin with
       install + vite config + provider selection guide; document
       the virtual module import path
- [ ] D3: Package-entry smoke test — verify that importing from the
       BUILT dist (not src) resolves correctly (types + runtime)

## E. Openspec hygiene (priority: immediate)

- [ ] E1: Archive native-contract-fusion (move to
       openspec/changes/archive/)
- [ ] E2: Archive ui-plugin-package (move to
       openspec/changes/archive/)
- [ ] E3: verification.md for ui-plugin-package — record the r0-r5
       Codex review evidence, test counts, and known non-blocking items
