## ADDED Requirements

### Requirement: the eight universal axes — every family, one grammar

Every NON-EXEMPT registry component family (the exemption ledger of design
§17.2 names the exceptions with reasons — a family in neither the
inventory's families list nor its exemptions is a gate failure) SHALL
expose the eight universal props —
`size · shape · radius · density · color · theme · elevation · motion` —
through the shared slot helpers (the `densitySlot` precedent generalized:
`explicit ?? ambient ?? own`, 无意见不盖章). The grammar is uniform: `named`
(plugin alias table) | `auto` (inherit, the default) | `${number}` (exact
value, units per design §0.1: px / coefficient / dp / hue-degrees; shape
and theme enum-only), with the orthogonal `query({...})` wrapper for
media/container-conditional values. `auto` and number literals SHALL NOT
be remappable by any alias table.

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
value downward on its root — for ALL EIGHT axes (the frozen supply table,
design §11: size/shape/radius/density carry effective vars or the density
stamp; color carries the resolved value var; theme carries the class scope;
elevation and motion carry their effective vars), plus `container-type`
where the family is a layout container. A non-contributing consumer breaks
the chain and is a lint error.

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
