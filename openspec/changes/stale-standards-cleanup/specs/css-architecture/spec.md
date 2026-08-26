# css-architecture — delta

## MODIFIED Requirements

### Requirement: the derived-scale law

Geometry and type tokens SHALL be derived from the ruler by written
equations in the canonical theme sheet (calc chains from `--jx-unit`
and the text base), never hand-picked per component. Density scopes
([data-density]) exist ONLY in that sheet and its byte-identical
generated mirror; components consume the inherited `--jx-*` aliases.
The four-density computed table (text/line/gaps/inset/row-min/
hit-min/media) is asserted by a real-browser gate; a greppable source
guard enforces the same law statically. (The remainder of the
requirement's text is unchanged; this delta only corrects the ruler
token name — `--jx-ruler-unit` was renamed `--jx-unit` by c31fe6a.)
