# component-authoring delta — the chart family

## ADDED Requirements

### Requirement: charts render from data with zero dependencies

The chart family (`registry/files/ui/chart/`) SHALL render entirely
from props data using text glyphs and inline SVG — no chart/animation
runtime dependency. It is a family of DETERMINISTIC DISPLAY
PRIMITIVES, not a chart library: tooltips, interaction, automatic
axes/layout/collision engines, streaming, and generated data tables
are explicitly OUT of scope. Each part SHALL freeze its semantics for
degenerate data (empty, all-negative, constant, NaN/non-finite,
zero-total) — every part's render is a pure function of props, and
those cases are unit-tested. Every chart SHALL carry `role="img"`
with a REQUIRED accessible name enforced by the type contract (label
prop without a default), plus an opt-in visually-hidden data table
fallback.

#### Scenario: a sparkline in a stat row

- GIVEN `<ChartSparkline data={[3,5,2,8,7]} label="deploys this week" />`
- WHEN it renders
- THEN the glyphs are proportional to the data, the accessible name is
  "deploys this week", and the DOM contains no runtime library import

#### Scenario: degenerate data is frozen, not invented

- GIVEN `data={[NaN, 5]}` on any chart part
- WHEN it renders
- THEN the output is the documented frozen behavior for non-finite
  input (same input, same output, every time)

#### Scenario: reduced motion

- GIVEN `prefers-reduced-motion: reduce`
- WHEN any chart mounts
- THEN it paints its final state immediately (no entrance animation)
