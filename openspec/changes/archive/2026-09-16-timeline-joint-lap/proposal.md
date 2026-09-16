# The timeline joint-lap law — the connector meets the dot as ink-under-ink, never a floating butt

## Why

The Owner's r4 walkthrough of the horizontal families: the line and
the dots "没有完全对接好". Root cause (lab-proven): the site's dots
paint as BEVELED DIAMONDS (`corner-shape: bevel` + the round
variant's `border-radius: 9999px` — the site's signature shape, and
the default square variant bevels the same way), so the connector's
edge-to-edge butt lands on the diamond's 45° VERTEX — a knife-edge
point where antialiasing leaves light seams on both slopes (raster:
sub-pixel background slivers at the join rows; reads as a floating
line at normal zoom).

## What Changes

THE JOINT-LAP LAW: the connector laps 1px INTO the node's edge band —
`shave = nodeRadius − 1` on both ends of every gap subpath, and the
dot MASK's circles shrink to `r = nodeRadius − 1` in step (the
dash-driven strokes carry the same lap). The lap hides UNDER the
dot's own ink (the filled face on completed dots, the 1px border band
on hollow ones — the dot layer paints over the spine svg), so the
join is structural ink-under-ink; the never-cross law holds (raster:
hollow interiors stay clean, join rows show zero background gaps).

- component-authoring: the spine-drawn requirement's connector
  scenario MODIFIED (edge-to-edge + the joint-lap sentence).
- Tests: the segment/runPath expectations move by the lap; stops/
  flowPath/pathLength unchanged (center space). Degenerate spacing
  (dist < 2·(R−1)) collapses the gap to its midpoint — never a
  reversed subpath (unit-tested).
- Probe (r2, review round 2 of this change): the DOM law (mask r =
  R−1, every endpoint LAP inside the owning node's edge, euclidean —
  direction/axis/RTL-agnostic) swept across ALL 12 geometry-matrix
  cells (axis × direction × RTL) + a live ring-variant host; the
  raster arm proves join ink CONTINUITY through the vertex band
  (joins sampled only between consecutive dots — end windows carry
  no connector by design) + hollow-interior cleanliness on the
  inscribed diamond core (completed fills skipped — their ink is the
  point). The r1 raster arm sampled stage-offset rows over a host
  screenshot — VACUOUS passes; r2 additionally settle-gates captures
  against the page's data-reveal entrances (measure → screenshot →
  measure, drift ≤ 0.5px) and occlusion-gates each scan region
  (the canvas dock's aside overlaps the horizontal host's top rows;
  foreign-chromed regions are excluded and the binding aggregate
  requires real samples — no arm passes vacuously).
