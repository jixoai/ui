# Verification: expand-form-family

## Baseline (2026-08-30)

- input: no count, no reveal toggle, no floating label. combobox:
  single-value only, no clear. No input-group / button-group items.

## Gate evidence

1. `npm run verify:all` green after the registry gains input-group +
   button-group (item count 95) and combobox/input changes.
2. ACCEPTANCE GATE: the A harness's registered cases for input-group
   and button-group — fresh Vite consumer, install from generated
   `public/r/`, import the canonical entry, BUILD. Bare add-resolution
   is diagnostic context only.
3. Unit suites: counter code-point math; combobox multiple commit +
   chip removal; reveal toggle state; input-group disabled
   propagation.
4. Browser probes: floating bracket label focus/filled/error states;
   chips render + remove; clear submits empty (not "undefined");
   password reveal flips `type` without losing focus.
5. Docs pages (input, input-group, button-group, combobox, cascader,
   form recipes) skeleton-compliant per the docs-demo-standard lint.
