# component-authoring — delta

## MODIFIED Requirements

### Requirement: the Tier system

- **Tier-0** — `jx-pure`: element defaults for BARE native elements
  (see the jx-pure spec; one stylesheet, zero JS).
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

Components SHALL use runes (`$props`, `$bindable`, `$state`); `class` merges into the root
element; `...rest` (HTMLAttributes) flows through verbatim so
title/data-*/aria-* land on the DOM. `value` is `$bindable`: bound =
controlled, absent = purely uncontrolled (FormData/form.reset
untouched). Policy props are typed unions; `density` is THE policy
prop for scale (visual `size` is identity-only, Avatar-style);
`controlSize`, `ItemSize`, and `data-size` are removed without
aliases.

#### Scenario: consumer passes arbitrary attributes

- GIVEN `<Foo data-testid="x" title="y" />`
- THEN both attributes land on the root native element unmodified

#### Scenario: density resolves with fallback

- GIVEN a Table with density omitted inside an lg provider
- THEN it stamps lg; the same Table with no parent stamps sm — the
  local fallback never shadows inherited context


### Requirement: styling posture

Tier-1 components are migrating to utility-first: paint is composed as
Tailwind v4 utilities in markup against the jixoai token-sheet
`@theme` mappings — which resolve for consumers ONLY under the
canonical entry setup (tailwind entry → jixoai theme import; see the
registry spec), declared as the documented install prerequisite of
utility-authored items. WHEN a Tier-1 component is migrated to
utility-authored paint, its affected public class slots SHALL merge
through `cn()` for class-string hygiene (deduping conflicting
utilities inside one string) — `cn()` is NOT a cascade mechanism;
override behavior comes from the layer law (css-architecture spec).
Components not yet migrated (P0–P2 transitional state) keep their
existing class-merge behavior and carry NO cn() obligation. CSS that
utilities cannot express SHALL live in the component folder as
`<item>.css` (`@layer components` + `:where()`, `jx-`-prefixed). The v2
Tier-2 vocabulary (jx-pure Part A) and the element-default laws
(Parts A–D) MUST be consumed only — never copied, moved, redefined,
or re-wrapped; Tier-2 classes MUST NOT route through `cn()` as a
redefinition entry. Density-owned declarations consume
`--jx-d-ctl-*` for control footprints, or the NAMED kernel
ruler-role allowlist (see the design-tokens spec) for their
established semantic purposes — never literal dimensions. Scoped-style migration MUST
explicitly re-express selector boundaries (`:global()` child
selectors, pseudo-elements, `@supports`, media queries) rather than
pattern-copying.

#### Scenario: consumer restyles an installed component

- GIVEN a utility-authored component with paint in `@layer components`
- WHEN the consumer passes any token utility on `class`
- THEN the consumer's utility wins by the layer/specificity law — the
  pre-refactor silent-loss defect (scoped-style specificity inversion)
  is gone; this scenario name carries that history
- AND unmigrated components, while any remain, keep legacy behavior
  with no override guarantee (the migration's transitional state)

#### Scenario: consumer restyles a migrated component

- GIVEN a utility-authored component with paint in `@layer components`
- WHEN the consumer passes any token utility on `class`
- THEN the consumer's utility wins by the layer/specificity law — the
  pre-refactor silent-loss defect is gone

#### Scenario: unmigrated component (transitional)

- GIVEN a Tier-1 component still on scoped `<style>` (pre-P3)
- THEN it carries no cn() obligation and its legacy string-concat
  class merge stands until its migration lands

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


### Requirement: the density contract (token + context injection)

Density is a TWO-CHANNEL contract. The Svelte channel resolves policy:
a getter-backed `DensityContext` (one Symbol key, one stable object)
with the law `explicit ?? inherited ?? local fallback` (the fallback never shadows inherited context — parent-lg + Table → lg, no-parent Table → sm); providers are
opt-in (no forced app root). The CSS channel injects values: providers
and density-aware components stamp `data-density`, and ONLY the
canonical theme sheet AND its byte-identical generated mirror carry
density scopes, mapping the derived `--jx-density-*` vocabulary to
inherited `--jx-d-*` aliases — never component css.
Components consume the aliases and MUST NOT branch on density values
in their own css; `controlSize`, `ItemSize`, and `data-size` are removed (no aliases);
`density` is the sole policy prop — visual `size` is identity-only.
Every
scale value is DERIVED from the ruler (`--jx-ruler-unit`, text base)
by written equations; the computed four-row table is gate-asserted.
The balance invariant holds at every density: row inline-start inset
== the media/content seam (one ruler mark); media boxes derive from
the line (icon = one line, image = two — the seam never folds into
the object); optical correction is ONE bounded token (±U/2).

#### Scenario: a group changes density after mount

- GIVEN an ItemGroup with density-adopting rows
- WHEN the group's density prop changes
- THEN rows re-resolve and re-stamp data-density reactively, and the
  CSS scope cascade repaints them in the same frame

#### Scenario: a component tries to branch on density

- GIVEN family css after the migration
- WHEN the registry static phase scans it
- THEN no [data-density]/[data-size] selector exists in family css;
  control footprints reference --jx-d-ctl-* and semantic roles
  reference the NAMED kernel allowlist (design-tokens spec) — any
  other --jx-d-* use or literal fails with family/selector/property/
  value


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
#### Scenario: the optical correction is consumed

- GIVEN a solid media glyph with --jx-d-icon-optical-inline set
- WHEN the ruler probe reads the glyph transform
- THEN translateX(Q) with Q clamped to ±U/2 applies — the token is
  consumed, not merely declared

#### Scenario: the grouped media posture is measurable

- GIVEN a media-content-end group at standard vs layout=media
- WHEN probed at xs/default/lg
- THEN the registered deltas (media track from --jx-d-media-image,
  block-start alignment, stack gap) are observable


### Requirement: the Item family system (list-item)

The Item family is a deep module with one policy seam: `ItemGroup`
provides a typed context policy; `Item` resolves it and stamps the
result as data attributes; CSS paints stamps only. Group DOM SHALL be
native: `<div>` (or `<section aria-labelledby>` when labeled) framing
a `<ul data-slot="item-list">` whose direct row children are `<li>`
wrapping each row root; the group context identity SHALL be created
once with reactive policy fields so every Item re-resolves when its
own props or a relevant group field changes (SSR pins only the
initial stamps). `data-dividers` SHALL be stamped only on the inner
`<ul>` (it owns row adjacency); the frame carries mode/inset/density/
layout. The trailing lane is ONE slot — `ItemEnd` — whose children
are `ItemAfter` (non-interactive metadata), `ItemActions` (controls),
and `ItemChevron` (decorative `aria-hidden` leaf; NO inheritance
anywhere). Form rows are served by `ItemField` (generated label/
control/description/error IDs, typed `control` snippet) plus thin
adapters over the EXISTING controls — adapters MUST NOT reimplement
control semantics, keyboard behavior, or form participation; their
reserved props SHALL be sealed by compile-time `Omit` sets (`id`,
`aria-labelledby`, `aria-describedby` centralized; each control's
duplicate label/error/labelSide APIs reserved) with NO `any` or cast
bypass. `ItemSeparator` is deleted; `ItemDivider` is the childless
decorative explicit boundary, structurally exclusive with the
automatic divider rule (one source per edge). Component-owned
`data-*`/roles/`aria-*` SHALL be spread after consumer rest-attrs so
stamps replace rather than merge.

#### Scenario: standalone row vs grouped row

- GIVEN an `Item` with default `variant="auto"` outside any group
- WHEN it renders
- THEN it stamps `data-item-chrome="surface"` and carries its own
  frame/fill/shadow
- GIVEN the same Item inside an `ItemGroup`
- THEN it stamps `data-item-chrome="none"` and the group owns the
  single surface
- GIVEN an Item with explicit `variant="outline"` inside a group
- THEN the explicit paint wins over the group policy (escape hatch)

#### Scenario: policy changes after mount

- GIVEN a grouped Item rendered under a group with `mode="default"`
- WHEN the group's `mode`/`size`/`layout`/`dividers` prop changes
- THEN the Item's stamped resolution updates in the same render
  (resolution is a pure function of current props, never a mount-time
  snapshot)
- GIVEN a nested ItemGroup inside an outer ItemGroup
- THEN inner rows resolve against the inner policy only (shadowing)

#### Scenario: divider resolution and single source

- GIVEN groups in `default`, `muted`, and `plain` modes
- THEN dividers resolve auto-on for default (omitted prop → `auto`),
  FORCED none for muted (even when `dividers="auto"` is supplied),
  and none for plain when omitted
- GIVEN `<ItemGroup mode="plain">` versus
  `<ItemGroup mode="plain" dividers="auto">` (raw prop optional, no
  language-level default — omission stays distinguishable)
- THEN the first resolves `data-dividers="none"` and the second
  `"auto"`, in SSR output and after any rerender
- GIVEN an explicit `ItemDivider` between two rows in any mode
- THEN the automatic adjacency rule skips that edge and only the
  explicit full-strength line renders (one source per edge)

#### Scenario: native list DOM and labels

- GIVEN an unlabeled ItemGroup
- THEN the DOM is a neutral frame div containing `<ul>` with `<li>`
  row wrappers (anchors inside `li` keep link semantics)
- GIVEN `label="…"` on an ItemGroup
- THEN the frame is `<section aria-labelledby>` with the visible
  label outside the inner list

#### Scenario: settings row via adapter (labelMode for)

- GIVEN `<ItemToggle label="…" bind:checked />`
- THEN the row label is `<label id={labelId} for={controlId}>`, the
  native toggle input carries `id={controlId}` and an
  `aria-describedby` chaining description then error, NO
  `aria-labelledby` (native association is the name source), and
  clicking the row label activates the control with NO row-level
  click handlers

#### Scenario: settings row with a non-labelable control (labelMode text)

- GIVEN an `ItemField` with `labelMode="text"` and a custom control
  consuming the snippet context
- THEN the label renders as `<span id={labelId}>` and the control
  carries `aria-labelledby={labelId}` plus the same describedby chain
- GIVEN an `error` string in either mode
- THEN the control receives `aria-invalid="true"`

#### Scenario: link row purity

- GIVEN an `Item` with `href`
- THEN interactive descendants belong outside the anchor root (docs
  show the non-link row pattern for actions) and the root never
  receives synthetic `tabindex`, `role="button"`, or click handlers
- GIVEN `selected` on any Item
- THEN it is visual only — no `aria-selected` is emitted


> density-adoption: the family's policy prop is renamed `density`
> (visual `size` never returns as policy); `controlSize` is removed.

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
