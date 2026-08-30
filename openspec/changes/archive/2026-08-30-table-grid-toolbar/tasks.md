# Tasks: table-grid-toolbar

Sequencing: demo work can start anytime, but the skeleton-compliance
pass (3.1) runs AFTER C's lint exists; the table page is one of C's
pilot twelve — C migrates its props table first, this change adds
demos on top. B's parity-chrome edit precedes any parity additions.

## 1. Table recipes (the suite)

- [ ] 1.1 Sortable headers recipe (aria-sort wiring, caret via
      press-button carets, single-column sort state).
- [ ] 1.2 Filter row (text contains) + faceted filter (facets as
      toggle-group) recipes.
- [ ] 1.3 Pagination footer recipe (pagination family + page-size
      select).
- [ ] 1.4 Row selection recipe (checkboxes + header select-all,
      indeterminate law, selection count readout).
- [ ] 1.5 Row-actions recipe (dropdown-menu column) + column
      visibility popover recipe + sticky header demo.
- [ ] 1.6 The composed "tasks table" demo (toolbar + filter +
      selection + actions + pagination) as the page's terminal
      example.

## 2. Sibling matrices

- [ ] 2.1 transfer: oneWay demo + select-all-labels demo.
- [ ] 2.2 tour: non-modal demo; placement matrix (4 quadrants shown,
      the 12-placement table documented); custom indicators snippet.
- [ ] 2.3 descriptions: vertical / responsive / extra-slot demos.
- [ ] 2.4 statistic: countdown recipe; prefix/suffix/precision demo.

## 3. Compliance

- [ ] 3.1 All five pages to the docs-demo-standard skeleton; missing
      table APIs logged in `followups.md` next to this change.

## Verification

- Lint green; demos interactive in the real browser: sort toggles
  aria-sort, select-all indeterminate state, row actions open,
  tour non-modal does not lock scroll, countdown ticks.
- No registry-file diffs (or each logged one carries its own
  mirror re-record).
