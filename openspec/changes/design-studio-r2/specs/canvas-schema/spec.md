# canvas-schema Specification (r2 delta)

## ADDED Requirements

### Requirement: the x-ui vocabulary carries design decorations

The schema kernel's `x-ui` passthrough vocabulary SHALL include
`control`, `label`, `description`, `lane`, `unit`, `sourceType`
(the existing keys) AND `icon` plus `i18n` (the design-studio
r2 additions — property-panel decorations). The metadata
extractor SHALL validate annotation keys against this
vocabulary and fail loudly on unknown keys; the lowered
jsonSchema SHALL pass both new keys through like the existing
ones. Consumers that predate the new keys ignore them without
error (passthrough semantics, no breaking change).

#### Scenario: a decorated prop lowers cleanly

- GIVEN an annotation zone marking a prop with
  x-ui: { control: "segmented", icon: "lucide:palette" }
- WHEN the extractor regenerates and the kernel lowers the IR
- THEN the export carries both x-ui keys verbatim and the docs
  canvas renders the row unchanged (icon ignored there,
  consumed by the design panel)
