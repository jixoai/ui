# css-architecture — delta

## MODIFIED Requirements

### Requirement: the derived-scale law (尺规思维)

Geometry and type tokens SHALL be derived from the ruler by written
equations in the canonical theme sheet (calc chains from
--jx-ruler-unit and the text base), never hand-picked per component.
The `--jx-d-ctl-*` property list is part of the density-owned
vocabulary — aliases only, never a second scale; family-local literal
branches and unregistered literals are forbidden; private family
properties are one-line aliases to `--jx-d-ctl-*` only. Density
scopes exist ONLY in that sheet and its byte-identical mirror.
Browser assertions SHALL compare USED values.

#### Scenario: the scale computes

- GIVEN the token sheet at a 16px root
- WHEN a real browser resolves each [data-density] scope
- THEN every value in the four-row table (and each ctl alias)
  computes exactly, compared as USED values

#### Scenario: a hand-picked dimension sneaks in

- GIVEN component css with padding: 0.625rem
- WHEN the registry static phase scans density-owned declarations
- THEN it fails and names the family row, selector, property, value

#### Scenario: a family invents a second scale

- GIVEN family css declaring an independent size custom property
- WHEN the registry static phase scans it
- THEN it fails unless the property is a one-line alias to a ctl
  alias

### Requirement: stamped-attribute painting (presence-matrix families)

Component families whose geometry or chrome depends on slot presence
or group policy SHALL resolve that state in the component and stamp
it as data attributes; family css paints stamps only and MUST NOT
infer from arbitrary descendant context. Presence-driven GRID
templates: STANDALONE rows (and the no-subgrid fallback) keep the
exhaustive self-contained combinations; GROUPED rows under
@supports(subgrid) rent an EXPLICIT shared ruler through two subgrid
levels with one fixed area template per ruler per wrap mode; the
narrow law changes areas ONLY. The effective grouped `layout="media"`
deltas (media track from --jx-d-media-image, line-derived lane
posture) and their probes are normative; inert vocabulary is removed
rather than kept.

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
- THEN data-item-chrome on the row root reads "none" in the SSR HTML,
  and the browser paints exactly that resolution

#### Scenario: no implicit tracks at any presence combination

- GIVEN a browser fixture rendering all sixteen wide combinations
  (standalone/fallback path)
- WHEN each row's computed grid is read
- THEN both grid-template-columns and grid-template-areas match the
  authored template exactly — zero implicit tracks

#### Scenario: consumer overrides still win

- GIVEN family rules as :where() inside @layer components
- WHEN a consumer applies a utility class
- THEN the utility overrides family paint per the layer law

#### Scenario: grouped media posture is observable

- GIVEN a media-content-end group at standard vs layout=media
- WHEN probed at xs/default/lg
- THEN the registered deltas (track width, block-start alignment,
  stack gap) are observable — inert vocabulary is removed instead
