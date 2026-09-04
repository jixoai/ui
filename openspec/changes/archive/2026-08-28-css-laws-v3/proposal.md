# Proposal: css-laws V3 — the @apply chain retired into a TS single declaration source

## Why

The V2 architecture (native-contract-fusion) single-sourced the 13
jx-html form-control laws as `@utility` families in jixoai.css, with
the jx-pure face APPLYING them (`input { @apply jx-html-input }`).
TW4's dev server could not reliably emit complex utilities onto
element selectors: the bare range/checkbox/radio/color rules went
missing, and the stopgap (hand-expanding declarations in the face)
violated the single-source law the whole change exists to enforce.

## What Changes

- The 13 laws become typed TS objects in `packages/css-laws/src/laws`
  (`ComponentLaw`: base / pseudos / states / subtrees / media /
  supports / customProperties / application).
- A serializer (`src/serializers/core.ts`) produces THREE projections
  from one declaration source:
  - `utility` — flat `.jx-html-*` rules in jixoai.css's generated
    slot inside `@layer components` (consumer utilities win over law
    paint by layer order — the css-architecture placement law)
  - `face` — bare-element defaults under `:where(.jx-pure)` in the
    jx-pure.css Part B generated slot (inside the sheet's components
    layer)
  - `alias` — the Tier-2 opt-in classes (`.jx-control`, `.jx-slider`,
    …) in the Part A generated slot, unlayered by design
- Law composition (textarea/select ⊂ input, radio ⊂ checkbox) moves
  into `composeLaw` (TS-level merge); the `@apply` chain is fully
  retired.
- The generator (`src/generate.ts` + `src/build.ts` CLI) writes the
  slots between `@jixoai/css-laws:begin/end` markers, mirror-syncs
  to apps/www, and refreshes the mirror manifest. `--check` verifies
  committed slots are fresh from the law sources.

## Capabilities

- Subtree laws (tgroup's `> label` seam family, clear's glyph
  descendant) are first-class (`SubtreeRule`).
- Comma safety: `splitTopLevelCommas` is paren/quote-aware —
  `:where([multiple], [size])` and `:not(.a, .b *)` survive intact,
  and every top-level comma part is re-anchored (a face selector can
  never escape the `:where(.jx-pure)` scope).
- Empty declarations and anchorless rules are skipped in every emit
  path — no empty braces, no orphan rules.
- Real single-sourcing tests: an independent CSS text parser
  (`test/parse-css.ts`) compares projections cross-format by
  declaration fingerprints; guards cover scope leaks, empty rules,
  `--j-` typos, and byte stability.

## Impact

- registry/files/theme/{jixoai,jx-pure}.css + their mirrors: the
  @utility family and @apply applications replaced by generated
  slots; face-authored laws untouched.
- No component markup changes (classes keep their names).
- Budgets re-baselined (+17% source / +23% face): the deliberate
  cost of flattened composition and full alias rule-sets, justified
  in scripts/verify-budgets.mjs; rendering identity proven by the
  parity gate (305 comparisons + 19 DOM-AST, GREEN before and after).
