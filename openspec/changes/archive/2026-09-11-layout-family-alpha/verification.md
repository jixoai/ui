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

## Review absorption + the real-mount lane (2026-09-11)

The super-thinker review (7.5/10) landed one blocker and five
improvements; all absorbed, plus one defect the re-verification
itself caught:

- B1 (blocker): the illegal track value `auto-fit 14rem` — `auto-fit`
  is legal ONLY inside `repeat()`, and the CSSOM drops the whole
  declaration (jsdom and browsers agree; real-mount proof below).
  Fixed at all three infected sites: the suite's string-tracks
  assertion (now `repeat(auto-fit, 14rem)`, proven to round-trip),
  the spec scenario's example, and the docs usage example.
- NEW, caught by the real-mount probe beyond the review: the suite's
  two bare-render assertions expected `display:flex` after
  whitespace stripping, but the CSSOM serializes the style attribute
  WITH a trailing semicolon (`'display: flex;'`) — both were
  merge-gate certainties to fail. Exact-content assertions now strip
  `[\s;]`.
- I1: requirement 2 states the identity per member (flex/grid carry
  `display`; the waterfall identity IS the `columns` shorthand, so a
  bare waterfall writes ZERO declarations — now also a scenario).
- I2: the ui-item count corrected 105→108 → 103→106 (the snapshot's
  own arithmetic: shape totals 106 after three additions).
- I3: `prototype-canvas` re-attributed everywhere as the
  design-studio-r2 cross-branch precedent (it lives on the product
  branch, not in this repo): component header (registry+mirror),
  docs page, design, spec.
- I4/I5/I6: the suite now pins the stamp-collision replace (a
  consumer `data-jx-prototype-*="evil"` renders `"true"`), the
  consumer-style merge (`'color: red; display: flex;'`), filters the
  registry by the exact three names, and asserts the
  stamp-precondition description text.

The real-mount probe (the review's proposed method, executed):
`node /tmp/layout-family-mount-verify.mjs <checkout-root>` — jsdom
globals + `svelte/compiler` client codegen + native `mount()`, no
vitest, no repo footprint beyond node_modules/.cache. 36 checks
green in the worktree (evidence:
`/tmp/layout-mount-worktree-evidence.txt`): the full acceptance
battery (every union member, both coercions, omission transparency,
rest spread, children via the fixture host, class passthrough), the
B1 drop proof (`gridTemplateColumns === ''` for the illegal value;
the four legal candidate forms all round-trip), and the I4
serializations. The same probe re-runs on the main checkout at
merge if the vitest lane stays cold-start-blocked.

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

- (merge gate, 2026-09-11, main checkout @ merge 979cb02e): vitest
  on the warm cache — `prototype-layout-family.spec.ts` **32/32 on
  the first run** (the review-absorbed battery: the legal
  repeat(auto-fit, 14rem) round-trip, the `[\s;]`-stripped bare
  assertions, the stamp-collision replace + style-merge pins, the
  fixed three-name registry slice, the stamp-precondition regex).
  `catalog.spec.ts` + `docs-structure.spec.ts` first run 21/22 —
  the one failure was the dist-loop test reading the STALE
  pre-merge dist (103 pages, built 04:47, before the three routes
  existed); after the standard `npm run build` (106 pages, the
  three prototype-*.json payloads emitted into public/r/), all
  three suites re-ran **54/54 GREEN**. No cold-start issue: the
  warm-cache lane worked exactly as designed.
