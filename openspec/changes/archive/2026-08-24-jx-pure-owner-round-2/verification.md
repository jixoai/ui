# verification — jx-pure Owner round 2

Evidence inventory (all reproducible from the repo root):

## Gates

- `node scripts/verify-jx-pure.mjs 5199` — Chromium, all checks green
  (×3 consecutive): the D1–D6 surfaces, B5-glyph-leak regression lock,
  no-jx-pure island + nested-scope precedence, aria-invalid matrix with
  token-resolution comparisons, WCAG contrast audit (semantic pairs),
  .jx-input-group label-click focus, CustomElement shadow adoption,
  auto-dark emulation, reduced-motion full stillness.
- `node scripts/verify-jx-pure-engines.mjs 5199` — Firefox 11/11
  (pill paint box, fill/groove/disc pixel probes, :has() posture,
  forced-colors reversion, the FF platform-arrow select law);
  WebKit SKIP (cached build protocol-incompatible — recorded debt:
  rerun after installing the matching bundle).
- `pnpm --dir apps/www test` — 24 files / 327 tests green (incl. the
  parity suite: alias same-source, site-copy bytes, layer structure,
  auto-dark sync, 17KB gzip gate).
- `npm run build:site` — site + registry payloads + llms regenerated.

## Review loop

- review-r8.md — 5.5/10, four contract blockers + evidence gaps.
- Fixes: universal element-and-subtree revert; forced-colors bare
  select; RTL scope-root selectors; :has(:disabled) contracts;
  cross-engine run; contrast/nested/keyboard probes.
- Mid-flight Owner rulings applied: `.jx-group` → `.jx-input-group`
  (navigation class collision), switch + range rebuilt on the daisyUI
  language (pill + ringed disc; pill track + round knob).
- review-r9.md — final verdict on the terminal state:
  **10.0/10 — Accept** (loop: r8 5.5 → r9 7.0 → r9-final 8.0 →
  acceptance 10.0). All blockers closed; WebKit run remains a
  recorded non-blocking debt (cached build protocol mismatch).

## Visual evidence

- .agents/images/2026-08-24-openspec-owner-round-2/ — forms (time
  family, number platform stepper, groups), switch five states,
  validation matrix, scope laws, daisyUI rebuild (range/switch/tier2),
  firefox-page.
