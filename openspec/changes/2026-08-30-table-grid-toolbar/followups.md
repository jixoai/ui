# Followups: table-grid-toolbar

Missing atom APIs discovered while composing the recipe suite
(2026-08-30). Law: a discovered missing API is RECORDED here, never
silently worked around in demo code. Each entry names the recipe that
needed it and what the demo does instead — the composition stays
honest, public-surface only. No registry file was touched by this
change.

## table

### 1. No sticky-header law (the vertical scrollport)

- **Needed by**: the "with sticky header" recipe (`tasks.md` 1.5).
- **Gap**: the table owns the horizontal scrollport (figure +
  `overflow-x-auto`, `data-sticky` column pins) but no vertical law —
  nothing clamps the frame's block size and nothing pins `thead` to a
  vertical scrollport.
- **Demo instead**: consumer CSS on public structure — the page passes
  `class="sticky-scroll"` to the frame and authors
  `:global(.sticky-scroll) { max-block-size: 16rem; overflow-y: auto; }`
  + `:global(.sticky-scroll thead th) { position: sticky; top: 0; }`
  (cells already paint an opaque `--jx-table-surface`, so the pinned
  head masks scrolled rows).
- **Proposal**: a `stickyHeader?: boolean` prop (or a documented
  `data-sticky-rows` law) owning the clamp + pin in `table.css`, so
  consumers don't re-derive the scrollport contract.

### 2. No sort-state helper (aria-sort tri-state)

- **Needed by**: the "with sortable headers" recipe (`tasks.md` 1.1)
  and the tasks table.
- **Gap**: `aria-sort` wiring is a hand-written tri-state
  (absent/ascending/descending, single-column, third-press-clears) on
  every consumer.
- **Demo instead**: page-owned `sortKey`/`sortDir` + `ariaSort(key)`
  helper (~15 lines, shown verbatim in the recipe code).
- **Proposal**: OPTIONAL — a pure `sortState()` helper in the table
  folder (like `pagination-range`) would deduplicate the law without
  breaking the headless contract. Low priority: the page version is
  small and legible.

## transfer

### 3. No `oneWay` mode

- **Needed by**: the "with one-way moves" recipe (`tasks.md` 2.1).
- **Gap**: antd's `oneWay` removes the backward mover and renders the
  target panel without checkboxes; here both movers always render and
  target rows are always checkable.
- **Demo instead**: a value guard through the public `onchange` seam —
  a next list shorter than the committed list bounces (the committed
  list never shrinks). Behavior-level one-way is honest; the VISUAL
  half (checkbox-free target panel, hidden ← mover) is not expressible.
- **Proposal**: a `oneWay?: boolean` prop hiding the backward mover and
  rendering target rows as plain list items.

### 4. No header select-all / `selectAllLabels`

- **Needed by**: the "with batch select-all" recipe (`tasks.md` 2.1).
- **Gap**: panels have no header checkbox; transient per-panel
  selection (`pickedSource`/`pickedTarget`) is private state no
  external control can reach.
- **Demo instead**: external batch controls over the public `value`
  binding ("select all → move" commits every enabled option at once,
  "return all" clears) plus derived panel labels tracking the committed
  list.
- **Proposal**: header select-all checkboxes per panel wired to the
  existing transient selection, with an optional
  `selectAllLabels?: [string, string]` for the antd label surface.

## tour

### 5. No `placement` prop

- **Needed by**: the "with placement control" recipe + the 12-placement
  table (`tasks.md` 2.2).
- **Gap**: the card's geometry is fixed in `tour.css`
  (`top: anchor(bottom); left: anchor(left)`) — no prop reaches it.
- **Demo instead**: page-level overrides of the card's anchor()
  expressions scoped by a wrapper class (`.tour-place-top` …), unlayered
  so they beat the components-layer `:where(.jx-tour)` rule; the
  12-placement table documents the full block × inline matrix these
  expressions compose.
- **Proposal**: a `placement?: Placement` prop mapping to
  `inset-area`/`position-area` (the dropdown-menu precedent) so the
  geometry is component-owned again.

## statistic

### 6. No countdown item (deliberate composition, low priority)

- **Needed by**: the "with countdown" recipe (`tasks.md` 2.4).
- **Gap**: antd ships `Statistic.Countdown`; here the component renders
  only the value it is handed.
- **Demo instead**: page-owned time state — a 1s interval over
  remaining ms, mm:ss formatting, a one-shot finished flag, interval
  cleared at 00:00 and on destroy.
- **Proposal**: none urgent. If the recipe duplicates across products,
  consider a `statistic-countdown` recipe item in the registry (a
  composed demo file, not a component change).

## Non-gaps (recorded so they stop being re-litigated)

- **descriptions vertical/extra**: antd's `layout="vertical"` and
  `title`/`extra` props are intentionally NOT component props here —
  vertical is the Item's own grid re-run (`grid-cols-1!`, consumer class
  wins the merge) and the extra slot composes a header AROUND the dl
  (foreign content inside a dl would fight its semantics). Both demos
  are on the descriptions page.
- **tour non-modal**: not a missing option — non-modal IS the contract
  (`aria-modal=false`, pointer-events-none tint, no scroll clamp). A
  modal/guided mode would be a separate surface by the recorded
  architecture decision.
