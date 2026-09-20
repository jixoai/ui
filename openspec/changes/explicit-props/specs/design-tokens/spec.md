## ADDED Requirements

### Requirement: the surface ladder (elevation follows official M3)

The theme SHALL carry an M3-style surface ladder — `surface` +
`surface-container-lowest … highest` (six rungs) plus one deepest rung below
`lowest` for the `-1dp` concave level — in BOTH theme profiles. Elevation
SHALL NOT use surface tint (deprecated upstream, Owner ruling 跟随官方走):
light expresses hierarchy by per-level shadow recipes, dark by the surface
steps. Surface darkening obeys the 减色墨律 (steps the roles, never adds
black overlays).

#### Scenario: elevation levels resolve to the paired recipe

- GIVEN `elevation="level3"` — the mapping is FROZEN: `level-1 → −1dp ·
  level0 → 0dp · level1 → 1dp · level2 → 3dp · level3 → 6dp · level4 →
  8dp · level5 → 12dp`
- THEN light renders the 6dp shadow recipe on its surface role, and dark
  renders the corresponding surface-container step with that level's weaker
  shadow

#### Scenario: the concave rung

- GIVEN `elevation="level-1"`
- THEN the surface takes an inset 1px shadow and the deepest ladder rung
  (below surface-container-lowest)

### Requirement: the eight axes as token members

Each axis' named steps SHALL live as typed token members remappable through
the plugin alias tables (`[$alias]: value`), with the per-axis number-lane
units fixed (size/radius/density → px, elevation → dp, color → hue degrees
through the fixed oklch primary formula). The micro-typography rungs
(`--text-caption` 9px, `--text-micro` 10px) SHALL stay absolute (rem), never
em-scaled by the size axis.

#### Scenario: a plugin remaps a named step

- GIVEN a consumer plugin registering `size: { large: 20 }`
- WHEN `size="large"` renders
- THEN the resolved root font-size follows the remap; `auto` and `42`
  (number) behave identically to the shipped defaults
