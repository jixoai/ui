# design-studio-shell — presence-liveness delta

## ADDED Requirements

### Requirement: selection IS attention

A human's component selection SHALL report a canvas attention (the
protocol componentId, stamped as the native `id` at ingest) so remote
studios render the selecting player's ghost ring on the same component.
The attention priority law SHALL be: a held panel field focus outranks
the canvas selection; both outrank nothing. The shell's selection state
and the store reference driving the report SHALL be reactive — a dead
effect at mount (read-before-assign of a plain variable) is a defect,
not a degradation.

#### Scenario: pick in a kit frame, remote ring within budget

- GIVEN two studios on one canvas and a stamped component with id a4
  inside a kit iframe
- WHEN alice clicks it
- THEN bob's canvas renders alice's canvas-focus ring on a4 within the
  selection-sync budget (≤200ms, matrix min-of-3), badge naming a4

#### Scenario: panel focus holds over the selection

- GIVEN alice holds a property field focused while a canvas selection
  exists
- WHEN the selection changes
- THEN the reported attention stays the panel field (no clobber); WHEN
  the field blurs, the held selection reclaims the attention lane

### Requirement: cursors survive kit iframes — the frame-surface relay

A kit iframe SHALL relay its own pointer moves (rAF-coalesced, frame
document coordinates) to the canvas host, which forwards them upstream
as cursor reports on surface `frame:<id>`; a receiving surface resolves
the owning iframe and adds its offset. The coordinate-space law: frame
reports are pre-transform CSS pixels, iframe rects are post-transform —
they meet only through the measured scale (rect.width ÷ the frame
document's viewport width), applied to both cursor placement and
attention-ring resolution through kit frames.

#### Scenario: pointer crosses into a kit iframe

- GIVEN two studios on one canvas with a rendered kit iframe
- WHEN alice's pointer moves from canvas ground into and within the kit
- THEN bob's cursor follows continuously (no freeze at the boundary)
  and lands within pixel tolerance of the pointer's page position
  (≤3px, lens-adjusted), the report carrying surface frame:<id> with
  canvas still naming the shared canvas

### Requirement: the presence transport never throws at its callers

The studio's presence socket wrapper SHALL buffer sends issued while
the WebSocket is CONNECTING (flushing them, in order, on open) and drop
sends on a closing/dead socket silently — presence reports are
ephemeral and the reconnect's welcome rebuilds the world. A throwing
send at mount once destroyed the shell's selection→attention effect
forever; that class of failure SHALL be regression-tested.

#### Scenario: report before the handshake completes

- GIVEN a fresh studio whose store just connected (socket CONNECTING)
- WHEN the selection effect reports attention before the handshake
- THEN the frame is buffered, flushed on open, and no exception
  escapes the wrapper to the effect

## MODIFIED Requirements

### Requirement: panel text edits commit in real time

Property-panel text edits SHALL admit through the collab op lane on an
input-event debounce (~300ms) — Enter/blur is no longer the only
commit path; remote mirrors see the value within the input-sync budget
(≤600ms) without any submit action.

#### Scenario: typing mirrors without Enter

- GIVEN two studios with the same component's text field open
- WHEN bob types one character and presses nothing
- THEN alice's field mirrors the value within 600ms

### Requirement: the remote caret speaks the selection range

Panel attention SHALL carry the remote selection `{start, end}` (equal
ends = collapsed caret) reported on selectionchange (with fallbacks)
at caret-report cadence (≤32ms throttle); the receiving panel renders
a 2px caret bar at the collapsed offset and a selection highlight when
start ≠ end, measured by the zero-width-span mirror method (MIRROR
props fully copied, the marker escaped in source — never a literal).
Caret/selection elements SHALL NOT live inside an input/textarea's
content model.

#### Scenario: caret moves and ranges highlight

- GIVEN bob focuses a text field and alice watches the same panel
- WHEN bob moves the caret, then drag-selects a range
- THEN alice's caret bar follows within 100ms, and a selection
  highlight renders for the range with the attention frame carrying
  the {start, end} vocabulary

### Requirement: ribbons speak the Owner's border-image grammar

Nav canvas rows and tree component rows SHALL carry the multiplayer
ribbon on the row element itself, in one unified model that includes
the local player's own selection: single player = `border-inline-start:
2px solid <player color>` with no border-image (today's look); multiple
players = the placeholder border plus `border-image:
linear-gradient(to bottom, …) 0 0 0 1 / 0 0 0 2px` — VERTICAL equal
segments, the local player's color always first, others in joining
order. A horizontal rainbow is a defect.

#### Scenario: one then two players on the nav row

- GIVEN alice's studio with bob on the same canvas
- WHEN only bob's cursor is on the canvas
- THEN the nav row shows a 2px solid edge in bob's color; WHEN a third
  player joins the canvas, the row becomes the Owner border-image
  gradient (slice `0 0 0 1`, width `0 0 0 2px`) with alice's own color
  in the first segment

#### Scenario: the selected tree row joins the ribbon model

- GIVEN alice has a component selected and a remote AI attends the
  same component
- THEN the tree row carries the ribbon attribute on the row itself,
  single when only alice's selection lights it, multi with alice's
  color first once the AI joins

### Requirement: presence streams at frame cadence

Cursor reporting SHALL ride rAF coalescing end to end (pointer capture,
store throttle, gateway merge window ≤16ms, forward, render) inside the
end-to-end cursor budget (≤100ms, measured in-page, quiet-gated,
min-of-3 on shared machines; the idle two-context baseline is ≈40ms).

#### Scenario: the latency probe under the matrix's own load

- GIVEN the dual-instance matrix with its quiet gates satisfied
- WHEN a probe cursor frame is sent
- THEN the receiving overlay's transform lands within 100ms on the
  best of three samples
