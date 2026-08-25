# component-authoring — delta

## MODIFIED Requirements

### Requirement: the density contract (token + context injection)

Density is a TWO-CHANNEL contract. The Svelte channel resolves policy:
a getter-backed `DensityContext` (one Symbol key, one stable object)
with the law `explicit ?? inherited ?? local fallback`; the fallback
NEVER shadows inherited context. The CSS channel injects values:
providers and density-aware components stamp `data-density`, and ONLY
the canonical theme sheet and its byte-identical mirror carry density
scopes mapping the derived `--jx-density-*` vocabulary (now including
the `--jx-d-ctl-*` control aliases) to inherited `--jx-d-*` aliases.
`density` SHALL be the sole policy prop — no policy `size` alias
(visual `size` is identity-only, Avatar-style); `controlSize`,
`ItemSize`, and `data-size` are removed without aliases. Provider
roots (ItemGroup, menu roots, Command roots, Table with local sm
fallback) and top-layer panel stamping are normative.

#### Scenario: Table default does not shadow an explicit parent

- GIVEN an lg provider wrapping a Table with density omitted
- WHEN the table resolves
- THEN rows stamp lg (inherited wins over the sm local fallback)

#### Scenario: a group changes density after mount

- GIVEN an ItemGroup with density-adopting rows
- WHEN the group's density prop changes
- THEN rows re-resolve and re-stamp data-density reactively, and the
  CSS scope cascade repaints them in the same frame

#### Scenario: a component tries to branch on density

- GIVEN component css after the migration
- WHEN the registry static phase scans it
- THEN no [data-density]/[data-size] selector exists in family css
  and every density-owned declaration references a --jx-d-ctl-* (or
  derived) alias — literals fail with family/selector/property/value

### Requirement: the hit-lane contract

Every interactive control SHALL expose a PHYSICAL activation
rectangle at `min-block-size: var(--jx-d-ctl-hit)`; visual glyph
dimensions (ctl-icon and friends) are separate declarations. Probes
measure the clickable rectangle, not an ancestor min-height.

#### Scenario: a checkbox lane is clicked at the corner

- GIVEN a checkbox wrapper lane at xs density
- WHEN the probe clicks the wrapper's physical corner
- THEN the input toggles — the lane, not just the 16px square, is the
  target
