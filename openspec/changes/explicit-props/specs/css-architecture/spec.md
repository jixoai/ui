## ADDED Requirements

### Requirement: the CSS-expression carrier

Universal axis values SHALL resolve to CSS expressions assigned to custom
properties on the component root — vars are the degenerate case; `calc()`,
`max()`, `color-mix()` and var-chains are the general case (the concentric
radius `max(0px, calc(effective − inset))` is canonical). Resolution SHALL
introduce no class identities and no runtime JavaScript (the `query()` JS
shell is the sanctioned fallback lane only).

#### Scenario: concentric radius is one expression, zero probing

- GIVEN `radius="auto"` inside a supplying container
- THEN the resolved value is a single CSS expression with EXPLICIT var()
  fallbacks (`max(0px, calc(var(--jx-radius-effective, 0px) -
  var(--jx-inset-effective, 0px)))` — undefined vars would void the whole
  calc under IACVT, so the fallbacks are load-bearing), evaluated by the
  cascade, with the root sheet carrying the `0px` invariants

### Requirement: plugin-level degrade verdicts

Capability-dependent lanes (today: `corner-shape`, Chromium-only) SHALL
degrade through ONE plugin-wide `@supports` verdict expressed as VARIABLE
re-assignment inside `@supports` blocks — never stamped classes (the
zero-class-identity carrier law stays intact), never per-component runtime
detection. The documented fallback table: shape `scoop|bevel|notch →
square`, `squircle → round` (the ×2 radius factor rides the same vars, so
its reversal on degrade is automatic).

#### Scenario: the degrade path is the main path

- GIVEN a Safari/Firefox agent (no corner-shape)
- WHEN `shape="squircle"` renders
- THEN the corners compute as `round` with the un-doubled radius, and the
  rendered geometry matches the documented fallback receipt
