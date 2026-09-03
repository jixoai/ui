# Delta: component-authoring — the foot zones scope the flat texture by Context

## MODIFIED Requirements

### Requirement: the variant grammar (prominence ladder + hue injection)

The paint ladder stays closed and paint still never touches physics. On
top of the `raised` physics axis (2026-09-03: `raised={false}` = the flat
texture — rest/hover zero shadow, active re-points to the engrave tier,
`--jx-press-move: none`), this change records the axis's ZONE resolution:

- `raised` carries NO static default. Resolution is
  `explicit ?? zone ?? true`: an explicit prop always wins, a
  Context-scoped zone default follows, the convex law is the resting
  default.
- The zone default rides its OWN context key (`PRESS_TEXTURE_KEY`, owned
  by press-button), NOT `BUTTON_GROUP_KEY` — every ButtonGroup resets the
  group key (paint policy), while physics must flow THROUGH joined
  groups untouched: a footer's grouped buttons ride flat exactly like
  its free-floating ones.
- `ButtonVariantScope` (the zero-DOM zone boundary that already scopes
  the variant) carries `raised?: boolean`, inherit-then-provide: a
  paint-only scope (variant set, raised absent) passes the enclosing
  zone's texture through and never un-flattens it.
- The FOOT zones of Dialog and Card declare `raised={false}` on their
  zone scope (Owner 2026-09-04): foot buttons ride the engrave-tier
  inset press by default. Head zones, standalone footers, and every
  bare button keep the convex default — the zone scopes a DEFAULT,
  never a law.

#### Scenario: a dialog footer button rides flat without any prop

- WHEN a PressButton renders inside a Dialog's footer (raw snippet or
  DialogFooter's grouped cluster) with no `raised` prop
- THEN it adopts the flat texture (the four pose customs; the grouped
  path included — the texture flows through the ButtonGroup)

#### Scenario: an explicit prop beats the zone

- WHEN the same button renders `raised={true}`
- THEN none of the flat block's seams ride (`--jx-press-move` absent,
  no engrave re-point) — a convex ghost keeps its own none-trio, which
  is r13 ghost law, not flat

#### Scenario: the head stays convex and a bare button is unchanged

- WHEN a PressButton renders in a Dialog/Card HEAD zone, or outside any
  zone
- THEN the convex law holds byte-identically (no pose customs, the
  kernel's `1px 1px` fallback)
