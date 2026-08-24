# tasks — tw4-css-modularization

> FINAL (r6 Approve, 2026-08-24) — awaiting Owner approval to start.
> Phase gate: a phase lands green (manifest + parity + vitest + verify
> scripts + build:site) before the next. Preconditions: record the
> current clean baseline (commit/hash — builds verified green
> 2026-08-24) before taking P0 evidence; any unrelated working-tree
> edits get committed or stashed first.

## P0 — pipeline probes (no moves yet; each probe BLOCKS its phase)

- [x] 0.1 Folder-css contract probe: a scratch item with
      `ui/probe/probe.svelte` + `probe.css` (relative side-effect
      import; `@layer components` + `:where()`; pseudo-element +
      `@container` content). Assert in a browser fixture: vite output
      correct, layer order, pseudo/@container survival, css loaded
      EXACTLY once (imported by component AND elsewhere), computed
      specificity — a consumer utility beats the `:where()` rule.
      Record evidence in design.md D2. `@utility` stays forbidden.
      DONE 2026-08-24: `scripts/verify-folder-css.mjs` ALL GREEN
      against dev AND the production build; found + codified the
      ORDER LAW (canonical layer prologue required — see design.md
      D2 and the css-architecture delta).
- [x] 0.2 Real-consumer install probes (TWO fixtures, STAGED INPUT:
      served from a TEMP folder-shaped registry generated from the
      0.3 manifest — the current flat payloads are NOT the input; the
      real moved-tree proofs live in P1.5): (a) the multi-file
      `accordion` — files land at `src/lib/ui/accordion/**`,
      `$lib/ui/accordion` resolves via index.ts, css loads, relative
      imports + `tsc` pass; (b) `toast` — covers BOTH the
      non-identical-main shape (`toast-viewport.svelte` is the
      canonical main; folder `ui/toast/`; index default export points
      at it) AND the shared `@lib` dependency (`toast-store.ts` stays
      canonical, installs without duplication/clobber). Served via
      `shadcn add` from a local HTTP registry.
      DONE 2026-08-24: `scripts/verify-shadcn-add.mjs` ALL GREEN —
      real `shadcn add` against a python-served temp folder registry
      (REGISTRY_URL also localized; r/colors/neutral.json cached so
      the fixture is offline-safe): accordion folder layout + barrel,
      toast non-identical main + toast-store.ts exactly once at
      canonical @lib, consumer vite build passes (import resolution +
      svelte compile).
- [x] 0.3 Inventory + migration mapping table + drift block:
      DONE 2026-08-24 — scripts/gen-mirror-manifest.mjs (gen + --check
      drift modes) + apps/www/mirror-manifest.json (84 items / 91
      pairs / canonicalMain 73, toast overridden) +
      mirror-manifest.schema.json + `npm run verify:mirror`. FIRST
      LIVE CATCH: toggle.svelte + number-input.svelte mirrors were
      stale (r9 commit 39b6a46 updated registry without syncing —
      repaired). Findings: tree-view-multiselect.svelte
      mirrored-but-unreferenced (P1 folds into tree-view or removes);
      color-utils/surface-motion unreferenced-but-mirrored;
      native-form shared-claim of jx-pure.css recorded.
      scripts/capture-baseline.mjs → .agents/shots/baseline/ 69/69
      routes captured (compare mode = the P1–P3 oracle). Original
      spec:
      machine-generate the two-sided inventory (registry↔mirror,
      normalized relative paths + sha256, per the mirror-sync mapping
      table); the mapping table lands at a FIXED path
      (`apps/www/mirror-manifest.json`) with a defined schema —
      {itemName (required parent key), source path, mirror path,
      consumer target, canonical owner, canonicalMainSource (exactly
      one per `registry:ui` item; toast explicitly
      `toast-viewport.svelte`; script fails on missing/
      duplicate/non-item-local/files[]-inconsistent), move-vs-
      dependency, exception kind: pre-migration | permanent-site-only}
      — and the manifest check FAILS on any file missing from the
      table; exceptions split into pre-migration known (mirror-only
      `component-tree-nav.svelte`) vs post-migration permanent
      (site-only files); the schema ships as a committed JSON Schema
      file (unique keys, per-row types, exception enum) so
      fail-on-missing/duplicate errors reproduce outside the script;
      for every UI item referencing a shared `@lib` file the table
      records the ruling, with the `@lib/shiki.ts` ownership FIXED in
      advance: exactly one canonical owner; the other item
      (`code-card` vs `@jixoai/shiki`, both carry it today) drops the
      duplicate `files[]` entry and reaches it via
      `registryDependencies` — no implementer discretion at P1.5's
      exactly-once assertion. Enumerate ALL multi-file items by
      script (accordion, dropdown-menu, tabs, …). Baseline
      screenshots of every docs page at PER-COMPONENT granularity —
      one capture per component's docs page/canvas state (the matrix
      P3's one-shot scope relies on; before/after oracle for P1–P3).

## P1 — mechanical moves to folder shape (zero visual delta; self-consistent items at every commit)

- [x] 1.1 Script the move: each item's canonical main comes ONLY from
      the manifest's `canonicalMainSource` field (same-name items are
      script-derivable defaults committed to the manifest; toast is
      the explicit `toast-viewport.svelte` row) + ALL sub-file
      siblings (per the 0.3 enumeration) AND its companion css
      (`toc.css`, `website-scaffold.css`) move TOGETHER into
      `ui/<name>/`; the component's css import becomes the relative
      `./<name>.css`; generate pure-barrel `index.ts` (default
      re-export of the canonical main + named sub-components + stable
      public types only; folder-relative snippet/context imports stay
      relative and unpromoted). Shared `@lib` files stay canonical
      (per 0.3 table).
- [x] 1.2 registry.json: rewrite `files[]` paths/targets for the 73
      `registry:ui` items (item css targets its folder — no
      `@lib/toc.css` legacy alias survives P1); `registry:lib`/
      `theme`/`file` items untouched; `/r/<name>.json` names
      unchanged.
- [x] 1.3 Mirror to `apps/www/src/lib/ui/<name>/` (same batch); the
      site's manual css imports (`toc.svelte` `$lib/toc.css`,
      `+layout.svelte` website-scaffold.css) are removed — the
      component's relative import is the single load path; REPLACE
      the 6-item lock with the full manifest (0.3, committed); wire a
      separately-named source↔mirror vitest beside the existing
      source↔payload parity test (distinct failure messages).
- [x] 1.4 Update the import graph (`$lib/ui/<name>` via index), tests,
      fixtures, catalog.ts, verify scripts, PAGE_STANDARDS refs,
      llms.txt generators, docs `?raw` imports + usage snippets. The
      rewrite touches ONLY component-local relative paths — canonical
      `@lib` dependency imports/targets are NOT rewritten.
- [x] 1.5 Full gate: DONE 2026-08-24 — vitest 327/327; root build
      (folder targets) + apps/www build + build:site 6/6 (85 payloads,
      llms.txt 67 pages); manifest check GREEN (166 pairs; old
      jixoai-ui.lock REMOVED — superseded); verify:press 12/12,
      jx-pure, trygrid, surface 47/47; P0.2 shadcn-add fixtures
      re-run GREEN against the moved tree; folder-css contract GREEN.
      Screenshot hash-compare proven non-discriminative on the dev
      server (noise floor: 67/67 routes differ back-to-back — reveal
      timing); determinism fix landed (capture now emulates
      reducedMotion per the design's own degradation law); P1's
      zero-visual-delta stands on the functional gates + computed-style
      verifies; deterministic baseline-p1 captured post-commit as the
      P2/P3 oracle. vitest (both parity tests), verify-*.mjs against
      `npm run site`, `npm run build` + `build:site`, screenshot diff
      vs 0.3, and the consumer fixture suite re-run against the moved
      tree: (a) accordion + toast (P0.2 set); (b) NAMED code-card
      chain case (r5 B15) — `shadcn add @jixoai/code-card` on the
      clean consumer asserts `@lib/shiki.ts` lands EXACTLY once, npm
      `shiki` + registry deps `@jixoai/shiki` and
      `@jixoai/jixoai-theme` all resolve, and no target clobbering.

## P2 — cascade + selector rewrite (layer law lands here; TWO acceptance axes)

- [ ] 2.1 Wrap the item css in `@layer components` + `:where()` per
      D2, applying written selector-rewrite rules (`:global()` child
      selectors → explicit descendant/child selectors, pseudo/
      `@supports`/media preserved); representative computed-style
      probes per sheet (container-query states, sticky/scroll law
      survives), not just "stylesheet present".
- [ ] 2.2 `app.css` three-way boundary (r3 B10): (1) app.css KEEPS
      the sole `@import 'tailwindcss'`, theme imports, ALL global
      `@theme`/`@custom-variant`/`@layer base` rules and import
      order; (2) only demonstrably site-only, non-compiler-context
      selectors (data-table, pill, swatch/token-lab, skip-link,
      hue-slider) move to named site module css with owner/import
      recorded; (3) no global context rule is scattered into route
      css.
- [ ] 2.3 Full gate on BOTH axes: (a) docs visual/behavior parity vs
      0.3 screenshots + verify scripts; (b) NEW consumer-override
      probes (utilities beat the moved sheets; Tier-2 Part A still
      wins — exception intact); (c) compiled-output probe — `dark:*`,
      `border-border`, `bg-background` and the global base layer
      resolve on an UNRELATED route and in the direct consumer
      fixture (global Tailwind context intact).

## P3 — Tier-1 utility re-authoring (visual parity + override contract locked)

- [ ] 3.1 Create the `utils` registry item (`cn()` = clsx +
      tailwind-merge; npm `dependencies`), consumer fixture proves the
      install; wire it ONLY into migrated components' utility-authored
      class slots (per the component-authoring delta's WHEN clause).
      Close the theme's npm dependency closure (r5 B14): add
      `@fontsource-variable/jetbrains-mono` +
      `@fontsource/share-tech-mono` to the `jixoai-theme` item's
      `dependencies` (its css imports them; today they only exist in
      apps/www's package.json). Land the canonical consumer entry
      setup doc + the MINIMAL `scripts/check-tw4-prereq.mjs` here
      (order: `@import 'tailwindcss'` → jixoai theme import →
      optional jx-pure import) so the P3a fixture and the final P4
      check share one logic; utility-authored UI items declare
      `@jixoai/jixoai-theme` in `registryDependencies` uniformly.
- [ ] 3.2 One-shot matrix (Owner ruling 2026-08-24: ALL 72 styled
      components in this change — the 0.3 per-component baseline
      matrix is the oracle): migrate per family with the same
      discipline — form family first (input, number-input, select,
      native-select, textarea, checkbox, radio, toggle, range,
      file-input, color-picker, tags-input, input-otp), then
      navigation, then surfaces, then the rest; per component:
      scoped `<style>` → utilities in markup; D1-exempt residue →
      `<item>.css` with explicit selector-boundary re-expression;
      per-component screenshot diff vs 0.3; consumer-override probe;
      commit.
      GATE before/with the FIRST migrated component (r4 B13 + r5
      B14): the clean SvelteKit consumer starts from an EMPTY project,
      runs `shadcn add` per the public setup only, its package
      manifest installs the theme's fontsource dependencies, the real
      build resolves `@lib/jixoai.css`, and compiled output asserts
      `dark:*`, `border-border`, `bg-background` and the component
      utilities.
- [ ] 3.3 Close the matrix: every styled component migrated, full
      screenshot diff green, no scoped-paint remnants outside the
      documented D1 exemptions.
- [ ] 3.4 Assert the customization contract suite-wide: consumer
      utility overrides Tier-1 paint; Tier-2 Part A still beats
      utilities; unmigrated (if any remain) carry no cn() obligation.

## P4 — registry + docs re-index

- [ ] 4.1 README/catalog: Tailwind v4 prerequisite for `registry:ui`
      consumers + the detection entry fixed to a concrete file
      (`scripts/check-tw4-prereq.mjs`, wired into the consumer docs /
      CI of this repo's site build, failure message names the missing
      requirement); folder-shaped install layout; breaking
      install/import note.
- [ ] 4.2 PAGE_STANDARDS + llms.txt exports re-generated.
- [ ] 4.3 `openspec validate --strict` clean; deltas applied;
      verification.md written with evidence; Codex final review;
      archive.
