# Tasks: stylex-kernel-phase0

> Status legend: [x] done · [~] in flight · [ ] todo. The research
> dossier (archive/2026-09-13-stylex-kernel-research) is the
> evidence base; this change's receipts land in its own research/
> folder.

## P0.1 — the production-bug pre-checks (phase-1 gate; cherry-pickable)

- [x] scripts/verify-range-thumb-ring.mjs equivalent: PROBED
      (research/p0-bug-probes.md) — verdict **NO BUG**: Chrome 152
      renders the cq law healthily (pixel-diff 0.0000 vs px
      overrides); the L3b lead was an API trap
      (getComputedStyle(el,'::-webkit-slider-thumb') returns HOST
      geometry — untrustworthy for UA-shadow pseudos; recorded as a
      kernel-note, no production change).
- [x] scripts/verify-popover-area-align.mjs equivalent: PROBED —
      verdict **CONFIRMED BACKWARDS**: span-right measures LEFT-
      aligned, span-left RIGHT-aligned; production surfaces ride
      overflow-rescue (hue via flip-inline). Fix plan (from the
      receipt): popover.svelte placement-mapping span-suffix swap
      (L189-197), terminal-header.css override -> span-left (or drop;
      family inline is span-left) + comment fix, navigation-menu-
      panel.svelte L137 intent check; visual regression across
      nav/dropdown/tooltip/float-button/hue.
- [x] Implement the popover-area fix as cherry-pickable commits +
      permanent regression probe rows. [IMPL-B, 2026-09-15. FIX COMMIT:
      popover.svelte placement→area map span-suffix swap (*-start →
      span-right, *-end → span-left — now agreeing with the r23
      physical map); terminal-header.css override → `bottom span-left
      !important` (RIGHT edges under the pill, rendered DIRECT —
      pre-fix the mega panels rode the ICB clamp at [512,1440],
      aligned to neither edge); navigation-menu-panel family inline →
      span-right (LEFT edges under the item — the family's intent,
      evidenced by the header's pre-fix comment + the deliberate
      non-default inline; receipt verdict "right-aligned where left
      was intended"); composition-f.spec.ts updated (it asserted the
      buggy value); mirror manifest re-hashed (141 items / 532 pairs
      green). PROBE COMMIT: scripts/verify-popover-area-align.mjs +
      `npm run verify:popover-area` + verify-all row (4c — after the
      mirror-class gates, BEFORE every consumer gate, per design.md's
      final ordering authoring → payload → mirror → popover probe →
      consumer) + the /probe-popover-area fixture route (REAL Popover
      on the area path, ?placement-driven, geometry authored to keep
      both arms inside 1440×900 so no rescue masks the alignment).
      Protocol of record executed: ONE metric panelLeft − pillLeft;
      PASS = |primary| ≤ 0.5px ∧ |control − primary| ≥ 1px. RECEIPTS:
      post-fix primary=0px / control=−171px / exit 0; TEETH — the map
      swapped back on a rebuilt dist → primary=−171px, FAIL exit 1;
      restored + rebuilt → PASS again. Geometric sweep, 10 real
      surfaces pre/post: nav mega panels clamped → dR=0; nav family
      demo right-aligned → dL=0 (left, its intent); hue-popover pixel-
      identical (mechanism now direct); dropdown/tooltip/float-button
      IDENTICAL pre/post (own maps, untouched). typecheck: zero type
      errors, failure set identical to clean HEAD (43 pre-existing
      live-wasm/env failures + the load-flaky markdown-ssr, both
      trees). openspec --strict green. KNOWN FOLLOW-UP (out of P0.1
      territory): dropdown-menu.svelte, tooltip.svelte, float-button.
      svelte, menubar-panel.svelte carry the same inverted span maps
      and still ride overflow-rescue — the phase-1 corpus sweep owns
      them.]

## P0.2 — the engine rides the plugin (build-side)

- [x] packages/vite-plugin: devDep @stylexjs/unplugin @0.19.0
      ( + peer review of the version pin policy: exact pin, bump =
      re-run D1 fixtures). [f0b560f5 — + @stylexjs/stylex@0.19.0
      (test fixtures + the apps' type surface); policy in
      src/stylex/vite-plugin.ts header + README; engine kept EXTERNAL
      in tsdown (bare specifier, F11)]
- [x] The jixoai() wiring for our builds: transform scope = the
      kernel trees only (registry/files, apps/www/src/lib mirror),
      NOT docs routes. [f0b560f5 + d7891b37 — the kernel-scope gate
      (realpath-normalized; vite hands realpath'd ids) + the bridge
      (the icons-bridge law; enforce-undefined plugin-order trick);
      twins opt in via stylex.include]
- [x] The F9 canonical layer statement baked into emitted CSS (the
      plugin owns it; no author hand-writing). [f0b560f5 —
      STYLEX_LAYER_STATEMENT at byte zero of every emitted css
      carrying stylex output (mirrored re-hash emission); verified in
      the REAL www build: dist entry css starts with the FULL
      statement, 4 @layer stylex blocks, the defineVars :root block;
      dev /virtual:stylex.css carries it too; the §5.2 css-entry trap
      warns with the named fix]
- [x] The vite twins stay byte-identical (gate green). [d7891b37 —
      cmp-verified both pairs (vite.config.ts + package.json twins);
      registry-side root math resolves to match-nothing dirs, the
      established twin path-math precedent]

## P0.3 — the typed token layer

- [x] registry/files/lib (new lib item): tokens.stylex.ts wrapping
      the jixoai sheet via defineVars with verbatim var() values.
      ACCEPTANCE, itemized: registry.json edge added; mirror-
      manifest regenerated + verify:mirror green; blueprint scene
      committed; the byte-twin vite configs updated identically.
      [d79bc320 + fe12cde7 — 60 tokens, key --jx-<sheet-name>, value
      verbatim var(--sheet-name); the sheet's own --jx-* kernel
      channels excluded (self-reference cycle); item 'tokens'
      (registry:lib, engines) with the @jixoai/jixoai-theme install
      prerequisite; mirror 141 items / 532 pairs GREEN; scene
      tokens.svelte + tokens.svg through the real pipeline (first
      real atoms: static longhands, zero-runtime sx() table); found +
      fixed the serializer's wide-gamut gap (three sheet hues are
      out-of-srgb; parseRgb now clamps negative/>1 color(srgb)
      components)]
- [x] Type-safety probe: a typo'd token fails the kernel build
      (compiles green otherwise). [a3d00956 —
      research/stylex-typo-probe.mjs: clean exit=0; typo exit=1
      naming the key ("Did you mean '--jx-primary'?"); receipt in
      research/p0-engine-token-receipts.md]

## P0.4 — the payload generator + consistency gate

- [ ] Generator: compiled class-constant modules + per-item CSS from
      ONE build pass (same-build hash).
- [ ] scripts/verify-stylex-payload.mjs: re-derives both artifacts,
      asserts hash identity + spot-compiles a consumer import; wired
      into verify:all.
- [ ] verify:shadcn-add extended: the clean consumer's lockfile
      contains ZERO @stylexjs/* entries; items work via CSS import.

## P0.5 — the authoring law's teeth

- [ ] babel propertyValidationMode:'throw' in kernel builds.
- [ ] scripts/verify-stylex-authoring.mjs: forbidden patterns
      (factory calls at non-markup level, vars-keys, shorthands in
      .stylex.ts) → fail naming file+pattern; wired into verify:all.
      SCAN SCOPE is the MIGRATION LEDGER — research/migration-ledger.json
      (schema: { version, files: [posix-relative stylex-touched paths] };
      maintained: each migration commit appends its family's files;
      P0 seeds it with the phase-0 dogfood files; the authoring gate
      and the canonical-statement check read it, legacy trees are
      never scanned).
- [ ] The law text lands in the spec deltas (this change's specs/).

## P0.6 — the corpus dogfood

- [ ] The 8 research families compile through the real pipeline;
      equivalence check vs the spike's compiled outputs via the
      COMMITTED comparator script (serialization normalization:
      number formats, pseudo content, steps() timing); receipt in
      research/.
- [ ] No production markup switches paint (phase 1); the dogfood
      runs as a build fixture, not a shipped page.

## P0.7 — gates + docs

- [ ] verify-all chain gains: stylex-payload, stylex-authoring, the
      popover regression probe (ONE permanent probe).
- [ ] Docs: the install prerequisite page (import the item CSS;
      engine tooling optional for consumers' own use).

## P0.8 — review gates (remix)

- [ ] Gate 1: Codex reviews this change doc set (fresh agent).
- [ ] Gate 2: Codex reviews the implementation + receipts; iterate
      to ≥ the research bar (8.0+); score + reasons recorded.
