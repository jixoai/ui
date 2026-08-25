# component-authoring — delta

## ADDED Requirements

### Requirement: the density contract (token + context injection)

Density is a TWO-CHANNEL contract. The Svelte channel resolves policy:
a getter-backed `DensityContext` (one Symbol key, one stable object)
with the law `explicit ?? inherited ?? 'default'`; providers are
opt-in (no forced app root). The CSS channel injects values: providers
and density-aware components stamp `data-density`, and ONLY the
canonical theme sheet AND its byte-identical generated mirror carry
density scopes, mapping the derived `--jx-density-*` vocabulary to
inherited `--jx-d-*` aliases — never component css.
Components consume the aliases and MUST NOT branch on density values
in their own css; `data-size` authority is removed (no alias). Every
scale value is DERIVED from the ruler (`--jx-ruler-unit`, text base)
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
  density-owned declaration references --jx-d-* (or a family var
  derived from one) — literals fail with file/selector/property/value

### Requirement: the shared ruler (grouped list geometry)

Grouped rows SHALL align through an EXPLICIT shared ruler, not per-row
collapse: ItemGroup declares `ruler` ('content-end' default |
'media-content-end'); under @supports(subgrid) the list owns the
column tracks and rows rent them through TWO subgrid levels (the li
wrapper AND the row root — subgrid stops at the immediate parent).
Missing slots RETAIN shared tracks (alignment is deliberate); header,
footer, and divider rows span the ruler. The narrow law changes
PLACEMENT ONLY (row areas), never the shared tracks — mixed
wrap=auto/never rows coexist in one list. Standalone rows (no ruler)
keep the exhaustive :has() presence matrix; the no-subgrid path falls
back to it. ItemField's end lane SHALL render wrap="never"; the lane's
min-block-size is the INHERITED density hit-min (never a literal
44px); truncation is an explicit opt-in stamp.

#### Scenario: media rows align across the group

- GIVEN a media-content-end group with and without media rows
- WHEN geometry is read in a real browser
- THEN every row's content starts at the same x-coordinate and end
  lanes right-align — a no-media row keeps the shared media track

#### Scenario: the known field defect stays dead

- GIVEN the one-form-name checkbox group fixture inside a narrow
  column
- WHEN rendered at or below the 30rem container
- THEN the control stays BESIDE its label (overlapping y-ranges) — it
  is never relocated below the content lane
