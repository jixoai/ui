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

Families ship at ecosystem part granularity: the shadcn/shadcn-vue/
Dice UI anatomy for the equivalent component is the floor, not the
ceiling. Barrels follow the tabs precedent — `export { default }`
for the canonical main when one exists, sub-parts as named defaults,
`export *` for module types; NO Root aliases.

#### Scenario: a new component needs repeated items

- WHEN a component renders a list/sections/steps of caller-defined
  content
- THEN the registry ships the family parts and the consumer authors
  each item in their tree; no `items`/`steps`/`sections` prop exists

#### Scenario: ordinal state stays explicit

- GIVEN a composed family with an active/progress ordinal
- THEN items carry REQUIRED explicit ordinal/value props (`step`) and
  state derives from comparing them to the bindable root state —
  registration or instantiation order is never load-bearing

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

### Requirement: family context contract

State-sharing context in a family SHALL carry state and behavior
only — never membership order. Ordinal state compares explicit
per-item values; keyboard walks and filtering are DOM-delegated and
scoped to the nearest container (`closest()`), so nested families
never leak into each other's walks. Where items carry metadata the
DOM cannot express (match text), items SELF-match against context
state instead of registering into a central ordered registry. What
must register (imperative show/hide handles) registers at component
initialization — synchronously, SSR-executed, under a family-defined
stable DERIVED key (panel families: `${itemId}-panel`, never the
registrant's own `$props.id()`), unregistered `onDestroy`; `onMount`
is never the only registration path. Consequences that MUST hold: SSR output is semantically
complete before hydration; keyed `{#each}` reorders, conditional
inserts, deletions and restores never corrupt state or walk order.
ONE declared exception: DOM-derived AUTO modes (a toc deriving links
from rendered headings) render their landmark shell server-side and
complete on hydration — the data does not exist at render time; the
exception applies to auto modes only, never to composed trees.

#### Scenario: SSR renders the family complete

- GIVEN a composed family rendered server-side
- THEN the first paint carries every item with correct state paint
  and no hydration-time re-registration flash

#### Scenario: keyed reorder cannot corrupt state

- GIVEN a Steps/Command/Anchor family whose items live in a keyed
  `{#each}` that reorders at runtime
- THEN item state and walk order follow the NEW tree order with no
  stale ordinals and no ghost registration

#### Scenario: nested families do not leak walks

- GIVEN a MenubarPanel containing a nested dropdown-menu
- WHEN the panel walker walks `[role=menuitem]`
- THEN only entries whose `closest('[role=menu]')` is this panel
  participate — the nested menu keeps its own walk

### Requirement: the child snippet contract

Interactive parts (triggers, links, markers) MAY offer element
substitution, typed with the part's ONE concrete element kind — no
`any`, no generic, no element unions:

```ts
child?: Snippet<[{ props: HTMLAnchorAttributes & { class: string } }]>;   // link part
child?: Snippet<[{ props: HTMLButtonAttributes & { class: string } }]>;   // button part
```

The part hands the consumer a props object: `class` carries the
component's classes cn()-merged (the consumer appends their own via
`class={cn(props.class, 'own')}` after spreading, winning by the
layer law — the same contract as plain `class`), handlers and
aria/data attributes flow verbatim, and a consumer who REPLACES a
handler or aria attribute owns the consequences (Svelte spread
order). The replacement element MUST preserve the part's
role/semantics. Where a part's element kind can switch, child() is
offered only on the interactive form. Layout parts MUST NOT offer
child(). The parts offering it are listed per family in the change's
design.md.

#### Scenario: consumer replaces the element

- GIVEN a link part with a `child({ props })` snippet rendering an
  consumer `<a>` with a router href and an added click handler
- THEN the anchor carries the part's aria wiring and merged classes
  and the consumer's handler is the one that fires (replacement, by
  the spread-order law)
