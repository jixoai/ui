# docs-site — spec delta (icon-component-pipeline)

## ADDED Requirements

### Requirement: the icons page documents the component and the library face

The icons documentation page SHALL lead with the Icon component API
(`name`/`size`/`strokeWidth`, the type-safety law), render the
named-icon grid from `ICON_NAMES` (dynamic — a new icon appears with
zero page edit, the existing grid law carried over), and document
the plugin library face: override/custom/`lucide:` sources, the
chunk budget (`maxChunkBytes` default 20480 raw), `chunking:
'single'`, `inlineFirstChunk`, `optimize`, and the async semantics
(inline sync core → SSR-safe; lazy overflow → reserved box +
`preloadIcons`). The CSS-slot section (the `--jx-icon-*` vocabulary
table) SHALL remain, re-framed as the slot face's documentation
beside the library face.

#### Scenario: the grid tracks the generated union

- GIVEN a new icon name lands in icon-set.gen.ts
- WHEN the icons page renders
- THEN the grid shows it without any page edit (the coverage test
  asserts grid count === ICON_NAMES length)

#### Scenario: the two faces are distinguishable

- GIVEN a reader on the icons page
- WHEN they scan the sections
- THEN the component/library face (JS consumption) and the slot face
  (CSS custom properties) are presented as separate systems with
  their own sections, not conflated
