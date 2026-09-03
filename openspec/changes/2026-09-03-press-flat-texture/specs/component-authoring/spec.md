# Delta: component-authoring — the raised physics axis (flat texture)

## MODIFIED Requirements

### Requirement: the variant grammar (prominence ladder + hue injection)

The paint ladder stays closed (`fill`/`tonal`/`outline`/`ghost` +
PressButton's `link` interaction exception) and paint still never touches
physics. This change records the **physics axis** that was implicit:

- PressButton gains `raised?: boolean` (default `true`). The paint ladder
  is untouched; `raised` modulates ONLY the press law's poses, entirely
  through the pose-custom mechanism (`--jx-press-shadow`,
  `--jx-press-shadow-hover`, `--jx-press-shadow-active`, and the NEW
  `--jx-press-move` seam on the kernel's `:active` translate —
  `translate: var(--jx-press-move, 1px 1px)` keeps every existing button
  byte-identical).
- `raised={false}` (the FLAT texture): rest and hover carry NO shadow;
  the press pose re-points to the engrave tier (an inset — pressed-ness
  expressed as being pushed INTO the plane) and the press vector is
  nulled (`--jx-press-move: none`) — the body never moves, the inset
  alone creates the illusion of movement. The variant's own pose customs
  are stripped before the flat block is applied (no two same-property
  utilities in one class list — ghost's none-trio must not collide).
- The press pose expressing pressed-ness as an inset is a sanctioned
  pose expression (the press pose IS the affordance); it is distinct
  from the well-at-rest law (input-class controls: hover changes
  intensity only, never tier). PressButton keeps the 1px border frame —
  an inset shadow is never the sole affordance (r14-12).

#### Scenario: a flat button presses inward without moving

- **WHEN** a PressButton renders `raised={false}` with any framed rung
- **THEN** it carries the four pose customs (rest none, hover none, active engrave, move none), no same-property pose utility appears twice in its class list, and the 1px border frame remains
- **WHEN** it is pressed
- **THEN** the body does not translate and an inset (engrave-tier) shadow appears

#### Scenario: every existing button keeps today's physics byte-for-byte

- **WHEN** any button renders without `raised={false}`
- **THEN** the kernel resolves `--jx-press-move` to its `1px 1px` fallback and all three shadow poses resolve to the ladder defaults — nothing changes for any existing consumer
