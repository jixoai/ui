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

## Phase 4 — the @apply mirror pilots

- Pilot `af1037d` (native-select, subagent + orchestrator
  cross-check): B4 select law mirrored declaration-for-declaration;
  three state-machine drifts fixed toward Tier-0 (hover :not(:disabled),
  disabled box-shadow:none, [size]-as-listbox). Subagent report
  cross-checked against the actual diff — accurate; its judgment calls
  (scheme-light/dark:scheme-dark stays inline; chevron moves into the
  css as the law twin) adopted and codified in subagent-briefs.md's
  "Pilot resolutions".
- Batches `423020f` (input+textarea — clear-button hit lane; chromeless
  textarea lane with the placeholder drift FIXED toward Part A's
  --jx-placeholder mix; textarea.css registered), `405a12e`
  (checkbox+radio via the surviving subagent batch — radio
  rounded-full→50% drift fix; labelSide branch on the existing
  data-jx-check-left hook), `cf17648` (toggle — sr-only folded,
  role=switch adopted, disabled dim rule). Two sibling subagents died
  to API timeouts; their batches were completed by the orchestrator.
- RANGE scope ruling (design §4, `46c8f76`): the custom pointer-driven
  slider is not a native wrapper — out of the mirror migration.
- Gates after each batch: targeted suites green, svelte-check
  253/61/19 == baseline throughout.

## Phase 5 — Part B density adoption

- Commit `689a319`. 7 regions swept onto the --jx-* interface with
  old-literal fallbacks (B3 buttons, B4 text-like box law, textarea
  min, date/time indicator, checkbox + radio icon scale, B0 scoped
  text/leading). The face's controls now ride --jx-hit 44px (the a11y
  floor) / --jx-gap / --jx-inset / --jx-text / --jx-leading.
- verify-jx-pure.mjs: literal asserts (40px/16px) replaced by
  DERIVED probes (var() resolver elements) — "all checks passed".
- The parity gate QUANTIFIED the pre-sweep drift before fixing it
  (40px/8px/14px literals vs 44px/12px/13px interface — commit
  451c74d's evidence), then flipped the native-select row green.
- gzip 18,279B ≤ 18,432B budget (post-sweep).

## Phase 6 — the parity gate, complete

- Commit `82ae86d`. Rows: toggle-group, native-select, checkbox,
  radio, toggle (+ checkbox@xs and checkbox@dark variant sections);
  252 computed comparisons GREEN across the state matrix.
- Hardening found by the gate itself: (1) mid-transition color
  sampling → motion freeze; (2) the site's wall-clock BRAND HUE
  animates --primary (5s entry spin + 1s cruising) → hue-stable
  capture retry; (3) color-notation tolerance (oklab component
  deltas ≤0.011 — sub-visual interpolation variance, not drift).
- Pixel oracle (capture-baseline's tolerant comparator: channel ≤8,
  hot ≤0.5%): checkbox + radio **0.000% hot** — the clip-path glyph
  and the dot render pixel-identical across renderers.
- KNOWN GAP (warn-only): toggle knob CARRIERS differ (B13 ::before +
  margin travel vs component span + transform; end-state math equal,
  raster diverges 8.9% of the track box) — unifying the knob builds
  is follow-up work; the computed phase still gates the law box.

## Phase 7 — full gates

- vitest 549/549; svelte-check 253/61/19 == main baseline; mirror
  GREEN 91 items / 303 pairs; verify:contract GREEN; payload regen;
  gzip within budget; verify-jx-pure all checks.

## Codex r1 implementation review — fix round (2026-08-27)

- Verdict was 6.5/10 with 4 P1s; all fixed this round:
  - P1-1 toggle-group clean-install contract: registry deps
    `@jixoai/form-field` (dead bridge) → `@jixoai/jx-native-contract`;
    docs/description rewritten onto the native contract (name REQUIRED
    in single, getAll semantics, .jx-tgroup law source).
  - P1-2 DOM contract: `.jx-tgroup-item`/`.jx-tgroup-content` are now
    css-defined Part A aliases (`:is(label, .jx-tgroup-item)`
    selectors — bare DOM keeps working, the component's classes are
    hook-legal); the component stamps them via cn().
  - P1-3 the parity matrix: EXPECTED declaration + completeness
    validation (missing sections fail the gate), state ISOLATION
    (fresh page + motion freeze per non-base state — the r1
    false-green is dead), input + textarea rows added (posture-
    agnostic box props), native-select@lg variant added. 7 rows ×
    2960 comparisons GREEN.
  - P1-4 the toggle knob: motion carrier unified (transform), layout
    carrier unified (absolute + inset, position:relative on the B13
    input); computed geometry/colors/transforms byte-equal. The
    residual 8.917% is a RASTERIZATION-path artifact (::before inside
    the input element vs a real span child — deterministic,
    sub-visual, law-level equal by every computed probe); warn-only
    with this root cause recorded. A bare input cannot host a real
    child, so full carrier unification would mean rebuilding the
    component around pseudo-elements — declined for this change.
- Minor items fixed: B4 select chevron gutter + B14 ink gutters
  density-adopted (calc(inset+icon) — the @lg parity row caught the
  32px-vs-40px drift); summary min-height swept; jx-native-contract
  description lists .jx-tgroup; jx-pure docs point at the extract.
- gzip 18,296B ≤ 18KB (the :is() compression + comment trims paid
  for the class aliases).
- Remaining known items (documented, non-blocking): name validation
  is init-time only (mode/name swaps after mount keep the original
  grouping identity — comment documents it); Part A's three 2rem ink
  gutters stay literal (shared by both renderers — no parity
  divergence; density adoption optional follow-up); .mjs scripts +
  Chrome path match the existing scripts/ house pattern (deliberate);
  the 55-SVG blueprint regen mixed pre-existing drift catch-up into
  e157c32 (honest, noted); engines rerun + @types/node self-hosting
  are follow-ups.

## Pending evidence

- verify-jx-pure-engines (Firefox/WebKit) rerun result.
- Codex r2 confirmation round.
