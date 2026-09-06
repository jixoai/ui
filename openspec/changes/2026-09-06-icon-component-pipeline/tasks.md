# tasks — icon-component-pipeline

## 0. Prep

- [ ] P1: worktree bootstrap — `npm install` at repo root (lucide for
       the manifest migration + tests), packages/vite-plugin, apps/www,
       registry/ (worktrees carry no node_modules); record the node
       version; keep installs off the critical path of parallel streams

## A. Plugin library face (packages/vite-plugin)

- [ ] A1: `src/icons/library/` — options types (IconLibraryOptions,
       IconSource, write/output contract), the §1 validation matrix
       (provider-only / library-only / both / empty-error /
       false-off) with unit tests, name validation, manifest
       migration (38 built-ins in GROUPS order from
       scripts/gen-icons.mjs), ADAPTER-side source resolution
       (lucide: refs / inline / {file} via ctx.loadSource +
       watchFile) feeding the pure core a RESOLVED asset list
- [ ] A2: svgo integration — the FULL packaging chain (design §9):
       package.json dependencies + self-contained package-lock
       (npm install in the package, lock committed) + tsdown external
       + dynamic named-import inside the icons sub-entry; tuned
       preset (removeViewBox:false, floatPrecision 3, dimension
       stripping); optimize-after-safety ordering; the no-op-on-
       lucide unit pin; umbrella graph-purity test (dist/index.js
       free of svgo/provider code); `npm ci && npm run build && npm
       pack --dry-run` green
- [ ] A3: structured extraction + packing — {v,n,d} extraction,
       nature detection, greedy chunking at maxChunkBytes (20480
       raw), oversized-own-chunk warning, the §3 mode matrix
       (auto×inline / auto×lazy / single×inline / single×lazy)
       test-locked, deterministic byte output
- [ ] A4: `generateIconLibraryArtifacts()` pure core (design §5) —
       input = resolved assets (never IconSource); returns
       { artifact, chunks, report } with ZERO fs/vite imports; the
       artifact's LAZY loaders carry the fixed named-error message
       (design §5 sentinel); vite adapter (virtual chunk modules,
       drift-warn with write:false default, HMR via the slot face's
       refresh path); root-script adapter (gen:icons canonical
       write = the ONLY in-repo writer; verify:icons --check, no
       vite import)
- [ ] A5: options wiring — IconsPluginOptions.provider optional,
       provider-only path regression-locked against a COMMITTED
       GOLDEN fixture (frozen CSS module bytes; the test compares
       plugin output to the golden, not to itself), exports from
       `./icons`; THE UMBRELLA BRIDGE — src/index.ts's static
       icons imports replaced by the memoized dynamic-import proxy
       plugin (design §9), frozen sync jixoai() API preserved,
       dist import-graph purity gate (transitive static-import
       parse: no icons impl/provider/lucide/svgo in dist/index.js)
       + bridge integration test across the config matrix
- [ ] A6: tests — packing boundaries (at/over budget, oversized
       icon, all four mode-matrix rows, determinism), override +
       custom + lucide:ref resolution, svgo compaction fixture,
       safety gating incl. malicious-attr/namespace/CDATA fixtures
       (design §2), MEASURED default-set acceptance (chunk count and
       per-chunk bytes asserted from real generator output — never
       assumed), artifact↔chunk PARITY test as its own acceptance
       (same input: artifact CHUNK_OF/LAZY map === plugin-served
       chunk payloads, byte-for-byte), the exact sentinel-message
       assertion, and a real `vite build()` integration test
       asserting emitted lazy chunks + artifact file (vite-native
       precedent)

## B. Component + registry wiring

- [ ] B1: `registry/files/ui/icon/` — icon.svelte (name/size/
       strokeWidth props; sync render; lazy path with the FIXED
       pending/catch span shape + per-chunk deduped warn — design
       §7), index.ts barrel
- [ ] B2: root `gen:icons` writes + commits
       `registry/files/lib/icon-set.gen.ts`; mirror to
       apps/www/src/lib via the existing mirror tooling (artifact
       only — chunk bodies are virtual, never files, design §6);
       registry.json items `icon` + `icon-set` (icon declares
       @jixoai/icon-set + @jixoai/jixoai-theme), `icons` item
       REMOVED; mirror-manifest regenerated
- [ ] B3: gate migration — root package.json `gen:icons`/
       `verify:icons` re-pointed at the root-script adapter over the
       pure generator; scripts/gen-icons.mjs DELETED (manifest lives
       in the plugin); verify-all chain green with the new wiring
- [ ] B4: apps/www + registry vite configs both gain the library
       block (write:false default — no artifact writes, no orphan
       registry/src files) in the SAME edit (per the temporary
       INTEGRATION-NOTES.md from B1 — then DELETE that note);
       `cmp apps/www/vite.config.ts registry/vite.config.ts` byte-
       identity gate; dual-app build probe asserting no
       `registry/src/**` artifact ever appears

## C. Full migration (the auditable inventory — design §8)

- [ ] C0: `scripts/verify-icon-migration.mjs` (--write/--check) +
       committed `scripts/icon-migration-inventory.json` snapshot;
       wired into verify-all as `verify:migration`; scope excludes
       living specs, change docs, THE VERIFIER'S OWN SOURCE and the
       inventory file (fixed self-exclusion rule); snapshot
       semantics = live hits must equal the committed snapshot
       (progress shrinks it; C5 completion = snapshot `[]` + zero
       live hits)
- [ ] C1: migrate `verify-shadcn-add.mjs` fixtures — exact-once
       list / preseed / hero-closure `src/lib/icons.ts` entries →
       `src/lib/icon-set.gen.ts`; ADD the forced-overflow
       clean-consumer probe (real vite project, plugin wired, lazy
       chunks emit + load; the unwired path asserts the EXACT
       build-time resolver error message; the runtime loader
       sentinel asserted via a wired-but-broken fixture — the
       server's library packs SMALLER than the artifact so a chunk
       import throws and the LAZY catch rethrows the sentinel;
       vite 8 minify note: the fixture must drive `preloadIcons`
       at top level so tree-shaking keeps the LAZY chain)
- [ ] C2: migrate test consumers — jx-pure-parity.spec.ts,
       icons-page.spec.ts, terminal-patterns.spec.ts,
       geometry-consistency.test.ts (reads the new artifact;
       asserts `d` payloads equal lucide serialization),
       verify-deps.mjs synthetic fixtures → icon-neutral
       dangling/dead names, verify-deps-baseline.json (the
       breadcrumb → @jixoai/icons row migrates to the new items)
- [ ] C3: commit `scripts/icon-edge-ownership.json` (the 26-edge
       expected-owner snapshot: component importers → @jixoai/icon;
       artifact-level importers → @jixoai/icon-set) and migrate
       registry.json's edges accordingly; final zero-hit assertion
       over registry.json/scripts/apps/registry/packages
- [ ] C4: registry/files/ui/** (~33 files) + www chrome/docs/
       blueprints (~58 files) — {@html icons.x} → <Icon name>;
       ternaries → dynamic name; input.svelte SEMANTIC_GLYPHS →
       IconName; sizing/stroke wrapper classes → props where
       mechanical; docs PROSE teaching the old API rewritten
- [ ] C5: delete `registry/files/lib/icons.ts` + `apps/www/src/lib/
       icons.ts` (the retired string bag — NOTE: scripts/gen-icons.mjs
       SURVIVES as the thin root-script adapter that now generates
       icon-set.gen.ts; only the icons.ts pair dies) + drop the
       mirror-manifest UNREFERENCED_LIB stopgap entry B2 added for
       the interim; sweep remaining imports; FINAL GATE:
       `npm run verify:migration` (snapshot `[]` + zero live hits)
- [ ] C6: living-spec migration (same change; openspec archive
       applies this change's deltas to the living specs — verify
       post-archive that no stale Requirement survives) —
       component-authoring "components consume the generated icon
       module" → the <Icon name> law; registry icons-item +
       registryDependencies "declared icon dep" scenario → the new
       items/artifact

## D. Docs

- [ ] D1: docs/icons.html rewrite — component API section,
       ICON_NAMES grid (dynamic, zero page edit per icon), library
       config section (sources/override, mode matrix, budgets,
       optimize, write/output contract), async semantics (inline
       core, lazy overflow, preloadIcons, pending-box law, the
       sentinel error), install tiers (default plugin-free vs
       overflow plugin-prerequisite), slot-face section
       (icon-table) retained and re-framed
- [ ] D2: docs-structure snapshot + reading-chain coverage updated;
       icon + icon-set item pages/rows added

## E. Verification + closure

- [ ] E1: `verify-all` green end-to-end on a clean worktree install
       (incl. mirror, deps, meta, laws, budgets, shadcn-add probes
       both tiers, verify:migration, the full test suite baseline)
- [ ] E2: vision regression — icons docs page + theme-toggle + input
       semantic glyphs + tree-view + dialog, light/dark
- [ ] E3: SSR + lazy-path spot proofs — server HTML contains core
       icons (no pop-in); forced-overflow fixture renders the
       reserved box, never layout-shifts; hydration stable (pending
       span identical pending/rejected)
- [ ] E4: Codex review rounds on the real diff until sign-off;
       findings fixed and re-verified
