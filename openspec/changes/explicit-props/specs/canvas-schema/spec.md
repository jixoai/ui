## ADDED Requirements

### Requirement: universal axes in the canvas playground

The component canvas meta pipeline (component-metadata-gen → two-zone meta →
schema IR → schema2form) SHALL inject the shared universal-props block into
every family's generated zone per the FROZEN interfaces (design §17:
`UniversalAxisDoc`, `ControlHint` additions `axis-enum`/`axis-number`/
`query-editor`, `ComponentMeta.universal`, the 115-family
`universal-props.inventory.json` + exemption ledger, and the committed
normal-family + exempt-family fixtures under the change's `research/`).
The drift gate (`--check`) SHALL fail with the frozen one-line-per-divergence
format when any of artifact/injection/inventory diverges.

#### Scenario: playground edits an axis live

- GIVEN a component canvas for any family
- WHEN the operator flips `elevation` from `auto` to `level4` in the controls
- THEN the canvas instance re-renders with the 8dp recipe and the meta block
  in the generated zone is untouched by the edit

#### Scenario: the drift gate guards the shared block

- GIVEN a hand-edited generated zone that diverges from the shared block
- WHEN `component-metadata-gen --check` runs
- THEN it fails naming the family and the field
