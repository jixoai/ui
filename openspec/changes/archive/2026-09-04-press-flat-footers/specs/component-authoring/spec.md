# Delta: component-authoring — the foot zones scope the flat texture by Context

## MODIFIED Requirements

### Requirement: the variant grammar (prominence ladder + hue injection)

Surface paint variants SHALL come from the one ladder — `fill` /
`tonal` / `outline` / `ghost` — plus PressButton's `link` interaction
exception. Semantic color is NEVER a variant name: intent is expressed
by injecting values into the four global hue slots (`--jx-fill`,
`--jx-fill-ink`, `--jx-tonal`, `--jx-outline`; theme-owned,
inheritable). The action/status split is mandatory: destructive
ACTIONS inject `--destructive` (the fill pair), error STATUSES inject
`--error` into the tonal slot. Variant paint rides token utilities in
the markup (tw4 utility-authored law); press physics (`.jx-press`)
never change with paint. Availability is per-component (see the
frozen table in openspec/changes/variant-grammar/design.md §4):
Badge fill/tonal/outline (default tonal, brand hue); InlineCode
tonal/outline (default tonal, locally neutral); Chip all four
(default tonal); PressButton fill/tonal/outline/ghost/link (default
outline); Alert outline/tonal (default outline — no fill/ghost:
banner readability). Valued `data-jx-*` hooks carry the variant
(`data-jx-badge`, `data-jx-alert`, `data-jx-press-button`,
`data-jx-chip`).

The injection seam is TWO-LAYERED (hue-injection-utilities,
2026-08-27): the CANONICAL form for the curated semantic set is the
theme's TW4 `@utility` intent layer — `jx-hue-primary | neutral |
error | success | warning | info` (tonal slot) and
`jx-pair-destructive` (fill + fill-ink together, making the
always-inject-both law structural; there is no `jx-hue-destructive`
— the action/status split holds by construction). The
arbitrary-property class (`[--jx-tonal:var(--error)]`) remains the
escape hatch for values outside the closed set; ONE form per slot in
a class list (cross-form mixing is not dedupable). `cn()` registers
the closed set as tailwind-merge dedupe groups.

THE PHYSICS AXIS (Owner 2026-09-03), orthogonal to the paint ladder:
the ladder stays closed and paint still never touches physics, but
the axis that was implicit is now recorded.

- PressButton gains `raised?: boolean` (default `true`). The paint
  ladder is untouched; `raised` modulates ONLY the press law's poses,
  entirely through the pose-custom mechanism (`--jx-press-shadow`,
  `--jx-press-shadow-hover`, `--jx-press-shadow-active`, and the NEW
  `--jx-press-move` seam on the kernel's `:active` translate —
  `translate: var(--jx-press-move, 1px 1px)` keeps every existing
  button byte-identical).
- `raised={false}` (the FLAT texture): rest and hover carry NO
  shadow; the press pose re-points to the engrave tier (an inset —
  pressed-ness expressed as being pushed INTO the plane) and the
  press vector is nulled (`--jx-press-move: none`) — the body never
  moves, the inset alone creates the illusion of movement. The
  variant's own pose customs are stripped before the flat block is
  applied (no two same-property utilities in one class list —
  ghost's none-trio must not collide). NO rung loses its border in
  flat (Owner ruling 2026-09-04: tonal's 45% outline stays; fill /
  ghost were never visibly bordered; outline's border IS the
  variant).
- The press pose expressing pressed-ness as an inset is a sanctioned
  pose expression (the press pose IS the affordance); it is distinct
  from the well-at-rest law (input-class controls: hover changes
  intensity only, never tier). PressButton keeps the 1px border
  frame — an inset shadow is never the sole affordance (r14-12).

THE ZONE RESOLUTION (Owner 2026-09-04): the flat texture's default
is Context-scopable on the same zero-DOM boundary that scopes the
variant.

- `raised` carries NO static default. Resolution is
  `explicit ?? zone ?? true`: an explicit prop always wins, a
  Context-scoped zone default follows, the convex law is the resting
  default.
- The zone default rides its OWN context key (`PRESS_TEXTURE_KEY`,
  owned by press-button), NOT `BUTTON_GROUP_KEY` — every ButtonGroup
  resets the group key (paint policy), while physics must flow
  THROUGH joined groups untouched: a footer's grouped buttons ride
  flat exactly like its free-floating ones.
- `ButtonVariantScope` (the zero-DOM zone boundary that already
  scopes the variant) carries `raised?: boolean`,
  inherit-then-provide: a paint-only scope (variant set, raised
  absent) passes the enclosing zone's texture through and never
  un-flattens it.
- The FOOT zones of Dialog and Card declare `raised={false}` on
  their zone scope (Owner 2026-09-04): foot buttons ride the
  engrave-tier inset press by default. Head zones, standalone
  footers, and every bare button keep the convex default — the zone
  scopes a DEFAULT, never a law.

#### Scenario: a failed status chip is authored

- WHEN a badge must read as failed
- THEN it is `<Badge variant="tonal" class="jx-hue-error">` (or the
  arbitrary equivalent) — never `tone="destructive"` and never the
  destructive ACTION hue

#### Scenario: a variant utility set is audited

- GIVEN any component's variant map after this change
- WHEN the source guard scans its markup
- THEN every variant's paint consumes the four global slots and no
  variant name encodes a semantic hue

#### Scenario: a flat button presses inward without moving

- WHEN a PressButton renders `raised={false}` with any framed rung
- THEN it carries the four pose customs (rest none, hover none,
  active engrave, move none), no same-property pose utility appears
  twice in its class list, and the 1px border frame remains
- WHEN it is pressed
- THEN the body does not translate and an inset (engrave-tier)
  shadow appears

#### Scenario: every existing button keeps today's physics byte-for-byte

- WHEN any button renders without `raised={false}`
- THEN the kernel resolves `--jx-press-move` to its `1px 1px`
  fallback and all three shadow poses resolve to the ladder
  defaults — nothing changes for any existing consumer

#### Scenario: a dialog footer button rides flat without any prop

- WHEN a PressButton renders inside a Dialog's footer (raw snippet
  or DialogFooter's grouped cluster) with no `raised` prop
- THEN it adopts the flat texture (the four pose customs; the
  grouped path included — the texture flows through the
  ButtonGroup)

#### Scenario: an explicit prop beats the zone

- WHEN the same button renders `raised={true}`
- THEN none of the flat block's seams ride (`--jx-press-move`
  absent, no engrave re-point) — a convex ghost keeps its own
  none-trio, which is r13 ghost law, not flat

#### Scenario: the head stays convex and a bare button is unchanged

- WHEN a PressButton renders in a Dialog/Card HEAD zone, or outside
  any zone
- THEN the convex law holds byte-identically (no pose customs, the
  kernel's `1px 1px` fallback)
