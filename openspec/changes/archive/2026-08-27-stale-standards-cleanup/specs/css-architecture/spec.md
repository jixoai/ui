# css-architecture — delta

## MODIFIED Requirements

### Requirement: the derived-scale law (尺规思维)

Geometry and type tokens SHALL be derived from the ruler by written
equations in the canonical theme sheet (calc chains from `--jx-unit`
and the text base), never hand-picked per component. Density scopes
([data-density]) exist ONLY in that sheet and its byte-identical
generated mirror; components consume the inherited `--jx-*` aliases.
The four-density computed table (text/line/gaps/inset/row-min/
hit-min/media) is asserted by a real-browser gate; a greppable source
guard enforces the same law statically. (The ruler token was renamed
`--jx-ruler-unit` → `--jx-unit` by c31fe6a; this delta corrects the
spec's spelling — the law itself is unchanged.)

#### Scenario: the scale computes

- GIVEN the token sheet at a 16px root
- WHEN a real browser resolves each [data-density] scope
- THEN every value in the four-row table computes exactly (e.g.
  mediaImage == 2 × line, seam excluded; hitMin >= 44px)

#### Scenario: a hand-picked dimension sneaks in

- GIVEN component css with padding: 0.625rem
- WHEN the source guard scans density-owned declarations
- THEN it fails and names the file, selector, property, and value
