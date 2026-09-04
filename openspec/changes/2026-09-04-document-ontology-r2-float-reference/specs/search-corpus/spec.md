# Delta: search-corpus — R2 number and refids fields (additive)

## ADDED Requirements

### Requirement: the corpus carries line numbers and reference edges

The harvest SHALL project R2's numbering emissions into the corpus
schema, additively — old corpora are never rewritten.

- `data-number` (figure or section) projects onto the wrapped point's
  `block.number` (the Figure wrapper never becomes a block of its
  own; the wrapped point keeps its own `data-kind` marker — taxonomy
  priority: the line marks structure, the point keeps semantics);
  section `number` lands on `sections[]`.
- `data-ref-to` on a reference point projects onto that block's
  `refids[]` (an inline reference hangs on its nearest block root; a
  block-level bare reference is never silently dropped by the
  stream walk); a reference to a missing target emits nothing (dead
  anchors stay a filed bug class, never harvested).
- `data-cited-in` (JSON array) projects onto the wrapped block's
  `citedIn`; a Figure whose content slot has no projectable child
  block projects no `number` (recorded, not synthesized).
- The schema extension is additive: corpora generated before R2
  parse unchanged; the corpus sha stability gate's baseline is
  regenerated with this batch.

#### Scenario: a numbered page harvests with numbers and edges

- GIVEN a fixture page with a declared numbering domain, two wrapped
  equation Figures, and a reference pointing at the second
- WHEN the harvester runs
- THEN the wrapped blocks carry `number` values in DOM order, the
  reference block carries `refids` containing the target id, the
  wrapper itself contributes no block, and a pre-R2 corpus still
  parses byte-stable under the regenerated baseline
