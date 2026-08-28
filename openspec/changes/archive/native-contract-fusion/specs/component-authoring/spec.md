# component-authoring — delta

## MODIFIED Requirements

### Requirement: the Tier system

- **Tier-0** — `jx-pure`: the face — bare native elements under
  `.jx-pure`, painted by APPLYING the standard layer utilities
  (`:where(.jx-pure) input:where(<allowlist>) { @apply jx-html-input }`);
  pipeline-bound (zero-tailwind retired by Owner ruling).
- **Tier-1** — registered components: Svelte files that wrap/enhance a
  native element; their markup carries the standard `.jx-html-*`
  classes; folder css holds ONLY component extras.
- **Tier-2** — the standard layer: the `.jx-html-*` utility family in
  the theme sheet — the SINGLE declaration source for the native laws
  (see the native-contract spec). The r1 v2-class vocabulary
  (.jx-control family, .jx-tgroup) survives only as standard-layer
  postures/utilities or retires per the deletion matrix.

Tier-1 native-family components (input, textarea, native-select,
checkbox, radio, toggle, toggle-group) hold a 1:1 vocabulary duty
with DOM-isomorphic trees (the native-contract spec's canonical DOM
schema); range is a custom pointer-driven slider by scope ruling.

#### Scenario: a component needs a form lane

- GIVEN `input.svelte` renders the text-like shell
- WHEN it applies the standard classes (jx-html-control-shell/lane
  postures or jx-html-input)
- THEN the paint comes from the standard layer — no component-local
  law copy exists

#### Scenario: a native component's own paint is authored

- GIVEN a component extra beyond the standard classes (slots, a
  clear button)
- THEN it lands in the folder css as bounded @apply/plain css and
  the isomorphism gate proves the DOM stays canonical
## MODIFIED Requirements

### Requirement: styling posture

Tier-1 components consume the standard layer as MARKUP CLASSES —
the native laws are never re-authored in component markup or folder
css. Component-extras paint is Tailwind v4 utilities/arbitrary
values in markup (the canonical entry setup is the documented
install prerequisite), merging through `cn()` for class-string
hygiene — `cn()` is NOT a cascade mechanism; override behavior comes
from the layer law (css-architecture spec). CSS that utilities
cannot express SHALL live in the component folder as `<item>.css`
(`@layer components` + `:where()`, bounded @apply of context-free
and arbitrary utilities ONLY — named-theme @apply fails in a
standalone sheet, probe-locked). Scoped-style migration MUST
explicitly re-express selector boundaries rather than
pattern-copying.

#### Scenario: consumer restyles an installed component

- GIVEN a utility-authored component with paint in `@layer components`
- WHEN the consumer passes any token utility on `class`
- THEN the consumer's utility wins by the layer/specificity law

#### Scenario: consumer restyles a migrated component

- GIVEN a utility-authored component with paint in `@layer components`
- WHEN the consumer passes any token utility on `class`
- THEN the consumer's utility wins by the layer/specificity law —
  the pre-refactor silent-loss defect is gone

#### Scenario: unmigrated component (transitional)

- GIVEN a Tier-1 component still on scoped `<style>` (pre-P3)
- THEN it carries no cn() obligation and its legacy string-concat
  class merge stands until its migration lands

#### Scenario: component needs non-utility css

- WHEN paint requires selectors utilities cannot express
- THEN it lands in `<item>.css` in the folder and still loses to
  consumer utilities (layer law)

#### Scenario: Tier-2 consume-only

- GIVEN a component using a standard-layer utility (jx-html-*)
- WHEN the component is refactored
- THEN the utility is consumed as-is; no component-side copy,
  re-wrap, or cascade-altering redefinition exists, and it never
  routes through `cn()`
