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

- GIVEN an AlertDialogActions strip (a popover-sized surface that
  rents no banded ruler)
- THEN its Cancel and Action render as ONE joined cluster through
  CardFooter's standalone mirror — each button fills the strip's
  height, the strip's border-t is the rim, the inter-button seam
  is the 1px hairline (never a gap)

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

# MODIFIED Requirement: the anchored-alert form (alert-dialog's flesh ruling)

The anchored popover surface (alert-dialog: popover="manual" +
CSS Anchor Positioning, rising beside its trigger) is NOT a banded
panel: its Title rides the content flow, its action strip escapes
the body padding through negative margins — a popover-sized surface
rents no banded ruler, and full dialect adoption would be dogma,
not law (floating-flesh-sweep ruling, 2026-09-09). What the form
SHALL shed is RECIPE DUPLICATION: AlertDialogAction and
AlertDialogCancel render PressButton (explicit variant; density
DEFAULT — the carved strip's height IS the Dialog footer's, the
Owner parity ruling 2026-09-09) — the family's one ladder, one
press law, one forced-colors
set — with the family's single local addition preserved (the fill
rung ships the jx-pair-destructive injection as the confirmTone
default; consumer pair injections still win by layer order). The
AlertDialogActions strip carries the action-band zone (ghost +
flat): the Cancel renders quiet with zero paint props, an explicit
Action variant always wins. The strip's interior is the CARVED
ACTION BAND (carved-action-band, 2026-09-09): the bleed wrapper
keeps the strip's own craft (the mt/gap breathing arithmetic, the
negative margins, the rim border-t) and renders CardFooter's
standalone mirror inside — the buttons fill the strip vertically,
joined by the group's seam, never a loose padded row.

#### Scenario: the confirm keeps its destructive default on the one ladder

- GIVEN a bare `<AlertDialogAction>delete</AlertDialogAction>`
- THEN it renders PressButton at the fill rung with the
  jx-pair-destructive pair injected (destructive ground/ink), pressing
  through the family's one press law — no local variant recipe exists

#### Scenario: the cancel rides the strip's quiet zone

- GIVEN the same strip's `<AlertDialogCancel>`
- THEN it renders ghost on the flat texture with zero paint props,
  and its data-jx-adlg-cancel stamp rides the rest lane onto the
  control root (the APG focus landing still finds it)

#### Scenario: the strip is carved, not padded

- GIVEN the rendered AlertDialogActions strip
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
