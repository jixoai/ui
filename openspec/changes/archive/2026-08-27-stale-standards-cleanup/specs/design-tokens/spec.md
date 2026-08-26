# design-tokens — delta

## MODIFIED Requirements

### Requirement: the control alias interface (--jx-d-ctl-*)

(the header keeps its historical name; the interface it SHALLs is
the post-rename `--jx-*` spelling below)

The canonical theme sheet (and its byte-identical mirror) SHALL carry
the exact `--jx-*` alias equations as adopted — aliases ONLY, never a
second scale: every control value derives from existing ruler aliases
by written calc (the c31fe6a rename retired the `--jx-d-*` /
`--jx-d-ctl-*` spellings; component supplements live under their
component's own `--jx-<component>-*` names, e.g. `--jx-toggle-track`).
Browser assertions SHALL compare USED values (raw custom-property
text is serialization-fragile: the `oklch(60% .2 25)` vs
`oklch(0.6 0.2 25)` lesson).

#### Scenario: a control alias drifts from its derivation

- GIVEN the kernel gate resolving every alias at four scopes
- WHEN an alias stops matching its ruler derivation
- THEN the gate fails naming the alias and scope

### Requirement: the kernel ruler-role allowlist

(the header keeps its historical name; the closed allowlist below
is the post-rename `--jx-*` vocabulary)

Control-footprint geometry SHALL consume the inherited `--jx-*`
aliases. The CLOSED kernel-only allowlist of established ruler roles
— `--jx-text-secondary`/`--jx-line-secondary`, `--jx-icon`,
`--jx-image`, `--jx-media-gutter`, `--jx-inset`, `--jx-gap`,
`--jx-stack`, `--jx-row-min`, `--jx-hit`, `--jx-text`, `--jx-line`,
`--jx-leading`, `--jx-icon-optical` — remains legal for the semantic
roles it already owns (secondary voice, media boxes, balance/inset,
optical correction); the verifier enforces this closed set and
rejects any OTHER ad-hoc density-token consumption in family css as
a second-scale attempt.

#### Scenario: a family reaches past the allowlist

- GIVEN family css consuming an unlisted density token directly
- WHEN the registry static phase scans it
- THEN it fails — the closed allowlist is the rule, not a suggestion
