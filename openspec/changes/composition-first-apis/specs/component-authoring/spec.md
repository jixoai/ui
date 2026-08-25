# component-authoring — delta

## ADDED Requirements

### Requirement: composition-first API surface

Repeated or nested UI structure SHALL be authored in the consumer's
tree as family parts (Svelte 5 snippets/children), never described
through props. A registered component MUST NOT own markup that is
only reachable via data-array props, config trees, keyed render-props,
or string-to-glyph mappings. Legal props are: value/state (bindable),
behavior (`activation`, `placement`), presentation enums (`variant`,
`size`, `orientation`), and value/behavior-domain payloads (option
sets, tour targets, code strings, virtualizer rows) — the payload
category MUST provide snippet escapes for per-item content. The
diagnostic for gray zones: a prop that changes WHAT renders (which
rows/sections exist) must become a child component; a prop that
changes HOW it renders (paint, layout mode) is legal.

Families follow the in-repo precedent (tabs, list-item, dropdown-menu):
one part per file, index.ts barrel with short names + Root aliases,
shared state through context on the `Symbol.for('jx-…')` registry,
element replacement through the `child({ props })` snippet convention.

#### Scenario: a new component needs repeated items

- WHEN a component renders a list/sections/steps of caller-defined
  content
- THEN the registry ships Root + Item parts and the consumer authors
  each item in their tree; no `items`/`steps`/`sections` prop exists

#### Scenario: ordinal state stays a prop

- GIVEN a composed family with an active/progress ordinal (steps
  `current`, timeline pending)
- THEN the ordinal is a bindable state prop and item state paint
  derives from registration order versus it (Dice UI `activeIndex` /
  shadcn-vue Stepper `v-model` precedent)

#### Scenario: the keyed render-prop trap

- GIVEN a component tempted to expose `body?: Snippet<[item, index]>`
  as the only content path over a data array
- THEN that design is rejected: iteration ownership moves to the
  consumer and the snippet becomes plain children

#### Scenario: value-domain payload with content escape

- GIVEN an option-domain control (select options, tour targets) whose
  items ARE the value
- THEN the data prop is legal only if rich per-item content escapes
  through snippets; a fully closed row renderer is a violation

#### Scenario: computed structure ships logic, not markup

- GIVEN structure computed from state (pagination windows)
- THEN the computation lands as an exported pure helper and the
  consumer composes the parts through it; the component does not
  compute-and-render rows behind closed markup
