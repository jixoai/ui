# css-architecture — spec delta

## ADDED Requirements

### Requirement: icon geometry provenance (icon upstream, 2026-08-29)

Every SVG glyph in the theme sheets — law-slot fallbacks, the
`--jx-icon-*` vocabulary definitions, and the ink variants — SHALL
derive its geometry from the `lucide` package's IconNode data at
generation time (css-laws `src/icon-uris.ts`). Hand-written path
data in law sources or the hand sheet regions is FORBIDDEN, with
ZERO exemptions. The ink pair SHALL map to lucide `check` (valid)
and lucide `circle-alert` (invalid) at sw 2.5.

#### Scenario: a law source hand-writes a data URI

- GIVEN any css-laws law source
- WHEN a `url("data:image/svg` literal appears instead of an
  `iconUri(...)` call
- THEN code review rejects it and the byte-stability tests flag the
  delta against the lucide-derived expectation

#### Scenario: the vocabulary block drifts from lucide

- GIVEN the generated `jx-icon-vocab` slot in jx-pure.css
- WHEN a `--jx-icon-*` definition's URI is edited by hand
- THEN the css-laws `--check` gate FAILS (slot not fresh from the
  lucide-backed law sources)
