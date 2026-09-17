# design-studio-shell — presence-visuals delta

## ADDED Requirements

### Requirement: indicators speak the player's primary — the brand-hue law

The local player's colorHue SHALL re-paint the whole surface's
jixoai-ui primary: the studio shell, the canvas document, and every
kit frame document it hosts set `--brand-hue` (bridged from the HSL
ordinal hue to OKLCH degrees by a pure, anchor-tested function). The
picker's own hover/selected rings SHALL no longer hardcode colors —
selected speaks `var(--primary)`, hover speaks the primary at half
alpha, and the badge derives from the same hue; light/dark frame twins
keep their theme, only the primary hue rides.

#### Scenario: one canvas, two viewers

- GIVEN two players on the same canvas, each with their ordinal hue
- WHEN either looks at the page
- THEN the page's primary UI and that viewer's own rings speak THE
  VIEWER's hue (each studio re-hues itself), while the remote ghost
  indicators keep the remote players' hues

### Requirement: cursors are canvas-scoped

A cursor report SHALL carry the canvas it lives on; a receiving
surface renders only same-canvas cursors — players on different pages
are invisible to each other, and no cursor ever renders on the studio
chrome (the shell-surface cursor lane is retired).

#### Scenario: two players, two pages

- GIVEN player A on canvas X and player B on canvas Y
- WHEN A sweeps their pointer
- THEN B sees nothing of A (no cursor, anywhere), and neither sees
  cursors over the navigator/props chrome

### Requirement: the multiplayer ribbon

Rows highlighted by attending players (the navigator's canvas rows and
the component tree's usage rows) SHALL render their border-inline-start
as a ribbon: ONE player keeps today's plain color; N players split the
border evenly in the LOCAL order (self first, then a stable ordinal)
via a border-image gradient from one shared pure function.

#### Scenario: two players attend the same tree row

- GIVEN players P1 (self, hue A) and P2 (hue B) both attending the
  same component
- THEN the row's start border is a two-band ribbon — A on the first
  half, B on the second — and each player's own studio sees THEMSELVES
  first

### Requirement: the props panel renders remote focus within the fields

The property panel (not a shell overlay) SHALL render remote panel
focus: each attending player outlines the operated field row in their
hue (stacked box-shadows for multiple), and when the field is an
input/textarea the remote player's text caret offset SHALL render as a
positioned caret bar (mirror-measured) with their name tag. The panel
SHALL report its own focus/caret upstream through the presence
attention lane (throttled; blur clears — the gateway accepts a null
focus as the clear).

#### Scenario: a remote player typing in the label input

- GIVEN player B focused in a text input at caret offset 7
- THEN player A's panel shows B's outline on that row and a B-hued
  caret bar between the 7th and 8th characters, gliding as B types
