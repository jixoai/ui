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
units frozen per design §0.1 (size/radius → px, density/motion →
coefficient, elevation → dp, color → hue degrees through the fixed oklch
primary formula). The micro-typography rungs (`--text-caption` 9px,
`--text-micro` 10px) SHALL stay absolute (rem), never em-scaled by the
size axis.

#### Scenario: the density coefficient composes over a rung

- GIVEN `density={0.75}` (number lane) inside an ambient `sm` scope
- THEN every PLAIN kernel channel computes its base rung value × the
  coefficient via the frozen pattern (`calc(var(--jx-<channel>-base) *
  var(--jx-density-coefficient, 1))`); the DERIVED channels follow the
  double-scaling law (design §4): row-min/hit compose the per-rung base
  scales × the coefficient ONCE with their floors absolute (and the 2xs
  scope's own `--jx-hit-floor` 6U override preserved), while
  textarea-min/color-lane stay UNCHANGED (their operands are already
  effective channels — zero additional coefficient); a named lane
  resolves to the exact rung with coefficient 1
- AND the probe asserts EXACT VALUES, not existence: each fixture's
  expected computed value is the frozen formula itself evaluated in the
  probe (`getComputedStyle` must equal the same `max()/calc()` evaluated
  numerically in JS), plus the two absolute guardrails hard-coded —
  `--jx-hit ≥ 24px` under 2xs (the 6U override) and `≥ 28px` (7U)
  everywhere else, whatever the coefficient

#### Scenario: the three lanes resolve distinctly (Codex r3 — never blur them)

- GIVEN a plugin registering `size: { large: 20 }` and an ambient `large`
  context
- WHEN `size` is omitted (or `auto`)
- THEN the effective size inherits the ambient resolved value — identical
  to what the tree already renders
- WHEN `size="large"` is set explicitly
- THEN the root font-size is the REMAPPED alias value (20px), driven
  through `var(--jx-size-large)` (the plugin's remap redefines the var)
- WHEN `size={42}` is set (number lane)
- THEN the root font-size is EXACTLY 42px — the number lane is the
  exact-value escape and NEVER follows alias tables
