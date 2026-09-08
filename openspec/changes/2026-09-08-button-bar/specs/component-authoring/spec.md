# ADDED Requirement: the button-bar action lane (free-floating, ghost+flat by default)

The `button-bar` item is the FREE-FLOATING action lane: a single
row/column flex container whose members are independent buttons
(PressButton / IconButton) and joined clusters (ButtonGroup) separated
by gap — never edge-to-edge, never border-collapsed (the structural
boundary against ButtonGroup, the joined-cluster container). The lane
exists to DEFAULT the subtree: it provides the paint zone with own
'ghost' (`variant ?? enclosing ?? 'ghost'` — inherit-then-provide on
PAINT_ZONE_KEY) and the press texture zone with own flat
(`raised ?? enclosing ?? false` on PRESS_TEXTURE_KEY, the
ButtonVariantScope shape), so member buttons render borderless ghost
with the engrave-tier flat press by default — no redundant borders, no
per-button convex shadows — while explicit props at any level still
win. A nested ButtonGroup inherits the ghost variant (its ghost seam
policy follows), and its root cluster shadow goes dark
(`clusterRaised` resolves through the bar's flat texture — one
control, one shadow, and the lane casts none). The lane is
`orientation: 'horizontal' | 'vertical'` (single row/column only —
no wrap, no collapse, no measurement; overflow is the scroll
container's business) and `justify: 'start' | 'center' | 'end' |
'between'` (own default 'end' — the DialogFooter inline-end-actions
posture this lane generalizes), laid out entirely in utilities (no
css file; `data-jx-btnbar={orientation}` is the css-less semantic
hook), role=group named by `label` or rest aria attributes. The
family ships the Defaults contract (paint slot values
[fill, tonal, outline, ghost], own ghost — fused excluded: the
button families carry no fused rung; density slot no-opinion), a
proxy-family row in the context-coverage frozenAvailability mirror.

#### Scenario: a bare member button renders ghost and flat

- GIVEN a PressButton with no variant/raised inside a ButtonBar
- THEN it stamps `data-jx-press-button="ghost"` and
  `data-jx-press-flat` — no border color, no rest/hover shadow, the
  engrave-tier inset press

#### Scenario: an explicit prop beats the lane at either level

- GIVEN the same button with `variant="fill"` or `raised={true}`, or
  the bar itself with `variant="tonal"` / `raised={true}`
- THEN the explicit prop wins at its level — a fill button inside a
  ghost bar, or a convex bar of outline buttons, are both legal

#### Scenario: a joined cluster rides the lane silently

- GIVEN a ButtonGroup with no variant/raised inside a ButtonBar
- THEN its member buttons inherit ghost (seams on by the ghost seam
  policy) and its root carries no cluster shadow
  (`data-jx-btngroup-flat`) — the lane's flat texture carried
  through the physics key

#### Scenario: the lane is one row or one column, never both

- GIVEN a horizontal ButtonBar overflowing its container
- THEN it never wraps and never collapses — the lane has no overflow
  machine; a vertical lane is one stretched column
  (`items-stretch`), a horizontal lane centers its cross axis

#### Scenario: the lane adopts the enclosing zone when it sets none

- GIVEN a ButtonBar with no variant inside a zone providing 'tonal'
- THEN its members default to tonal (inherit-then-provide); with no
  enclosing zone they default to ghost — the lane's own
