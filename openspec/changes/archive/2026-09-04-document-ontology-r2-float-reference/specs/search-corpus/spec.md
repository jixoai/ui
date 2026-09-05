# Delta: search-corpus — R2 number and refids fields (additive)

## ADDED Requirements

### Requirement: the corpus carries line numbers and reference edges

The harvest SHALL project R2's numbering emissions into the corpus
schema, additively — old corpora are never rewritten.

- `data-number` (figure or section) projects onto the wrapped point's
  `block.number` (the Figure wrapper never becomes a block of its
  own; the wrapped point keeps its own `data-kind` marker — taxonomy
  priority: the line marks structure, the point keeps semantics);
  section `number` lands on `sections[]`. Both fields are OPTIONAL
  and OMITTED when unnumbered (never written as null).
- The harvest runs as a TWO-PASS pre-scan (Owner ruling P1-4=A,
  2026-09-05): pass one builds the document-wide REFERENCEABLE-TARGET
  index — every `[data-jx-section][id]` (numbered OR NOT: an
  unnumbered Section is a legal target) plus every
  `[data-jx-figure][id][data-number]` (an unnumbered Figure is not
  referenceable and stays out of the index); bare ids are excluded.
  Pass two projects the edges — so a forward reference whose SSR form
  is the `??(to)` fallback still contributes its `refids[]` edge
  (not-yet is not missing), while an edge whose target never exists
  in the index is filtered (the harvester is the
  static-completeness authority).
- `data-ref-to` on a reference point (a SINGLE id string under
  standard HTML serialization — no JSON, no compound value) projects
  onto that block's `refids[]` with FIRST-OCCURRENCE dedup and
  stable order (multiple references to the same target in one block
  collapse to one entry).
  An INLINE reference hangs on its containing block; a BARE reference
  (directly in a section body, no block root) hangs on the nearest
  PRECEDING stream item in the same section; a bare reference with
  no preceding stream item warns and is skipped (never silently
  dropped).
- `data-cited-in` (JSON array) projects onto the wrapped block's
  `citedIn`; a Figure whose content slot has no projectable child
  block projects no `number`; a Figure with multiple point-block
  children projects `number` onto the FIRST point block only.
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

#### Scenario: the five projection branches each hold

- GIVEN a harvest page exercising the five branches — an inline
  reference inside a paragraph, a bare reference with a preceding
  paragraph, a bare reference with no preceding stream item, a
  reference to a missing target, and a Figure wrapping two point
  blocks
- THEN the inline refid lands on its paragraph block, the bare
  refid lands on the preceding stream item, the no-precedent bare
  reference warns and contributes nothing, the missing target
  contributes nothing, and the two-block Figure's `number` lands on
  the first block only

#### Scenario: a forward reference's edge survives the static harvest

- GIVEN a prerendered page where a paragraph references an equation
  Figure that renders LATER (the SSR form is the `??(to)` fallback
  carrying `data-ref-to`)
- WHEN the two-pass harvester runs
- THEN pass one indexes the equation's id and pass two projects the
  paragraph's `refids` containing it — the edge is complete in the
  static corpus without hydration; an edge whose target id never
  exists anywhere in the document is filtered instead of harvested

#### Scenario: an unnumbered Section is an indexable target

- GIVEN a page with an unnumbered `Section id="preface"` and a
  Reference pointing at it, plus a Figure without `data-number` that
  a dangling reference mentions
- WHEN the two-pass harvester runs
- THEN the preface edge projects into `refids` (the index carries
  `[data-jx-section][id]` regardless of numbering) while the
  unnumbered-Figure edge is filtered (never a legal target)
