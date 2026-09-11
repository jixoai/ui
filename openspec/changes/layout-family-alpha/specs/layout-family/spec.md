# layout-family — spec delta (ADDED)

## ADDED Requirements

### Requirement: the standardized layout vocabulary (zero translation)

The three alpha layout primitives — `prototype-flex`,
`prototype-grid`, `prototype-waterfall` — SHALL expose exactly the
standardized prop vocabulary of design-studio-r2 §6 and map every
value to its CSS property 1:1 with NO vocabulary-translation layer:
Flex `direction/wrap/align/justify/gap`, Grid `cols/rows/gap/areas`,
Waterfall `columns/gap/strategy` (v0: `'balanced'` only). The only
coercions are TYPE coercions (gap number → px; numeric tracks → the
blowout-proof repeat form).

#### Scenario: every union member lands as CSS truth

- GIVEN `<PrototypeFlex direction="column-reverse" justify="space-evenly" gap={12} />`
- THEN the root's inline style reads exactly `display: flex;
  flex-direction: column-reverse; justify-content: space-evenly;
  gap: 12px` — no renamed token, no mapped synonym

#### Scenario: grid numeric tracks take the blowout-proof form

- GIVEN `<PrototypeGrid cols={3} />`
- THEN `grid-template-columns: repeat(3, minmax(0, 1fr))` — and a
  legal string track form (`cols="repeat(auto-fit, 12rem)"` —
  `auto-fit` exists only inside `repeat()`) passes through verbatim

#### Scenario: waterfall balanced is column-fill balance

- GIVEN `<PrototypeWaterfall columns={3} gap={16} strategy="balanced" />`
- THEN the root renders CSS multi-column with `columns: 3` (the
  shorthand — count form), `column-gap: 16px`, `column-fill:
  balance` — and the docs declare the newspaper-order tradeoff
  honestly (children flow column-first; `break-inside` stays the
  consumer's call)

> The two type coercions, stated once: `number` gap → `<n>px`, and
> `number` cols/rows → `repeat(N, minmax(0, 1fr))` — the
> no-max-content-blowout track form (the css-architecture grid-law
> vocabulary; the design-studio-r2 cross-branch precedent); strings
> stay verbatim
> everywhere. Waterfall `columns` rides the CSS `columns` SHORTHAND
> verbatim: a number is the count form, a length string (`'14rem'`)
> is the auto-width form — one property, both shapes, no branching.
> Grid `areas` is a single verbatim string in v0 —
> an array-join form is a recorded future enhancement, not guessed.
> A future `strategy: 'ordered'` (JS-measured placement) extends the
> union non-breakingly; the prop ships in v0 for exactly that seam.

### Requirement: single root, rest spread, omission transparency

Every layout primitive SHALL render ONE root element: the
consumer's `...rest` (HTMLAttributes of the root's element kind)
spreads BEFORE the component's own `data-jx-prototype-*` stamp (the
replace-not-merge law), and an OMITTED prop SHALL inject NO style
declaration — flex/grid roots carry their identity (`display`)
plus only what the consumer declared; the waterfall identity IS
the `columns` shorthand, so a bare waterfall writes ZERO
declarations and CSS initial values serve the rest.

#### Scenario: the stamp mechanism's precondition holds family-wide

- GIVEN any of the three components rendered with
  `data-testid="x" title="y" aria-label="z"`
- THEN every attribute lands on the single root element, the root
  carries the family stamp (`data-jx-prototype-flex` et al.), and a
  consumer stamp collision replaces rather than merges

#### Scenario: omission writes nothing

- GIVEN `<PrototypeFlex>` with no props
- THEN the root's style attribute is exactly `display: flex` — no
  `flex-direction`, no `gap`, no `undefined` ever serialized
- GIVEN `<PrototypeWaterfall>` with no props
- THEN the root's style attribute is ABSENT — `columns` IS the
  waterfall identity, and an omitted one writes zero declarations

> This requirement is the in-repo self-proof of the design-studio
> stamp precondition (r2 §3/§6): the family exists to be stamped.
> The shared laws it rides — props discipline, composition-first,
> data-jx-* semantic hooks, TS-strict — are component-authoring's;
> this domain states only what differs.

### Requirement: inline-style-only, host-agnostic posture

The alpha layout family SHALL style exclusively through inline
`style` declarations on its root — zero Tailwind utilities, zero
theme tokens, zero css files, zero runtime dependencies and zero
`registryDependencies` — so the items install and render in ANY
host, including one that never wired the jixoai token sheet. The
component-owned `class` surface is empty: a consumer `class` passes
through verbatim with nothing to merge against.

#### Scenario: a Tailwind-less host installs the item

- GIVEN `npx jixoai-ui add prototype-flex` into a consumer with no
  Tailwind and no jixoai theme
- THEN the component renders and lays out correctly — the payload
  carries no `@jixoai/jixoai-theme` prerequisite

#### Scenario: consumer class rides through untouched

- GIVEN `<PrototypeGrid class="my-frame" cols={2} />`
- THEN the root's class attribute is exactly `my-frame` — the
  component authored no class of its own

### Requirement: the alpha track meta stamp

Alpha-track registry items SHALL stamp `meta.alpha: true` in their
registry.json entry and their `description` SHALL name the alpha
track and the single-root/rest-spread stamp precondition. The alpha
stamp is a meta fact ONLY: it exempts the item from NOTHING in the
standing distribution laws.

#### Scenario: the registry entry is auditable

- GIVEN registry.json after this change
- THEN the three `prototype-*` items each carry
  `"alpha": true` in meta and a description naming the alpha track
  and the stamp precondition — the acceptance suite reads
  registry.json and pins this

#### Scenario: alpha is not a distribution exemption

- GIVEN the three items' landing in the repo
- THEN the mirror manifest, catalog meta (group + live href), and
  docs-route taxonomy snapshot all cover them exactly as any other
  `registry:ui` item — verify:mirror, catalog.spec, and
  docs-structure.spec stay green with them included

> The `meta.alpha` key is additive to the shadcn registry-item
> schema's open meta object; catalog projections read group/href
> only. No Defaults contract is owed: none of the family's props is
> in the verify:context detection vocabulary (behavior-domain
> layout props, not style words — the design §4 audit).
