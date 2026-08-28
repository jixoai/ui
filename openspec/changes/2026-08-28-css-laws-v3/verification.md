# Verification — css-laws V3

## Gates (post-cutover, commit `feat(css-laws): V3 cutover`)

| gate | result |
|---|---|
| packages/css-laws vitest | 42/42 (independent-parser dual-projection equality, scope integrity, empty-rule guard, `--j-` typo scan, fidelity spot-checks, composeLaw, byte stability, anchorless projections) |
| apps/www vitest | 573/573 |
| verify:parity | GREEN — 8 rows, 311 computed-style comparisons + 20 DOM-AST assertions + ABSOLUTE posture locks (select[multiple]: no chevron, default cursor, 92px lane); identical rendering pre- and post-cutover |
| verify:budgets | 3/3 PASS (baselines re-recorded with justification: B-source 31630→measured 30047 after the anchorless fix, B-face 9124, B-consumer unchanged) |
| verify:mirror | GREEN |
| `npx tsx packages/css-laws/src/build.ts --check` | GREEN (committed slots fresh from law sources) |
| browser walkthrough (headless Chrome, section-by-section screenshots) | input/range/checkbox/radio/toggle/toggle-group/select/native-select/textarea — zero visual regression post-cutover |

## Review loop

- Codex r1 (prototype review, 2026-08-28): interface completeness
  gaps (subtree selectors, comma-prefix correctness, empty rules,
  tautological tests) + merge strategy. All addressed in the cutover
  (see proposal "Capabilities").
- Codex r2 (completion review): **6.5/10, NO-GO** — one verified P0
  and honest-model findings. Disposition (all landed, commit
  "fix(css-laws): r2 blockers"):
  - **P0 select[multiple] chevron regression** — the serializer's
    fixed section order emitted the listbox override BEFORE the
    @supports gate; equal specificity, later wins, so
    select[multiple] got the chevron back. FIXED with an explicit
    rule `order` model (base 0 · pseudos 100 · subtrees 200 ·
    states 300 · media 400 · supports 500; the listbox state rides
    600). Regression locks: unit tests assert the order in every
    projection; the parity page gained a `select-multi` row AND —
    after the negative test showed relative parity blind to
    same-stylesheet regressions — ABSOLUTE computed assertions
    (background-image none, cursor default, 92px lane). Negative
    verification: removing the order fails the absolute lock with
    the chevron URL in the computed style; restoring it goes GREEN.
  - **P1 model overclaim** — repositioned as a BOUNDED 13-law
    serializer (types.ts header); removed the unused
    LawCollection.sharedProperties.
  - **Closeout** — pnpm-workspace.yaml restored to a valid mapping;
    css-laws package.json main/description fixed; stale prototype
    dist/ deleted; marker slots validated for exactly-one begin/end
    pairing in both generate and --check paths.
  - **Test blind spots** — the scope test now covers selectors
    inside @media/@supports; radio ::before/checked cascade
    assertions added (content: none wins the base pseudo, the
    checkbox morphs carry — the V2 cascade exactly).
- Codex r3: submitted with the r3 evidence (parity now 311
  comparisons + 20 AST + absolute posture locks, all suites green).

## Known honest gaps

- The range law's engine pseudos ride bare (no @supports gates) —
  faithful to the V2 source of truth, which relied on unknown-
  selector degradation. The select law keeps its real @supports
  gate (Firefox branch).
- The alias projection duplicates the utility projection's
  declarations under Tier-2 selectors — inherent to unlayered
  aliases; accounted in the budget re-baseline.
- The tw-standard-layer-probe suite now locks TW4's @apply
  CAPABILITY on fixture-local utilities only (historical
  documentation); the shipping architecture's gates are the
  css-laws suite + parity + slot freshness check.
