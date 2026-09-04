# ui-plugin-followup Specification

## Purpose
TBD - created by archiving change ui-plugin-followup. Update Purpose after archive.

## Requirements

### Requirement: DOM-AST isomorphism is asserted before computed styles

The parity gate SHALL parse both renderers' DOM into a comparable AST
(element tags, attribute sets minus caller-specific values, child
order, cardinality) and assert isomorphism BEFORE any computed-style
comparison. The class attribute SHALL be scoped: standard-layer
classes (jx-html-*) are ignored (consumption mechanism, not
divergence); non-standard classes must match on both sides.

#### Scenario: a component grows an unsanctioned wrapper

- GIVEN a vocabulary row whose registry render adds an element the
  canonical DOM schema does not sanction
- WHEN the isomorphism gate runs
- THEN it fails naming the row, the extra node, and the schema clause

### Requirement: face icon variables are layered for plugin override

The face's icon custom properties (--jx-icon-calendar, --jx-icon-clock)
SHALL be declared inside `@layer theme { :root { ... } }` so the
plugin's virtual CSS module (also @layer theme, later in import
order) can override them at equal specificity.

#### Scenario: a plugin-provided calendar icon takes effect

- GIVEN a consumer with the jxUI plugin and a custom calendar icon
- WHEN the site builds
- THEN the plugin's --jx-icon-calendar overrides the face's default
  (both in @layer theme, plugin imported later wins)

### Requirement: opentype.js stays external in the plugin build

The @jixoai/ui-plugin build SHALL keep the dynamic
`import('opentype.js')` as an external dependency in dist — it is a
build-time-only tool (runs inside the vite plugin during
`vite build`/`vite dev`), never ships to the consumer's browser. The
plugin package's dist SHALL NOT bundle opentype.js code.

#### Scenario: a consumer without fontIconProvider installs the plugin

- GIVEN a consumer using only lucideIconProvider
- WHEN they install @jixoai/ui-plugin
- THEN opentype.js is NOT downloaded (it's an optionalDependency,
  dynamically imported only by fontIconProvider)

### Requirement: composite components adopt the standard layer

Composite form components (select, combobox, date-picker, color-picker,
tags-input, number-input) SHALL mount jx-html-* classes on their
internal native controls and connect their trigger icons to the
corresponding icon slots (--jx-icon-chevron, --jx-icon-calendar).

#### Scenario: the composite select's chevron follows the icon slot

- GIVEN a consumer overrides --jx-icon-chevron via the plugin
- WHEN the composite select renders
- THEN its dropdown chevron uses the overridden icon (not a hardcoded
  inline SVG)
