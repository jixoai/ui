# ADDED Requirement: markdown-rendered tables harvest through the declared marker

> r2 correction: `table` is an EXISTING `blocks.kind` value (the
> harvester's KIND_TABLE and its `<table>` tag-shape fallback already
> ship). This delta adds NO enumeration and NO schema edit — it locks
> the declared-marker precedence for the markdown face's output.

The markdown face's table block renders as a semantically neutral
`div[data-kind="table"]` wrapper around Table's own `<figure>/<table>`
tree. The harvester resolves such a block through the DECLARED marker
(the wrapper's `data-kind`), never through the inner tag shape, and
counts the block exactly once (the wrapper and Table's inner
`<table>` are one block, not two).

The markdown root additionally stamps `data-jx-markdown`; code blocks
inherit CodeCard's `data-kind="code"` unchanged; prose stays bare
elements (the heading-tree law governs headings; the site id stamper
stays the single addressing authority).

#### Scenario: harvesting a markdown-rendered page

- WHEN the corpus harvester walks a page whose content renders through
  the markdown component
- THEN a GFM table is harvested as kind `table` via the wrapper's
  declared `data-kind` marker — the tag-shape fallback never fires for
  it — and the inner `<table>` adds no second block

#### Scenario: existing corpora and heuristics stay untouched

- WHEN pages contain raw `<table>` markup not rendered by the markdown
  component
- THEN the pre-existing tag-shape fallback keeps working unchanged
