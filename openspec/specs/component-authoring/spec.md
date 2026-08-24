# component-authoring — the Svelte 5 component contracts (living spec)

> Capability owner: `registry/files/ui/**` (mirrored at
> `apps/www/src/lib/ui/**`). Components are Svelte 5 runes-first,
> native-element-first, and follow the Tier system below.

## Current contract (state: 2026-08-24)

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

### Requirement: styling posture (pre-refactor baseline, verified 2026-08-24)

72 of the 79 registry `.svelte` files under `registry/files/ui/`
carry Svelte-scoped `<style>` blocks using `jx-`-prefixed classes
(the apps/www mirror holds 80 files including the site-only
`component-tree-nav.svelte`). Component-adjacent global sheets exist
OUTSIDE the components (`toc.css`, `website-scaffold.css` — registry
items whose mirrors sit in `src/lib/`) — cross-file couplings
documented per file. Tailwind v4 is installed and imported
(`app.css` → `@import 'tailwindcss'` + `@theme` supplements), and
jx-pure's element defaults deliberately sit in `@layer components`
with `:where()` so utilities always win; but the Tier-1 components
themselves are NOT yet utility-authored.

#### Scenario: consumer restyles an installed component

- GIVEN a component paint defined in its scoped `<style>`
- WHEN the consumer passes a utility class meant to override it
- THEN the scoped rule (class + Svelte hash specificity) wins and the
  utility silently loses — the customization-pain this baseline records
