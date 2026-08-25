# css-architecture — delta

## ADDED Requirements

### Requirement: the derived-scale law (尺规思维)

Geometry and type tokens SHALL be derived from the ruler by written
equations in the canonical theme sheet (calc chains from
--jx-ruler-unit and the text base), never hand-picked per component.
Density scopes ([data-density]) exist ONLY in that sheet and its byte-identical generated mirror; components
consume the inherited --jx-d-* aliases. The four-density computed
table (text/line/gaps/inset/row-min/hit-min/media) is asserted by a
real-browser gate; a greppable source guard enforces the
no-literal-branch law (density-owned declarations must reference the
aliases; named structural-paint exceptions aside). The balance law is
an equation (inset == seam), not a convention.

#### Scenario: the scale computes

- GIVEN the token sheet at a 16px root
- WHEN a real browser resolves each [data-density] scope
- THEN every value in the four-row table computes exactly (e.g.
  mediaImage == 2 × line, seam excluded; hitMin >= 44px)

#### Scenario: a hand-picked dimension sneaks in

- GIVEN component css with padding: 0.625rem
- WHEN the source guard scans density-owned declarations
- THEN it fails and names the file, selector, property, and value

## MODIFIED Requirements

### Requirement: stamped-attribute painting (presence-matrix families)

Component families whose geometry or chrome depends on slot presence
or group policy SHALL resolve that state in the component and stamp
it as data attributes; family css paints stamps only and MUST NOT
infer from arbitrary descendant context. Presence-driven GRID
templates: STANDALONE rows (and the no-subgrid fallback) keep the
exhaustive self-contained combinations — every media/end/header/
footer combo declares BOTH columns AND areas (no implicit tracks).
GROUPED rows under @supports(subgrid) SHALL instead rent an EXPLICIT
shared ruler (three or five tracks with explicit gap tracks,
column-gap 0) through two subgrid levels, with one fixed area
template per ruler per wrap mode; missing slots retain shared tracks
(deliberate alignment) and the narrow law changes areas ONLY — never
the shared tracks. Group-owned paint targets the group frame, the
inner list, and direct-child row wrappers only.

#### Scenario: the topology split holds in one tree

- GIVEN the migrated list-item css
- THEN grouped-subgrid rows carry no per-row presence matrix while
  standalone rows keep all 16 wide + 8 narrow self-contained
  combinations, and neither path ever mints an implicit track

#### Scenario: the narrow law never rewrites the ruler

- GIVEN a media-content-end group at or below the 30rem container
  WHEN one row wraps auto and its sibling keeps wrap="never"
- THEN the auto row's end occupies a full-width area row while the
  never row's end stays on the shared fifth track — the ul's tracks
  are unchanged

#### Scenario: chrome is inspectable without a computed style

- GIVEN a grouped Item resolved as chrome-less
- THEN `data-item-chrome` on the row root reads `"none"` in the SSR
  HTML, and the browser paints exactly that resolution

#### Scenario: no implicit tracks at any presence combination

- GIVEN a browser fixture rendering all sixteen wide media × end ×
  header × footer combinations (standalone/fallback path)
- WHEN each row's computed grid is read
- THEN both `grid-template-columns` and `grid-template-areas` match
  the authored template exactly — zero implicit tracks, no ghost
  columns; grouped-subgrid rows assert three/five explicit tracks

#### Scenario: consumer overrides still win

- GIVEN family rules written as `:where()` inside `@layer components`
- WHEN a consumer applies a utility class to a row or group
- THEN the utility overrides the family paint per the layer law
