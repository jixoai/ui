# design-tokens — delta

## MODIFIED Requirements

### Requirement: the derived-scale law (尺规思维)

The canonical theme (and its byte-identical mirror) SHALL carry the
exact `--jx-d-ctl-*` alias equations as adopted; aliases are NOT a
second scale — every one derives from existing ruler aliases. Density
scopes exist only there. Browser assertions SHALL compare USED values
(raw custom-property text is serialization-fragile).

#### Scenario: a control alias drifts from its derivation

- GIVEN the kernel gate resolving every ctl alias at four scopes
- WHEN an alias stops matching its ruler derivation
- THEN the gate fails naming the alias and scope

### Requirement: the exception registry law

Density-owned declarations SHALL be scanned by selector/property
ownership via the adoption registry; registered structural exceptions
(selector + property + reason) are explicit and reviewable.

#### Scenario: an unregistered literal appears

- GIVEN the registry static phase
- WHEN a density-owned property carries a px/rem literal with no
  registered exception
- THEN the failure names the owning family row, selector, and value
