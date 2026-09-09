# ADDED Requirement: the borderless-chrome law (no framed controls inside a bounded surface)

Inside a surface that already carries its own clear boundary (a
border, a material edge — the canvas dock, a floating panel), a
control SHALL NOT add a second frame of its own: boxes inside boxes
read catastrophic (Owner, 2026-09-09: "在一个有明确边界的这种组件
内，尽量不要再出现有 border 的控件，在视觉上会带来灾难性的
问题"). The affordance carries itself: ghost cells under the zone,
hover wash, the active option's fill, the focus ring. The
control-chrome axis ('bare') is the form lane's expression of the
same law; decorative SEPARATOR lines between controls are not frames
and stay legal (the law bans control borders, not boundaries).

#### Scenario: the dock's inner controls carry no frames

- GIVEN the playground dock's control rows (a segmented option set,
  a stepper trio, the output projection rows)
- THEN none paints a control frame — the segmented options read as
  ghost cells with the active option filled, the stepper reads as
  three borderless cells around the mono value, and the output rows
  band by tint alone

# ADDED Requirement: the system trio (alert · confirm · prompt on the one alert engine)

The system-dialog family SHALL carry the window.alert /
window.confirm / window.prompt roles through an imperative trio
(`alert()`, `confirm()`, `prompt()` from the family index; a bare
string fills the title): each call mounts one host composition of
the family parts at the CENTER pose — Content's pose="center" drops
the anchor chain (a system question has no trigger to rise beside)
and the UA popover centering owns the panel. Resolution is EXACTLY
ONCE: an affirmative action resolves its value (void / boolean /
string), any close without an action (Cancel, Escape, programmatic)
resolves the cancel value (false / null); the mount unmounts after
the exit window so the animation plays out. Focus: the choice
postures land on Cancel (the APG safe-landing law); prompt lands on
its input (the answer is the task) and Enter submits through the
host's keydown. The prompt input rides the Input component at bare
chrome (the borderless-chrome law).

#### Scenario: confirm answers through a promise

- GIVEN `const ok = await confirm('delete?')` with the panel open
- THEN the Action click resolves true, the Cancel click and Escape
  both resolve false — never a hang, never a double resolve

#### Scenario: prompt returns the typed answer

- GIVEN `const name = await prompt({ title: 'rename' })` with text
  typed into the input
- THEN Enter (or the submit action) resolves the string; Escape
  resolves null

#### Scenario: the system panel is centered, not anchored

- GIVEN a trio-mounted panel
- THEN Content carries pose="center" — no position-anchor chain; the
  UA's popover centering (margin auto, fit-content, inset 0) owns
  the geometry, the window.confirm posture

# ADDED Requirement: the corner context (publish the container's corner, never clip)

A surface with a rounded corner SHALL publish it as an inherited lane
— `--jx-corner` (css custom-property inheritance, the platform's own
context mechanism, SSR-pure) — and any inhabitant sitting FLUSH in
that corner pairs concentrically (`border-*-radius:
var(--jx-corner, 0px)`) instead of poking past the curve. Clipping
the surface (overflow: clip) is RULED OUT (Owner, 2026-09-09, the
mobile-dev lesson): a clip shears the engrave inner shadow along
with the overflow, while a button's own radius lets the shadow — and
the press law — follow the curve natively. The lane is INERT
wherever no provider exists (the 0px fallback keeps every square
surface exactly as it was).

#### Scenario: the split strip's end cells ride the panel's corner

- GIVEN the system dialog's action strip inside its 8px-corner panel
- THEN the first cell's end-start radius and the last cell's
  end-end radius resolve to the published --jx-corner (measured 8px,
  concentric with the panel), the fill rung's corner no longer pokes
  past the panel's curve, and no overflow clip exists anywhere on
  the surface

#### Scenario: the kernel's cluster pairs the same lane

- GIVEN a CardFooter cluster's end cell inside any surface
- THEN it carries border-end-end-radius: var(--jx-corner, 0px) —
  0px and visually unchanged in square surfaces, concentric the
  moment a surface publishes a corner (the reversal's full-bleed
  start cell pairs end-start the same way)

# ADDED Requirement: the carved action band (the carved-cell law generalized to any surface)

An action band is a CARVED REGION, never a floating row (Owner
2026-09-09: "button 没有在纵向上铺完整个 footer，也没有合理的
分割线……padding 留白，这会令人困扰"). Wherever a surface mounts a
bar of actions — a foot band, an anchored alert's action strip, a
floating dock's reset row — it SHALL render CardFooter as the
content face (standalone mirror when the host carries no card
ruler): the buttons fill the band vertically edge-to-edge (the rim
line above IS the band's top edge, the group's leadingSeam IS the
carved left edge, the block height IS the band — min-h a floor,
never a cap), the cluster rides the inline end flush, and there is
NO padding-block whitespace around the buttons. The host surface
owns the bleed craft (negative margins escaping its own padding,
the rim line) — CardFooter stays geometry-pure. Loose self-padded
action rows (gap + py utilities wrapping zone buttons) are retired
with this law; a bar that is not a button cluster keeps whatever
non-action geometry it legitimately needs.

#### Scenario: a sheet footer carves its cluster

- GIVEN an open sheet whose footer snippet renders `<CardFooter>`
- THEN the cluster spans the band to the panel's inline end, its
  buttons stretch the full band height from the rim Separator to
  the panel's bottom edge — no padding whitespace above or below
  the buttons, the leadingSeam is the cluster's left edge

#### Scenario: an anchored alert's strip carves without a ruler

- GIVEN an SystemDialogActions strip (a popover-sized surface that
  rents no banded ruler)
- THEN its Cancel and Action render as ONE full-width ButtonGroup
  whose columns are minmax(auto, 1fr) — the buttons SPLIT the strip
  evenly (a long label may widen its column; the macOS system-alert
  posture), each fills the strip's height, the inter-button seam is
  the 1px hairline (never a gap), and the rim above is a REAL
  Separator instance — the same contrast-ghost ink engine Dialog's
  riding separators paint, never a border-t token line (the ink-law
  parity ruling, 2026-09-09 round 3)

#### Scenario: a chrome bar quiets into the same band

- GIVEN the canvas dock's head row (the drag bar: grip, theme
  toggle, density select, collapse chevron — buttons AND a select)
- THEN the row rides the same carved treatment: the zone quiets
  every press control (ghost + flat, zero hand borders — the
  ButtonBar spirit), controls stretch to fill the band with no
  padding float, the body's rim line below closes the band; the
  one non-press cell (the native select) rides the band borderless

#### Scenario: a non-footer bar uses the same band

- GIVEN the canvas playground dock's reset row (not a footer — a
  floating control panel's last row)
- THEN the reset control renders as the same carved band (bleeding
  to the dock's edges, rim line above, the icon button filling the
  band) — one form serves every action bar

# MODIFIED Requirement: the anchored-alert form (system-dialog's flesh ruling)

The anchored popover surface (system-dialog: popover="manual" +
CSS Anchor Positioning, rising beside its trigger) is NOT a banded
panel: its Title rides the content flow, its action strip escapes
the body padding through negative margins — a popover-sized surface
rents no banded ruler, and full dialect adoption would be dogma,
not law (floating-flesh-sweep ruling, 2026-09-09). What the form
SHALL shed is RECIPE DUPLICATION: SystemDialogAction and
SystemDialogCancel render PressButton (explicit variant; density
DEFAULT — the carved strip's height IS the Dialog footer's, the
Owner parity ruling 2026-09-09) — the family's one ladder, one
press law, one forced-colors
set — with the family's single local addition preserved (the fill
rung ships the jx-pair-destructive injection as the confirmTone
default; consumer pair injections still win by layer order). The
SystemDialogActions strip carries the action-band zone (ghost +
flat): the Cancel renders quiet with zero paint props, an explicit
Action variant always wins. the strip's
interior is the CARVED ACTION BAND (carved-action-band, 2026-09-09,
round 3: the even-split + ink-law rulings): the bleed wrapper keeps
the strip's own craft (the mt/gap breathing arithmetic, the negative
margins) and renders ONE full-width ButtonGroup with minmax(auto,1fr)
columns under a real Separator rim — the buttons split the strip
evenly, fill it vertically, and join by the group's 1px seam; never
a loose padded row, never a border-t token rim.

#### Scenario: the confirm keeps its destructive default on the one ladder

- GIVEN a bare `<SystemDialogAction>delete</SystemDialogAction>`
- THEN it renders PressButton at the fill rung with the
  jx-pair-destructive pair injected (destructive ground/ink), pressing
  through the family's one press law — no local variant recipe exists

#### Scenario: the cancel rides the strip's quiet zone

- GIVEN the same strip's `<SystemDialogCancel>`
- THEN it renders ghost on the flat texture with zero paint props,
  and its data-jx-sysdlg-cancel stamp rides the rest lane onto the
  control root (the APG focus landing still finds it)

#### Scenario: the strip is carved, not padded

- GIVEN the rendered SystemDialogActions strip
- THEN its height IS its buttons' height (joined, seamed, riding
  the strip's rim and end edge flush) — no padding-block floats
  the buttons inside a taller band

# MODIFIED Requirement: sheet speaks the full card dialect

Sheet (the showModal side drawer) is a full-panel floating surface
and SHALL carry its interior in the Card dialect like Dialog: ONE
sticker host (data-jx-card, card.css imported — the load-bearing
lesson) with the head/body/foot bands, edge-riding Separators
replacing the hand-drawn border-b/border-t, the × riding the
end-action seat as a zone-inheriting IconButton (the hand-painted
border button retired), the body as CardBody under the RHYTHM escape
hatch (the drawer's 18px beat and popover ink override the cell's
utilities with the consumer's `!` — the class-append law), and the
optional foot band under the action-band zone rendering the footer
snippet RAW (dialog's r14-9 law verbatim — the standard face is
CardFooter, whose cluster is the carved action band; the sheet
component mounts no layout wrapper of its own).
The slide state machine, edge docking, and the surface material stay
the mechanism's own (sheet.css), untouched.

#### Scenario: the drawer renders the kernel bands server-side

- GIVEN an open side sheet with a footer
- THEN its interior host carries data-jx-card with the three bands
  placed by the kernel's rule set (SSR-complete), the head and foot
  lines are Separator instances edge-riding their bands, and the ×
  sits in the end-action seat inheriting the head band's ghost zone

#### Scenario: the drawer keeps its own rhythm under the escape hatch

- GIVEN the sheet's CardBody class override (18px beat, popover ink,
  side-axis height cap)
- THEN the cell's same-property utilities lose to the bang-prefixed
  overrides by the class-append law while the kernel's scroll law and
  gutter compensation stay single-sourced in the cell's own css

#### Scenario: the foot band is RAW — CardFooter is the face

- GIVEN a sheet footer snippet
- THEN the snippet renders RAW inside the foot band (no grid, no
  group, no loose flex row from the sheet) — a CardFooter snippet
  dissolves against the rented ruler and carves its cluster; the
  consumer who passes bare buttons owns their geometry (the r14-9
  contract, dialog verbatim)
