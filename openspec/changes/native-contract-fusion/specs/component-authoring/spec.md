# component-authoring — delta

## MODIFIED Requirements

### Requirement: the Tier system

- **Tier-0** — `jx-pure`: element defaults for BARE native elements
  (see the jx-pure spec; one stylesheet, zero JS).
- **Tier-1** — registered components: Svelte files that wrap/enhance a
  native element (e.g. `input.svelte` wraps every native input type).
- **Tier-2** — the v2 class vocabulary (kept `.jx-field/.jx-label/
  .jx-error`; renamed `.jx-control/.jx-control-shell/.jx-control-lane/
  .jx-slider/.jx-color-shell/.jx-color-swatch/.jx-color-expand` + icon
  custom properties + the `.jx-tgroup` toggle-group law), authored
  ONLY in jx-pure.css Part A and distributed both inside the
  jx-pure face and as the generated `@jixoai/jx-native-contract`
  extract — consumed by Tier-1 components as a cross-file contract
  that MUST NOT drift (byte gate; see the native-contract spec).
  The v2 rename is complete: old names have no aliases.

Tier-1 native-family components (input, textarea, native-select,
checkbox, radio, toggle, toggle-group) hold a 1:1 vocabulary duty:
each mirrors exactly one Tier-0 law (see the native-contract spec's
vocabulary table) and its component-extra static paint is authored
as @apply mirror sheets per the mirror-boundary law — not as
hand-re-derived utility strings (the native-select drift defect
class is retired). Composites (select, combobox, date-picker, …)
compose the native family and keep utility-in-markup for their own
surfaces.

#### Scenario: a component needs a form lane

- GIVEN `input.svelte` renders the text-like shell
- WHEN it applies the Tier-2 `.jx-control-lane` class
- THEN the paint comes from the contract (single definition), not
  from a component-local duplicate

#### Scenario: a native component's own paint is authored

- GIVEN checkbox's glyph/box paint beyond the Part A classes
- THEN it lands in checkbox.css as mirror rules (bounded @apply +
  bare-CSS state machines) whose declarations the parity gate proves
  equivalent to the Tier-0 twin law

## MODIFIED Requirements

### Requirement: styling posture

Tier-1 components are utility-first: paint is composed as Tailwind v4
utilities in markup against the jixoai token-sheet `@theme` mappings —
which resolve for consumers ONLY under the canonical entry setup
(tailwind entry → jixoai theme import → contract/face import; see the
registry spec), declared as the documented install prerequisite of
utility-authored items. WHEN a Tier-1 component is migrated to
utility-authored paint, its affected public class slots SHALL merge
through `cn()` for class-string hygiene — `cn()` is NOT a cascade
mechanism; override behavior comes from the layer law
(css-architecture spec). CSS that utilities cannot express SHALL live
in the component folder as `<item>.css` (`@layer components` +
`:where()`, `jx-`-prefixed). For the native family, the folder sheet
IS the @apply mirror sheet (static paint mirroring the Tier-0 law;
the native-contract spec's boundary applies — named-theme @apply
banned, state machines unlayered, markup keeps Part A classes +
hooks + slot one-offs). The frozen Tier-2 vocabulary (Part A) and
the element-default laws (Parts A–D) MUST be consumed only — never
copied, moved, redefined, or re-wrapped; Tier-2 classes MUST NOT
route through `cn()` as a redefinition entry. Scoped-style migration
MUST explicitly re-express selector boundaries rather than
pattern-copying.

#### Scenario: consumer restyles an installed component

- GIVEN a utility-authored component with paint in `@layer components`
- WHEN the consumer passes any token utility on `class`
- THEN the consumer's utility wins by the layer/specificity law

#### Scenario: component needs non-utility css

- WHEN paint requires selectors utilities cannot express
- THEN it lands in `<item>.css` in the folder and still loses to
  consumer utilities (layer law)

#### Scenario: Tier-2 consume-only

- GIVEN a component using `.jx-control-lane` (Part A)
- WHEN the component is refactored
- THEN the class is consumed as-is; no component-side copy, re-wrap,
  or cascade-altering redefinition exists, and it never routes
  through `cn()`
