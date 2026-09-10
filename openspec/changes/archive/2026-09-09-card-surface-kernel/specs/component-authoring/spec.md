# ADDED Requirement: the structural kernel law (four layers, stickers, and the attach test)

Surface-bearing components SHALL organize into four layers with ONE
implementation per layer: (4) floating mechanisms (Dialog, Sheet,
Popover…) own top-layer, focus, Escape, scrim, entry/exit motion and
surface material — and NEVER grow structural flesh; (3) the Card
structural family (CardHeader / CardBody / CardFooter) is the ONE
implementation of the three-band interior (head/body/foot placement,
band separators, foot action assembly, band zones); (2) ButtonGroup is
the ONE layout component for joined member rows — free-floating
arrangement is plain utilities (no component wraps it); (1) skin is
contextual: `<Card>` root for planar surfaces, the jx-surface material
for floating ones. STRUCTURE IS A STICKER: the `data-jx-card`
attribute family + card.css rule set IS the ruler (five named
columns, three rows with the body row as sole absorber, the `jx-card`
container) — any element carrying `data-jx-card` acquires the whole
grid, server-rendered, by CSS alone; a floating surface's interior
host stamps the attributes instead of nesting a Card (the
`.jx-card-end-action-slot` seat, reserved since 2026-09-03, is where
Dialog's × rides). The 15rem narrow reversal is the ONE native
`@container jx-card` query (card-footer.css) — every carrier of the
sticker inherits it. THE ATTACH TEST (ruling, 2026-09-09): a concern
that must WAIT for the element to be on screen (measuring, listeners,
external libraries) uses `{@attach}`; a concern that exists at render
time (attributes, styles, semantics) is written declaratively —
attributes and classes that are present in SSR output; wrapping pure
CSS capability in a runtime attachment is a violation. THE ACTION-ZONE
LAW: every component's action bands (head/foot/dock button areas)
carry their own ButtonVariantScope from the band skeleton — head
ghost, foot ghost+flat — so bare PressButton/IconButton members (and
raw-snippet content) render quiet by default while explicit props
always win; a component author NEVER re-derives this per surface.
ButtonBar is RETIRED with this law (2026-09-09): a component exists
to carry a law, not a convenience — it had none of its own (zone
belongs to the bands, flex belongs to utilities).

#### Scenario: a floating surface renders the Card interior

- GIVEN a Dialog open with title and footer content
- THEN its interior host carries `data-jx-card` (not a Card
  component), the × rides `.jx-card-end-action-slot`, the body is a
  CardBody with the gutter-compensation cell, and the surface material
  rules paint unchanged — no Card skin (border/bg/shadow) exists
  inside the dialog

#### Scenario: any element wearing the sticker gets the ruler

- GIVEN an arbitrary element stamped `data-jx-card` with CardHeader/
  CardBody/CardFooter children
- THEN the five named columns and three-band rows apply server-side
  (no runtime attachment, no flash), and the 15rem reversal works
  through the inherited `jx-card` container

#### Scenario: the attach test classifies a concern

- GIVEN a proposed `tooltip(element)` attachment and a proposed
  "card-grid" structural attachment
- THEN the tooltip (measures the element on screen) is an attachment;
  the structural grid (exists at render time, SSR-complete) is a
  declarative attribute — wrapping it in `{@attach}` fails review

#### Scenario: an action band quiets its buttons

- GIVEN a bare PressButton inside a Card/Dialog foot band or a
  code-card/canvas action row wrapped by the band's
  ButtonVariantScope
- THEN it renders ghost on the flat texture with zero per-button
  props, an explicit variant/raised still wins, and no hand-drawn
  outline button (border/bg utilities + shadow-suppression vars)
  remains in any action band

#### Scenario: joined members compose, loose members are utilities

- GIVEN foot actions rendered through CardFooter
- THEN the buttons join ONE ButtonGroup with the leading seam
  (the one layout component); a caller arranging loose buttons
  anywhere writes plain flex/gap utilities — no wrapper component
  for free-floating arrangement exists in the registry
