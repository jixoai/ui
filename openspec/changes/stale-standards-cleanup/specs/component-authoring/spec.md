# component-authoring — delta

## MODIFIED Requirements

### Requirement: the density contract (token + context injection)

Density is a TWO-CHANNEL contract. The Svelte channel resolves policy:
a getter-backed `DensityContext` (one Symbol key, one stable object)
with the law `explicit ?? inherited ?? 'default'`; providers are
opt-in (no forced app root). The CSS channel injects values: providers
and density-aware components stamp `data-density`, and ONLY the
canonical theme sheet AND its byte-identical generated mirror carry
density scopes, mapping the derived `--jx-density-*` vocabulary to
inherited `--jx-*` aliases — never component css.
Components consume the aliases and MUST NOT branch on density values
in their own css; `data-size` authority is removed (no alias). Every
scale value is DERIVED from the ruler (`--jx-unit`, text base)
by written equations; the computed four-row table is gate-asserted.
The balance invariant holds at every density: row inline-start inset
== the media/content seam (one ruler mark); media boxes derive from
the line (icon = one line, image = two — the seam never folds into
the object); optical correction is ONE bounded token (±U/2).

#### Scenario: a group changes density after mount

- GIVEN an ItemGroup with density-adopting rows
- WHEN the group's size prop changes
- THEN rows re-resolve and re-stamp data-density reactively, and the
  CSS scope cascade repaints them in the same frame

#### Scenario: a component tries to branch on density

- GIVEN list-item component css after the migration
- WHEN the source guard scans it
- THEN no [data-density]/[data-size] selector exists and every
  density-owned declaration references --jx-* (or a family var
  derived from one) — literals fail with file/selector/property/value
