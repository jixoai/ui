# component-authoring — the Svelte 5 component contracts (living spec)

## Purpose

The Svelte 5 component contracts: the Tier system, native-element-first law, props discipline, and the utility-first styling posture with its documented cascade exceptions.

> Capability owner: `registry/files/ui/**` (mirrored at
> `apps/www/src/lib/ui/**`). Components are Svelte 5 runes-first,
> native-element-first, and follow the Tier system below.

## Current contract (state: 2026-08-24)

## Requirements

### Requirement: the Tier system

- **Tier-0** — `jx-pure`: element defaults for BARE native elements
  (see the jx-pure spec; one stylesheet, zero JS).
- **Tier-1** — registered components: Svelte files that wrap/enhance a
  native element (e.g. `input.svelte` wraps every native input type).
- **Tier-2** — the frozen class vocabulary
  (`.jx-field/.jx-label/.jx-error/.jx-input/.jx-field-shell/.jx-input-lane/
  .jx-range/.jx-color-field/.jx-color` + icon custom properties),
  defined in jx-pure.css Part A, consumed by Tier-1 components — a
  cross-file contract that MUST NOT drift between the sheets and the
  components.

#### Scenario: a component needs a form lane

- GIVEN `input.svelte` renders the text-like shell
- WHEN it applies the Tier-2 `.jx-input-lane` class
- THEN the paint comes from the jx-pure sheet (single definition), not
  from a component-local duplicate

### Requirement: native-element-first, W3C-first

The platform element IS the component where possible (accordion =
`<details>/<summary>`; kbd = `<kbd>`; table = native table with
container-query driven modes). Semantics, keyboard, SSR come from the
platform; JS only adds what the platform cannot do.

#### Scenario: choosing the implementation element

- WHEN a new component is proposed
- THEN the first question is which native element/structure already
  carries the semantics, and hydration cost is zero unless unavoidable

### Requirement: props discipline

Runes (`$props`, `$bindable`, `$state`); `class` merges into the root
element; `...rest` (HTMLAttributes) flows through verbatim so
title/data-*/aria-* land on the DOM. `value` is `$bindable`: bound =
controlled, absent = purely uncontrolled (FormData/form.reset
untouched).

#### Scenario: consumer passes arbitrary attributes

- GIVEN `<Foo data-testid="x" title="y" />`
- THEN both attributes land on the root native element unmodified

### Requirement: styling posture

Tier-1 components are migrating to utility-first: paint is composed as
Tailwind v4 utilities in markup against the jixoai token-sheet
`@theme` mappings — which resolve for consumers ONLY under the
canonical entry setup (tailwind entry → jixoai theme import; see the
registry spec), declared as the documented install prerequisite of
utility-authored items. WHEN a Tier-1 component is migrated to
utility-authored paint, its affected public class slots SHALL merge
through `cn()` for class-string hygiene (deduping conflicting
utilities inside one string) — `cn()` is NOT a cascade mechanism;
override behavior comes from the layer law (css-architecture spec).
Components not yet migrated (P0–P2 transitional state) keep their
existing class-merge behavior and carry NO cn() obligation. CSS that
utilities cannot express SHALL live in the component folder as
`<item>.css` (`@layer components` + `:where()`, `jx-`-prefixed). The
frozen Tier-2 vocabulary (jx-pure Part A) and the element-default
laws (Parts A–D) MUST be consumed only — never copied, moved,
redefined, or re-wrapped; Tier-2 classes MUST NOT route through
`cn()` as a redefinition entry. Scoped-style migration MUST
explicitly re-express selector boundaries (`:global()` child
selectors, pseudo-elements, `@supports`, media queries) rather than
pattern-copying.

#### Scenario: consumer restyles an installed component

- GIVEN a utility-authored component with paint in `@layer components`
- WHEN the consumer passes any token utility on `class`
- THEN the consumer's utility wins by the layer/specificity law — the
  pre-refactor silent-loss defect (scoped-style specificity inversion)
  is gone; this scenario name carries that history
- AND unmigrated components, while any remain, keep legacy behavior
  with no override guarantee (the migration's transitional state)

#### Scenario: consumer restyles a migrated component

- GIVEN a utility-authored component with paint in `@layer components`
- WHEN the consumer passes any token utility on `class`
- THEN the consumer's utility wins by the layer/specificity law — the
  pre-refactor silent-loss defect is gone

#### Scenario: unmigrated component (transitional)

- GIVEN a Tier-1 component still on scoped `<style>` (pre-P3)
- THEN it carries no cn() obligation and its legacy string-concat
  class merge stands until its migration lands

#### Scenario: component needs non-utility css

- WHEN paint requires selectors utilities cannot express
- THEN it lands in `<item>.css` in the folder and still loses to
  consumer utilities (layer law)

#### Scenario: Tier-2 consume-only

- GIVEN a component using `.jx-input-lane` (jx-pure Part A)
- WHEN the component is refactored
- THEN the class is consumed as-is; no component-side copy, re-wrap, or
  cascade-altering redefinition exists, and it never routes through
  `cn()`
