## ADDED Requirements

### Requirement: the eight universal axes — every family, one grammar

Every registry component family SHALL expose the eight universal props —
`size · shape · radius · density · color · theme · elevation · motion` —
through the shared slot helpers (the `densitySlot` precedent generalized:
`explicit ?? ambient ?? own`, 无意见不盖章). The grammar is uniform: `named`
(plugin alias table) | `auto` (inherit, the default) | `${number}` (exact
value, unit per axis: px / dp / hue-degrees), with the orthogonal
`query({...})` wrapper for media/container-conditional values. `auto` and
number literals SHALL NOT be remappable by any alias table.

#### Scenario: a nested component inherits by default

- GIVEN a card that sets `size="large"` and `density="small"`
- WHEN a button inside it renders with no explicit props
- THEN the button resolves both axes from the ambient context (`auto`), and
  a probe reads the same effective values as the card's supply set

#### Scenario: a native wrapper never forwards an owned prop

- GIVEN the input family (spreads `{...rest}` onto a native `<input>`)
- WHEN `size="medium"` is passed
- THEN the family consumes it as the scale axis and the native element never
  receives a `size` attribute from it

### Requirement: the broadcast protocol — 吃也供

A component that consumes an axis' context SHALL ALSO supply its resolved
value downward on its root: `--jx-size-effective`, `--jx-radius-effective` +
`--jx-inset-effective` (the concentric pair), `--jx-shape-effective`, the
density scope stamp, and `container-type` where the family is a layout
container. A non-contributing container breaks the chain and is a lint error.

#### Scenario: concentric radius across a container boundary

- GIVEN a panel with resolved radius R and inset P, containing a child in
  `radius="auto"`
- WHEN the child renders
- THEN the child's effective radius computes `max(0px, R − P)` as a CSS
  expression, and an arc-center probe shows the corners concentric

#### Scenario: the carrier law holds

- WHEN any axis value resolves
- THEN it lands as a CSS expression (custom property / calc / var-chain) —
  the resolution introduces ZERO class identities (the tailwindless ratchet
  budget stays unmoved)
