# card — the structural surface (2026-09-03, Owner)

## ADDED Requirements

### Requirement: the card is the dialog ruler's structural clone, grid-tenant edition

The `<Card>` shall clone the dialog row ruler's STRUCTURE (zones,
stamped presence, content faces) while diverging on every law that
breaks under card-grid subgrid tenancy. Zones place by INTEGER cell
lines (`grid-area 1/1`, `2/1`, `3/1`) — never named rows (a wrapped
band rents IMPLICIT rows where line names don't resolve; the
2026-09-03 rev.1 lesson). The single column is `minmax(0, 1fr)` (the
blowout floor). The separators EDGE-RIDE their zone rows
(head-sep `1/1 + align-self: end`, foot-sep `3/1 + align-self: start`)
— no dedicated 1px tracks for a subgrid landlord to rent.

```
section[data-jx-card]            ← root = surface + ruler host
  ├─ [data-jx-card-head]         row 1 · flush zone
  │    └─ .jx-card-head-grid     [content] 1fr [inline-end-action-slot] auto
  │         ├─ head snippet | CardHeader (title face)
  │         └─ actions snippet   ← dialog × 的座位（开放插槽，无内建关闭钮）
  ├─ [data-jx-card-sep=head]     row 1 · riding the bottom edge
  ├─ [data-jx-card-body]         row 2 · plain track occupant (NO scroll law here)
  │    └─ [data-jx-card-cell]    THE scroll ring · max-height:100% + overflow-y:auto
  │                              · scrollbar-gutter: stable both-edges
  ├─ [data-jx-card-sep=foot]     row 3 · riding the top edge
  └─ [data-jx-card-foot]         row 3 · raw transport · carries @container/jx-card
```

#### Scenario: honest presence

- WHEN neither `title` nor `head` is passed THEN no head zone and no
  head separator render and `data-sep-head` is absent (dialog's head
  is structural for the × contract; the card's is not).
- WHEN `foot` is absent THEN no foot zone and no `data-sep-foot`.

#### Scenario: the scroll law, grid-tenant edition (two measured laws)

- A scroll-container ZONE collapses its rented `fr` row to zero (the
  engine relays the scrollable min, not the content max) — the ZONE
  stays a plain occupant, the CELL is the ring.
- An explicit `min-height: 0` on the zone collapses the row EVEN with
  a plain cell; the automatic minimum (scrollable descendant ⇒ 0) is
  what keeps the relay honest. NEVER write `min-height: 0` there.
- `scroll={false}` stamps `data-jx-scroll='off'` — the cell's scroll
  authority and gutter reservation retire together.

#### Scenario: never a container on a tenant (the tenancy guard)

`container-type` on a subgrid tenant breaks Chromium's rented-track
resolution (measured live: per-card row sets, misaligned separators
until `container-type: normal`). r2: the zones became COLUMN tenants
too, so the `jx-card` container moved to the ROOT — guarded by an
explicit retirement (`.jx-card-grid > [data-jx-card] {
container-type: normal }`): the container exists exactly where the
narrow reversal is reachable (standalone; card-grid's 320px floor
keeps in-grid cards above the reversal width anyway).

### Requirement: the inline ruler — grid+subgrid on the card's own axis (r2, Owner 2026-09-03)

WHEN passive text (the head title face, the foot start/end seats)
or an interactive cluster (the actions slot, the footer ButtonGroup)
places in a card, the geometry shall come from ONE ruler, not from
per-face padding utilities.

- The ROOT owns five named column tracks: `[card-inline-start]
  0.875rem [card-content-start] auto [card-fill] minmax(0.625rem,1fr)
  [card-content-end] auto [card-inline-end] 0.875rem`. The head and
  foot zones RENT them (`grid-template-columns: subgrid`); the body
  zone stays full-bleed (the scroll ring owns its dynamic-gutter
  inline formula — a width tracks cannot see).
- Passive seats ENTER at the content lines: the head title face
  (`card-content-start / card-content-end`, py-2.5 — its inline
  inset is the track; dialog-header painted the same 14px by hand),
  the foot start text (`card-content-start / card-fill`), the foot
  end text (`card-fill / card-inline-end`). Foot text seats carry
  py-2.5 — the card's one vertical text rhythm (18px line + 20px ≈
  the 40px cluster band measured on dialog).
- Edge riders SPAN the end inset with justify-self: end — the
  actions slot and the foot cluster seat (`card-content-end / -1`)
  ride the card edge flush; their buttons carry the rhythm
  internally (measured on dialog: footer buttons 40px tall,
  padding 0 12px).
- THE CROSS-ROW SHARING LAW (measured): tracks are shared by every
  row — the end-seat track sizes to its widest resident across rows
  (a 115px foot cluster measurably widened the head row's line 4).
  Consequences BY LAW: content-axis ENDINGS use `card-inline-end`
  (the end INSET line — never `card-content-end`, which the shared
  column pushes outward); edge riders span to `-1` (the corner is
  theirs regardless of the column width); the title face stops at
  `card-content-end` (dialog-parity: the title reserves the end
  column, like dialog's title reserves its × slot).
- The CardFooter wrapper DISSOLVES inside the foot zone
  (`[data-jx-card-foot] > .jx-card-foot-grid { display: contents }`)
  so the seats rent the ROOT's ruler directly; standalone it
  renders its own face of the same tracks (the mandatory fallback,
  dialog's no-subgrid geometry is the precedent).
- The narrow reversal (<15rem) is grid-NATIVE css against the root
  container: the cluster takes row 1 full-bleed (justify-self:
  stretch), text seats stack below at the content axis. Tailwind
  display utilities would replace the rented grid — they retired.

### Requirement: card-grid's explicit foot mode

`<CardGrid foot>` shall declare a THIRD shared row
(`auto 1fr auto`, children `span 3`) so zone-trio cards align heads,
fill bodies, and align FEET at band bottoms. The mode is EXPLICIT on
the landlord — never presence-inferred from children (mixed spans in
one grid silently misplace bands). The default two-row contract stays
byte-identical for every existing consumer.

### Requirement: print keep-chain

The kernel's separator keep law covers the card's lines: a bare comma
list `[data-jx-section-sep], [data-jx-card-sep] { break-after: avoid }`
(`:where()` shatters under pagedjs). Everything else (borderless
paper, padding flatten, first-child keep, `display: block`) reaches
the card for free through the `section.bg-card` projection.
