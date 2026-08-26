# design-tokens — the jixoai token-sheet law (living spec)

## Purpose

The jixoai token-sheet law: OKLCH one-hue colors with dark drift, structure laws (hard shadows, radius/bevel, mono-first, terminal surfaces), semantic palette, and degradation laws.

> Capability owner: `registry/files/theme/jixoai.css` (registry item
> `jixoai-theme`, mirrored at `apps/www/src/lib/jixoai.css` with
> `--brand-hue: 330`). One number — the hue — changes per project.

## Current contract (state: 2026-08-24)

## Requirements

### Requirement: OKLCH one-hue law

All colors are OKLCH with a single brand hue per project
(`--brand-hue`); dark mode drifts the hue -4°. Light/dark pairs ship in
`:root` / `.dark` blocks with color-scheme; `.jx-light` excludes
subtrees. Semantic tokens (success / warning / info / error) exist with
`-foreground` pairs; validation remaps valid→success, invalid→error
(destructive stays the monochrome inversion pair).

#### Scenario: rebranding a consumer site

- WHEN a consumer sets one number (`--brand-hue`)
- THEN the whole palette (primary, hover flows, chart harmony) follows

### Requirement: structure laws

Hard offset shadows (no blur), radius 0 with `corner-shape: bevel`
upgrade only (rounded-full reserved for status-dot-class pills),
mono-first typography (`--font-mono` body, `--font-nav` nav), terminal
surfaces (`--terminal*` tokens). Tailwind v4 `@theme` mappings live in
the registry sheet; the site's `app.css` only supplements what the sheet
leaves open (e.g. killing the default rounded scale) plus site-only
surfaces.

#### Scenario: a new surface needs the design law

- WHEN it consumes the token custom properties instead of literal values
- THEN dark mode, hue rebranding and the shadow/radius laws hold with
  zero per-surface work

### Requirement: degradation laws

`prefers-reduced-motion: reduce` neutralizes reveal/motion surfaces;
forced-colors reverts to native paint (carried by jx-pure's Part C for
the element face; site transitions neutralized site-side).

#### Scenario: reduced-motion user

- WHEN the OS requests reduced motion
- THEN entrances render in their final state with transitions removed

> The derived-scale law lives in css-architecture (added by the
> archived kernel change); these requirements ADD the token-sheet
> obligations that belong to THIS capability: the ctl alias interface
> and the exception registry as token-sheet laws.

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

### Requirement: the exception registry as a token-sheet law

Density-owned declarations SHALL be scanned by selector/property
ownership via the adoption registry; registered structural
exceptions (selector + property + reason) are explicit and
reviewable. Unregistered literals fail with the owning family row.

#### Scenario: an unregistered literal appears

- GIVEN the registry static phase
- WHEN a density-owned property carries a px/rem literal with no
  registered exception
- THEN the failure names the owning family row, selector, and value
