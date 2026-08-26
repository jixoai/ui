# verification — native-contract-fusion evidence index

> Updated per batch; each entry names the gate, the run, and the
> evidence. All runs in the worktree
> (feat/jx-pure-register-fusion) unless noted.

## Phase 0 — design (frozen)

- Codex design round 2026-08-27, session `codex-jx-pure-fusion`
  (gpt-5.6-terra xhigh, 23m): verdict A-verified + native
  toggle-group table + six contract additions; brief-as-written
  6/10 → corrected design 8.5/10. Brief + full transcript digest:
  `.agents/documents/2026-08-26-jx-pure-register-fusion/brief.md`
  (main checkout, untracked artifacts dir).
- Commit `0672b67` — openspec change set (proposal/design/5 spec
  deltas/tasks).

## Phase 1 — the @apply boundary, probe-locked

- Commit `a7ba5ea`. `apps/www/test/tw-context-probe.spec.ts` +
  `test/fixtures/tw-context-probe-runner.mjs` (child-process vite
  build — vitest's virtual module runner breaks rolldown's tsconfig
  discovery in-process).
- Evidence: 4/4 green — named-theme `@apply` FAILS
  (`Cannot apply unknown utility class 'border-border'`), arbitrary
  + core + variant-bearing compile to literal/variant-scoped rules.
- Worktree env note: one-time `npx svelte-kit sync` required (the
  generated `.svelte-kit/tsconfig.json` is absent in fresh
  worktrees; its absence breaks vitest's dep optimizer with
  "Tsconfig not found").

## Phase 2 — the Part A contract layer

- Commit `7f32300`. Markers in jx-pure.css (mirror pair synced);
  `scripts/gen-jx-native-contract.mjs` + `npm run verify:contract`
  (byte-exact drift gate, GREEN); registry.json: `jx-native-contract`
  item + 12 dependents switched off the full face + jx-pure
  description vocabulary fix (stale `.jx-input/.jx-range` retired —
  a Codex-flagged defect).
- Evidence: `npm run verify:mirror` GREEN (91 items / 303 pairs);
  `shadcn build` emits `public/r/jx-native-contract.json` (28,263B,
  byte-identical content); registry-payload-parity green.

## Phase 3 — toggle-group native

- Commit `e157c32`. Part A `.jx-tgroup` law (joined edges, sr-only
  driver input, `:has()` state machines, density geometry,
  reduced-motion prelude extension); extract regenerated (30,798B /
  7,251B gzip); jx-pure.css gzip 17,918B ≤ 18,432B budget.
- Component rewrite: radio (single, name REQUIRED — throws) /
  checkbox (multiple); DOM-checked uncontrolled truth + $bindable
  projection (diff-only DOM sync); form.reset() microtask re-sync;
  onValueChange/onchange split (rest-spread cannot sever the law —
  internal handler bound after spread); `required` forwards in
  single mode; jx-form-field bridge DELETED (toggle-group.css
  deleted with it — the law IS Part A).
- Tests rewritten: batch4 (5 native-contract cases incl. real-
  FormData + reset + no-re-press-clear), composition-c (3),
  composition-props (1, label-root/input-rest contract).
  Full suite 549/549. svelte-check 253 errors / 19 warnings /
  61 files == main baseline exactly.
- Blueprint scene + committed SVG (`build:blueprints`). NOTE: the
  rebuild also resynced ~40 pre-existing SVGs whose grays drifted
  when 2026-08-26 token renames (c31fe6a, a056874) landed without a
  blueprint rebuild — pre-existing drift caught up, e.g. checkbox
  border rgba(111,111,111)→rgba(94,94,94); not caused by this
  change's CSS laws.
- Honest env finding: main checkout's svelte-check silently borrows
  `@types/node` from the ancestor `~/Dev/GitHub/jixoai-labs/
  node_modules` — an environmental accident, not a repo guarantee.
  Worktree reproduces parity via a gitignored symlink; a follow-up
  change should add `@types/node` to apps/www devDependencies.

## Phase 6 (skeleton) — the parity gate

- Commit `c29902a`. `apps/www/src/routes/parity.html` (fixture
  rows: tier0 bare DOM ⇄ tier1 component, same density/darkness) +
  `scripts/verify-native-parity.mjs` (declarative probe registry:
  rows × probes × property whitelist × state actions; values
  normalized) + `npm run verify:parity`.
- Evidence: toggle-group row 136/136 comparisons GREEN across
  {base, second-checked} — including a REAL catch during bring-up
  (fixture initial-state divergence: tier0 hand-`checked` vs tier1
  default value; the gate flagged exactly those 4 color/背景
  mismatches before the fixture was aligned — the teeth work).
- Rows pending: native-select, input, textarea, checkbox, radio,
  toggle, range (added with their Phase-4 pilots).

## Pending evidence

- Phase 4 pilots (subagent batches + orchestrator cross-check).
- Phase 5 Part B density sweep (verify-jx-pure.mjs derived-number
  asserts, gzip budget re-check).
- Density × light/dark matrix extension of the parity gate.
- Screenshot oracle for pseudo builds (checkbox glyph, radio dot,
  slider fill).
- Final Codex implementation review rounds.
