# ADDED Requirement: the press-button rest lane (attribute passthrough)

PressButton and IconButton SHALL pass arbitrary attributes through
VERBATIM onto the control root (button or anchor — the shared
HTMLElement contract): the Props interface extends
HTMLAttributes with the family's typed channels (onclick, class,
style, type — and aria-label, whose single lane is the ariaLabel prop
/ IconButton's text) omitted, `...rest` spreads FIRST in the markup
with component-owned stamps expanding after (the replacement
semantics of the stamped-attribute law). IconButton forwards its rest
lane into the wrapped PressButton. Consequences: semantic stamps
(`data-jx-canvas-reset`, `data-jx-adlg-cancel`, valued variant
stamps) ride the lane onto the root with NO wrapper element; a
consumer's `data-testid`/`title`/`aria-*` land unmodified; the
wrapper-span hack for unstampeable buttons is retired with this law.

#### Scenario: a stamp rides the lane onto the control root

- GIVEN an IconButton carrying `data-jx-canvas-reset` and a title
- THEN both attributes land on the rendered button root itself — no
  intermediate wrapper element exists, and a delegated
  querySelector/click reaches the real control in one hop

#### Scenario: rest never fights the family channels

- GIVEN a PressButton receiving `aria-label="x"` through spread props
- THEN it does not compile — the lane is omitted from the rest
  contract and the ariaLabel prop owns the channel (a rest-borne
  undefined can never strip the family's value)

# ADDED Requirement: the anchored-alert form (alert-dialog's flesh ruling)

The anchored popover surface (alert-dialog: popover="manual" +
CSS Anchor Positioning, rising beside its trigger) is NOT a banded
panel: its Title rides the content flow, its action strip escapes the
body padding through negative margins — a popover-sized surface rents
no banded ruler, and full dialect adoption would be dogma, not law
(floating-flesh-sweep ruling, 2026-09-09). What the form SHALL shed
is RECIPE DUPLICATION: AlertDialogAction and AlertDialogCancel render
PressButton (explicit variant / density sm) — the family's one ladder,
one press law, one forced-colors set — with the family's single local
addition preserved (the fill rung ships the jx-pair-destructive
injection as the confirmTone default; consumer pair injections still
win by layer order). The AlertDialogActions strip carries the
action-band zone (ghost + flat): the Cancel renders quiet with zero
paint props, an explicit Action variant always wins.

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

# ADDED Requirement: sheet speaks the full card dialect

Sheet (the showModal side drawer) is a full-panel floating surface
and SHALL carry its interior in the Card dialect like Dialog: ONE
sticker host (data-jx-card, card.css imported — the load-bearing
lesson) with the head/body/foot bands, edge-riding Separators
replacing the hand-drawn border-b/border-t, the × riding the
end-action seat as a zone-inheriting IconButton (the hand-painted
border button retired), the body as CardBody under the RHYTHM escape
hatch (the drawer's 18px beat and popover ink override the cell's
utilities with the consumer's `!` — the class-append law), and the
optional foot band under the action-band zone over a LOOSE flex row
(joined clusters are ButtonGroup's law; loose rows stay utilities).
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
