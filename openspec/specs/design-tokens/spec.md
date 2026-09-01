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

### Requirement: the elevation grammar (Owner ruling, 2026-09-01)

Every component's elevation SHALL sit on the five tier tokens —
float / raise / lift / engrave / well — derived from the `--shadow-*`
rungs in the theme sheet (float/raise/lift reuse the md/xs/2xs rungs;
engrave and well add dedicated tokens). Tier semantics are physical,
not decorative:

- float — projects from the TOP layer down onto the content
  (float-button; large offset);
- raise — a pressable lifting within the CURRENT layer
  (press-button/chip via `.jx-press`; xs→sm on press);
- lift — static visual focus one step above the page (card family;
  2xs);
- engrave — carved INTO the surface (kbd keycaps; inset);
- well — a fillable container depressed into the page (input-class
  controls; inset at rest, hover changes INTENSITY not tier, focus
  changes border + caret only — never the shadow tier).

Two tracks for "floating" surfaces are legal and named: interactive
surfaces (float-button) ride the tier tokens; panel/dialog families
ride the floating-surface law's `.jx-surface` subtractive ink layer
(css-architecture). The dark theme pins geometry rung-for-rung with
the light theme — only the ink inverts (a shadow's size/offset must
NOT change between themes; the one documented compensation is the
`--shadow-sm` second-layer alpha, where dark needs more ink to stay
perceptible). Marker-style insets (indicator rims, hairline accents
painted via box-shadow as a drawing tool) are NOT elevation and are
exempt from the tier grammar.

#### Scenario: a control's hover changes its shadow tier

- GIVEN a well-tier control (input-like, fillable)
- WHEN it is hovered, then focused
- THEN hover swaps `--shadow-well` → `--shadow-well-hover` (intensity
  only) and focus returns the shadow to rest while border + caret
  change — a tier jump on hover/focus is a violation

#### Scenario: a component hand-writes an elevation shadow

- GIVEN any family css in lib/ui
- WHEN a box-shadow literal (px offsets + color) appears instead of a
  tier token (outside a documented exemption such as the print paper
  metaphor)
- THEN review rejects it and the sweep moves it onto the grammar

### Requirement: the subtraction ink law (Owner ruling, 2026-09-01)

Masks, shades, veils and darkening overlays SHALL NOT add ink: no
dark `background`, no black `box-shadow` over content. They SHALL
subtract color instead — `backdrop-filter` (e.g. `contrast(0.5)`)
pulls the backdrop toward middle tones: near-white darkens, near-black
lightens, so light/dark themes are mutual inverses with ZERO color
tokens. Geometry and range are expressed by mask gradients
(backdrop-filter only paints where the element draws); progressive
falloff uses the progressive-blur ladder; blend-mode `difference` is
the sanctioned technique for fade-style separators. State-carrying
lines (timeline done segments, step connectors) and signal layers
(toast pulse/sweep) may paint additive ink because subtraction cannot
express state — that boundary is part of this law. The known limit:
an additive `background` cutout reads wrong on non-flat backdrops;
mask-based cutouts are the long-term direction.

#### Scenario: an edge veil darkens the content under it

- GIVEN a scroll-edge veil (tabs scrollEffect shadow)
- WHEN it paints over content near the run's edge
- THEN it desaturates via backdrop contrast — a black gradient or
  darkening background under it violates the law

#### Scenario: a separator needs to read on any backdrop

- GIVEN the separator's default ink
- WHEN it renders on light, dark, or mid-tone surfaces
- THEN the contrast ghost self-adapts (no per-theme color token); a
  border-color literal as separator ink is retired practice
