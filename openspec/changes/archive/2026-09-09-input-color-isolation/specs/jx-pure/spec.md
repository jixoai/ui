## MODIFIED Requirements

### Requirement: Part A — the v2 class vocabulary (unlayered Tier-2 contract)

The Tier-2 class vocabulary SHALL be the v2 set — kept: `.jx-field`,
`.jx-label`, `.jx-error`, `.jx-slotted` (structural state stamp), the
icon custom properties; renamed with NO deprecated aliases:
`.jx-control` (was .jx-input), `.jx-control-shell` (was
.jx-field-shell), `.jx-control-lane` (was .jx-input-lane),
`.jx-slider` (was .jx-range), `.jx-color-shell` (was .jx-color-field),
`.jx-color-swatch` (was .jx-color), `.jx-color-expand` (was
.jx-color-stretch). Range size classes are REMOVED. Part A stays the
intentionally unlayered cascade exception (it beats layered utilities
by design); the sheet stays zero-JS and canonical/mirror
byte-identical. Part A's own ladder hosts follow the isolation clause
(css-architecture, 2026-09-09 — the deferred class-(a) tails cleared
2026-09-09, input-color-isolation): `.jx-color-shell` roots its whole
internal ladder with `isolation: isolate` (`container-type` is NOT a
stacking context, measured); the control shell isolates when it
carries a floating label or a picker overlay. A ladder rung inside a
GENERATED slot (the pipette z2) carries its annotation in the
css-laws TS source, never a hand edit.

#### Scenario: the color shell's ladder stays private

- GIVEN a .jx-color-shell next to a sibling with a higher raw z
- WHEN the shell's pipette (z2) and swatch (z1) paint
- THEN they never compare against the sibling's z — the shell's
  isolation roots the ladder; computed isolation on the shell reads
  isolate

#### Scenario: a consumer writes an old class name

- GIVEN the rebuilt sheet
- WHEN markup uses .jx-input or .jx-range
- THEN no rule matches — old names are gone by contract and the
  parity test asserts the v2-only vocabulary

#### Scenario: the unlayered cascade exception survives the rename

- GIVEN a .jx-control-shell painted against a consumer utility
- THEN the Tier-2 unlayered rule still wins by design (the layer
  law's documented exception), unchanged from the frozen era

