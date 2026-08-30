# Proposal: table-grid-toolbar — the enterprise data surface, demo-complete

## Why

The official data-table tutorial (sort → filter → pagination →
selection → toolbar) is the most-referenced demo corpus in the shadcn
ecosystem; reui proves the depth market with 36 Data Grid blocks.
jixoai's `table` owns the paint (container-query card mode, pinned
columns, token surface) but ships no composition demos for the
interactive layer. Sibling enterprise components (transfer, tour,
descriptions, statistic) likewise lack the multi-form demo matrices
their antd counterparts standardize (research: antd cascader 19 /
transfer 11 / tour 8 / descriptions 8 demos vs jixoai's single-form
demos).

## What Changes

- **Table composition demo suite** (recipes, not new components — the
  headless law stands): sortable headers (aria-sort + press-button
  carets), text + faceted filter row, pagination footer (the existing
  pagination family), row selection (native checkboxes + select-all
  with indeterminate), row-actions dropdown column, column visibility
  popover, sticky header demo — each demo a standalone recipe snippet
  on the table page, ending in the composed "tasks table" demo
  (toolbar + filter + selection + actions + pagination, the shadcn
  Tasks analog in terminal paint).
- **transfer**: oneWay demo, per-panel search (exists — demoed),
  select-all labels demo.
- **tour**: non-modal (mask=false) demo, placement matrix demo,
  custom indicators snippet.
- **descriptions**: vertical, responsive columns, extra slot demos.
- **statistic**: countdown recipe demo, precision/prefix/suffix
  matrix.
- All pages to the docs-demo-standard skeleton; demos named by
  ability.

## Layering

- `apps/www` docs demo snippets ONLY (registry files untouched except
  bugs found while composing — each logged, none expected).
- docs pages: table, transfer, tour, descriptions, statistic.

## Risks

- Demo-wide: composing exposes missing table APIs (e.g. no
  `aria-sort` helper). Rule: demos compose public behavior; a missing
  API becomes a logged followup item in this change, not a silent
  workaround.
