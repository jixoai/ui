# The timeline stroke-alignment law — butt caps, one weight with the dot's border

## Why

The Owner's r5 walkthrough note on the timeline spine: `stroke-linecap`
should be `butt` (more harmonious with the site's beveled-diamond
grammar), and the stroke width MUST match the dot's border-width —
the spine lines were painting 2px + round caps against 1px dot
borders, reading heavier than the nodes they connect.

## What Changes

THE STROKE-ALIGNMENT LAW: the structural spine strokes (plain base,
dashed segments, progress) paint `stroke-linecap: butt` and
`stroke-width: var(--jx-tl-stroke-w)` — ONE token (1px) that ALSO
drives the default dot's `border-width`, so the pair can never drift
apart (a consumer sets the token once, dots and lines follow
together). Two standing exemptions, both identity laws: the BEAM
preset keeps its glow grammar (4px, round caps, blur — a traveling
light, not a connector), and the RING dot keeps its 2px border
(variant identity outranks the shared token, as it outranks the
state paints).

- timeline.css: the token on `[data-jx-timeline]`, consumed by the
  dot border + the three structural strokes; caps butt; exemption
  comments at the beam block.
- Joint-lap interplay verified: with butt caps the lapped tip ends
  EXACTLY at the endpoint — the archived r4 probe (join-continuity
  raster + 12-cell matrix + ring arm) reruns 8/8 green under the new
  caps (the flush join stays continuous: the stroke's and the band's
  partial coverages sum in the shared boundary pixel; ring joins
  keep a full 1px of stroke inside their 2px band).
- New probe: computed-style alignment assertions (structural
  stroke-width === dot border-width === token, butt caps on base/
  seg/progress, beam 4px/round, ring 2px) ×3 stable.
- Docs: the timeline TokenTable gains the `--jx-tl-stroke-w` row;
  registry.json's timeline docs field carries the law.
- MINIFY round (small directive): no Codex gate; receipts local
  (batteries, build:registry, mirror, strict, both probes).
