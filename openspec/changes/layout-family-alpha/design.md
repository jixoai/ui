# Design: layout-family-alpha

## 1. The three components, one shape

Every family member is the same six-line shape — a bare native
`<div>`, its layout identity as inline `style:` declarations, the
consumer's `...rest` FIRST and the component's own `data-jx-*` stamp
AFTER (the component-authoring replace-not-merge law):

```svelte
<div
  {...rest}
  class={className}
  data-jx-prototype-flex
  style:display="flex"
  style:flex-direction={direction}
  style:flex-wrap={wrap}
  style:align-items={align}
  style:justify-content={justify}
  style:gap={gapStyle}
>
  {@render children?.()}
</div>
```

Why this exact shape:

- **SINGLE ROOT + `{...rest}`** — the design-studio stamp
  precondition (design-studio-r2 §3/§6). The stamp replaces rather
  than merges: component-owned attributes come after the spread.
- **`style:` directives, not a style string** — Svelte drops a
  `style:` declaration whose value is `undefined`, so
  *omitted prop → that CSS property is never injected*. No
  `undefined` ever leaks into an inline style; the browser default
  applies. This is the honest-minimal contract: the component writes
  ONLY what the consumer said.
- **`Props extends HTMLAttributes<HTMLDivElement>`** — full native
  attribute passthrough, TS-strict; `data-*`/`aria-*`/`title` land
  on the root verbatim (the props-discipline law).
- **No `cn()`, no token, no css file** — `class` is passed through
  verbatim (there is no component-owned class to merge against).
  Zero imports, zero registryDependencies: the item installs into
  any Tailwind-less host. This is the alpha track's reason to exist
  as a separate styling lane (see §3).

## 2. The standardized prop vocabulary (zero translation)

Every value is a native CSS value passed through 1:1 — there is NO
vocabulary-mapping layer (no `'between' → 'space-between'`): the
tests assert transparency, the design panel edits CSS-truth. The two
coercions that DO exist are type coercions, not vocabulary ones, and
both carry in-repo precedent (prototype-canvas, 2026-09-11):

- `gap`/`columns`-family `number` → `<n>px` (a bare number is not a
  valid CSS length; px is the only unit a number can honestly mean)
- `cols`/`rows` `number` → `repeat(N, minmax(0, 1fr))` — the
  no-max-content-blowout track form (css-architecture's grid law
  vocabulary; string stays verbatim as the escape hatch)

### prototype-flex — `display: flex`

| prop | union | maps to |
| --- | --- | --- |
| `direction?` | `'row' \| 'row-reverse' \| 'column' \| 'column-reverse'` | `flex-direction` |
| `wrap?` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `flex-wrap` |
| `align?` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `align-items` |
| `justify?` | `'start' \| 'center' \| 'end' \| 'space-between' \| 'space-around' \| 'space-evenly'` | `justify-content` |
| `gap?` | `number \| string` | `gap` |

All values are legal CSS Box Alignment tokens as-is (`'start'`/`'end'`
are the logical-axis spellings — the modern form). No defaults: an
omitted prop omits the declaration, and the CSS initial value serves.

### prototype-grid — `display: grid`

| prop | union | maps to |
| --- | --- | --- |
| `cols?` | `number \| string` | `grid-template-columns` |
| `rows?` | `number \| string` | `grid-template-rows` |
| `gap?` | `number \| string` | `gap` |
| `areas?` | `string` | `grid-template-areas` (verbatim) |

`areas` is a single verbatim string (`'"head head" "side main"'`);
an array-join form is a future enhancement, deliberately not
guessed at in v0.

### prototype-waterfall — CSS multi-column

| prop | union | maps to |
| --- | --- | --- |
| `columns?` | `number \| string` | the `columns` shorthand, verbatim (number = the count form; a length string like `'14rem'` = the auto-width form — one property, both shapes) |
| `gap?` | `number \| string` | `column-gap` |
| `strategy?` | `'balanced'` | `column-fill: balance` |

`strategy: 'balanced'` is v0's ONLY member (per the r2 ruling): the
browser balances column heights — the honest CSS-columns semantics.
The known CSS-columns tradeoffs are declared, not hidden: children
flow in column order (newspaper order, not shortest-column-first),
and a child's `break-inside` stays the consumer's call (the
component never overrides it). A future `'ordered'` (JS-measured
shortest-column placement) would extend the union — the prop exists
now so that extension is non-breaking.

## 3. Why a separate spec domain (`layout-family`), not a component-authoring MODIFIED

The specs/ shelf is domain-per-capability (component-authoring =
the Tier contracts every jixoai component obeys; registry =
distribution; canvas-schema = the metadata pipeline). The alpha
layout family is a REAL capability but a deliberately different
lane:

- component-authoring's styling posture is utility-first against
  the jixoai token sheet, with a documented install prerequisite
  (Tailwind v4 + the theme entry). The alpha layout family exists
  PRECISELY to not need that host — inline style only. Hosting an
  "exception requirement" inside component-authoring would erode
  its utility-first law with a permanent carve-out; a separate
  domain states the different posture as its own law.
- The alpha track has its own lifecycle: items graduate (fold into
  the Tier-1 vocabulary) or retire, and the domain archives with
  them. component-authoring is 3.5k lines of frozen rulings — alpha
  churn does not belong in it.
- Shared laws are REFERENCED, never re-stated: single-root +
  rest-spread (props discipline), composition-first (no items/data
  props here), data-jx-* hooks, TS-strict. The layout-family spec
  cites component-authoring as the governing contract for anything
  not overridden here.

## 4. No Defaults contract owed (the vocabulary audit)

`verify:context`'s pinned detection vocabulary (v1:
variant/density/elevation/size/shape/radius/tone/inset/bordered)
contains none of this family's props — direction/wrap/align/
justify/gap/cols/rows/areas/columns/strategy are BEHAVIOR-domain
layout props, not style-vocabulary words. No `XxxDefaults` object is
owed, and none ships. If a future axis (say, a shared gap scale)
opens, the family adopts the slot machinery then.

## 5. The standing distribution laws apply unchanged (mirror, catalog, docs)

Alpha is a meta stamp, not a distribution exemption — every
registry-item law this repo enforces in CI applies to the three
items:

- **mirror-sync**: byte mirrors under `apps/www/src/lib/ui/prototype-*/`,
  manifest regenerated (`gen-mirror-manifest.mjs` write mode).
- **catalog lock**: `meta.group: "layout"` + `meta.href` must target
  an EXISTING route — so each item gets a minimal alpha docs page
  (hero SectionCard + one live ComponentCanvas + usage + API) and
  `svelte.config.js` entries. The pages are honest about alpha
  status (an `alpha` pill in the hero row).
- **taxonomy snapshot**: docs-structure.spec.ts re-freezes
  layout 16→19 (105→108 ui items) with the customary dated note.
- **payload parity**: `public/r/*.json` is gitignored; unbuilt
  payloads are skipped by the parity spec by design — the next root
  `shadcn build` (CI/Owner) publishes them, no action here.
- **component-metadata-gen**: no `.meta.ts` is required until a
  docs canvas uses schema mode — the alpha pages use snippet
  playgrounds, not schema rows; the `--check` gate only audits
  committed meta files.
- The registry entry's `meta.alpha: true` is a NEW meta key: the
  shadcn registry-item schema is open on `meta` (extra keys pass
  validation — the existing entries already vary), and catalog
  projections read only group/href, so the stamp is additive.

## 6. Test lane: the apps/www tracked lane (same-source mirror import)

The suite lives at `apps/www/test/prototype-layout-family.spec.ts`
importing from `$lib/ui/prototype-*` — the byte-mirror of the
registry source (the same-source law: the site tests what it
ships). Rendering uses svelte's native `mount()` — no
@testing-library dependency in this suite.

Covered per component: (a) props→inline-style mapping — every
union member lands as the exact CSS value, `number` coercions
included; (b) omission transparency — an absent prop injects NO
declaration (asserted negatively: `style` attribute carries only
identity + what was passed); (c) rest spread — `data-testid`/
`title`/`aria-*` land on the single root; (d) children render
(through a real fixture host snippet); (e) the alpha contract —
registry.json carries `alpha: true` and the description names the
stamp precondition (the registry-level assertion rides the same
suite, fs-read like catalog.spec).

**The two-stage verification reality (a baseline infra bug,
recorded for the friction report):** this baseline's vitest
(vite 8.2.2 / rolldown 1.2.5) CANNOT cold-start its jsdom deps
optimizer anywhere — the rolldown runtime's `node:module` import
fails to resolve during dependency optimization; reproduced with
an isolated cacheDir in the MAIN checkout too, so the tracked
lane only runs off the main checkout's warm
`node_modules/.vite/vitest` cache (CI never runs vitest —
verify-all is a pure node gate chain). Consequences for this
change:

- In-worktree verification (pre-merge): a pure-node smoke script
  (outside the repo) asserting the SOURCE halves — per-component
  skeleton (identity declaration, the rest-before-stamp spread
  order, the exact style member set, zero runtime imports,
  intent header), the coercion semantics, the registry.json
  alpha contract, mirror byte-identity, and a bare
  `svelte/compiler` compile of each component — all green.
- The vitest suite itself runs on the tracked lane in the MAIN
  checkout at merge time (its warm cache), together with
  catalog/docs-structure; that run is the merge gate (task 9).
- The suite must therefore stay dependency-free (native mount,
  no @testing-library) — a dependency's externalized tree is
  exactly what drags the cold optimizer into the bug.

## 7. What v0 deliberately does not do

- No Waterfall `strategy: 'ordered'` (JS measurement) — r2's v0
  scope; the union is typed for it.
- No responsive/breakpoint props — the design panel edits one
  viewport truth; container-query vocabulary is a graduation-time
  question.
- No sub-parts, no snippets, no context — these are the three
  flattest primitives in the registry; anything more is a signal
  the primitive is in the wrong family.
- No `@jixoai/ui-prototype-plugin` package (that is the
  design-tool product branch's consume-side; it rebase-consumes
  these items — Owner ruling 2026-09-11, the independent-track
  workflow).
