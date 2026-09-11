# Verification: layout-family-alpha

## The worktree evidence (pre-merge, 2026-09-11)

Every gate that runs without the vitest pipeline:

- `openspec validate layout-family-alpha --strict` — **valid**; every
  requirement body ≤500 chars (486/407/437/294) in the strict-lint
  sweep's living-spec shape, overflow re-housed verbatim in
  post-scenario notes.
- `node scripts/gen-mirror-manifest.mjs --check` — **GREEN** (139
  items / 529 file pairs; the three families' registry↔www pairs
  sha-verified by the smoke as well).
- `node scripts/verify-context-coverage.mjs` — **GREEN** (no Defaults
  owed: the family's props touch none of the detection vocabulary —
  confirmed by run, not just by design).
- `node scripts/verify-standards.mjs` — **GREEN** (B3 census clean).
- `node scripts/component-metadata-gen.mjs --check` — **GREEN**.
- `node scripts/verify-deps.mjs` — **GREEN** (closure ledger intact;
  the three items add zero dependency edges).
- `node scripts/verify-docs-structure.mjs --selftest` — fixtures pass
  (the built-page lint itself needs dist; the new pages join the
  out-of-scope WARN backlog like every recent page before its pilot
  round — see friction).
- The pure-node smoke (outside the repo, `/tmp`): component skeletons
  (identity declaration, `{...rest}` BEFORE the stamp, the exact
  `style:` member set, zero runtime imports, intent header with the
  original requirement input + timestamp), the two type-coercion
  semantics, the registry.json alpha contract (3 items, `meta.alpha:
  true`, live hrefs, zero registryDependencies), mirror byte-identity
  per file, `svelte/compiler` compile of the three components AND the
  three docs pages AND the test fixture, TS-transpile of the spec —
  **all green**. Two real defects were caught and fixed by this
  smoke before any review: the spec header comment's
  `data-jx-prototype-*)` sequence closed the block comment early
  (parse error at line 17), and the waterfall assertions originally
  read jsdom longhands (`style.columnCount`) the `columns` shorthand
  never decomposes (verified against jsdom directly; the assertions
  now read the style attribute for the shorthand).
- Taxonomy shape, measured: layout 19 / shape total 106 — matches the
  re-frozen snapshot (the hand-recount caught my own first draft's
  "105→108" narrative error before it shipped).

## The vitest lane (the baseline's cold-start reality)

This baseline's vitest (vite 8.2.2 / rolldown 1.2.5) cannot
cold-start its jsdom dependency optimizer ANYWHERE — the rolldown
runtime's `node:module` import fails to resolve during dependency
optimization; **reproduced with an isolated cacheDir in the main
checkout itself**, so the tracked apps/www lane runs only off the
main checkout's warm `node_modules/.vite/vitest` cache (CI never
runs vitest — `verify:all` is a pure node gate chain). The suite was
therefore authored dependency-free (svelte native `mount`, no
@testing-library — its externalized dep tree is exactly what drags
the cold optimizer into the bug) and runs on the main checkout at
merge time:

- (merge gate, recorded below after the merge)
  `apps/www` vitest: `prototype-layout-family.spec.ts` +
  `catalog.spec.ts` + `docs-structure.spec.ts` — results filled in
  at the merge step.
