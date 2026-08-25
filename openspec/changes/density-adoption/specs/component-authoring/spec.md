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

## MODIFIED Requirements (2nd wave)

### Requirement: the Tier system

- **Tier-0** — `jx-pure`: element defaults for BARE native elements
  (see the jx-pure spec; one stylesheet, zero JS; density-scoped via
  `data-density` with no JS).
- **Tier-1** — registered components: Svelte files that wrap/enhance a
  native element (e.g. `input.svelte` wraps every native input type).
- **Tier-2** — the v2 class vocabulary (kept `.jx-field/.jx-label/
  .jx-error`; renamed `.jx-control/.jx-control-shell/.jx-control-lane/
  .jx-slider/.jx-color-shell/.jx-color-swatch/.jx-color-expand` + icon
  custom properties), defined in jx-pure.css Part A, consumed by
  Tier-1 components — a cross-file contract that MUST NOT drift
  between the sheets and the components. The v2 rename is complete:
  old names have no aliases.

#### Scenario: a component needs a form lane

- GIVEN `input.svelte` renders the text-like shell
- WHEN it applies the Tier-2 `.jx-control-lane` class
- THEN the paint comes from the jx-pure sheet (single definition), not
  from a component-local duplicate

### Requirement: props discipline

Runes (`$props`, `$bindable`, `$state`); `class` merges into the root
element; `...rest` (HTMLAttributes) flows through verbatim so
title/data-*/aria-* land on the DOM. `value` is `$bindable`: bound =
controlled, absent = purely uncontrolled. Policy props are typed
unions; `density` is THE policy prop for scale (visual `size` is
identity-only, Avatar-style); `controlSize`, `ItemSize`, and
`data-size` are removed without aliases.

#### Scenario: consumer passes arbitrary attributes

- GIVEN `<Foo data-testid="x" title="y" />`
- THEN both attributes land on the root native element unmodified

#### Scenario: density resolves with fallback

- GIVEN a Table with density omitted inside an lg provider
- THEN it stamps lg; the same Table with no parent stamps sm — the
  local fallback never shadows inherited context

### Requirement: styling posture

Tier-1 components are utility-first: paint is composed as Tailwind v4
utilities in markup against the jixoai token-sheet `@theme` mappings
(installed via the canonical entry setup; see the registry spec).
WHEN a Tier-1 component's paint is utility-authored, its affected
public class slots SHALL merge through `cn()` for class-string
hygiene — `cn()` is NOT a cascade mechanism; override behavior comes
from the layer law. CSS that utilities cannot express SHALL live in
the component folder as `<item>.css` (`@layer components` +
`:where()`, `jx-`-prefixed). Density-owned declarations consume
`--jx-d-ctl-*` (control footprints) or the CLOSED kernel ruler-role
allowlist (design-tokens spec) — never literal dimensions. The v2
Tier-2 vocabulary (jx-pure Part A) and the element-default laws
(Parts A–D) MUST be consumed only — never copied, moved, redefined,
or re-wrapped; Tier-2 classes MUST NOT route through `cn()` as a
redefinition entry.

#### Scenario: consumer restyles an installed component

- GIVEN a utility-authored component with paint in `@layer components`
- WHEN the consumer passes any token utility on `class`
- THEN the consumer's utility wins by the layer/specificity law

#### Scenario: component needs non-utility css

- WHEN paint requires selectors utilities cannot express
- THEN it lands in `<item>.css` in the folder and still loses to
  consumer utilities (layer law)

#### Scenario: Tier-2 consume-only

- GIVEN a component using `.jx-control-lane` (jx-pure Part A)
- WHEN the component is refactored
- THEN the class is consumed as-is; no component-side copy, re-wrap, or
  cascade-altering redefinition exists, and it never routes through
  `cn()`
