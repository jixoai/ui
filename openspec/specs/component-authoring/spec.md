# component-authoring — the Svelte 5 component contracts (living spec)

## Purpose

The Svelte 5 component contracts: the Tier system, native-element-first law, props discipline, and the utility-first styling posture with its documented cascade exceptions.

> Capability owner: `registry/files/ui/**` (mirrored at
> `apps/www/src/lib/ui/**`). Components are Svelte 5 runes-first,
> native-element-first, and follow the Tier system below.

## Current contract (state: 2026-09-03, adversarial-review rulings + the r14 tuning casebook + 2026-09-03-context-defaults-economy)

## Requirements

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

### Requirement: the hit-lane contract

Every interactive control SHALL expose a PHYSICAL activation
rectangle at `min-block-size: var(--jx-hit)` (the canonical alias —
the previous text's `--jx-d-ctl-hit` predated the Tailwind-aligned
token rename and is retired); visual glyph dimensions (icon and
friends) are separate declarations. Probes measure the clickable
rectangle on the actual interactive root, not an ancestor min-height
and not a pseudo-element expansion. Paint variants never alter the
lane: a Chip is control-scale (root ≥ `--jx-hit`) with badge-nature
paint, not a badge-sized control.

#### Scenario: a checkbox lane is clicked at the corner

- GIVEN a checkbox wrapper lane at xs density
- WHEN the probe clicks the wrapper's physical corner
- THEN the input toggles — the lane, not just the 16px square, is the
  target

#### Scenario: a compact-looking chip is probed

- GIVEN a Chip rendering at default density
- WHEN the probe measures the root element's activation rectangle
- THEN the root's min-block-size resolves to `var(--jx-hit)` — the
  tinted micro-label paint does not shrink the physical lane

### Requirement: the slot-vs-padding law (badge dialect, Owner ruling, 2026-09-01)

When a component renders an optional inline-start/inline-end slot
lane (icon, glyph, adornment), the lane SHALL REPLACE its side's
`padding-inline` — never stack on top of it: the side's padding
collapses to the half-inset lane width (`has-[[data-icon=inline-start]]:
pl-[calc(var(--jx-inset)/2)]` and the mirror), so slot-present and
slot-absent rhythms stay one system. The icon-ONLY exception applies
to components whose label is OPTIONAL: when no children render,
symmetric padding is KEPT so the lone glyph centers — guarded by
children presence, never by slot presence (badge and tabs-trigger
carry the guard; children-required families like chip and
toggle-group-item take the unconditional lanes). Adopters today:
badge, chip, toggle-group-item, tabs-trigger, input's edge zones
(the shell dialect: square hit children zero their side's padding —
same law, box-shaped). New components with slot lanes adopt the same
rule; a lane that double-pads (full inset + lane) is a rhythm
violation.

#### Scenario: a chip renders a leading icon

- GIVEN a chip with and without a slot-start icon, side by side
- WHEN the icon-to-text gap and the no-icon text inset are measured
- THEN the icon sits in the lane where the inset was (half-inset gap,
  no accumulated double space)

#### Scenario: an optional-label component renders icon-only

- GIVEN a badge (optional children) with only a slot-start icon
- WHEN its symmetric padding is measured
- THEN the glyph centers — the children guard kept the full inset;
  an unconditional lane would have pinned it off-center

#### Scenario: a component adds an icon slot without the lane law

- GIVEN review of a new family with slot-start/slot-end snippets
- WHEN its css carries unconditional padding-inline with the lane
  layered over it
- THEN the review flags the missing `has-[[data-icon=…]]` collapse —
  the lane replaces the padding, it does not ride on it

### Requirement: native-element-first, W3C-first

The platform element IS the component where possible (accordion =
`<details>/<summary>`; kbd = `<kbd>`; table = native table with
container-query driven modes). Semantics, keyboard, SSR come from the
platform; JS only adds what the platform cannot do.

#### Scenario: choosing the implementation element

- WHEN a new component is proposed
- THEN the first question is which native element/structure already
  carries the semantics, and hydration cost is zero unless unavoidable

### Requirement: props discipline

Runes (`$props`, `$bindable`, `$state`); `class` merges into the root
element; `...rest` (HTMLAttributes) flows through verbatim so
title/data-*/aria-* land on the DOM. `value` is `$bindable`: bound =
controlled, absent = purely uncontrolled (FormData/form.reset
untouched).

#### Scenario: consumer passes arbitrary attributes

- GIVEN `<Foo data-testid="x" title="y" />`
- THEN both attributes land on the root native element unmodified

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
`<item>.css` (`@layer components` + `:where()`, `jx-`-prefixed). The
frozen Tier-2 vocabulary (jx-pure Part A) and the element-default
laws (Parts A–D) MUST be consumed only — never copied, moved,
redefined, or re-wrapped; Tier-2 classes MUST NOT route through
`cn()` as a redefinition entry. Scoped-style migration MUST
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

- GIVEN a component using `.jx-input-lane` (jx-pure Part A)
- WHEN the component is refactored
- THEN the class is consumed as-is; no component-side copy, re-wrap, or
  cascade-altering redefinition exists, and it never routes through
  `cn()`

### Requirement: semantic hooks are data-jx-* attributes, never css-less classes

Component markup SHALL carry every css-less semantic anchor as a
`data-jx-*` attribute: static hooks as boolean attributes
(`data-jx-foo`), variant families as ONE valued attribute
(`data-jx-foo={variant}`). Every `jx-*` CLASS remaining in markup MUST
be css-defined somewhere (state machines, kernels, Tier-2 frozen
vocabulary, residue statics — the cascade law's territory); a repo-wide
scan (`scripts/verify-hook-law.mjs`) MUST fail on any css-less jx-*
token and on any data-jx-* name shadowing a css-defined selector.
Reference sites (tests, docs, scripts, scenes) query the attribute form
(`[data-jx-foo]`, `[data-jx-foo="v"]`).

#### Scenario: a component needs a semantic anchor

- WHEN tests/docs/JS must target an element that carries no authored
  css selector
- THEN the markup carries `data-jx-foo` (boolean) or `data-jx-foo={v}`
  (variant) and the class attribute holds only utilities and
  css-defined selector names

#### Scenario: the placement law is auditable

- WHEN `verify-hook-law.mjs` runs
- THEN it fails on any css-less jx-* token repo-wide and on any
  data-jx-*/css-defined name collision

#### Scenario: consumer queries a hook

- GIVEN the documented breaking markup-contract change
- WHEN a consumer targets a hook
- THEN they query `[data-jx-kbd]`-style attributes (the `.jx-kbd`
  class era is gone for css-less hooks)

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
`<ul>` (it owns row adjacency); the frame carries mode/inset/size/
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

### Requirement: composition-first API surface

Repeated or nested UI structure SHALL be authored in the consumer's
tree as family parts (Svelte 5 snippets/children), never described
through props. A registered component MUST NOT own markup that is
only reachable via data-array props, config trees, keyed render-props,
or string-to-glyph mappings. Legal props are: value/state (bindable),
behavior (`activation`, `placement`), presentation enums (`variant`,
`size`, `orientation`), and value/behavior-domain payloads (option
sets, tour targets, code strings, virtualizer rows) — the payload
category MUST provide snippet escapes for per-item content. The
diagnostic for gray zones: a prop that changes WHAT renders (which
rows/sections exist) must become a child component; a prop that
changes HOW it renders (paint, layout mode) is legal.

Families ship at ecosystem part granularity: the shadcn/shadcn-vue/
Dice UI anatomy for the equivalent component is the floor, not the
ceiling. Barrels follow the tabs precedent — `export { default }`
for the canonical main when one exists, sub-parts as named defaults,
`export *` for module types; NO Root aliases.

#### Scenario: a new component needs repeated items

- WHEN a component renders a list/sections/steps of caller-defined
  content
- THEN the registry ships the family parts and the consumer authors
  each item in their tree; no `items`/`steps`/`sections` prop exists

#### Scenario: ordinal state stays explicit

- GIVEN a composed family with an active/progress ordinal
- THEN items carry REQUIRED explicit ordinal/value props (`step`) and
  state derives from comparing them to the bindable root state —
  registration or instantiation order is never load-bearing

#### Scenario: the keyed render-prop trap

- GIVEN a component tempted to expose `body?: Snippet<[item, index]>`
  as the only content path over a data array
- THEN that design is rejected: iteration ownership moves to the
  consumer and the snippet becomes plain children

#### Scenario: value-domain payload with content escape

- GIVEN an option-domain control (select options, tour targets) whose
  items ARE the value
- THEN the data prop is legal only if rich per-item content escapes
  through snippets; a fully closed row renderer is a violation

#### Scenario: computed structure ships logic, not markup

- GIVEN structure computed from state (pagination windows)
- THEN the computation lands as an exported pure helper and the
  consumer composes the parts through it; the component does not
  compute-and-render rows behind closed markup

### Requirement: family context contract

State-sharing context in a family SHALL carry state and behavior
only — never membership order. Ordinal state compares explicit
per-item values; keyboard walks and filtering are DOM-delegated and
scoped to the nearest container (`closest()`), so nested families
never leak into each other's walks. Where items carry metadata the
DOM cannot express (match text), items SELF-match against context
state instead of registering into a central ordered registry. What
must register (imperative show/hide handles) registers at component
initialization — synchronously, SSR-executed, under a family-defined
stable DERIVED key (panel families: `${itemId}-panel`, never the
registrant's own `$props.id()`), unregistered `onDestroy`; `onMount`
is never the only registration path. Consequences that MUST hold: SSR output is semantically
complete before hydration; keyed `{#each}` reorders, conditional
inserts, deletions and restores never corrupt state or walk order.
ONE declared exception: DOM-derived AUTO modes (a toc deriving links
from rendered headings) render their landmark shell server-side and
complete on hydration — the data does not exist at render time; the
exception applies to auto modes only, never to composed trees.

#### Scenario: SSR renders the family complete

- GIVEN a composed family rendered server-side
- THEN the first paint carries every item with correct state paint
  and no hydration-time re-registration flash

#### Scenario: keyed reorder cannot corrupt state

- GIVEN a Steps/Command/Anchor family whose items live in a keyed
  `{#each}` that reorders at runtime
- THEN item state and walk order follow the NEW tree order with no
  stale ordinals and no ghost registration

#### Scenario: nested families do not leak walks

- GIVEN a MenubarPanel containing a nested dropdown-menu
- WHEN the panel walker walks `[role=menuitem]`
- THEN only entries whose `closest('[role=menu]')` is this panel
  participate — the nested menu keeps its own walk

### Requirement: the child snippet contract

Interactive parts (triggers, links, markers) MAY offer element
substitution, typed with the part's ONE concrete element kind — no
`any`, no generic, no element unions:

```ts
child?: Snippet<[{ props: HTMLAnchorAttributes & { class: string } }]>;   // link part
child?: Snippet<[{ props: HTMLButtonAttributes & { class: string } }]>;   // button part
```

The part hands the consumer a props object: `class` carries the
component's classes cn()-merged (the consumer appends their own via
`class={cn(props.class, 'own')}` after spreading, winning by the
layer law — the same contract as plain `class`), handlers and
aria/data attributes flow verbatim, and a consumer who REPLACES a
handler or aria attribute owns the consequences (Svelte spread
order). The replacement element MUST preserve the part's
role/semantics. Where a part's element kind can switch, child() is
offered only on the interactive form. Layout parts MUST NOT offer
child(). The parts offering it are listed per family in the change's
design.md.

#### Scenario: consumer replaces the element

- GIVEN a link part with a `child({ props })` snippet rendering an
  consumer `<a>` with a router href and an added click handler
- THEN the anchor carries the part's aria wiring and merged classes
  and the consumer's handler is the one that fires (replacement, by
  the spread-order law)

### Requirement: the density contract (token + context injection)

Density is a TWO-CHANNEL contract. The Svelte channel resolves policy:
a getter-backed `DensityContext` (one Symbol key, one stable object)
with the law `explicit ?? inherited ?? own` (the manufactured-'default'
fallback retires into the family's Defaults slot argument or
no-opinion undefined); providers are opt-in (no forced app root). The
CSS channel injects values: providers and density-aware components
stamp `data-density`, and ONLY the canonical theme sheet AND its
byte-identical generated mirror carry density scopes, mapping the
derived `--jx-density-*` vocabulary to inherited `--jx-*` aliases —
never component css.
Components consume the aliases and MUST NOT branch on density values
in their own css; `data-size` authority is removed (no alias). Every
scale value is DERIVED from the ruler (`--jx-unit`, text base)
by written equations; the computed four-row table is gate-asserted.
The balance invariant holds at every density: row inline-start inset
== the media/content seam (one ruler mark); media boxes derive from
the line (icon = one line, image = two — the seam never folds into
the object); optical correction is ONE bounded token (±U/2). Inline
`resolveDensity`/`getDensityContext` calls in consumer bodies retire
in favor of `densitySlot` wiring; the helpers remain, living only in
the axis module and the gate's provider whitelist (structural
providers and kind:`provider` inherit-then-provide containers).

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

#### Scenario: a family fallback resolves through the slot

- GIVEN Table's Defaults declares `density: densitySlot('sm')`
- WHEN the table renders with no provider and no explicit prop
- THEN data-density="sm" lands; with a parent provider's opinion, the
  provider wins; with an explicit prop, the prop wins

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
dimension); truncation is an explicit opt-in stamp.

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

### Requirement: the variant grammar (prominence ladder + hue injection)

Surface paint variants SHALL come from the one ladder — `fill` /
`tonal` / `outline` / `ghost` — plus PressButton's `link` interaction
exception. Semantic color is NEVER a variant name: intent is expressed
by injecting values into the four global hue slots (`--jx-fill`,
`--jx-fill-ink`, `--jx-tonal`, `--jx-outline`; theme-owned,
inheritable). The action/status split is mandatory: destructive
ACTIONS inject `--destructive` (the fill pair), error STATUSES inject
`--error` into the tonal slot. Variant paint rides token utilities in
the markup (tw4 utility-authored law); press physics (`.jx-press`)
never change with paint. Availability is per-component (see the
frozen table in
openspec/changes/archive/2026-08-27-variant-grammar/design.md §4 —
the table itself is authoritative):
Badge fill/tonal/outline (default tonal, brand hue); InlineCode
tonal/outline (default tonal, locally neutral); Chip all four
(default tonal); PressButton fill/tonal/outline/ghost/link (default
outline); Alert outline/tonal (default outline — no fill/ghost:
banner readability). Valued `data-jx-*` hooks carry the variant
(`data-jx-badge`, `data-jx-alert`, `data-jx-press-button`,
`data-jx-chip`). The frozen table's per-component rows become the
`definePaintSlot(values, own)` calls in each family's Defaults —
the values array IS the family union's SOURCE (default ∈ values is
compile-locked; the runtime consumes no value-domain guard; the AST
gate asserts the array bidirectionally against the frozen table);
the family's exposed union derives from the slot
(`ReturnType<typeof slot>`); the previously implicit `??` chains
are the paint slot's `explicit ?? ambient(zone) ?? own` resolution.

The injection seam is TWO-LAYERED (hue-injection-utilities,
2026-08-27): the CANONICAL form for the curated semantic set is the
theme's TW4 `@utility` intent layer — `jx-hue-primary | neutral |
error | success | warning | info` (tonal slot) and
`jx-pair-destructive` (fill + fill-ink together, making the
always-inject-both law structural; there is no `jx-hue-destructive`
— the action/status split holds by construction). The
arbitrary-property class (`[--jx-tonal:var(--error)]`) remains the
escape hatch for values outside the closed set; ONE form per slot in
a class list (cross-form mixing is not dedupable). `cn()` registers
the closed set as tailwind-merge dedupe groups.

THE PHYSICS AXIS (Owner 2026-09-03), orthogonal to the paint ladder:
the ladder stays closed and paint still never touches physics, but
the axis that was implicit is now recorded.

- PressButton gains `raised?: boolean` (default `true`). The paint
  ladder is untouched; `raised` modulates ONLY the press law's poses,
  entirely through the pose-custom mechanism (`--jx-press-shadow`,
  `--jx-press-shadow-hover`, `--jx-press-shadow-active`, and the NEW
  `--jx-press-move` seam on the kernel's `:active` translate —
  `translate: var(--jx-press-move, 1px 1px)` keeps every existing
  button byte-identical).
- `raised={false}` (the FLAT texture): rest and hover carry NO
  shadow; the press pose re-points to the engrave tier (an inset —
  pressed-ness expressed as being pushed INTO the plane) and the
  press vector is nulled (`--jx-press-move: none`) — the body never
  moves, the inset alone creates the illusion of movement. The
  variant's own pose customs are stripped before the flat block is
  applied (no two same-property utilities in one class list —
  ghost's none-trio must not collide). NO rung loses its border in
  flat (Owner ruling 2026-09-04: tonal's 45% outline stays; fill /
  ghost were never visibly bordered; outline's border IS the
  variant).
- The press pose expressing pressed-ness as an inset is a sanctioned
  pose expression (the press pose IS the affordance); it is distinct
  from the well-at-rest law (input-class controls: hover changes
  intensity only, never tier). PressButton keeps the 1px border
  frame — an inset shadow is never the sole affordance (r14-12).
- `raised` is a press-law physics prop, NOT a vocabulary style prop:
  it never enters a family Defaults slot (the Defaults economy
  governs the style vocabulary; the physics lane keeps its own
  resolution below).

THE ZONE RESOLUTION (Owner 2026-09-04): the flat texture's default
is Context-scopable on the same zero-DOM boundary that scopes the
variant.

- `raised` carries NO static default. Resolution is
  `explicit ?? zone ?? true`: an explicit prop always wins, a
  Context-scoped zone default follows, the convex law is the resting
  default.
- The zone default rides its OWN context key (`PRESS_TEXTURE_KEY`,
  owned by press-button) — a physics axis key OUTSIDE the single-key
  paint law: `PAINT_ZONE_KEY` stays the ONE paint lane
  (`BUTTON_GROUP_KEY` carries layout only), and a ButtonGroup
  inherit-then-provides the paint zone (shadows it only when it
  declares a variant of its own) while physics must flow THROUGH
  joined groups untouched — a footer's grouped buttons ride flat
  exactly like its free-floating ones.
- `ButtonVariantScope` (the zero-DOM zone boundary that already
  scopes the variant) carries `raised?: boolean`,
  inherit-then-provide: a paint-only scope (variant set, raised
  absent) passes the enclosing zone's texture through and never
  un-flattens it.
- IconButton forwards `raised` verbatim (Owner 2026-09-04): the
  composition needs NO restate — the wrapped press-button reads the
  same ambient texture key in the same window, so the zone's flat
  default reaches the square (and a joined ⋯ overflow trigger) by
  construction; the explicit prop is the chrome escape hatch. The
  dialog head's × sits OUTSIDE the flat zones and keeps the convex
  law with no opt-out.
- The FOOT zones of Dialog and Card declare `raised={false}` on
  their zone scope (Owner 2026-09-04): foot buttons ride the
  engrave-tier inset press by default. Head zones, standalone
  footers, and every bare button keep the convex default — the zone
  scopes a DEFAULT, never a law.

#### Scenario: a failed status chip is authored

- WHEN a badge must read as failed
- THEN it is `<Badge variant="tonal" class="jx-hue-error">` (or the
  arbitrary equivalent) — never `tone="destructive"` and never the
  destructive ACTION hue

#### Scenario: a variant utility set is audited

- GIVEN any component's variant map after this change
- WHEN the source guard scans its markup
- THEN every variant's paint consumes the four global slots and no
  variant name encodes a semantic hue

#### Scenario: the frozen table reads through Defaults

- GIVEN the frozen availability table and a migrated family
- WHEN the family's Defaults is read
- THEN every available variant in the table is addressable through
  the paint slot's values array, the own default matches the table,
  and the array contains no variant outside its table row (link
  never reaches Badge/Chip/Alert)

#### Scenario: a flat button presses inward without moving

- WHEN a PressButton renders `raised={false}` with any framed rung
- THEN it carries the four pose customs (rest none, hover none,
  active engrave, move none), no same-property pose utility appears
  twice in its class list, and the 1px border frame remains
- WHEN it is pressed
- THEN the body does not translate and an inset (engrave-tier)
  shadow appears

#### Scenario: every existing button keeps today's physics byte-for-byte

- WHEN any button renders without `raised={false}`
- THEN the kernel resolves `--jx-press-move` to its `1px 1px`
  fallback and all three shadow poses resolve to the ladder
  defaults — nothing changes for any existing consumer

#### Scenario: a dialog footer button rides flat without any prop

- WHEN a PressButton renders inside a Dialog's footer (raw snippet
  or DialogFooter's grouped cluster) with no `raised` prop
- THEN it adopts the flat texture (the four pose customs; the
  grouped path included — the texture flows through the
  ButtonGroup)

#### Scenario: an explicit raised beats the zone

- WHEN the same button renders `raised={true}`
- THEN none of the flat block's seams ride (`--jx-press-move`
  absent, no engrave re-point) — a convex ghost keeps its own
  none-trio, which is r13 ghost law, not flat

#### Scenario: the icon-only square rides the zone's physics

- WHEN an IconButton renders inside a flat foot zone — text posture,
  iconOnly square, or joined in the group (the overflow trigger) —
  with no `raised` prop
- THEN the wrapped press-button carries the flat texture (stamp +
  four pose customs) exactly like its text-button siblings
- WHEN it renders `raised={true}`
- THEN the square stays convex — chrome escape inside a flat zone

#### Scenario: the head stays convex and a bare button is unchanged

- WHEN a PressButton renders in a Dialog/Card HEAD zone, or outside
  any zone
- THEN the convex law holds byte-identically (no pose customs, the
  kernel's `1px 1px` fallback)

### Requirement: every registered component family ships a Defaults contract

Every registered component family with public STYLE props (per the
pinned detection vocabulary) SHALL ship ONE `XxxDefaults` object (a
`*-defaults.svelte.ts` file inside the family folder, a member file
of the registry:ui item, byte-mirrored, zero kernel imports) — per
family, not per part file. The Defaults object is the family's
SINGLE declared ambient contract. Coverage means EVERY style prop
has a slot, in exactly two kinds: an axis slot (ambient-manageable)
or a literal-family slot — the literal kind has three forms:
`defineLiteralSlot(values, default)` (closed scalar domain, default
∈ values compile-locked), `defineOpenSlot<T>(own)` (an OPEN scalar
domain — free lengths/numbers with no union to enumerate; explicit
type argument, the absentSlot discipline), and `absentSlot`
(absent-meaningful, undefined-capable) — all with ambient
capability pending a future axis. Literal/paint slots SHALL
be declared as NAMED exported constants (`const kbdVariantSlot =
defineLiteralSlot(…)`) — the capability concentrates on the single
slot value — with the family's union type derived from it
(`type KbdVariant = ReturnType<typeof kbdVariantSlot>`; the values
array is the one source of truth — the meta-feeding families
(select/combobox/date-picker) keep their component-Props inline
unions, the surviving half of the drift double-lock: Props ⊆ values
is compile-checked at the resolve call site).
Every style prop SHALL be classified (axis / literal / roadmap /
never-ambient); the classification is versioned and gate-checked as
a whole.

#### Scenario: the standalone look vs the nested look

- GIVEN `pressButtonVariantSlot = definePaintSlot(['fill', 'tonal',
  'outline', 'ghost', 'link'], 'outline')` feeds `PressButtonDefaults`
- WHEN a PressButton renders standalone
- THEN its variant resolves to 'outline' (the frozen variant-grammar
  default)
- WHEN the same button renders inside a Dialog zone providing ghost
- THEN its variant resolves to 'ghost' with no per-call-site code

#### Scenario: a style prop with no axis yet

- GIVEN Dialog exposes `variant?: 'solid' | 'acrylic' | 'auto'`
- THEN its Defaults declares
  `dialogSurfaceVariantSlot = defineLiteralSlot(['solid', 'acrylic',
  'auto'], 'auto')` — auditable today, promotable to an axis slot
  when an axis opens

#### Scenario: an absent-meaningful style prop enters the contract

- GIVEN a component's optional style prop whose absence IS the
  meaningful state (native/unset rendering)
- THEN its Defaults declares `absentSlot<ThatUnion>()` (the absent
  overload — no values to infer from, the explicit type argument
  stays) — the slot's resolved value may be undefined and the
  component renders its absent-state path

#### Scenario: the contract is auditable

- GIVEN a reviewer asks which of a family's props respond to the
  environment
- THEN the answer is exactly the key set of its Defaults `slots`,
  split by slot kind
### Requirement: slots are branded factory products only

A Defaults slot SHALL be a branded callable (module-private unique
symbol) constructible ONLY by the slot factories exported from
`lib/defaults.svelte.ts` and the axis modules. Bare functions, bare
literals, and forged brand objects SHALL fail at compile time
(negative type assertions are gate material);
`defineComponentDefaults` SHALL additionally verify the brand at
runtime IN DEV ONLY (the `import.meta.env?.DEV`-gated WeakSet check
— vitest runs under vite so the guard stays test-assertable; the
type brand is the production contract); the gate's AST check SHALL
accept only registered factory calls as slot values — resolving a
NAMED slot constant to its same-file factory-call initializer.

#### Scenario: a bare function sneaks into slots

- GIVEN `defineComponentDefaults({ variant: (v) => v ?? 'fill' })`
- THEN the brand constraint rejects it at compile time and the gate
  fails it at AST level
### Requirement: explicit-wins sentinel discipline

`undefined` SHALL be the only "unspecified" sentinel (TS optional
props; `null` is not a sentinel and the slot signature rejects it).
Slot resolution SHALL be `explicit ?? ambient ?? own default` with
ambient read via getter closures (no snapshot caching). No-opinion
axes (density) SHALL keep their fleet-law semantics: the slot's
resolved value may BE undefined (no opinion → no stamp → the
ambient css scope channel keeps flowing); a family's local fallback
(e.g. Table's 'sm') SHALL be declared as the slot's own argument,
never an inline component fallback. Instance semantics props
(open/bind, callbacks, aria/data attributes, class, id) SHALL NEVER
become ambient; bindable state-typed style props (page-owned
toggles) are instance semantics and exempt.

#### Scenario: explicit beats the zone

- GIVEN a zone scope provides variant ghost
- WHEN a button inside passes `variant="fill"`
- THEN the button renders fill — the explicit prop wins

#### Scenario: a family fallback migrates into the slot

- GIVEN Table today resolves `density ?? 'sm'` inline
- WHEN its Defaults declares `density: densitySlot('sm')`
- THEN no-provider resolves 'sm', an explicit prop wins, and a
  parent provider's opinion beats 'sm'

#### Scenario: no-opinion stays unstamped

- GIVEN a density slot resolving to undefined (no explicit, no
  inherited opinion, no own)
- WHEN the component stamps `data-density={d.density}`
- THEN no data-density attribute lands and the ambient css scope
  channel flows through

### Requirement: slot factories are lazy; context reads happen at resolve time

Slot factories SHALL be pure at construction (capturing only the
own argument; module-level Defaults objects SHALL NOT touch
context). Context reads SHALL happen only when `resolve` evaluates
the slot — inside a component's initialization/`$derived` window
(Svelte's runtime carries the creating component's ctx through
derived recomputation). A read OUTSIDE that window SHALL throw the
platform's `lifecycle_outside_component` error untouched — slots
and axis modules SHALL NOT catch, normalize, or string-match
lifecycle errors, and there SHALL be no ambient-skip degradation;
axis-internal and plugin errors SHALL propagate the same way. Unit
assertions of resolution SHALL mount a host component (the
`unit-resolve-host` fixture and the per-suite host precedents).

#### Scenario: pure unit call outside a component

- GIVEN `PressButtonDefaults.resolve({})` must be asserted in a
  plain unit test
- WHEN the assertion renders the unit-resolve host (the resolve
  runs inside the host's `$derived` window)
- THEN the own-defaults projection is read from the host's echoed
  value — the window contract is the test's shape, not a runtime
  degradation

#### Scenario: an axis bug is not swallowed

- GIVEN an axis module whose ambient read throws a non-lifecycle
  error
- WHEN resolve evaluates the slot
- THEN the error propagates (no silent identity)
### Requirement: zone scopes are axis-level providers

A zone scope SHALL be a zero-DOM, getter-backed boundary keeping ONE
key per axis (never layout — the layout half stays in components
like ButtonGroup); the paint axis key
(`PAINT_ZONE_KEY`) SHALL be distinct from any family-state context
key, and it is the ONE paint lane (the single-key law, Owner
2026-09-04: pre-adoption, no release ever shipped a second paint
key to be compatible WITH); nested zone scopes stack with the
nearest winning. The shared helpers
`providePaintZone(variant: () => ZonePaintVariant | undefined)` and
`getPaintZone()` (exported from `lib/paint.svelte.ts`;
ZonePaintVariant excludes 'link' — link is PressButton's
interaction exception, never a zone value, and has no second key to
ride) SHALL write and read the one key (payload:
`{ get variant() }`, getter-backed); ButtonGroup provides paint
through the helper ONLY — BUTTON_GROUP_KEY carries layout state
(orientation/separator) and NO variant; ButtonVariantScope is the
sanctioned two-axis host: paint through the helper, and the physics
texture axis's zone default (`raised`) on its OWN key
(`PRESS_TEXTURE_KEY`, owned by press-button, outside this paint
lane). Their variant props are ZonePaintVariant (a
`<ButtonGroup variant="link">` is a compile error; link stays
reachable through PressButton's own explicit prop); ButtonGroup's
inherit-then-provide captures the parent zone eagerly via
getPaintZone (the getDensityContext precedent — read before its own
write); a parent variant flip SHALL re-derive every consumer in the
same frame (reactivity assertion); the paint SLOT reads the zone
key and TRUSTS the typed domain (ZonePaintVariant narrows at the
provider; the values array is the gate's availability carrier, not
a runtime guard — an out-of-family ambient value is not clamped and
does not warn).

#### Scenario: nested zone scopes

- GIVEN an outer zone providing tonal and an inner zone providing
  ghost
- WHEN a button inside the inner zone resolves its paint slot
- THEN it sees ghost

#### Scenario: the group provides through the one lane

- GIVEN a ButtonGroup with its own variant containing a slot-based
  consumer and a composed button
- WHEN both resolve their variant
- THEN the values agree (one effectiveVariant getter, one key)
### Requirement: the context coverage gate

`verify:context` (`scripts/verify-context-coverage.mjs`) SHALL take
deterministic in-repo inputs (registry items, parsed component
sources, the exemptions whitelist
`scripts/context-coverage.exemptions.json` with kinds
`bindable`/`passthrough`/`no-style`/`provider`/`roadmap` —
`provider` exempts ONLY the legacy-helper bypass check, never
Defaults existence, slot coverage, or resolve presence; `roadmap`
entries (prop + target axis + reason) carry the class-c props
awaiting their axis — and the versioned detection vocabulary in
`scripts/context-coverage.config.json`) and enforce FAMILY-LEVEL
coverage: (a) a family with style props has a Defaults object
covering them (or an explicit exemption); (b) every slot value is a
registered slot factory call (AST — resolved through a named slot
constant's same-file factory-call initializer); (c) every consumer
file of a family with a Defaults object CONTAINS a
`XxxDefaults.resolve(` call AND contains NONE of the banned bypass
channels (direct axis-symbol `getContext`, `resolveDensity`,
`getDensityContext`, known scope reads) outside axis modules and
whitelisted providers; (d) the paint family's values array (the
slot's first argument) matches the frozen availability table
bidirectionally (link stays PressButton-only). Per-prop dataflow
beyond these clauses is OUTSIDE static decidability — the boundary
is declared, not hidden, and belongs to code review. Output SHALL
be machine-readable JSON plus a human list with exit codes; a
`--scope=pilot` mode runs the pilot subset. The single
full-enablement point is the final integration task.

#### Scenario: a new component lands without a Defaults object

- GIVEN a registry component exposes a public variant prop
- WHEN `verify:context` (`scripts/verify-context-coverage.mjs`)
  runs
- THEN it fails naming the component and the uncovered prop

#### Scenario: a legacy helper bypass

- GIVEN a consumer component still calls
  `resolveDensity(density, getDensityContext())` inline
- WHEN the gate runs
- THEN it fails naming the legacy-helper bypass

#### Scenario: an inherit-then-provide container stays legal

- GIVEN Table provides density derived from its inherited context
  (the documented provider idiom) and is whitelisted kind `provider`
- WHEN the gate runs
- THEN the legacy helpers in its provider path do not fail the
  gate, while its Defaults existence and slot coverage are still
  checked

#### Scenario: a badge tries to reach link

- GIVEN Badge's Defaults declared a paint slot whose values array
  contains 'link'
- WHEN the gate runs
- THEN it fails the availability-table consistency check
### Requirement: native-controls governs every custom control (2026-08-29)

The Input component SHALL mount its custom controls by default for
every covered type — number (−/+ stepper in the prefix/suffix slot
positions, spin pseudos hidden under `.jx-number-shell`),
date/datetime-local/week/month/time (embedded Popover-API panels),
color (Swatches editor). The bare `native-controls` boolean attribute
SHALL opt any of them back into the platform control, with no
compatibility alias for the retired `native-picker` name. The picker
snippet stays the highest-priority override.

#### Scenario: a number field opts into the platform spinner

- GIVEN `<Input type="number" native-controls />`
- THEN no stepper buttons render, no spin-pseudo hiding applies, and
  the platform spinner + ↑/↓ native stepping serve

#### Scenario: the stepper pair owns its edge zones (Owner catch, 2026-08-29)

- GIVEN `<Input type="number" />` (custom stepper mounted)
- THEN the shell's `padding-inline` drops to 0 on each side a stepper
  button occupies at the first/last child position (the END-INSET
  OWNERSHIP law, `control-shell`: a self-insetting edge child — the
  clear button's precedent — replaces that side's padding; a slim
  text slot keeps it as its inset), and the buttons carry the clear
  button's full `--jx-hit` edge-lane geometry — glyph centered on
  BOTH axes in its zone, flush with the border
- WHERE the drop rides `:has(> .jx-input-prefix-icon-button:first-child)`
  / `:has(> .jx-input-suffix-icon-button:last-child)` in input.css —
  keyed to component-owned classes, immune to whatever the snippet
  slots render (a sibling selector cannot work: the padding lives on
  the parent shell)

#### Scenario: a week field commits an ISO week

- GIVEN `<Input type="week" />` with the embedded panel open
- WHEN a day inside 2026-08-24..30 is picked
- THEN the value commits as `2026-W35` and reopening anchors that
  week's Monday with the week painted as the range tint

#### Scenario: hovering a day previews its whole week (Owner follow-up, 2026-08-29)

- GIVEN a week panel open (`weekHover`)
- WHEN the pointer enters any day cell
- THEN all 7 days of that day's Monday-first week highlight with the
  range tint — inclusive of both ends and of out-month cells (the
  week is 7 days whatever month the cells belong to; the anchor cell
  keeps its fill); leaving the calendar drops the preview
- AND the PICKED week paints all 7 days too: the range end is the
  EXCLUSIVE next Monday (Tue–Sun tint strictly inside), Monday keeps
  the anchor fill — Sunday was bare under the old Sunday edge

### Requirement: the time stepper owns the hour format (Owner follow-up, 2026-08-29)

The TimeStepper SHALL end with one text-icon button cycling the hour
input scale 24h → AM → PM (default 24h; the glyph IS the current
mode). The mode is input-scale state only — committed values stay
24h "HH:MM" always. On 24h → AM/PM, hours > 12 drop by twelve (0 and
12 pass through untouched); on PM → 24h the hour climbs back by
twelve (`(h % 12) + 12` keeps 12 PM at noon's 12); AM → PM flips the
meridiem only. In AM/PM the hour cell steps and validates on the
1–12 ring (12 → 1). A mode crossing that changes no number commits
nothing; an empty value flips the mode without seeding one.

#### Scenario: 14:05 cycles the full ring

- GIVEN a TimeStepper at `14:05` (24h mode)
- WHEN the mode button is pressed three times (AM, PM, 24h)
- THEN the commits are `["02:05", "14:05"]` — the >12 drop, the
  meridiem flip (no number change, no commit), and the +12 climb
  that round-trips the ring

#### Scenario: noon passes every scale silently

- GIVEN a TimeStepper at `12:00`
- THEN every crossing (24h → AM → PM → 24h) commits nothing —
  12 AM, 12 PM and 12:00 share the number 12

### Requirement: the picker vocabulary renders through Intl (Owner follow-up, 2026-08-30)

The panels' locale-sensitive words — the calendar's month label and
weekday heads (visible + aria), the month grid's cells, the
date-picker's locale display format — SHALL render through
`Intl.DateTimeFormat`, never hand-rolled tables. A `locale` prop
(BCP 47) overrides; the default resolves the page's `<html lang>`,
else the browser language, else English (SSR-safe). The LOCALE owns
field order and spacing (one formatter — "August 2026" /
"2026年8月", never concatenation); the committed values stay ISO
always. Formatters cache per (locale, shape); the week vocabulary
reads a Monday-first anchor week (2024-01-01) in UTC so output is
deterministic in any runtime timezone.

#### Scenario: a zh-CN field opens its panels

- GIVEN `<Input type="date" locale="zh-CN" />` opening on 2026-08
- THEN the nav reads `2026年8月`, the heads read 周一..周日 (aria
  星期一..星期日), and a month panel's cells read 1月..12月
- AND with no `locale` prop the page's `<html lang>` drives the same
  vocabulary; an explicit `locale` outranks it

### Requirement: the time stepper cells are slider-grade (Owner follow-up, 2026-08-30)

The TimeStepper's numbers SHALL show digits even when the value is
unset (display-only 00:00; the commit stays undefined until the first
interaction), and support pointer gestures: the wheel over a group
steps its number (scroll up = +1), press-drag on a cell steps per
10px of vertical travel (up increases; the run is
pointer-captured so sliding off the cell never strands it), and the
cells wear `cursor: ns-resize` (the vertical-moveable cue). Gestures
ride the same wrap/mode-aware stepBy path as the buttons and keys.

#### Scenario: dragging the hour cell

- GIVEN a TimeStepper at `05:00`
- WHEN the hour cell is pressed and dragged 10px up, then 10px more
- THEN commits are `06:00`, `07:00`; sliding back below the start
  walks the value back down

### Requirement: the datetime panel owns the time part

The datetime-local panel SHALL carry a custom time stepper (HH/MM,
live commits into the value's time part, keyboard ↑/↓ + hold
acceleration + direct typing) beside the Calendar; a day pick
commits the date part WITHOUT closing the panel (light dismiss and
Escape close it).

#### Scenario: adjusting time after picking a day

- GIVEN a datetime-local panel open with value `2026-08-29T00:00`
- WHEN the user picks the next day, then steps the hour cell twice
- THEN the value reads `2026-08-30T02:00` and the panel is still open

### Requirement: components consume the generated icon module

Registry components SHALL NOT embed hand-written `<svg>` glyph
markup. Decorative icons come from the generated `$lib/icons`
module via `{@html icons.x}`; non-default stroke widths (2.5 /
1.75 / 1.5) ride scoped CSS overrides on the consuming context —
never edited geometry. Structural ornaments that are not
icon-library glyphs (e.g. the tooltip caret polygon) are exempt
from the icon module but MUST be declared in the change record.

#### Scenario: a component hand-draws a lucide-style glyph

- GIVEN a registry component file
- WHEN an inline `<svg viewBox="0 0 24 24" fill="none"
  stroke="currentColor">` glyph appears in markup
- THEN it is a migration miss — the glyph belongs in the
  gen-icons manifest

#### Scenario: a caret needs a heavier stroke

- GIVEN a component consuming `{@html icons.chevronDown}` at sw 2.5
- WHEN the surrounding rule sets `stroke-width: 2.5` on the svg
- THEN the presentation attribute yields to the CSS cascade and no
  manifest variant is created

### Requirement: the async action idiom

`press-button` SHALL own a `loading` pose with an explicit anchor
contract: `aria-disabled="true"` (focusable), pointer AND keyboard
activation suppressed (Enter/Space no-op), `href` navigation blocked,
tab order unchanged, spinner glyph in the leading lane — plus a
one-shot success flash idiom. `toast`'s store SHALL own
`api.promise(p, { pending, success, error })` — both framework-free,
no module side effects.

#### Scenario: a deploy button

- GIVEN the async button demo
- WHEN the promise is in flight
- THEN the button shows the spinner, ignores presses AND Enter/Space,
  and an `href` variant navigates nowhere; on settle it flashes
  success once, then returns to rest

#### Scenario: a rejected promise

- GIVEN `api.promise` with a rejecting task
- WHEN the task settles
- THEN the pushed toast is the error variant, assertive, sticky

### Requirement: date-picker presets, time, and disabled rules

- `presets` renders a quick-pick lane whose commit path is identical
  to a grid pick. The lane is the component's; the preset ENTRIES are
  the consumer's — the `{label, value}` payload array is a value-domain
  convenience only, and per-item CONTENT (rich labels) MUST ride the
  snippet escape (composition-first law).
- `showTime` (v1: single mode ONLY; range + time is rejected) defines
  the datetime state contract: canonical stored value
  `YYYY-MM-DDTHH:mm` local wall-clock (no zone conversion), localized
  display via `Intl`; the calendar mutates the date part, the
  TimeStepper mutates the time part, and each preserves the other;
  prebound datetimes restore day AND time.
- `isDisabled(date)` cells follow the outside-day law (visible,
  not-allowed) and are skipped by the keyboard walk.

#### Scenario: presets lane

- GIVEN the presets lane carries a `Last 7 days` entry
- WHEN the preset is activated
- THEN the range commits and the panel closes exactly as a grid pick

#### Scenario: a prebound datetime survives day navigation

- GIVEN `showTime` and value `2026-08-30T14:05`
- WHEN the consumer opens the panel and picks a different day
- THEN the committed value keeps `T14:05` and the panel closes

### Requirement: combobox multiple commits an array through the bridge

`combobox` SHALL support `multiple`, binding `string[]`; submission
goes through the form-field bridge's MULTIVALUE mode: the consumer
sets `values: string[]` (a property on the jx-form-field element, or
its `setValues(values: string[])` setter) — MULTIVALUE bypasses the
string `value` attribute entirely; the bridge then constructs
`internals.setFormValue(FormData)` with repeated same-name entries in
selection order (`getAll(name)`), preserving form.reset() (back to
the initial array) and disabled-fieldset omission. No joined-string
channel exists in this mode — the FormData payload is the ONLY
transport, and no value-rejection path exists. Selection renders via
the chip law with per-chip removal;
the panel declares `aria-multiselectable`.

#### Scenario: a multi-select combobox in a submitted form

- GIVEN `<Combobox multiple value={[]} options={[...]} name="tags" />`
- WHEN two options are picked and the form submits
- THEN `FormData.getAll("tags")` returns the two values in selection
  order, the trigger shows two removable chips, and a later
  form.reset() restores the initial empty array

### Requirement: the input shell carries count, reveal, and the floating bracket

- `count` SHALL render a live "n / max" readout in the hint lane.
- `type="password"` SHALL offer the reveal toggle (opt-out
  `reveal={false}`) with `aria-pressed` semantics.
- `labelMode="floating"` SHALL paint the label as a fieldset-bracket
  on the shell border (the terminal divergence from in-field label
  morphs), pure-CSS state driven.

#### Scenario: counting a textarea

- GIVEN `<Input count maxlength={120} textarea />`
- WHEN the value is 118 code points
- THEN the readout shows "118 / 120" and the live region stays silent
  until the polite threshold

### Requirement: charts render from data with zero dependencies

The chart family (`registry/files/ui/chart/`) SHALL render entirely
from props data using text glyphs and inline SVG — no chart/animation
runtime dependency. It is a family of DETERMINISTIC DISPLAY
PRIMITIVES, not a chart library: tooltips, interaction, automatic
axes/layout/collision engines, streaming, and generated data tables
are explicitly OUT of scope. Each part SHALL freeze its semantics for
degenerate data (empty, all-negative, constant, NaN/non-finite,
zero-total) — every part's render is a pure function of props, and
those cases are unit-tested. Every chart SHALL carry `role="img"`
with a REQUIRED accessible name enforced by the type contract (label
prop without a default), plus an opt-in visually-hidden data table
fallback.

#### Scenario: a sparkline in a stat row

- GIVEN `<ChartSparkline data={[3,5,2,8,7]} label="deploys this week" />`
- WHEN it renders
- THEN the glyphs are proportional to the data, the accessible name is
  "deploys this week", and the DOM contains no runtime library import

#### Scenario: degenerate data is frozen, not invented

- GIVEN `data={[NaN, 5]}` on any chart part
- WHEN it renders
- THEN the output is the documented frozen behavior for non-finite
  input (same input, same output, every time)

#### Scenario: reduced motion

- GIVEN `prefers-reduced-motion: reduce`
- WHEN any chart mounts
- THEN it paints its final state immediately (no entrance animation)

### Requirement: the canvas stays out of the outline

The canvas root SHALL carry `data-toc-skip`; its title and Playground
headings SHALL NOT be real outline headings (styled non-heading
elements or `h3`+skip). DensityDemo's children-quadrupling SHALL be
retired in favor of the stage density toggle.

#### Scenario: a docs page ToC

- GIVEN a docs page with three canvas instances
- WHEN the outline is derived
- THEN no canvas-internal heading appears; the page's own sections only

### Requirement: the floor is affordable for two-file items

A demo page whose item has ≤2 files SHALL render filename TABS over a
single CodeCard (no tree pane); files SHALL come only from `?raw`
imports of the mirrored sources — hand-pasted source in a docs page
is a gate failure. The GitHub source link SHALL be derived from the
item's registry path, never hand-written.

#### Scenario: a two-file floor

- GIVEN press-button (component + usage)
- WHEN the drawer opens
- THEN two filename tabs swap one CodeCard, and the header's source
  link resolves on GitHub (derived, not authored)

### Requirement: the stage carries theme and density as scoped attributes

The canvas stage SHALL expose light/dark and comfortable/compact
toggles that set `data-theme`/`data-density` on the STAGE element
only; toggle state SHALL be page-owned (bindable), never held inside
the canvas.

#### Scenario: previewing a dialog in light compact

- WHEN the toggles flip to light + compact
- THEN only the stage re-themes; the docs chrome and other instances
  are untouched; and the page's bound state reflects the change

### Requirement: the lab's code follows the controls

The flagship lab's code panel SHALL render the page's authored snippet
function over the current control state (single source: the taught
string and the shown string are the same function). A reset control
SHALL restore the documented defaults, and a read-only state
projection SHALL echo the current bound state.

#### Scenario: dragging variant to ghost

- GIVEN the lab with variant control
- WHEN the consumer selects ghost
- THEN the code panel shows the ghost snippet generated from the same
  function the usage section teaches

### Requirement: patterns are composition-only items

Pattern items are FLAT registry:ui items under the existing UI area:
`registry/files/ui/pattern-<name>/` (folder law unchanged; the prefix
is a product namespace, NOT a new source root), mirrored to
`apps/www/src/lib/ui/pattern-<name>/` with generated canonicalMain
manifest entries verified by `verify:mirror`. A pattern SHALL compose
ONLY the atoms it lists as direct `registryDependencies` — it SHALL
NOT re-implement atom behavior, duplicate atom paint, or add props to
an atom (a needed prop change belongs to the atom's own family
change, recorded as a followup). `verify:deps` compares
target-resolved imports to those direct edges; resolver traversal
owns only the transitive closure.

#### Scenario: a pattern needs a new atom prop

- GIVEN the hero marquee pattern wants a new press-button behavior
- WHEN the gap is found
- THEN the pattern records a followup instead of patching the atom,
  and ships without the behavior until the atom change lands

#### Scenario: installing a pattern

- WHEN `npx shadcn add @jixoai/pattern-login` runs in a fresh consumer
  (the A change's data-driven clean-install harness)
- THEN every directly declared atom installs through the resolved
  registryDependencies closure and the canonical entry BUILDS

### Requirement: patterns have canonical docs routes

Each pattern item SHALL own a canonical docs route under
`/docs/components/pattern-<name>.html` with a unique meta.group and
meta.href, a prerender entry, and docs-structure assertions — the
same contract as every registry:ui item. `/docs/patterns.html` is a
GALLERY linking those canonical routes, never their replacement.

#### Scenario: the docs navigation enumerates patterns

- WHEN the components navigation is built
- THEN each of the five pattern items appears exactly once with a
  unique canonical href

### Requirement: a floating surface's zones and its content faces are separate components

A surface component (dialog, popover, sheet) renders the ZONES — the
row ruler, the presence stamps, the variant/texture scopes, the
close contract, the motion — and offers per-zone SNIPPETS as the
transport (the default children render inside the body cell; only a
snippet reaches another row). The zone's standard CONTENT is a
separate composition component that the snippet typically carries.

#### Scenario: the dialog footer's slot architecture (r14-9)

- GIVEN Dialog shipped `footer`/`actions`/`end` as three sibling
  snippets with Dialog itself grouping the buttons
- WHEN the Owner ruled the slot architecture belongs to the FOOTER
  REGION ("actions 本身是包含在 footer 内…应该提供 <DialogFooter>")
- THEN `actions`/`end` retired, the `footer` snippet became the RAW
  full-zone override, and `<DialogFooter>` (children auto-join one
  end-packed ButtonGroup; `end` replaces the grouping) carries the
  economy — with `<DialogHeader>` landing symmetric

### Requirement: derived policies resolve from the same source as the paint they follow

When a policy derives from a theme-ish input (variant, density), it
SHALL key the RESOLVED value (explicit ?? enclosing scope ?? own
default) — the same chain the visible paint keys. Two chains over one
context tree drift apart silently.

#### Scenario: the ghost seam policy (r14-10)

- GIVEN ButtonGroup resolved its buttons' variant through
  inherit-then-provide (`variant ?? enclosingGroup?.variant`) but
  keyed the seam policy on the LOCAL prop alone
  (`separator ?? variant === 'ghost'`)
- WHEN a DialogFooter group inherited ghost from the dialog zone's
  variant scope (no variant prop of its own)
- THEN the buttons PAINTED ghost while `data-jx-separator` never
  stamped — the 1px seams never lit until the policy rekeyed
  `effectiveVariant`

### Requirement: stamps carry intent; css composes policies

A component stamps what the CONSUMER asked for; the selectors decide
when it paints. Composition belongs in css (selector AND), not in
JS-side preconditions that erase the intent from the DOM.

#### Scenario: the leading seam stamp (r14-13)

- GIVEN `leadingSeam` gated its stamp behind `separatorOn` in JS
- WHEN a standalone DialogFooter (no ghost scope around it) rendered
  in a test
- THEN the stamp vanished and the DOM could not prove the prop was
  even passed — the stamp moved to record the intent
  (`data-jx-leading-seam` whenever the prop is set), and the paint
  rule requires `[data-jx-separator][data-jx-leading-seam]` together,
  so a bordered cluster never doubles its opening edge

### Requirement: decorative lines ride their host, not a sibling

A line that must sit flush against an element SHALL be that element's
own pseudo (the seam-slot language), never a sibling node — any
parent layout property (a grid gap, a flex gap, a margin) detaches a
sibling, and only construction can guarantee flush.

#### Scenario: the dialog foot's opening line (r14-11 → r14-13)

- GIVEN DialogFooter rendered a standalone `<Separator
  orientation="vertical">` before its ButtonGroup inside
  `.jx-dialog-foot-grid` (column-gap: 0.625rem)
- WHEN the Owner caught the gap between the line and the actions
- THEN the line became the ButtonGroup's `leadingSeam` capability —
  the first button's own `::before` at `inset-inline-start: -1px`,
  the same slot language as the intra-cluster seams

### Requirement: a field boundary never rides the shadow alone

Inside a solid surface, a form control is an engraved WELL: the
hairline edge carries extent, the DISSOLVED ground keeps one solid
object, the inset shadow carries depth. A shadow is a soft gradient —
it conveys depth, never a boundary.

#### Scenario: the entity dissolve over-rotated (r14-12)

- GIVEN the entity law's depth-1 projection set border AND background
  transparent, leaving the input's affordance to the well inset alone
- WHEN the Owner reported "完全看不到边框，只看到内阴影，这很奇怪"
- THEN the recalibration kept the shell's own 1px var(--border) edge
  painting through, dissolved only the ground, retired the depth-2
  55% re-assert (subsumed), and added the symmetric overrides
  (`data-assert-border` grounds back, `data-dissolve-border` for
  flush edge-to-edge fields like the palette head — the edge there
  would double the panel's own border)

### Requirement: a declared capability and its costs retire together

An opt-out that disables a capability SHALL retire its accompanying
reserved costs in the same declaration — half-retired states are
never honest.

#### Scenario: scroll={false} (r14-15)

- GIVEN the dialog body zone is the only scroll ring with
  `scrollbar-gutter: stable both-edges` reserving symmetric space
- WHEN the consumer declares the body fits (`scroll={false}`)
- THEN the zone stamps `data-jx-scroll="off"` and ONE css rule retires
  the scroll authority (`overflow-y: visible` — mis-declared overflow
  paints out honestly) together with the gutter (`auto`)

### Requirement: animated formulas derive from the resting token

When a property has both a static paint and a motion-kernel formula,
the formula SHALL derive from the same token the static paint reads —
two handwritten copies of one visual value drift apart.

#### Scenario: the surface veil's polarity (r14-17)

- GIVEN the veil's static paint read `--surface-shadow` while the
  WAAPI resting formula derived from the generic `--shadow-color`
- WHEN the Owner flipped the polarity (white in light, black in dark)
- THEN the tokens flipped AND the formula rekeyed
  `oklch(from var(--surface-shadow) …)`, so the resting pose lands
  exactly on the token in both themes
