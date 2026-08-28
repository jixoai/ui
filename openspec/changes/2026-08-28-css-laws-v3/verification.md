# Verification — css-laws V3

## Gates (post-cutover, commit `feat(css-laws): V3 cutover`)

| gate | result |
|---|---|
| packages/css-laws vitest | 39/39 (independent-parser dual-projection equality, scope integrity, empty-rule guard, `--j-` typo scan, fidelity spot-checks, composeLaw, byte stability, anchorless projections) |
| apps/www vitest | 573/573 |
| verify:parity | GREEN — 7 rows, 305 computed-style comparisons + 19 DOM-AST isomorphism assertions; identical rendering pre- and post-cutover |
| verify:budgets | 3/3 PASS (baselines re-recorded with justification: B-source 31630→measured 30047 after the anchorless fix, B-face 9124, B-consumer unchanged) |
| verify:mirror | GREEN |
| `npx tsx packages/css-laws/src/build.ts --check` | GREEN (committed slots fresh from law sources) |
| browser walkthrough (headless Chrome, section-by-section screenshots) | input/range/checkbox/radio/toggle/toggle-group/select/native-select/textarea — zero visual regression post-cutover |

## Review loop

- Codex r1 (prototype review, 2026-08-28): interface completeness
  gaps (subtree selectors, comma-prefix correctness, empty rules,
  tautological tests) + merge strategy. All addressed in the cutover
  (see proposal "Capabilities").
- Codex r2 (completion review): submitted to the `codex-css-laws`
  agent (workspace `zcode-css-laws-review`) against HEAD with the
  evidence above; verdict pending at time of writing — r2 findings
  and their resolution will be recorded here.

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
