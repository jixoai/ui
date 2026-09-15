# Gate-1 r4 verdict — visual-g1 (Codex, gpt-5.6-terra xhigh), 2026-09-15

**NEEDS-WORK 7.9/10** (worked 6m 00s; 5.8 → 6.8 → 7.3 → 7.9). All three
r3 blockers confirmed closed against the real sources and package
scripts. ONE blocker remained:

1. **The connector sampling protocol forked** — r4's antialias-proof
   protocol (line-core + normal ground patch) landed in design/tasks but
   the delta scenario still said "midpoint of the longest edge": two
   acceptance protocols for one object. Fix condition: one verbatim
   protocol in all three places, fixing the connector selection scope,
   sampling points, normal offset, and patch aggregation.

Non-blocking: W4's "no mode branch of any name" is not statically
provable by a source scan — make it a pinned Props/API snapshot + the
scan + the behavioral fixture.

## r5 response (this commit)

- B1: ONE canonical connector protocol now verbatim-identical in delta /
  design / tasks (verified programmatically — normalized-whitespace
  containment check prints IDENTICAL ×3): "every edge connector in the
  fixture, at three equally spaced centerline points (1/4, 1/2, 3/4),
  the stroke's line-core pixel versus a ground patch 2px past the stroke
  edge along the normal, the patch the mean of its 3×3 device-pixel
  window" — selection scope (every edge connector in the fixture),
  sampling points (1/4, 1/2, 3/4 centerline), normal offset (2px past
  the stroke edge), patch aggregation (3×3 device-pixel mean) all
  fixed; nodes keep their own "2px past the node border" rule.
- Non-blocking adopted: the W4 acceptance is now statically assertable —
  (1) pinned Props snapshot (no `scrollbar` field, no mode-shaped field
  of any name, no `ScrollbarVariant` export), (2) source scan for
  `'native'`/`'overlay'` consumer sites, (3) two-directional fixture
  planting a live `scrollbar` prop proving both detectors redden —
  delta scenario + task 4.2 updated to the same three-part shape.
