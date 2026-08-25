# design-tokens — delta

## ADDED Requirements

> The derived-scale law lives in css-architecture (added by the
> archived kernel change); these requirements ADD the token-sheet
> obligations that belong to THIS capability: the ctl alias interface
> and the exception registry as token-sheet laws.

### Requirement: the control alias interface (--jx-d-ctl-*)

The canonical theme sheet (and its byte-identical mirror) SHALL carry
the exact `--jx-d-ctl-*` alias equations as adopted — aliases ONLY,
never a second scale: every ctl value derives from existing ruler
aliases by written calc. Browser assertions SHALL compare USED values
(raw custom-property text is serialization-fragile: the
`oklch(60% .2 25)` vs `oklch(0.6 0.2 25)` lesson).

#### Scenario: a control alias drifts from its derivation

- GIVEN the kernel gate resolving every ctl alias at four scopes
- WHEN an alias stops matching its ruler derivation
- THEN the gate fails naming the alias and scope

### Requirement: the kernel ruler-role allowlist

Control-footprint geometry SHALL consume `--jx-d-ctl-*`. The
CLOSED kernel-only allowlist of established ruler roles —
`--jx-d-secondary-text/line`, `--jx-d-media-icon/image/gutter`,
`--jx-d-inline-inset/gap`, `--jx-d-stack-gap`, `--jx-d-row-min`,
`--jx-d-hit-min`, `--jx-d-text/line/leading`, and
`--jx-d-icon-optical-inline` — remains legal for the semantic roles
it already owns (secondary voice, media boxes, balance/inset,
optical correction); the verifier enforces this closed set and
rejects any OTHER `--jx-d-*` consumption in family css as a
second-scale attempt.

#### Scenario: a family reaches past the allowlist

- GIVEN family css consuming an unlisted --jx-d-* token directly
- WHEN the registry static phase scans it
- THEN it fails — the closed allowlist is the rule, not a suggestion

### Requirement: the exception registry as a token-sheet law

Density-owned declarations SHALL be scanned are scanned by selector/property
ownership via the adoption registry; registered structural
exceptions (selector + property + reason) are explicit and
reviewable. Unregistered literals fail with the owning family row.

#### Scenario: an unregistered literal appears

- GIVEN the registry static phase
- WHEN a density-owned property carries a px/rem literal with no
  registered exception
- THEN the failure names the owning family row, selector, and value
