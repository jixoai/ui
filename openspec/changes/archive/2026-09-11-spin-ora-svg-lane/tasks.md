# tasks — spin-ora-svg-lane

## P. The plugin face (packages/vite-plugin)

- [x] P1: `src/spinners/` — types (SpinnerSource string|{file},
      SpinnersPluginOptions, SpinData {v,n,d}), the vendored
      blocks-wave manifest (svg verbatim from magecdn, MIT noted),
      resolve.ts (adapter I/O), generate.ts (PURE generator, NO svgo,
      single inline module), vite-plugin.ts (buildStart validate/
      resolve + optional write + drift-warn — NO resolveId/load,
      no virtual surface, design §8), script.ts
      (writeSpinSetArtifact/checkSpinSetArtifact), index.ts barrel
- [x] P2: the umbrella option — `jixoai({ spinners })` default-off,
      bare `{}` = blocks-wave-only (no ≥1-of-2 matrix); keep the
      entry's static graph pure (the dist graph-purity gate decides
      whether a bridge is needed)
- [x] P3: exports map `./spinners` sub-entry + tsdown config +
      package description sentence; per-entry purity gate in the
      packaging test battery
- [x] P4: plugin vitest battery — default artifact (blocks-wave
      union + payload byte-equal to vendored svg modulo root
      extraction), custom inline/file sources, kebab grammar +
      override law, safety (`<script>` rejected, `<animate>` ALLOWED
      — R2 pinned), generator determinism, drift-warn, umbrella
      default-off + bare-{} shape, write:false never touches disk
- [x] P5: build the package (tsdown) — the root script imports dist

## C. The catalog + component (registry/files/ui/spin)

- [x] C1: `spin-catalog.ts` — cli-spinners@2.9.2 corpus curated by
      the design §1 rule (Emoji_Presentation-based predicate, BMP
      ranges embedded; curation script checked in as the receipt),
      frames VERBATIM, intervals riding, TextSpinnerName union +
      TEXT_SPINNER_NAMES; bouncingBar excluded by name (bracket
      art); header cites cli-spinners MIT. ROOT devDependency
      cli-spinners@2.9.2 + scripts/verify-deps-baseline.json row
- [x] C2: `spin.svelte` rewrite — unified `spinner?: SpinName |
      TextSpinnerName` (default 'dots', artifact-first override,
      unknown-name fallback + one dev warn), JS interval engine
      (SSR frame 0, matchMedia change-listener for reduced-motion),
      svg posture (owned root, size via SpinDefaults open literal
      slot, n-aware painting, pauseAnimations/unpauseAnimations
      under reduce), wrapping posture UNCHANGED
      (scrim/aria-busy/pointer law), brackets deleted
- [x] C3: `spin.css` — shrinks to the `:where([data-jx-spin-svg] *)`
      reduced-motion animation kill (unlayered carve-out precedent;
      file STAYS in the registry files list);
      `spin-defaults.svelte.ts` contract refresh (spinner/size join
      the surface — no longer zero-vocabulary-hit);
      `index.ts` barrel updates
- [x] C4: `scripts/gen-spin-set.mjs` + package.json `gen:spins` /
      `verify:spins`; generate `registry/files/lib/spin-set.gen.ts`;
      ADD `'verify:spins'` to scripts/verify-all.mjs's FIXED gate
      array (it does not enumerate npm scripts)

## D. Dogfood + docs + registry

- [x] D1: mirror sync — apps/www copies of the spin files +
      `src/lib/spin-set.gen.ts`; REGENERATE the mirror manifest
      (gen-mirror-manifest write mode) so new files join it;
      BOTH `apps/www/vite.config.ts` AND `registry/vite.config.ts`
      add `spinners: {}` byte-identically (the vite-config-parity
      gate diffs them; CONFIG-PARITY with the root gen script)
- [x] D2: docs page `docs/components/spin.html` — text gallery
      (family representatives), svg section (blocks-wave, size,
      reduced-motion note, multi-instance/lockstep + unload-order
      note), postures section unchanged in law; blueprint scene trio
      (text/svg/wrap)
- [x] D3: registry.json — spin item (description, files list incl.
      spin-catalog.ts AND spin.css, registryDependencies +=
      @jixoai/spin-set) + NEW spin-set item (registry:lib, artifact
      file, gen:spins docs); regenerate public/r/spin.json + docs md
      via the build flow; component-metadata verify green

## V. Gates

- [x] V1: www suite — NEW spin battery (frame-0 SSR markup without
      brackets, spinner union, svg markup, reduced-motion paths
      mocked, wrapping regression, catalog snapshot vs cli-spinners
      data); BLAST-RADIUS re-records: defaults-overlays.spec.ts
      (SpinDefaults banner), batch5-antd-components.spec.ts
      ([data-jx-spin-*] assertions), context-coverage fixture spin
      copy — RULING (wave 2): the fixture is a SYNTHETIC designed-to-fail
      A1 counterexample, never a real mirror — re-syncing would break
      the gate's own spec, so it stays untouched by design; typecheck
      green (typecheck-only run)
- [x] V2: plugin suite + packaging battery green; `verify:spins`
      fresh; `verify:all` end-to-end green (mirror, meta, docs,
      budgets re-recorded where shifted, deps baseline); openspec
      validate --strict
- [x] V3: vision walkthrough — real browser pass over the docs page
      (text gallery animates, blocks-wave animates + respects
      reduced-motion emulation, wrapping posture intact,
      multi-instance + first-instance-unmount scenario, Safari or
      WebKit engine pass for the SMIL innerHTML path), screenshots
      filed; subagent report lists spawned processes + recycle
      evidence

## S. Spec + closeout

- [ ] S1: spec deltas land as written (build-plugins spinners
      requirements, component-authoring spin catalog + svg posture
      requirements); archive the change; commit + push; worktree
      cleanup
