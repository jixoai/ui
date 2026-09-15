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
      plugin owns it; no author hand-writing). [f0b560f5, superseded by
      the Gate-2 P1-1 general law in abfdd8b1 — layer-law.ts is the
      ONE law source: canonicalLayerStatement(N) with the stylex tiers
      NESTED under components (components.stylex.priorityN, the
      append-only first-mention repair) and utilities eternally last;
      N covers every tier the css carries (dynamic — the O1-H 1..3
      reading was that corpus's special case); generateBundle bakes it
      at byte zero coverage-aware (Gate-2 r2: a canonical(0) sheet
      opening is NOT a bake — the atoms land in the linked asset); the
      real www build + payload items + dev /virtual:stylex.css all
      carry it; the §5.2 css-entry trap warns with the named fix; the
      dual-order browser assertion reads grid/grid in
      verify:stylex-payload]
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

- [x] Generator: compiled class-constant modules + per-item CSS from
      ONE build pass (same-build hash). [IMPL-D, 2026-09-15.
      scripts/lib/stylex-payload.mjs (the compile core — generator and
      gate import the SAME law, the css-laws slots precedent) +
      scripts/gen-stylex-payload.mjs. Item set is DATA-DRIVEN: registry
      items owning .stylex.ts (today: `tokens`) + the migration
      ledger's non-registry modules (keyed corpus/<basename> — phase 0
      has no migrated production component, so the ledger corpus keeps
      the pipeline on REAL atoms; phase-1 migrations move families to
      registry keys by the same derivation). Compile = the pinned
      engine's own vite factory driven through its public surface +
      __stylexCollectCss (the accessor the wrapper already licenses),
      babel pins mirroring vite-plugin.ts EXACTLY (throw mode ON);
      per-item isolation via the unplugin shared-store clear.
      classModule = plain joined class strings ($$css markers dropped,
      F11); css = F9 statement at BYTE ZERO + collected rules. buildId
      = the spec formula, canonical serialization (U+000A joins +
      trailing sep, POSIX repo-root-relative paths — the ledger's
      established base, recorded in the core header; byte-sorted
      items+sources; lowercase hex), stamped into every artifact so a
      cross-build mix is mechanically decidable. LANDING: registry/
      payload/stylex/ — OUTSIDE the mirror trees (registry/files ⇄
      apps/www/src/lib never sees it; verify:mirror re-run GREEN),
      outside public/r (shadcn build owns that), registry/ is private.
      10 items / 175 class constants; regeneration byte-deterministic
      (--check: 0 drift across processes).]
- [x] scripts/verify-stylex-payload.mjs: re-derives both artifacts,
      asserts hash identity + spot-compiles a consumer import; wired
      into verify:all. [IMPL-D — failure modes in the spec's order:
      missing-rule (constants ↦ escaped selectors), cross-build
      (artifact buildId stamps + the formula recomputed from current
      sources), manual edit (recorded sha256 vs bytes), same-build
      emission (full byte re-derivation). Consumer spot-compile = a
      REAL plain-vite build, zero plugins/deps, importing a payload
      classModule + item css: build green, F9 layer first-mention
      order survives the consumer's lightningcss normalization,
      item rules land. ALWAYS-ON planted self-tests (popover-probe
      negative-control precedent): missing-rule planted with a
      sha-consistent manifest → caught naming item+class; cross-build
      planted via a REAL second compile of a tweaked source (new atom
      export) with only its css swapped in → caught on the stamps;
      manual-edit planted as a trailing comment → caught on the sha.
      Gate GREEN; receipts in research/p0-gates-receipt.md.]
- [x] verify:shadcn-add extended: the clean consumer's lockfile
      contains ZERO @stylexjs/* entries; items work via CSS import.
      [IMPL-D — a GENERIC per-case assertion (package-lock.json
      carries no node_modules/@stylexjs/* key — the spec's three
      named packages and the whole scope) + a stylex-tokens case: the
      registry's stylex-adjacent lib item installs clean, the theme
      sheet arrives for the css import, zero @stylexjs/* in package
      .json, consumer build green. SUPERSEDED-SCOPE (Gate-2 P1-2,
      764ae180): the compiled payload NOW rides the build chain —
      gen-stylex-payload --publish lands the payload tree + manifest
      in public/payload/stylex/, build-site step 5.5 + root
      build:registry wire it, and the stylex-compiled-payload case
      installs corpus/code-card FROM THE PUBLISHED MANIFEST (sha
      verified, one CSS import + plain strings, zero $$css, zero
      @stylexjs/*, build green, the inlined css carries the nesting
      law). 23 cases ALL GREEN. (The earlier phase-1 deferral note is
      obsolete; a real registry-item CLI install replaces the
      manifest-driven copy in phase 1.)]

## P0.5 — the authoring law's teeth

- [x] babel propertyValidationMode:'throw' in kernel builds. [IMPL-D
      — VERIFIED ALREADY LIVE (IMPL-A's f0b560f5): src AND dist carry
      the pin (packages/vite-plugin/src/stylex/vite-plugin.ts:254,
      dist/stylex/vite-plugin.js:73). Plus the gate's ALWAYS-ON
      receipt: a planted `background:` shorthand through the REAL
      babel transform under the kernel pins THROWS ("background is
      not supported. Use background-color…") every gate run — the
      P0.5 row is proven, not assumed.]
- [x] scripts/verify-stylex-authoring.mjs: forbidden patterns
      (factory calls at non-markup level, vars-keys, shorthands in
      .stylex.ts) → fail naming file+pattern; wired into verify:all.
      SCAN SCOPE is the MIGRATION LEDGER — research/migration-ledger.json
      (schema: { version, files: [posix-relative stylex-touched paths] };
      maintained: each migration commit appends its family's files;
      P0 seeds it with the phase-0 dogfood files; the authoring gate
      and the canonical-statement check read it, legacy trees are
      never scanned). [IMPL-D — the ledger's 9 modules PASS. The
      shorthand blacklist is DERIVED AT GATE RUNTIME from the pinned
      babel-plugin's own throwing table (18 names: the background/
      border/all/animation family + logical-side aliases) with a
      pin-count assertion (18) so an engine bump that moves the list
      fails the gate loudly; margin/padding/inset/gap/flex/overflow/
      textDecoration (spike §5.3: engine-expandable, throw mode
      passes them — the dogfood carries them as-is) are LAWFUL —
      the IMPL-C risk (textDecoration:'none' in demo.stylex.ts) is
      resolved BY the derivation, not by an exemption. Comments are
      stripped before scanning (the corpus documents its law in
      prose). Ledger .css sheets (phase 1): exact canonical FULL
      statement at the top + no hand-pasted compiled-atom rules
      (engine output is the plugin's). ALWAYS-ON teeth: planted
      factory/vars-key/shorthand each FAIL naming file+pattern; the
      sanctioned idioms pass (no false positives); varied/lawful/
      engine-output planted sheets exercise the canonical-statement
      scenarios. Gate GREEN; receipts in research/p0-gates-receipt.md.]
- [x] The law text lands in the spec deltas (this change's specs/).
      [IMPL-D — COVERAGE CHECKED, no edits needed: component-authoring
      MODIFIED carries static-atoms-only + shorthands-forbidden +
      throw-mode + factory/vars-keys forbidden with the gate named;
      css-architecture ADDED carries the canonical layer law's four
      scenarios (incl. the engine-statement and varied-statement
      cases) + the same-build payload consistency requirement with
      the buildId formula, canonical serialization and the three
      planted-defect self-tests; registry MODIFIED carries the
      zero-engine consumer contract naming all three @stylexjs
      packages + the TW4 transitional clause. The gates implement
      exactly these texts.]

## P0.6 — the corpus dogfood

- [x] The 8 research families compile through the real pipeline;
      equivalence check vs the spike's compiled outputs via the
      COMMITTED comparator script (serialization normalization:
      number formats, pseudo content, steps() timing); receipt in
      research/. [IMPL-C, 2026-09-15. 9 modules at apps/www/src/lib/
      __probe__/stylex-corpus/ (8 families + the spike's demo chrome —
      both sides of the comparison carry it), authored under the §4
      law: static longhands, typed tokens for theme refs, plain var()
      seams; icon factory re-authored as the --jx-icon-size seam,
      press-button defineVars/createTheme as atom fallbacks (§4.2).
      Wired into the REAL www build via the noindex /probe-stylex-
      corpus route. Comparator of record: DIFFERENT (334 vs 342
      selectors) — by design; ACCEPTANCE = every one of the 112 diffs
      root-caused, ZERO unexplained (research/dogfood/analyze-diffs.mjs
      exit 0): T=37 typed indirection (§2/§4.1), F=13 seam fallbacks
      (§4.2), P=12 spike-only machinery (icon @property/--x-* + the
      defineVars/createTheme blocks). 282/334 matched EXACTLY under
      N1-N5 incl. @keyframes xfeh6hy-B under its identical
      content-derived name; F9 byte-0 statement re-verified in both
      builds; layer wrappers stripped for comparison (the spike is
      pre-F9; useCSSLayers rides CSS-generation only — same babel
      atoms, N5 absorbs the :not(#\#) bump difference). Receipt:
      research/p0-dogfood-receipt.md; raw diff research/dogfood-diff
      .json; extracts + extractor + analyzer committed under
      research/dogfood/ for Gate-2 re-runs. LEDGER SEEDED: repo-root
      research/migration-ledger.json ({version:1, files:[9 posix
      repo-root-relative .stylex.ts paths]} — the path interpretation
      of record: the ledger is read ROOT-relative, never
      change-relative, because the change directory archives away
      while the authoring gate (P0.5) reads the ledger long-term).]
- [x] No production markup switches paint (phase 1); the dogfood
      runs as a build fixture, not a shipped page. [IMPL-C — the
      fixture renders nothing visible (one hidden marker div);
      registry/files untouched (phase 1 authors the real
      <item>.stylex.ts in place); __probe__/ is a SITE_ONLY_PREFIX so
      the mirror manifest is untouched (verify:mirror GREEN); route
      is noindex, no inbound links.]

## P0.7 — gates + docs

- [x] verify-all chain gains: stylex-payload, stylex-authoring, the
      popover regression probe (ONE permanent probe). [IMPL-D — the
      two new gates slot into the npm-script block as authoring →
      payload → mirror (design §7's final ordering; the popover probe
      already sits after the mirror-class gates at 4c and every
      consumer gate after THAT at step 5). npm scripts added:
      gen:stylex-payload / verify:stylex-payload /
      verify:stylex-authoring.]
- [x] Docs: the install prerequisite page (import the item CSS;
      engine tooling optional for consumers' own use). [IMPL-D —
      apps/www/src/routes/docs/install.html (+page.svelte +page.ts),
      neighbor-page style (SectionCard/CodeBlock/A11yTable/pills):
      one css entry; the compiled-payload contract (plain class
      strings + item css, zero @stylexjs/* owed, engine tooling
      OPTIONAL for consumers' own markup); the transitional lane
      (legacy utility-authored items keep the TW4 prerequisite until
      their family's migration — the registry delta's clause); the
      layer law (utilities always win); install verification. Nav:
      docs-route-model Sections lead entry. Prerender round-trip
      completed: svelte.config entries + docs-structure spec expected
      set (12/12 green — the spec ALSO carries the pre-existing
      /probe-stylex-corpus drift P0.6c left in that exact-set row,
      fixed in passing: the route was in svelte.config but absent
      from the expected probe list). svelte-check: zero errors from
      the new page (864→862 total, the 2 removed were the page's own
      parse errors mid-fix; baseline otherwise unchanged).]

## P0.8 — review gates (remix)

- [x] Gate 1: Codex reviews this change doc set (fresh agent).
- [x] Gate 2: Codex reviews the implementation + receipts; iterate
      to ≥ the research bar (8.0+); score + reasons recorded.
      [stylex-impl-g2, 5 rounds — 5.8 → 7.7 → 7.8 → 7.9 → 8.8 PASS;
      the r1 dual-order runtime counterexample reshaped the F9 law
      (components nesting — the append-only first-mention repair);
      r2 coverage-aware idempotence; r3 EXACTLY-ONE statement; r4 the
      semantic whitespace-tolerant matcher; final verdict: the
      implementation EXCEEDS Gate 1's doc score because it cashed the
      contracts with real builds, browsers, consumer installs, and
      manifest verification]
      [r1 verdict 5.8/10 INSUFFICIENT — four P1 blockers: (1) the F9
      statement fixed at priority1..3 while the payload emits
      priority2..9, no computed-style proof; (2) the compiled payload
      not wired into the shadcn build chain; (3) the longhand law
      text contradicting the implementation's engine-line; (4) the
      receipts claiming exit 0 where transcripts show FAILED. IMPL-E
      fix round, 2026-09-15 — P1-1/P1-2/P1-3 implemented, P1-4
      receipts rewritten at the final HEAD; details in the task rows
      below and research/p0-gates-receipt.md §Gate-2 fixes.]

## P0.9 — the Gate-2 P1 fix round (IMPL-E, 2026-09-15)

- [x] P1-1 the F9 general law: dynamic statement (priority1..N, N =
      the css's highest tier, utilities constantly last) + THE
      NESTING LAW (tiers under `components.stylex.*` via the
      useCSSLayers prefix — cascade-layer registration is
      append-only, so top-level tiers arriving after the consumer's
      utilities registration permanently beat utilities; measured:
      consumer-first + top-level tiers = atom wins, nested = utility
      wins BOTH orders). layer-law.ts rebuilt as the statement's
      single source (canonicalLayerStatement/maxStylexPriority/
      parseCanonicalStatement); vite-plugin.ts + scripts/lib/
      stylex-payload.mjs pins updated in lockstep (dev virtual css /
      build assets / payload css all consistent); plugin tests
      re-pinned; payload regenerated (10 items, same buildId + 175
      constants); the dogfood extractor + install docs updated. TEETH:
      verify:stylex-payload's dual-order browser assertion (headless
      Chromium, kernel-first AND consumer-first, computed value =
      the utility's) + the always-run negative control (the escaped
      shape shows the atom winning) + the planted layer-escape
      tree self-test.
- [x] P1-2 the compiled payload wired into the build chain: the
      generator's `--publish` step (build-site step 5.5 + the root
      build:registry script) ships the payload tree + manifest into
      public/payload/stylex/; verify:shadcn-add regenerates the same
      published tree and its stylex-compiled-payload case installs a
      compiled item FROM the manifest into a real consumer (one css
      import + plain-string constants, zero @stylexjs/* in
      package.json/lockfile, consumer build green, built css carries
      the canonical statement + atom rules). The "rides phase 1"
      deferral is retired — the spec's wiring clause is live.
- [x] P1-3 the shorthand law reconciled (option A): the spec/design
      text now states the ENGINE'S LINE — throw-table properties
      forbidden (18 names, gate-runtime derivation + pin-count
      assertion kept), engine-accepted shorthands lawful (compiled
      css carries them as standard CSS; the earlier "expands to
      longhand" claim was measured wrong — `margin: 0` serializes as
      `margin: 0`). New acceptance pair in verify:stylex-authoring:
      a lawful shorthand compiles through the real kernel pipeline
      with its declarations landing in the css (P1-3a) + the
      throw-table plant keeps failing scan AND engine. All scenario
      names preserved; one scenario ADDED (an engine-accepted
      shorthand is authored).
- [x] P1-4 the receipts rewritten for honesty at the final HEAD:
      p0-gates-receipt.md (the budgets-abort contradiction replaced
      by the real chain run + the re-baseline story + CHROME_PATH
      env notes), p0-engine-token-receipts.md (the real npm test
      counts + the Ghostty wasm environment attribution + the
      re-measured layer inventory under the nesting law),
      p0-dogfood-receipt.md (the F9 section re-measured on the
      rebuilt dist; extracts regenerated, trailing whitespace
      cleaned). All three name the final HEAD + rerun commands +
      environment conditions.
