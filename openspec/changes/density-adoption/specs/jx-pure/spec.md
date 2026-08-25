# jx-pure — delta

## MODIFIED Requirements

### Requirement: Part A — class vocabulary

The Tier-2 vocabulary SHALL be the v2 set: `.jx-field`, `.jx-label`,
`.jx-error` (kept) and the breaking renames `.jx-control` (was
.jx-input), `.jx-control-shell` (was .jx-field-shell),
`.jx-control-lane` (was .jx-input-lane), `.jx-slider` (was .jx-range),
`.jx-color-shell` (was .jx-color-field), `.jx-color-swatch` (was
.jx-color), `.jx-color-expand` (was .jx-color-stretch). No deprecated
aliases SHALL exist; range size classes are removed. Tier-1 consumers
migrate in their family packets; the sheet stays zero-JS and
canonical/mirror byte-identical.

#### Scenario: a consumer writes an old class name

- GIVEN the rebuilt sheet
- WHEN markup uses .jx-input or .jx-range
- THEN no rule matches — old names are gone by contract, and the
  parity test asserts the v2-only vocabulary

### Requirement: Part B — element defaults

Control typography, padding, rows, hit lanes, slider, and color shell
SHALL derive from `--jx-d-ctl-*` aliases; `.jx-pure` scopes
`font-size: var(--jx-d-text)` and `line-height: var(--jx-d-leading)`
while `body` remains untouched. Structural and degradation exceptions
(display headings, color-map dimensions, icon alpha geometry,
borders/outlines) are named registry exceptions, not density-owned.

#### Scenario: the static face follows density

- GIVEN a .jx-pure root with data-density="sm"
- THEN controls compute sm-row/hit/pad/text from the aliases with no
  JS, and used-value probes confirm the derived numbers
