# component-authoring — spec delta (icon-component-pipeline)

## MODIFIED Requirements

### Requirement: components consume the generated icon module

Registry components SHALL NOT embed hand-written `<svg>` glyph
markup. Decorative icons render through the `<Icon>` component
(`@jixoai/icon`) with a type-safe `name: IconName` from the
generated `$lib/icon-set.gen` artifact; per-instance overrides ride
the component's `size` / `strokeWidth` props — never edited
geometry. Structural ornaments that are not icon-library glyphs
(e.g. the tooltip caret polygon) are exempt from the icon component
but MUST be declared in the change record. The `{@html icons.x}`
string-bag consumption pattern is RETIRED (the icon-component-
pipeline change).

#### Scenario: a component hand-draws a lucide-style glyph

- GIVEN a registry component file
- WHEN an inline `<svg viewBox="0 0 24 24" fill="none"
  stroke="currentColor">` glyph appears in markup
- THEN it is a migration miss — the glyph belongs in the plugin
  library manifest

#### Scenario: a caret needs a heavier stroke

- GIVEN a component rendering `<Icon name="chevronDown" />` needing
  sw 2.5
- WHEN the call site passes `strokeWidth={2.5}`
- THEN the svg root carries stroke-width 2.5 and no wrapper-class
  override (`[&_svg]:stroke-*`) or manifest variant exists

#### Scenario: a typo'd icon name fails the type check

- GIVEN `<Icon name="chevronright" />` in a registry component
- WHEN svelte-check runs
- THEN the name fails against the `IconName` union (generated
  type-safety is the consumption law)
