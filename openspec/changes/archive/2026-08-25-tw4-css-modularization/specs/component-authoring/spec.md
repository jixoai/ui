# component-authoring — delta

## MODIFIED Requirements

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
