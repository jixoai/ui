# data-jx-hooks — semantic hooks move from jx-* classes to data-jx-* attributes

> Orthogonal intents (1, Owner message 2026-08-25, verbatim: "第三类改
> 成 `data-jx-*`" — referring to the hook-only class category from the
> tw4-css-modularization aftermath inventory): the 529 jx-* classNames
> that carry ZERO css definitions become data-jx-* attributes, so the
> class namespace shrinks to what the cascade law actually owns.
>
> Process: ZCode drafts; Codex reviews/amends/finalizes BEFORE
> implementation (the session's standing loop).

## Why

After the tw4 migration the `jx-` class namespace serves two unrelated
jobs: (a) cascade-law selectors (state machines, kernels, Tier-2 —
css-DEFINED, 281 of them) and (b) semantic anchors for tests, docs,
JS wiring and future styling hooks (css-LESS, 374 of them + 12 variant families — measured
by `scripts/classify-jx-hooks.mjs`, committed with this change). The
(b) group masquerades as styling when it is semantics; attributes are
the platform's own mechanism for non-styling semantics, they cannot
collide with utility generation or tailwind-merge, and they make the
law auditable: **every remaining jx-* class in markup MUST be
css-defined** (the inventory engine proves the placement law).

## What Changes

1. **The hook law**: a css-less `jx-foo` token becomes the boolean
   attribute `data-jx-foo`; a dynamic variant family `jx-foo-{v}`
   becomes the VALUED attribute `data-jx-foo={v}` (variant families
   are exactly the concatenation sites `'jx-foo-' + tone`). Elements
   may carry several data-jx-* attributes; their order is not
   meaningful.
2. **css-DEFINED selectors never convert** — the 232 cascade-law
   selectors (state machines, kernels, Tier-2 frozen vocabulary,
   residue statics) keep their class form; that is the layer law's
   territory (see the css-architecture spec, archived
   tw4-css-modularization).
3. **Reference rewrite**: every `.jx-foo` selector/query in tests,
   docs pages, scripts, scenes, site code becomes `[data-jx-foo]`
   (boolean) or `[data-jx-foo="v"]` (variant); classList-based probes
   become attribute reads. `cn()` strings lose the hook tokens (cn
   stays for utilities only — hooks were never mergeable semantics).
4. **Consumer note**: markup output changes (hooks now attributes);
   a consumer querying `.jx-kbd`-style hooks must switch to
   `[data-jx-kbd]`. Payload URLs/install layout unchanged. Documented
   as a breaking markup-contract change in the README consume section.
5. **Codemod + verify**: an automated codemod (seeded by the
   classifier's used-map) performs the mechanical rewrite; a new
   `verify-hook-law.mjs` gate asserts (a) zero css-less jx-* tokens
   remain anywhere and (b) zero `[data-jx-...]` tokens collide with
   css-defined selector names.

## Impact

- All 73 ui items' markup (registry + mirrors), docs routes, tests,
  scripts, blueprint scenes, catalog.
- No css file content changes (selectors in residue css never
  referenced hook-only classes — verified by the classifier: defined
  ∩ hook-only = ∅).
- Specs: component-authoring MODIFIED (hook convention); README
  consume note.
- NOT in scope: css-defined selectors (incl. Tier-2/jx-pure), the
  jx-surface kernel contracts, site chrome class conventions outside
  the hook-only set.

## Evaluation

Inventory evidence lives in `scripts/classify-jx-hooks.mjs` output
(529/232 split, foreign reference map). The tw4 gates
(manifest/vitest/oracle/layer-law/fixtures) all carry over as the
integration battery.
