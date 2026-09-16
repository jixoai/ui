# design-studio-shell — indicator laws, stage loading, restore

## ADDED Requirements

### Requirement: one ring pair per canvas, governed by three recitable laws

The canvas document SHALL be the single host of the hover/selection
ring pair. Every document (canvas or frame) SHALL only report
`{kind, source, box|null, pick|refresh}`; placement decisions SHALL
live in exactly one adjudication function governed by three laws:

1. hover with a box: the last event wins;
2. selected with a box: a user pick always wins and names its source
   document the owner; a refresh only counts from the current owner;
3. clearing (no box): only the current owner may clear.

No per-document placement state, idempotence guards, or asymmetric
null checks SHALL gate the placement path.

#### Scenario: re-picking a container after a frame component pick

- GIVEN a frame-owned selection (press-button inside a frame)
- WHEN the user clicks the container's caption — a pick from the
  canvas document, including the case where the canvas document held
  that same target earlier
- THEN the ring moves to the container and the panel follows (no
  idempotence short-circuit may leave the ring behind)

#### Scenario: a stale frame cannot steal the ring

- GIVEN a canvas-owned selection
- WHEN a frame document re-reports its own stale target (a refresh,
  with or without a box)
- THEN the report is ignored

#### Scenario: only the owner clears

- GIVEN a frame-owned selection
- WHEN the canvas document's own Escape fires
- THEN the ring stays and the panel selection stays (the frame — the
  owner — is the only one that may clear it, from inside)

### Requirement: rings align every frame while anything is marked

While a document has a live target (or the host hosts a frame-owned
ring), a requestAnimationFrame loop SHALL re-read the target's rect
every frame and re-report or re-host ONLY on movement — an idle frame
sends no message and writes no style. When nothing is marked the loop
SHALL not be scheduled. A target that left the DOM SHALL unmark
itself; a host whose owning frame left the canvas SHALL retire the
ring it owned. The host re-hosts frame-owned rings from its own
iframe measurement against the kept in-frame box — no cross-document
query, no down channel.

#### Scenario: a selected component changes size or place

- GIVEN a frame-owned selection ring
- WHEN the frame button grows (a prop edit lands, content reflows) OR
  the host layout shifts the figure (margin, sibling churn)
- THEN the ring follows on the next frame — regardless of which
  document's layout caused the move

### Requirement: the stage distinguishes loading from no-data

The stage SHALL render a blueprint-styled skeleton (pointer-
transparent, aria-hidden) whenever a canvas is mounted but its
metrics have not arrived, labeled by two beats: before the iframe
`load` event ("loading") and after it, before the first metrics
("shell ready · compiling"). The first metrics remove the skeleton.
The navigator SHALL show a loading line until the manifest's first
pull completes (ok OR failed); an empty list SHALL only render as a
no-data state after a completed pull.

#### Scenario: a first visit to a cold prototype

- GIVEN a freshly opened studio on a not-yet-compiled prototype
- THEN the stage shows the skeleton with the loading label (never a
  blank white iframe and never a "no prototypes" state)

### Requirement: a restored selection rides the canvas it was picked on

The persisted selection record SHALL carry the canvas name it was
picked on. On reload the record SHALL wait until the studio's canvas
lands; a canvas-name mismatch SHALL restore nothing (usageIndex is
file-scoped — the same number on another canvas names a different
usage). A matching record SHALL re-drive the DOWN seam so the ring
rebuilds in step with the panel.

#### Scenario: reload lands on a different canvas than the pick

- GIVEN a selection picked on canvas X, persisted
- WHEN the studio reloads and lands on the preferred canvas Y (X ≠ Y)
- THEN nothing is restored — no panel selection, no ring, and no
  retry loop
