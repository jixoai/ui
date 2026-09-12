# component-authoring — the Svelte 5 component contracts (living spec)

## Purpose

The Svelte 5 component contracts: the Tier system, native-element-first law, props discipline, and the utility-first styling posture with its documented cascade exceptions.

> Capability owner: `registry/files/ui/**` (mirrored at
> `apps/www/src/lib/ui/**`). Components are Svelte 5 runes-first,
> native-element-first, and follow the Tier system below.

## Current contract (state: 2026-09-09, the carved-action-band rounds 2-4 (head band, even split, ink rims, borderless chrome, the system trio renamed SystemDialog, the corner context) over the floating-flesh-sweep (rest lane + sheet dialect + anchored-alert ruling) over the structural kernel law)

## Requirements

### Requirement: the Tier system

- **Tier-0** — `jx-pure`: element defaults for BARE native elements
  (see the jx-pure spec; one stylesheet, zero JS).
- **Tier-1** — registered components: Svelte files that wrap/enhance a
  native element (e.g. `input.svelte` wraps every native input type).
- **Tier-2** — the v2 class vocabulary, defined in jx-pure.css Part A, consumed by
  Tier-1 components — a cross-file contract that MUST NOT drift
  between the sheets and the components. The v2 rename is complete:
  old names have no aliases.

#### Scenario: a component needs a form lane

- GIVEN `input.svelte` renders the text-like shell
- WHEN it applies the Tier-2 `.jx-control-lane` class
- THEN the paint comes from the jx-pure sheet (single definition), not
  from a component-local duplicate

> (kept `.jx-field/.jx-label/
>   .jx-error`; renamed `.jx-control/.jx-control-shell/.jx-control-lane/
>   .jx-slider/.jx-color-shell/.jx-color-swatch/.jx-color-expand` + icon
>   custom properties)

### Requirement: the hit-lane contract

Every interactive control SHALL expose a PHYSICAL activation
rectangle at `min-block-size: var(--jx-hit)`; visual glyph dimensions (icon and
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

> (the canonical alias —
> the previous text's `--jx-d-ctl-hit` predated the Tailwind-aligned
> token rename and is retired)

### Requirement: the slot-vs-padding law (badge dialect, Owner ruling, 2026-09-01)

When a component renders an optional inline-start/inline-end slot
lane (icon, glyph, adornment), the lane SHALL REPLACE its side's
`padding-inline` — never stack on top of it: the side's padding
collapses to the half-inset lane width (`has-[[data-icon=inline-start]]:
pl-[calc(var(--jx-inset)/2)]` and the mirror), so slot-present and
slot-absent rhythms stay one system.

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

> The icon-ONLY exception applies
> to components whose label is OPTIONAL: when no children render,
> symmetric padding is KEPT so the lone glyph centers — guarded by
> children presence, never by slot presence (badge and tabs-trigger
> carry the guard; children-required families like chip and
> toggle-group-item take the unconditional lanes). Adopters today:
> badge, chip, toggle-group-item, tabs-trigger, input's edge zones
> (the shell dialect: square hit children zero their side's padding —
> same law, box-shaped). New components with slot lanes adopt the same
> rule; a lane that double-pads (full inset + lane) is a rhythm
> violation.

### Requirement: native-element-first, W3C-first

The platform element SHALL be the component where possible (accordion =
`<details>/<summary>`; kbd = `<kbd>`; table = native table with
container-query driven modes). Semantics, keyboard, SSR come from the
platform; JS only adds what the platform cannot do.

#### Scenario: choosing the implementation element

- WHEN a new component is proposed
- THEN the first question is which native element/structure already
  carries the semantics, and hydration cost is zero unless unavoidable

### Requirement: props discipline

Runes (`$props`, `$bindable`, `$state`); `class` merges into the root
element; `...rest` (HTMLAttributes) MUST flow through verbatim so
title/data-*/aria-* land on the DOM. `value` is `$bindable`: bound =
controlled, absent = purely uncontrolled (FormData/form.reset
untouched).

#### Scenario: consumer passes arbitrary attributes

- GIVEN `<Foo data-testid="x" title="y" />`
- THEN both attributes land on the root native element unmodified

### Requirement: styling posture

Tier-1 components are migrating to utility-first: paint is composed as
Tailwind v4 utilities in markup against the jixoai token-sheet
`@theme` mappings. WHEN a Tier-1 component is migrated to
utility-authored paint, its affected public class slots SHALL merge
through `cn()` for class-string hygiene — `cn()` is NOT a cascade mechanism;
override behavior comes from the layer law (css-architecture spec).

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

> — which resolve for consumers ONLY under the
> canonical entry setup (tailwind entry → jixoai theme import; see the
> registry spec), declared as the documented install prerequisite of
> utility-authored items
>
> (deduping conflicting
> utilities inside one string)
>
> Components not yet migrated (P0–P2 transitional state) keep their
> existing class-merge behavior and carry NO cn() obligation. CSS that
> utilities cannot express SHALL live in the component folder as
> `<item>.css` (`@layer components` + `:where()`, `jx-`-prefixed). The
> frozen Tier-2 vocabulary (jx-pure Part A) and the element-default
> laws (Parts A–D) MUST be consumed only — never copied, moved,
> redefined, or re-wrapped; Tier-2 classes MUST NOT route through
> `cn()` as a redefinition entry. Scoped-style migration MUST
> explicitly re-express selector boundaries (`:global()` child
> selectors, pseudo-elements, `@supports`, media queries) rather than
> pattern-copying.

### Requirement: semantic hooks are data-jx-* attributes, never css-less classes

Component markup SHALL carry every css-less semantic anchor as a
`data-jx-*` attribute: static hooks as boolean attributes
(`data-jx-foo`), variant families as ONE valued attribute
(`data-jx-foo={variant}`). Every `jx-*` CLASS remaining in markup MUST
be css-defined somewhere; a repo-wide
scan (`scripts/verify-hook-law.mjs`) MUST fail on any css-less jx-*
token and on any data-jx-* name shadowing a css-defined selector.

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

> (state machines, kernels, Tier-2 frozen
> vocabulary, residue statics — the cascade law's territory)
>
> Reference sites (tests, docs, scripts, scenes) query the attribute form
> (`[data-jx-foo]`, `[data-jx-foo="v"]`).

### Requirement: the Item family system (list-item)

The Item family is a deep module with one policy seam: `ItemGroup`
provides a typed context policy; `Item` resolves it and stamps the
result as data attributes; CSS paints stamps only. Group DOM SHALL be
native: `<div>` (or `<section aria-labelledby>` when labeled) framing
a `<ul data-slot="item-list">` whose direct row children are `<li>`
wrapping each row root; `data-dividers` SHALL be stamped only on the inner
`<ul>`; the frame carries mode/inset/size/
layout.

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

> the group context identity SHALL be created
> once with reactive policy fields so every Item re-resolves when its
> own props or a relevant group field changes (SSR pins only the
> initial stamps).
>
> (it owns row adjacency)
>
> The trailing lane is ONE slot — `ItemEnd` — whose children
> are `ItemAfter` (non-interactive metadata), `ItemActions` (controls),
> and `ItemChevron` (decorative `aria-hidden` leaf; NO inheritance
> anywhere). Form rows are served by `ItemField` (generated label/
> control/description/error IDs, typed `control` snippet) plus thin
> adapters over the EXISTING controls — adapters MUST NOT reimplement
> control semantics, keyboard behavior, or form participation; their
> reserved props SHALL be sealed by compile-time `Omit` sets (`id`,
> `aria-labelledby`, `aria-describedby` centralized; each control's
> duplicate label/error/labelSide APIs reserved) with NO `any` or cast
> bypass. `ItemSeparator` is deleted; `ItemDivider` is the childless
> decorative explicit boundary, structurally exclusive with the
> automatic divider rule (one source per edge). Component-owned
> `data-*`/roles/`aria-*` SHALL be spread after consumer rest-attrs so
> stamps replace rather than merge.

### Requirement: composition-first API surface

Repeated or nested UI structure SHALL be authored in the consumer's
tree as family parts (Svelte 5 snippets/children), never described
through props. A registered component MUST NOT own markup that is
only reachable via data-array props, config trees, keyed render-props,
or string-to-glyph mappings.

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

> Legal props are: value/state (bindable),
> behavior (`activation`, `placement`), presentation enums (`variant`,
> `size`, `orientation`), and value/behavior-domain payloads (option
> sets, tour targets, code strings, virtualizer rows) — the payload
> category MUST provide snippet escapes for per-item content. ONE
> declared narrow exception (R2, Owner 2026-09-04): a
> **display-currency metadata payload** — an array of plain display
> strings rendered verbatim as annotations with NO per-item content
> sovereignty (no per-item layout, paint, or slots; Figure's `citedIn`
> is the instance) — carries no snippet escape; the strings are the
> harvest contract's mirror, not caller-defined structure. The
> diagnostic for gray zones: a prop that changes WHAT renders (which
> rows/sections exist) must become a child component; a prop that
> changes HOW it renders (paint, layout mode) is legal.
>
> Families ship at ecosystem part granularity: the shadcn/shadcn-vue/
> Dice UI anatomy for the equivalent component is the floor, not the
> ceiling. Barrels follow the tabs precedent — `export { default }`
> for the canonical main when one exists, sub-parts as named defaults,
> `export *` for module types; NO Root aliases.

### Requirement: family context contract

State-sharing context in a family SHALL carry state and behavior
only — never membership order. Ordinal state compares explicit
per-item values; keyboard walks and filtering are DOM-delegated and
scoped to the nearest container (`closest()`), so nested families
never leak into each other's walks. Where items carry metadata the
DOM cannot express (match text), items SELF-match against context
state instead of registering into a central ordered registry.

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

> What
> must register (imperative show/hide handles) registers at component
> initialization — synchronously, SSR-executed, under a family-defined
> stable DERIVED key (panel families: `${itemId}-panel`, never the
> registrant's own `$props.id()`), unregistered `onDestroy`; `onMount`
> is never the only registration path. Consequences that MUST hold: SSR output is semantically
> complete before hydration; keyed `{#each}` reorders, conditional
> inserts, deletions and restores never corrupt state or walk order.
> Declared DOM-derived AUTO-mode exceptions (a toc deriving links from
> rendered headings; the R2 figure counters and reference resolution):
> each renders its landmark shell server-side and completes on
> hydration — the data does not exist at render time. The exceptions
> split by shape — reference resolution rides the shell-plus-hydration
> form (a forward reference prerenders the fallback marker and follows
> on hydration), while figure numbering is SSR-complete (instantiation
> order = template order = static DOM order; hydration's first frame
> matches the SSR output) and touches the exception class only through
> incremental renumbering driven by DOM mutation. The exceptions apply
> to auto modes only, never to composed trees.

### Requirement: the child snippet contract

Interactive parts (triggers, links, markers) MAY offer element
substitution, typed with the part's ONE concrete element kind — no
`any`, no generic, no element unions:

```ts
child?: Snippet<[{ props: HTMLAnchorAttributes & { class: string } }]>;   // link part
child?: Snippet<[{ props: HTMLButtonAttributes & { class: string } }]>;   // button part
```

The part hands the consumer a props object: `class` carries the
component's classes cn()-merged, handlers and
aria/data attributes flow verbatim, and a consumer who REPLACES a
handler or aria attribute owns the consequences (Svelte spread
order). The replacement element MUST preserve the part's
role/semantics.

#### Scenario: consumer replaces the element

- GIVEN a link part with a `child({ props })` snippet rendering an
  consumer `<a>` with a router href and an added click handler
- THEN the anchor carries the part's aria wiring and merged classes
  and the consumer's handler is the one that fires (replacement, by
  the spread-order law)

> (the consumer appends their own via
> `class={cn(props.class, 'own')}` after spreading, winning by the
> layer law — the same contract as plain `class`)
>
> Where a part's element kind can switch, child() is
> offered only on the interactive form. Layout parts MUST NOT offer
> child(). The parts offering it are listed per family in the change's
> design.md.

### Requirement: the density contract (token + context injection)

Density SHALL be a TWO-CHANNEL contract. The Svelte channel resolves policy:
a getter-backed `DensityContext`
with the law `explicit ?? inherited ?? own`; providers are opt-in. The
CSS channel injects values: providers and density-aware components
stamp `data-density`, and ONLY the canonical theme sheet AND its
byte-identical generated mirror carry density scopes, mapping the
derived `--jx-density-*` vocabulary to inherited `--jx-*` aliases —
never component css.

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

#### Scenario: the 2xs rung's scoped hit floor

- GIVEN the density kernel verifier probing `[data-density='2xs']`
- WHEN it reads the used --jx-hit and --jx-row-min
- THEN both resolve 24px (the WCAG 2.5.8 AA pointer floor) while the
  :root guardrail --jx-hit-floor stays 7U = 28px for every other
  rung — the ONE scoped floor in the kernel, the pro-density stance
  for non-touch pointers

> (the manufactured-'default'
> fallback retires into the family's Defaults slot argument or
> no-opinion undefined)
>
> (no forced app root)
>
> (one Symbol key, one stable object)
>
> Components consume the aliases and MUST NOT branch on density values
> in their own css; `data-size` authority is removed (no alias). Every
> scale value is DERIVED from the ruler (`--jx-unit`, text base)
> by written equations; the computed five-row table is gate-asserted
> (the fifth rung 2xs — Owner 2026-09-05, pro-tool operation density:
> T 10px, L 14px, G=B 8px, S 4px, rowMin = hit = 24px — is OPT-IN ONLY
> for professional non-touch high-density operation surfaces, never a
> default; its ONE scoped law redeclares --jx-hit-floor at 6U = 24px,
> the WCAG 2.5.8 AA pointer floor, inside `[data-density='2xs']` — and
> because a :root-only hit-min token hands descendants the
> root-substituted 28px (the canvas-bug law), the scope redeclares BOTH
> the floor and --jx-density-hit-min-2xs; every other rung keeps the
> 7U global guardrail).
> The balance invariant holds at every density: row inline-start inset
> == the media/content seam (one ruler mark); media boxes derive from
> the line (icon = one line, image = two — the seam never folds into
> the object); optical correction is ONE bounded token (±U/2). Inline
> `resolveDensity`/`getDensityContext` calls in consumer bodies retire
> in favor of `densitySlot` wiring; the helpers remain, living only in
> the axis module and the gate's provider whitelist (structural
> providers and kind:`provider` inherit-then-provide containers).

### Requirement: the shared ruler (grouped list geometry)

Grouped rows SHALL align through an EXPLICIT shared ruler, not per-row
collapse: ItemGroup declares `ruler` ('content-end' default |
'media-content-end'); under @supports(subgrid) the list owns the
column tracks and rows rent them through TWO subgrid levels (the li
wrapper AND the row root — subgrid stops at the immediate parent).
Missing slots RETAIN shared tracks (alignment is deliberate); header,
footer, and divider rows span the ruler.

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

> The narrow law changes
> PLACEMENT ONLY (row areas), never the shared tracks — mixed
> wrap=auto/never rows coexist in one list. Standalone rows (no ruler)
> keep the exhaustive :has() presence matrix; the no-subgrid path falls
> back to it. ItemField's end lane SHALL render wrap="never"; the lane's
> min-block-size is the INHERITED density hit-min (never a literal
> dimension); truncation is an explicit opt-in stamp.

### Requirement: the variant grammar (prominence ladder + hue injection)

Surface paint variants SHALL come from the one ladder — `fill` /
`tonal` / `outline` / `ghost` — plus PressButton's `link` interaction
exception, plus the `fused` backdrop-fusion rung. Semantic color is NEVER a variant
name: intent is expressed
by injecting values into the four global hue slots. Variant paint rides token utilities in
the markup; press physics (`.jx-press`)
never change with paint.

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
  grouped path included — the footer's ButtonGroup writes the flat
  texture itself, and the footer zone's raised={false} removes the
  cluster shadow too)

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

#### Scenario: a bare joined group casts one cluster shadow

- WHEN a ButtonGroup renders outside any texture zone with no
  `raised` prop
- THEN its root paints the one convex shadow (`--shadow-xs`, behind
  `:where()`) and every joined button without its own `raised` prop
  rides the flat texture (the group's texture write — the per-button
  convex shadows that overlapped at the seams are gone)

#### Scenario: the group's raised=false only removes the root shadow

- WHEN the same group renders `raised={false}`, or inside a zone
  that scopes `raised={false}` (a card/dialog foot)
- THEN the root carries no box-shadow and no hover/active shadow
  pose exists on it (the root never presses), while the joined
  buttons' flat default is unchanged — an explicit `raised={true}`
  on a child still wins

#### Scenario: a nested cluster casts no shadow of its own

- WHEN a ButtonGroup renders inside another ButtonGroup with no
  `raised` prop
- THEN the inner root paints nothing — the OUTER cluster owns the
  one shadow (one control, one shadow); an explicit `raised` on the
  inner group is the consumer's escape hatch

> (2026-09-08, this
> change: the separator's ink technique promoted to chip paint — the
> quietest rung; paint derives from the ground behind the element, no
> own color, no border, reading as the backdrop's own tonal shift,
> theme-agnostic by construction)
>
> (`--jx-fill`,
> `--jx-fill-ink`, `--jx-tonal`, `--jx-outline`; theme-owned,
> inheritable)
>
> The action/status split is mandatory: destructive
> ACTIONS inject `--destructive` (the fill pair), error STATUSES inject
> `--error` into the tonal slot.
>
> (tw4 utility-authored law)
>
> Availability is per-component (see the
> frozen table in
> openspec/changes/archive/2026-08-27-variant-grammar/design.md §4 —
> the table itself is authoritative):
> Badge fill/tonal/outline (default tonal, brand hue); InlineCode
> fused/tonal/outline (default fused — 2026-09-08, this change: the
> Owner retired tonal-as-default and minted the fused rung; tonal and
> outline stay); Chip all four
> (default tonal); PressButton fill/tonal/outline/ghost/link (default
> outline); Alert outline/tonal (default outline — no fill/ghost:
> banner readability); Blockquote outline/tonal (default outline, the
> alert row shape — 2026-09-07, markdown-coverage: quote readability
> excludes fill/ghost, ghost is interactive-chrome vocabulary, and the
> borderless manuscript indent stays a future structural axis). Valued
> `data-jx-*` hooks carry the variant
> (`data-jx-badge`, `data-jx-alert`, `data-jx-press-button`,
> `data-jx-chip`, `data-jx-blockquote`). The frozen table's per-component rows become the
> `definePaintSlot(values, own)` calls in each family's Defaults —
> the values array IS the family union's SOURCE (default ∈ values is
> compile-locked; the runtime consumes no value-domain guard; the AST
> gate asserts the array bidirectionally against the frozen table);
> the family's exposed union derives from the slot
> (`ReturnType<typeof slot>`); the previously implicit `??` chains
> are the paint slot's `explicit ?? ambient(zone) ?? own` resolution.
>
> The injection seam is TWO-LAYERED (hue-injection-utilities,
> 2026-08-27): the CANONICAL form for the curated semantic set is the
> theme's TW4 `@utility` intent layer — `jx-hue-primary | neutral |
> error | success | warning | info` (tonal slot) and
> `jx-pair-destructive` (fill + fill-ink together, making the
> always-inject-both law structural; there is no `jx-hue-destructive`
> — the action/status split holds by construction). The
> arbitrary-property class (`[--jx-tonal:var(--error)]`) remains the
> escape hatch for values outside the closed set; ONE form per slot in
> a class list (cross-form mixing is not dedupable). `cn()` registers
> the closed set as tailwind-merge dedupe groups.
>
> THE PHYSICS AXIS (Owner 2026-09-03), orthogonal to the paint ladder:
> the ladder stays closed and paint still never touches physics, but
> the axis that was implicit is now recorded.
>
> - PressButton gains `raised?: boolean` (default `true`). The paint
>   ladder is untouched; `raised` modulates ONLY the press law's poses,
>   entirely through the pose-custom mechanism (`--jx-press-shadow`,
>   `--jx-press-shadow-hover`, `--jx-press-shadow-active`, and the NEW
>   `--jx-press-move` seam on the kernel's `:active` translate —
>   `translate: var(--jx-press-move, 1px 1px)` keeps every existing
>   button byte-identical).
> - `raised={false}` (the FLAT texture): rest and hover carry NO
>   shadow; the press pose re-points to the engrave tier (an inset —
>   pressed-ness expressed as being pushed INTO the plane) and the
>   press vector is nulled (`--jx-press-move: none`) — the body never
>   moves, the inset alone creates the illusion of movement. The
>   variant's own pose customs are stripped before the flat block is
>   applied (no two same-property utilities in one class list —
>   ghost's none-trio must not collide). NO rung loses its border in
>   flat (Owner ruling 2026-09-04: tonal's 45% outline stays; fill /
>   ghost were never visibly bordered; outline's border IS the
>   variant).
> - The press pose expressing pressed-ness as an inset is a sanctioned
>   pose expression (the press pose IS the affordance); it is distinct
>   from the well-at-rest law (input-class controls: hover changes
>   intensity only, never tier). PressButton keeps the 1px border
>   frame — an inset shadow is never the sole affordance (r14-12).
> - `raised` is a press-law physics prop, NOT a vocabulary style prop:
>   it never enters a family Defaults slot (the Defaults economy
>   governs the style vocabulary; the physics lane keeps its own
>   resolution below).
>
> THE ZONE RESOLUTION (Owner 2026-09-04): the flat texture's default
> is Context-scopable on the same zero-DOM boundary that scopes the
> variant.
>
> - `raised` carries NO static default. Resolution is
>   `explicit ?? zone ?? true`: an explicit prop always wins, a
>   Context-scoped zone default follows, the convex law is the resting
>   default.
> - The zone default rides its OWN context key (`PRESS_TEXTURE_KEY`,
>   owned by press-button) — a physics axis key OUTSIDE the single-key
>   paint law: `PAINT_ZONE_KEY` stays the ONE paint lane
>   (`BUTTON_GROUP_KEY` carries layout only), and a ButtonGroup
>   inherit-then-provides the paint zone (shadows it only when it
>   declares a variant of its own) while TAKING the physics axis over
>   at its own boundary (the cluster-shadow law, Owner 2026-09-04 —
>   below).
> - `ButtonVariantScope` (the zero-DOM zone boundary that already
>   scopes the variant) carries `raised?: boolean`,
>   inherit-then-provide: a paint-only scope (variant set, raised
>   absent) passes the enclosing zone's texture through and never
>   un-flattens it.
> - THE CLUSTER-SHADOW LAW (Owner 2026-09-04): the joined row is ONE
>   control, so it casts ONE shadow. A ButtonGroup writes the texture
>   key with `raised=false` for its joined subtree (per-button convex
>   shadows overlap at the -1px seams — the geometry defect this
>   closes; an explicit child prop still wins) and paints the
>   cluster's ONE convex shadow on its ROOT: `--shadow-xs` (the press
>   law's rest pose), behind `:where()` so consumer shadow utilities
>   win, with NO hover growth and NO active pose — the root never
>   presses ("不用做什么 actived 的效果，只需要去除阴影即可" — the
>   Owner's wording). The group's `raised?: boolean` resolves
>   `explicit ?? the enclosing texture zone ?? the top-level convex
>   default`, with one carve: a NESTED group defaults OFF (it is one
>   member of the OUTER cluster — one control, one shadow).
>   `raised={false}` removes the root shadow and NOTHING else; the
>   subtree's flat default is unconditional.
> - IconButton forwards `raised` verbatim (Owner 2026-09-04): the
>   composition needs NO restate — the wrapped press-button reads the
>   same ambient texture key in the same window, so the zone's flat
>   default reaches the square (and a joined ⋯ overflow trigger) by
>   construction; the explicit prop is the chrome escape hatch. The
>   dialog head's × sits OUTSIDE the flat zones and keeps the convex
>   law with no opt-out.
> - The FOOT zones of Dialog and Card declare `raised={false}` on
>   their zone scope (Owner 2026-09-04): foot buttons ride the
>   engrave-tier inset press by default. Head zones, standalone
>   footers, and every bare button keep the convex default — the zone
>   scopes a DEFAULT, never a law.

### Requirement: every registered component family ships a Defaults contract

Every registered component family with public STYLE props (per the
pinned detection vocabulary) SHALL ship ONE `XxxDefaults` object — per
family, not per part file. The Defaults object is the family's
SINGLE declared ambient contract. Coverage means EVERY style prop
has a slot, in exactly two kinds: an axis slot (ambient-manageable)
or a literal-family slot.

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

> (a
> `*-defaults.svelte.ts` file inside the family folder, a member file
> of the registry:ui item, byte-mirrored, zero kernel imports)
>
> — the literal kind has three forms:
> `defineLiteralSlot(values, default)` (closed scalar domain, default
> ∈ values compile-locked), `defineOpenSlot<T>(own)` (an OPEN scalar
> domain — free lengths/numbers with no union to enumerate; explicit
> type argument, the absentSlot discipline), and `absentSlot`
> (absent-meaningful, undefined-capable) — all with ambient
> capability pending a future axis. Literal/paint slots SHALL
> be declared as NAMED exported constants (`const kbdVariantSlot =
> defineLiteralSlot(…)`) — the capability concentrates on the single
> slot value — with the family's union type derived from it
> (`type KbdVariant = ReturnType<typeof kbdVariantSlot>`; the values
> array is the one source of truth — the meta-feeding families
> (select/combobox/date-picker) keep their component-Props inline
> unions, the surviving half of the drift double-lock: Props ⊆ values
> is compile-checked at the resolve call site).
> Every style prop SHALL be classified (axis / literal / roadmap /
> never-ambient); the classification is versioned and gate-checked as
> a whole.

### Requirement: slots are branded factory products only

A Defaults slot SHALL be a branded callable constructible ONLY by the slot factories exported from
`lib/defaults.svelte.ts` and the axis modules. Bare functions, bare
literals, and forged brand objects SHALL fail at compile time
;
`defineComponentDefaults` SHALL additionally verify the brand at
runtime IN DEV ONLY; the gate's AST check SHALL
accept only registered factory calls as slot values.

#### Scenario: a bare function sneaks into slots

- GIVEN `defineComponentDefaults({ variant: (v) => v ?? 'fill' })`
- THEN the brand constraint rejects it at compile time and the gate
  fails it at AST level

> (module-private unique
> symbol)
>
> (negative type assertions are gate material)
>
> (the `import.meta.env?.DEV`-gated WeakSet check
> — vitest runs under vite so the guard stays test-assertable; the
> type brand is the production contract)
>
> — resolving a
> NAMED slot constant to its same-file factory-call initializer

### Requirement: explicit-wins sentinel discipline

`undefined` SHALL be the only "unspecified" sentinel (TS optional
props; `null` is not a sentinel and the slot signature rejects it).
Slot resolution SHALL be `explicit ?? ambient ?? own default` with
ambient read via getter closures (no snapshot caching).

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

> No-opinion
> axes (density) SHALL keep their fleet-law semantics: the slot's
> resolved value may BE undefined (no opinion → no stamp → the
> ambient css scope channel keeps flowing); a family's local fallback
> (e.g. Table's 'sm') SHALL be declared as the slot's own argument,
> never an inline component fallback. Instance semantics props
> (open/bind, callbacks, aria/data attributes, class, id) SHALL NEVER
> become ambient; bindable state-typed style props (page-owned
> toggles) are instance semantics and exempt.

### Requirement: slot factories are lazy; context reads happen at resolve time

Slot factories SHALL be pure at construction (capturing only the
own argument; module-level Defaults objects SHALL NOT touch
context). Context reads SHALL happen only when `resolve` evaluates
the slot — inside a component's initialization/`$derived` window
(Svelte's runtime carries the creating component's ctx through
derived recomputation).

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

> A read OUTSIDE that window SHALL throw the
> platform's `lifecycle_outside_component` error untouched — slots
> and axis modules SHALL NOT catch, normalize, or string-match
> lifecycle errors, and there SHALL be no ambient-skip degradation;
> axis-internal and plugin errors SHALL propagate the same way. Unit
> assertions of resolution SHALL mount a host component (the
> `unit-resolve-host` fixture and the per-suite host precedents).

### Requirement: zone scopes are axis-level providers

A zone scope SHALL be a zero-DOM, getter-backed boundary keeping ONE
key per axis (never layout — the layout half stays in components
like ButtonGroup); the paint axis key
(`PAINT_ZONE_KEY`) SHALL be distinct from any family-state context
key, and it is the ONE paint lane (the single-key law, Owner
2026-09-04: pre-adoption, no release ever shipped a second paint
key to be compatible WITH); nested zone scopes stack with the
nearest winning.

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

> The shared helpers
> `providePaintZone(variant: () => ZonePaintVariant | undefined)` and
> `getPaintZone()` (exported from `lib/paint.svelte.ts`;
> ZonePaintVariant excludes 'link' — link is PressButton's
> interaction exception, never a zone value, and has no second key to
> ride) SHALL write and read the one key (payload:
> `{ get variant() }`, getter-backed); ButtonGroup provides paint
> through the helper ONLY — BUTTON_GROUP_KEY carries layout state
> (orientation/separator) and NO variant; ButtonVariantScope is the
> sanctioned two-axis host: paint through the helper, and the physics
> texture axis's zone default (`raised`) on its OWN key
> (`PRESS_TEXTURE_KEY`, owned by press-button, outside this paint
> lane). Their variant props are ZonePaintVariant (a
> `<ButtonGroup variant="link">` is a compile error; link stays
> reachable through PressButton's own explicit prop); ButtonGroup's
> inherit-then-provide captures the parent zone eagerly via
> getPaintZone (the getDensityContext precedent — read before its own
> write); a parent variant flip SHALL re-derive every consumer in the
> same frame (reactivity assertion); the paint SLOT reads the zone
> key and TRUSTS the typed domain (ZonePaintVariant narrows at the
> provider; the values array is the gate's availability carrier, not
> a runtime guard — an out-of-family ambient value is not clamped and
> does not warn).

### Requirement: the context coverage gate

`verify:context` SHALL take
deterministic in-repo inputs and enforce FAMILY-LEVEL
coverage: (a) a family with style props has a Defaults object
covering them; (b) every slot value is a
registered slot factory call; (c) every consumer
file of a family with a Defaults object CONTAINS a
`XxxDefaults.resolve(` call AND contains NONE of the banned bypass
channels; (d) the paint family's values array matches the frozen availability table
bidirectionally.

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

> (`scripts/verify-context-coverage.mjs`)
>
> (registry items, parsed component
> sources, the exemptions whitelist
> `scripts/context-coverage.exemptions.json` with kinds
> `bindable`/`passthrough`/`no-style`/`provider`/`roadmap` —
> `provider` exempts ONLY the legacy-helper bypass check, never
> Defaults existence, slot coverage, or resolve presence; `roadmap`
> entries (prop + target axis + reason) carry the class-c props
> awaiting their axis — and the versioned detection vocabulary in
> `scripts/context-coverage.config.json`)
>
> (AST — resolved through a named slot
> constant's same-file factory-call initializer)
>
> (direct axis-symbol `getContext`, `resolveDensity`,
> `getDensityContext`, known scope reads) outside axis modules and
> whitelisted providers
>
> (the
> slot's first argument)
>
> (link stays PressButton-only)
>
> (or an explicit exemption)
>
> Per-prop dataflow
> beyond these clauses is OUTSIDE static decidability — the boundary
> is declared, not hidden, and belongs to code review. Output SHALL
> be machine-readable JSON plus a human list with exit codes; a
> `--scope=pilot` mode runs the pilot subset. The single
> full-enablement point is the final integration task.

### Requirement: native-controls governs every custom control (2026-08-29)

The Input component SHALL mount its custom controls by default for
every covered type. The bare `native-controls` boolean attribute
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

> — number (−/+ stepper in the prefix/suffix slot
> positions, spin pseudos hidden under `.jx-number-shell`),
> date/datetime-local/week/month/time (embedded Popover-API panels),
> color (Swatches editor).

### Requirement: the time stepper owns the hour format (Owner follow-up, 2026-08-29)

The TimeStepper SHALL end with one text-icon button cycling the hour
input scale 24h → AM → PM (default 24h; the glyph IS the current
mode). The mode is input-scale state only — committed values stay
24h "HH:MM" always.

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

> On 24h → AM/PM, hours > 12 drop by twelve (0 and
> 12 pass through untouched); on PM → 24h the hour climbs back by
> twelve (`(h % 12) + 12` keeps 12 PM at noon's 12); AM → PM flips the
> meridiem only. In AM/PM the hour cell steps and validates on the
> 1–12 ring (12 → 1). A mode crossing that changes no number commits
> nothing; an empty value flips the mode without seeding one.

### Requirement: the picker vocabulary renders through Intl (Owner follow-up, 2026-08-30)

The panels' locale-sensitive words — the calendar's month label and
weekday heads (visible + aria), the month grid's cells, the
date-picker's locale display format — SHALL render through
`Intl.DateTimeFormat`, never hand-rolled tables. A `locale` prop
(BCP 47) overrides; the default resolves the page's `<html lang>`,
else the browser language, else English (SSR-safe).

#### Scenario: a zh-CN field opens its panels

- GIVEN `<Input type="date" locale="zh-CN" />` opening on 2026-08
- THEN the nav reads `2026年8月`, the heads read 周一..周日 (aria
  星期一..星期日), and a month panel's cells read 1月..12月
- AND with no `locale` prop the page's `<html lang>` drives the same
  vocabulary; an explicit `locale` outranks it

> The LOCALE owns
> field order and spacing (one formatter — "August 2026" /
> "2026年8月", never concatenation); the committed values stay ISO
> always. Formatters cache per (locale, shape); the week vocabulary
> reads a Monday-first anchor week (2024-01-01) in UTC so output is
> deterministic in any runtime timezone.

### Requirement: the time stepper cells are slider-grade (Owner follow-up, 2026-08-30)

The TimeStepper's numbers SHALL show digits even when the value is
unset, and support pointer gestures: the wheel over a group
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

> (display-only 00:00; the commit stays undefined until the first
> interaction)

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
markup. Decorative icons render through the `<Icon>` component
(`@jixoai/icon`) with a type-safe `name: IconName` from the
generated `$lib/icon-set.gen` artifact; per-instance overrides ride
the component's `size` / `strokeWidth` props — never edited
geometry.

#### Scenario: a component hand-draws a lucide-style glyph

- GIVEN a registry component file
- WHEN an inline `<svg viewBox="0 0 24 24" fill="none"
  stroke="currentColor">` glyph appears in markup
- THEN it is a migration miss — the glyph belongs in the plugin
  library manifest

#### Scenario: a caret needs a heavier stroke

- GIVEN a component rendering `<Icon name="chevronDown" />` needing
  sw 2.5
- WHEN the call site passes `strokeWidth={2.5}`
- THEN the svg root carries stroke-width 2.5 and no wrapper-class
  override (`[&_svg]:stroke-*`) or manifest variant exists

#### Scenario: a typo'd icon name fails the type check

- GIVEN `<Icon name="chevronright" />` in a registry component
- WHEN svelte-check runs
- THEN the name fails against the `IconName` union (generated
  type-safety is the consumption law)

> Structural ornaments that are not icon-library glyphs
> (e.g. the tooltip caret polygon) are exempt from the icon component
> but MUST be declared in the change record. The `{@html icons.x}`
> string-bag consumption pattern is RETIRED (the icon-component-
> pipeline change).

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

> - `showTime` (v1: single mode ONLY; range + time is rejected) defines
>   the datetime state contract: canonical stored value
>   `YYYY-MM-DDTHH:mm` local wall-clock (no zone conversion), localized
>   display via `Intl`; the calendar mutates the date part, the
>   TimeStepper mutates the time part, and each preserves the other;
>   prebound datetimes restore day AND time.

### Requirement: combobox multiple commits an array through the bridge

`combobox` SHALL support `multiple`, binding `string[]`; submission
goes through the form-field bridge's MULTIVALUE mode: the consumer
sets `values: string[]` — MULTIVALUE bypasses the
string `value` attribute entirely; the bridge then constructs
`internals.setFormValue(FormData)` with repeated same-name entries in
selection order (`getAll(name)`), preserving form.reset() (back to
the initial array) and disabled-fieldset omission.

#### Scenario: a multi-select combobox in a submitted form

- GIVEN `<Combobox multiple value={[]} options={[...]} name="tags" />`
- WHEN two options are picked and the form submits
- THEN `FormData.getAll("tags")` returns the two values in selection
  order, the trigger shows two removable chips, and a later
  form.reset() restores the initial empty array

> (a property on the jx-form-field element, or
> its `setValues(values: string[])` setter)
>
> No joined-string
> channel exists in this mode — the FormData payload is the ONLY
> transport, and no value-rejection path exists. Selection renders via
> the chip law with per-chip removal;
> the panel declares `aria-multiselectable`.

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
degenerate data.

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

> (empty, all-negative, constant, NaN/non-finite,
> zero-total)
>
> — every part's render is a pure function of props, and
> those cases are unit-tested
>
> Every chart SHALL carry `role="img"`
> with a REQUIRED accessible name enforced by the type contract (label
> prop without a default), plus an opt-in visually-hidden data table
> fallback.

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
`registry/files/ui/pattern-<name>/`, mirrored to
`apps/www/src/lib/ui/pattern-<name>/`. A pattern SHALL compose
ONLY the atoms it lists as direct `registryDependencies` — it SHALL
NOT re-implement atom behavior, duplicate atom paint, or add props to
an atom (a needed prop change belongs to the atom's own family
change, recorded as a followup).

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

> (folder law unchanged; the prefix
> is a product namespace, NOT a new source root)
>
> with generated canonicalMain
> manifest entries verified by `verify:mirror`
>
> `verify:deps` compares
> target-resolved imports to those direct edges; resolver traversal
> owns only the transitive closure.

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

A surface component (dialog, popover, sheet) SHALL render the ZONES — the
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
when it paints. Composition SHALL belong in css (selector AND), not in
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

Inside a solid surface, a form control SHALL be an engraved WELL: the
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

### Requirement: the scrollable region is ONE shared system (the scroll-run unification, Owner 2026-09-04 “统一成一套”)

A horizontal overflow strip SHALL ride the shared `@jixoai/scroll-run`
item — the stamp machine, the law sheet
, and the DOM chrome — never a
family-local copy of any of the three. The run itself SHALL be the
scroller, the JS-stamped verdict

SHALL be the single truth every overlay gate keys on, and the
per-member edge factors (`--jx-edge-start/end`) SHALL be consumed
SQUARED by the css.

#### Scenario: tabs consumes the shared system

- GIVEN the tablist degrades to a scroll run when its triggers
  outgrow the strip
- WHEN the shared machine stamps the verdict and factors
- THEN the chips, the veil layer, and the ramp rules all come from
  scroll-run.css, tabs-trigger.css carries only its own tuning
  (the inset·2 lane, proximity snap, the inset·6 veil band), and the
  indicator rides the SAME `> *` ramp rules through the machine's
  `mirrors` wiring (no tabs-local fade rule exists)

#### Scenario: button-group consumes the shared system

- GIVEN a joined row declares `overflow='scroll'`
- WHEN the group root becomes the run
- THEN the frosted edge chips, the veil pair, and the `scrollEffect`
  builders behave identically to tabs — the family sheet carries
  NOTHING scroll-painted (a source-pinned negative test enforces it)

#### Scenario: a vertical run rides the same contract (round 2)

- GIVEN a strip declares data-axis='vertical' on its run
- WHEN the machine measures and the chrome mounts
- THEN the verdict and factors measure along the BLOCK axis (no RTL
  funnel — scrollTop is canonical everywhere), the chips place against
  the block edges — horizontally CENTERED (round 3) — painting the
  up/down glyph slots, the veil entrance and the ramp translate slide
  along the block axis, and the progressBlur ladder rides the block
  edges (top/bottom bands, the component's grid dialect — distinct
  from the shadow veil)

#### Scenario: content that cannot scroll paints no chrome — and the verdict follows the content

- GIVEN a run whose content fits (or shrinks to fit — members removed)
- WHEN the machine stamps or re-stamps (a childList MutationObserver
  watches membership)
- THEN the verdict is 'none' and BOTH chips and the veil layer stay
  gated out; no dead control lingers after the content retires the
  scroll distance

#### Scenario: the merged ramp() builder (round 2, breaking)

- GIVEN the retired trio slide()/blur()/blurSlide()
- WHEN a consumer picks a member treatment
- THEN it is ramp({ opacity, blur, translate, distance, radius }) with
  every toggle defaulting ON, each css property gated on its OWN
  data-ramp-* flag stamped by ScrollChrome (a toggle turned off never
  pays its property — ramp({ blur: false }) is the old cheapest
  slide), the magnitude vars (--jx-scroll-edge-slide/blur) are
  chrome-stamped on the run from the builder's distance/radius (round
  3 — a consumer never hand-writes them; a toggle off never sets its
  var), and custom chip content rides backwardContent/forwardContent
  snippets INSIDE the frosted buttons (frost, gating and the
  focusable-button law stay; the glyph layer retires and the content
  centers in the chip)

#### Scenario: four direction glyph slots; the chips sit in-board (round 3)

- GIVEN the chip glyphs were a start/end pair re-aimed per axis, and
  the chips tucked half-out against their edges
- WHEN a consumer wants to swap ONE arrow or re-place a chip
- THEN the host carries FOUR physical glyph slots
  (--jx-scroll-chevron-left/-right/-up/-down — one customization slot
  per direction, each swappable independently; the run's axis + the
  chip's logical edge + the page direction pick which slot paints, RTL
  swapping the inline pair), and the chips sit IN-BOARD by default —
  flush against the edge they serve, CENTERED on the cross axis (no
  negative-edge tuck margins), every placement rule riding
  zero-specificity :where() so a consumer override re-places them

#### Scenario: a chip can be DECLARED disabled (round 4; semantics finalized round 7)

- GIVEN a scrollable region whose consumer declares
  backwardDisabled/forwardDisabled (default rendered)
- WHEN the chrome mounts
- THEN the disabled chip does not render AT ALL — no DOM node, no
  paint, no a11y entry (consumer-declared absence) — while the
  verdict stays the AUTOMATIC gate for rendered chips (a dead
  direction or a cannot-scroll run never paints)

#### Scenario: a NEW scrollable region adopts the raw contract

- GIVEN any future strip (a chip rail, a palette row) needs overflow
  with edge treatment
- WHEN the consumer wires host + run hooks + ScrollChrome + ONE
  createScrollStamp effect
- THEN it inherits the verdict gating, the squared ramps, the RTL
  three-engine funnel, and the background-tab wake with zero family
  css of its own (the scroll-run docs page's live demo IS this
  contract, family-neutral)

> (`createScrollStamp`)
>
> (`scroll-run.css`)
>
> (`ScrollChrome`)
>
> (`data-jx-scroll-run` + `data-axis` on the strip element,
> inside a one-cell grid host)
>
> (`data-jx-scroll-state`: none | start-closed | end-closed | open)
>
> (the eased curve)
>
> Consumers keep ONLY their
> tuning (band widths, snap, mirrors onto companion elements).

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

### Requirement: the numbered line — Section declares the counter domain

Numbering SHALL be an explicit declaration on the line primitive, never
an implicit depth inference.

- A Section that declares `numbering` becomes THREE things at once: a
  numbered subtree root, the FLOAT
  COUNTER DOMAIN for every Figure in its subtree, and the reset point
  for descendant section counters.

#### Scenario: a section outside every domain is byte-identical

- WHEN any Section renders with no `numbering` declaration in its
  ancestry
- THEN its DOM equals today's output exactly — no number display, no
  `data-number` attribute

#### Scenario: the decimal tree and the float domain hang off one declaration

- WHEN a Section declares `numbering` and contains child Sections and
  Figures
- THEN the root renders its ordinal with `data-number`, undeclared
  children continue the decimal tree, and each Figure kind counts
  from 1 inside the domain

#### Scenario: the number's visible DOM is frozen

- WHEN a numbered Section renders
- THEN `data-number` sits on the section root element and the display
  number is a leading dedicated `<span data-jx-number>` inside the
  header's title node (not aria-hidden — "3.2 Methods" is the natural
  accessible heading text), asserted as full outerHTML
- WHEN the section is unnumbered
- THEN the span node does not exist at all

#### Scenario: the Section's id wires the root element and the registry alike

- WHEN a Section renders with `id="methods"` (numbered or not)
- THEN its outerHTML carries `<section id="methods" data-jx-section …>`
  and a SectionTargetEntry registers under `methods`
- WHEN a Section renders without an id
- THEN it still numbers (inside a domain) but the registry holds no
  entry — a Reference to it cannot resolve

#### Scenario: a nested domain restarts locally and never consumes a sibling ordinal

- GIVEN an outer root with a child that declares `numbering` of its
  own, followed by a sibling root of the outer
- THEN the inner root renders its LOCAL restart `1` (not its document
  registry position) with descendants `1.1`, the inner root is absent
  from the outer's SectionRecord set (outer numbering continues past
  it), and the following sibling root numbers `2` by document-order
  position

#### Scenario: renumbering follows a keyed reorder while the id never moves

- GIVEN two Figures with explicit ids under one declared domain,
  rendered through a keyed `{#each}` (component instances preserved,
  DOM nodes moved), and a Reference pointing at the second
- WHEN the array order is reversed
- THEN each keeps its id, swaps its display number and `data-number`,
  the renumbering is driven by the DOM-mutation signal (not by
  unmount/remount), and the Reference's rendered value follows the
  target's new number in the same settle

#### Scenario: sibling root domains number by document order

- GIVEN two sibling Sections each declaring `numbering` (the
  handbook main path — one root per chapter)
- THEN the roots receive ascending chapter ordinals by document
  order and each domain's floats count independently from 1

#### Scenario: the document-scope exception counts across domains

- GIVEN two declared domains that BOTH set
  `floatScope={{ equation: 'document' }}` and both contain equation
  Figures
- THEN the document-scoped counter is unique per document for that
  kind, iterating only the participating domains in document order,
  while every other kind keeps its per-domain counters (mixed
  regimes coexist, never added); a domain that declares no document
  scope for the kind does not participate

#### Scenario: a nested declaration shadows the outer domain

- WHEN a Section inside a numbering domain declares `numbering` of
  its own
- THEN its subtree forms a new domain: descendants number within the
  inner tree and its Figures belong to the nearest declaring
  ancestor — the outer float counter never crosses in

> (it receives a chapter ordinal)
>
> (the decimal tree `3 → 3.1 → 3.2 →
>   3.2.1`)
>
> Descendant sections need NO declaration of their own —
>   inside a domain they receive numbers; the byte-identity guarantee
>   applies ONLY to sections outside every numbering domain subtree.
>
> - Section addressing is wired at the line: an optional `id?: string`
>   prop lands verbatim on the section root element (`<section
>   id="…">`, asserted in outerHTML alongside `data-jx-section`) and
>   registers a `SectionTargetEntry` under the SAME id; a Section
>   without an id still numbers but produces no registry entry (not
>   referenceable — same law as Figure's optional id).
> - Counter resolution is a DOM-derived AUTO mode and SHALL claim the
>   family-context law's existing auto-mode exception (state-sharing
>   context otherwise carries state and behavior, never membership
>   order): ordinals derive from `compareDocumentPosition` order over
>   a reactive registry driven by the TWO-LEVEL revision matrix — the
>   domain-root observer bumps `domainRevision` (in-domain members and
>   positions; sibling-root order, root moves, and document-scope
>   participants invalidate through `documentRevision`, bumped by the
>   document-level domain registry's observer) — registration order
>   NEVER assigns numbers, and DOM mutation is the ONLY renumbering
>   signal. The claim splits by
>   shape: Reference resolution rides the exception's shell-plus-
>   hydration form (forward references render the fallback in
>   prerender, hydrate to the resolved form), while Figure numbering
>   is SSR-complete (instantiation order = template order = static
>   DOM order; hydration's first frame MUST match the SSR output) and
>   touches the exception's class only through incremental renumbering.
>   CSS counters are a forbidden implementation (print-fragmentation
>   rewrites them and their values never reach the DOM); a number must
>   land as DOM text plus `data-number`.
> - `floatScope` configures counter continuity per Figure kind at the
>   DOMAIN level only: every kind defaults to `'chapter'`; `'document'`
>   is the explicit exception (the ASME equation idiom — one counter
>   per document per kind, iterating only the domains that declare it).
>   A per-Figure-instance scope declaration is a forbidden shape.
> - Numbers are the display currency of DOM order: reordering
>   renumbers, and addressing ALWAYS rides an explicit `id` — a number
>   is never an address (the upgraded Paged* ruling).

### Requirement: Figure — the 浮 primitive renders number, caption, and the manual backlink lane

The numbered, captioned, referenceable floating unit SHALL be a wrapper
primitive named by its DOM contract.

- `<Figure kind>` renders `<figure data-jx-figure={kind}>` with a
  `<figcaption>`; any point
  nests in the content slot, keeping its own kind marker.

#### Scenario: the manual lane renders what the author declares

- WHEN a Figure declares `citedIn={['§ 3.1', '§ 5.2']}`
- THEN the caption tail renders those strings and the tail node
  carries `data-cited-in` (the harvest marker — one name everywhere,
  never `data-jx-cited-in`) with the JSON array as its payload
- WHEN `citedIn` is absent or an empty array
- THEN no `data-cited-in` node or attribute renders and no
  backlink-only registration runs — while the Figure's normal
  numbering-domain and target registration still run (the gap is the
  documented default, not a registration opt-out)

#### Scenario: an undomained Figure stays usable but unnumbered

- WHEN a Figure renders with no `numbering` declaration in its
  ancestry (a bare demo page, an external consumer)
- THEN it renders its content and `data-jx-figure`, carries no number
  or `data-number`, and a dev warning names the escaped domain

> (CodeCard today, the R6 industry points as
>   they land)
>
> (label + resolved number + caption slot)
>
> — the line carries
>   structure, the point carries industry semantics, and the HARVEST
>   projection hangs the number on the wrapped point's block (the
>   wrapper never becomes a block of its own)
>
> - `kind` values this round: `figure | table | equation | listing`;
>   the value domain is the harvest registry, open to R6 extension.
>   Display words are hardcoded English defaults this round; the
>   customization axis (word/locale/number format) belongs to the R5
>   preset round.
> - `id` is optional: a Figure without an id still numbers (display
>   currency) but is not referenceable — stable addressing is the id's
>   job, documented at the prop. A Figure outside every declared domain
>   renders unnumbered with a dev warning (explicit structure; no
>   implicit sniffing).
> - `citedIn?: string[]` is the MANUAL backlink lane (Owner 2026-09-04):
>   explicitly declared display strings render verbatim in the caption
>   tail and emit `data-cited-in` as a JSON array. The component header
>   MUST document the GAP: automatic backlink RENDERING is deliberately
>   absent — the automatic backlink lives only in the harvest layer
>   (the inversion of the reference points' `refids[]`); the static
>   strings do not follow reordering (a stale `§ 3.1` after a swap is
>   the pressure that motivates the return); the re-entry condition is
>   a genre that actually prints a cited-at list (then:
>   reverse-registration context, pure increment).

### Requirement: Reference resolves its display grammar from its target

The typed cross-link SHALL carry zero grammar knowledge of its own.

- `<Reference to>` resolves through a DOCUMENT-LEVEL registry — a
  `TargetRegistry` INSTANCE created per route page
 .

#### Scenario: the five target states resolve each in its own grammar

- WHEN a Reference targets an equation Figure, a numbered Section, an
  unnumbered target, a nonexistent id, and a forward-positioned
  equation Figure (in that order)
- THEN they render `Eq (4.5)`, `§ 3.2.1`, the target's title, the
  visible `??(id)` marker with one console warning and no settled
  `data-ref-to`, and `Eq (4.5)` after hydration — while the
  prerendered forward form reads `??(id)` carrying its `data-ref-to`
  edge claim without a settled warning

> (`createTargetRegistry()` + `setContext` at the page root; never
>   the root/docs layouts, which outlive routes and would leak
>   prior-page ids; the registry dies with the page component on
>   navigation, collapsing every reference to the missing state with
>   no dangling warnings)
>
> Entries are a real discriminated union
>   with derived fields registered as ACCESSOR THUNKS (read-on-call
>   values, reactive inside `$derived` — never registration-time
>   snapshots): `FigureTargetEntry { id, kind: 'figure', number: ()
>   => string, title: null }` and `SectionTargetEntry { id, kind:
>   'section', number: () => string | null, title: () => string }`.
>   `registry.registerTarget()` returns an idempotent disposer; a
>   duplicate id warns in dev with the FIRST live registration the
>   winner, the earliest still-live candidate promoted in the same
>   settle when the winner disposes, and the target returning to the
>   missing state when the last entry disposes. Section/Figure/
>   Reference share ONE cross-domain move model: moves happen only
>   through Svelte instance destroy-and-rebuild — unmount disposes
>   (the old domain stops counting, the registry entry vanishes),
>   remount re-registers in the new domain; observer bumps recompute
>   ordinals but never migrate registry ownership. The rendered form follows the
>   TARGET: a Figure renders per its kind (`Eq (4.5)` / `Fig 2-3` /
>   `Table 6-1` / `Listing 3`), a numbered Section renders `§ 3.2.1`,
>   an unnumbered target renders its title (no connective — author
>   prose rides the children lane). Change the target's kind, chapter,
>   or order and every reference follows automatically — the follow is
>   gate-asserted (reorder scenario below). Referenceable targets:
>   numbered Figures and Sections (numbered or not); a bare id element
>   and an unnumbered Figure are NOT referenceable this round (both
>   resolve as the missing-id fallback).
> - Forward references (the target renders later) are a distinct state
>   from a missing target: the registry is reactive, so a late-registered
>   target is adopted automatically, and the warning fires only when
>   the target is still absent after settle. In SSR/prerender the
>   forward reference renders the fallback marker (single-pass
>   rendering cannot see ahead) and hydration follows to the resolved
>   form — this shape difference is the honest cost of display-currency
>   numbering under one-way rendering and is pinned by scenario.
> - A missing target id is a loud fallback: `console.warn` (never
>   dev-gated — prerender builds must surface broken references) plus a
>   visible `??(to)` marker rendered in production too; never a throw,
>   never a blocked print. Edge emission splits by state (Owner ruling
>   P1-4=A, 2026-09-05): the SSR/prerender FALLBACK of a not-yet-
>   registered target still carries `data-ref-to` (not-yet is not
>   missing — the static edge claim feeds the harvest's document-wide
>   pre-pass), while a reference still missing after settle drops its
>   `data-ref-to` (dead anchors are a filed bug class; the harvester's
>   target index filters edges whose target never exists).
> - The reference emits its forward face (`data-ref-to`) for the
>   harvest contract's `refids[]` — the attribute value is a SINGLE id
>   string under standard HTML serialization (no JSON, no compound
>   value; the harvester reads it directly).

### Requirement: mode vocabulary is a localization payload (theme-toggle)

The theme-toggle's user-facing strings — the three mode labels and the
full variant's group accessible name — SHALL be localizable through ONE
optional `labels` prop.
Absent, the prop SHALL resolve to the English literals shipped to date
; present, every
rendered label and the group's `aria-label` localize while the internal
value domain (`light | dark | system`) and the localStorage `theme`
contract stay untouched.

#### Scenario: a bilingual site localizes the toggle

- GIVEN a zh page mounting `<ThemeToggle variant="full" labels={{ light: '浅色', dark: '深色', system: '系统', groupAriaLabel: '配色主题' }} />`
- THEN the segmented options render the zh labels and the group's
  aria-label reads 配色主题
- AND clicking 系统 still writes `theme=system` to localStorage (the
  value domain is never localized)

#### Scenario: the prop stays inert by default

- GIVEN a mount with no `labels`
- THEN the rendered labels are exactly `light` / `dark` / `system` and
  the group aria-label is `Color theme` — no observable difference from
  the pre-prop component

> (`{ light, dark, system, groupAriaLabel? }`, the
> type exported beside the component; consumer-feedback-fixes, 2026-09-06)
>
> (byte-identical render, aria, and storage behavior)
>
> Labels are presentation vocabulary (a
> localization payload), never structure — this is not a
> composition-first exception.

### Requirement: the locale switch owns its persistence contract (language-switcher)

The language-switcher SHALL persist the consumer's locale choice
itself (consumer-feedback-fixes, 2026-09-06): every locale anchor click
(pair and menu variants) writes the target locale's code to
localStorage under the key `lang`, wrapped in try/catch.

#### Scenario: a locale link persists the choice

- GIVEN a menu-variant switcher with a `ja` entry
- WHEN the entry's anchor is clicked
- THEN `localStorage.getItem('lang')` returns `'ja'`
- AND the browser still follows the anchor's href (no preventDefault)

#### Scenario: hostile storage never breaks the switch

- GIVEN a consumer where `localStorage.setItem` throws
- WHEN a locale anchor is clicked
- THEN the error is swallowed and navigation proceeds

> (storage may be
> unavailable — private mode, quota; the failure is silent and navigation
> proceeds)
>
> The write is the COMPONENT's half of a two-party contract: a
> site's language-negotiation bootstrap reads the same `lang` key server-
> or boot-side; the key name is the frozen seam and is documented in the
> component header. Navigation SHALL stay a pure anchor navigation (href +
> hreflang per entry) — persistence rides the click, never a
> click-prevention or client routing takeover, so prerendered/SSG sites
> keep working.

### Requirement: hero-section's copy payload is snippet-conditional

hero-section's `copyCommand` SHALL be required exactly when that default CTA renders
(consumer-feedback-fixes, 2026-09-06): when the consumer provides a
`#copy` snippet that replaces the default CTA wholesale, `copyCommand`
SHALL be optional (absent → unused). The Props type encodes the
condition; the header, registry docs, and docs page state it. This is
the composition-first payload rule made precise for the one prop whose
consumer only exists when its snippet escape is not taken.

#### Scenario: a hero with a bespoke CTA

- GIVEN `<HeroSection eyebrow=… summary=…>{#snippet copy()}…{/snippet}</HeroSection>` with no `copyCommand`
- THEN the component type-checks and the bespoke snippet renders in
  place of the default copy button

#### Scenario: the default CTA still demands its payload

- GIVEN a hero without a `#copy` snippet
- THEN omitting `copyCommand` fails type checking (and the default CTA
  renders the command as label + clipboard payload when provided)

> (the clipboard payload of the DEFAULT copy
> CTA)

### Requirement: the math surfaces render server-side synchronously (math-block / math-inline)

The math surfaces SHALL render real KaTeX markup synchronously —
during SSR/prerender AND on every prop change — with no plain-text
floor and no hydration upgrade. The TeX source SHALL be a
runtime prop (`tex`), never markup-inlined text; `{@html}` carries
only engine-generated markup. Theming SHALL ride inherited color and
tokens — KaTeX output inherits `currentColor` and the error paint
binds a token, so light/dark inversion needs ZERO re-render. Both

#### Scenario: a prerendered page bakes real math

- GIVEN a prerendered page with `<MathBlock tex="e^{i\pi} + 1 = 0" />`
- THEN the served HTML contains the rendered `.katex` markup (spans
  and MathML), not a plain-text formula
- AND no hydration-time repaint of the formula occurs

#### Scenario: dark mode inverts with zero re-render

- GIVEN a rendered math surface in light mode
- WHEN the site flips to the dark theme
- THEN the formula's ink inverts through inherited color with no
  engine call and no DOM rewrite of the formula

#### Scenario: broken TeX paints in place

- GIVEN `<MathBlock tex="\frac{" />`
- THEN the erroneous source paints inside the same box in the error
  token color, one console.warn carries the katex diagnostic, and no
  error panel replaces the surface

#### Scenario: the copy control localizes and stays reachable

- GIVEN `<MathBlock tex="…" labels={{ copy: '复制', copied: '已复制' }} />`
- THEN the control renders 复制 and the copied feedback 已复制, the
  clipboard payload stays the raw TeX source (the value domain never
  localizes), and the button remains a discoverable interactive node
  beside the `role="math"` wrapper (the figure keeps native semantics)

#### Scenario: consumer attributes land on the root

- GIVEN `<MathInline tex="a^2" data-testid="eq" title="Pythagoras" />`
- THEN the span carries the testid and title and the katex markup
  renders unchanged

#### Scenario: the scroll verdict comes from the shared machine

- GIVEN a math-block whose formula overflows its run
- WHEN hydration arms the stamp machine
- THEN the run carries `data-jx-scroll-state` from the shared
  `createScrollStamp` (start-closed while scrolled to origin, open in
  transit, end-closed at the end) and the shared ScrollChrome paints
  its veil from that verdict — no family-local scroll chrome exists

> This is the recorded lane ruling for
> isomorphic-small engines: code-card's floor→upgrade contract answers
> heavy, lazily-loaded engines (shiki's late chunks); a math mount that
> painted a plain-text floor would flash on every hydration, so the math
> lane bakes real markup server-side — strengthening the family-context
> law ("SSR output is semantically complete before hydration") and the
> native-element-first hydration-cost ceiling.
>
> surfaces SHALL honor the rest-attributes contract (consumer
> `data-testid`/`title`/`aria-*`/handlers land on the root; the
> component's own `data-jx-*` and role stamp AFTER rest). `math-inline`
> owns no chrome and no controls — its single span carries `role="math"`
> (content-only, nothing to flatten). `math-block` keeps NATIVE figure
> semantics — `role="math"` lives on the inner wrapper that carries only
> the KaTeX output, so the copy control stays a discoverable interactive
> node; the wide-equation strip rides the FULL scroll-run trio
> (`createScrollStamp` armed in an effect with destroy cleanup, the
> shared law sheet, and `ScrollChrome` — the machine owns the
> `data-jx-scroll-state` verdict; never a family-local copy). The copy
> control SHALL follow the localization-payload law (`labels`, absent =
> shipped English verbatim) and the press physics. Errors SHALL paint in
> place (`throwOnError: false` default, errorColor token) with one
> console.warn diagnostic — no error chrome; a caller-forced throw is
> caught by the surface (raw source + warn), never escaping the
> component boundary. The accessible path SHALL be KaTeX's hidden MathML
> (shipped by the `htmlAndMathml` default); no default `aria-label` may
> shadow it.

### Requirement: the diagram surface keeps the source-first floor (mermaid)

The mermaid surface SHALL follow the code-card progressive-enhancement
contract: prerender paints the escaped diagram source as a readable
plain-text floor (zero JS), and after hydration the lazily-loaded
engine (a code-split singleton — the engine never rides a page's
critical path) swaps the rendered, sanitized SVG into the same box.

#### Scenario: the floor upgrades after hydration

- GIVEN a prerendered page with a mermaid diagram
- THEN the served HTML shows the diagram source as escaped plain text
- AND after hydration the engine chunk loads and the rendered SVG
  replaces the floor inside the same box (fade-in, reduced-motion
  respected)

#### Scenario: the site theme flip re-renders the palette

- GIVEN a rendered diagram in light mode with `theme="auto"`
- WHEN the root element's `dark` class toggles on
- THEN the diagram re-renders with themeVariables re-derived from the
  dark tokens (the SVG's baked colors change; the source does not)

#### Scenario: concurrent instances never cross wires

- GIVEN two mermaid instances mounted together, one light-pinned and
  one dark-pinned
- WHEN both render
- THEN each SVG comes out in its own theme with distinct ids (the
  engine's serial queue ordered the initialize/render pairs)

#### Scenario: a hostile config cannot break the floor

- GIVEN `config={{ securityLevel: 'loose', startOnLoad: true, theme: 'dark' }}`
- WHEN the engine initializes
- THEN startOnLoad stays false, securityLevel stays strict, and the
  theme stays base with the token-derived palette (protected fields
  survive; the rest of the config merges below)

#### Scenario: a parse error keeps the floor

- GIVEN a diagram whose source fails mermaid's parser
- THEN an error summary strip paints above the standing source floor
  and the surface never blanks

#### Scenario: zoom transforms without re-rendering

- GIVEN a rendered diagram
- WHEN the zoom-in control is pressed
- THEN the inner wrapper scales and the viewport becomes the pan
  surface, with no engine call, no SVG regeneration, and no shared
  scroll chrome inside the viewport

> Effect discipline SHALL match the code-card generation law: prop
> changes drop the previous paint booking, out-of-order resolutions
> no-op, and the floor shows the CURRENT source while a render is in
> flight; render ids SHALL follow the engine's collision contract (a
> per-instance monotonic base + per-render suffix — two instances,
> same-named instances, and consecutive re-renders never share a live
> id), and the engine's serial queue SHALL order initialize/render
> pairs so concurrent instances with different themes never interleave.
> The surface SHALL pass its own container as the engine's theme root
> (scoped containers — a `.jx-light` stage, a dark panel — resolve THEIR
> tokens, never the page's). `theme="auto"` (the default) SHALL follow
> the theme flip across the container's ENTIRE effective scope — a
> class observer filtered to the container ITSELF plus its current
> ancestors catches a scope class flipping on either (the figure
> directly, or an ancestor `.jx-light`→`.dark`) even when the document
> root never mutates — re-reading the live
> computed tokens after the change and re-rendering with re-derived
> themeVariables, with every observer disconnected on cleanup; an
> unrelated element's class change triggers nothing; an explicit
> `light|dark` SHALL pin the palette to the TARGET sheet's values, read
> through a temporary local probe wrapper under the same theme root
> (never a global class mutation — a light page with `theme="dark"`
> renders the dark sheet's colors). The engine's protected fields
> (startOnLoad:false,
> securityLevel strict, theme base) SHALL survive any consumer config —
> user config merges BELOW them, and user themeVariables merge
> field-wise over the derived palette. Controls SHALL cover the Owner
> minimum (copy source + zoom in/out/reset) under the press physics and
> the localization-payload law; zoom is a pure transform on the
> viewport's inner wrapper (no engine re-render). The zoom-pan viewport
> is a RECORDED scroll-run exemption: a two-axis pan surface for scaled
> content is not a linear overflow strip (the unification contract
> models one axis per run with linear nudge chips), so the viewport
> rides the scrollbar-token law (thin currentColor thumbs, both axes)
> and MUST NOT mount the shared chrome (no run, chips, or veils inside).
> The floor box reserves `min-height: var(--jx-mermaid-floor-min, 6rem)`
> while unrendered — a consumer-tunable token bounding the layout
> shift. A render failure SHALL paint an error summary strip and KEEP
> the source floor standing. The first render fades in, killed under
> `prefers-reduced-motion`. The surface SHALL honor the
> rest-attributes contract (rest spreads on the figure before the
> component's own stamps); the viewport SHALL carry `role="img"` with a
> NON-EMPTY accessible name at ALL times — the trimmed ladder
> `name?.trim() || labels?.diagram?.trim() || 'Diagram'` (an empty or
> whitespace `name` falls through; a nameless diagram never mounts a
> nameless img).

### Requirement: the structural kernel law (four layers, stickers, and the attach test)

Surface-bearing components SHALL organize into four layers with ONE
implementation per layer: (4) floating mechanisms own top-layer, focus, Escape, scrim, entry/exit motion and
surface material — and NEVER grow structural flesh; (3) the Card
structural family is the ONE
implementation of the three-band interior; (2) ButtonGroup is
the ONE layout component for joined member rows; (1) skin is
contextual: `<Card>` root for planar surfaces, the jx-surface material
for floating ones.

#### Scenario: a floating surface renders the Card interior

- GIVEN a Dialog open with title and footer content
- THEN its interior host carries `data-jx-card` (not a Card
  component), the × rides `.jx-card-end-action-slot`, the body is a
  CardBody with the gutter-compensation cell, and the surface material
  rules paint unchanged — no Card skin (border/bg/shadow) exists
  inside the dialog

#### Scenario: any element wearing the sticker gets the ruler

- GIVEN an arbitrary element stamped `data-jx-card` with CardHeader/
  CardBody/CardFooter children
- THEN the five named columns and three-band rows apply server-side
  (no runtime attachment, no flash), and the 15rem reversal works
  through the inherited `jx-card` container

#### Scenario: the attach test classifies a concern

- GIVEN a proposed `tooltip(element)` attachment and a proposed
  "card-grid" structural attachment
- THEN the tooltip (measures the element on screen) is an attachment;
  the structural grid (exists at render time, SSR-complete) is a
  declarative attribute — wrapping it in `{@attach}` fails review

#### Scenario: an action band quiets its buttons

- GIVEN a bare PressButton inside a Card/Dialog foot band or a
  code-card/canvas action row wrapped by the band's
  ButtonVariantScope
- THEN it renders ghost on the flat texture with zero per-button
  props, an explicit variant/raised still wins, and no hand-drawn
  outline button (border/bg utilities + shadow-suppression vars)
  remains in any action band

#### Scenario: joined members compose, loose members are utilities

- GIVEN foot actions rendered through CardFooter
- THEN the buttons join ONE ButtonGroup with the leading seam
  (the one layout component); a caller arranging loose buttons
  anywhere writes plain flex/gap utilities — no wrapper component
  for free-floating arrangement exists in the registry

> (Dialog, Sheet,
> Popover…)
>
> (CardHeader / CardBody / CardFooter)
>
> (head/body/foot placement,
> band separators, foot action assembly, band zones)
>
> — free-floating
> arrangement is plain utilities (no component wraps it)
>
> STRUCTURE IS A STICKER: the `data-jx-card`
> attribute family + card.css rule set IS the ruler (five named
> columns, three rows with the body row as sole absorber, the `jx-card`
> container) — any element carrying `data-jx-card` acquires the whole
> grid, server-rendered, by CSS alone; a floating surface's interior
> host stamps the attributes instead of nesting a Card (the
> `.jx-card-end-action-slot` seat, reserved since 2026-09-03, is where
> Dialog's × rides). The 15rem narrow reversal is the ONE native
> `@container jx-card` query (card-footer.css) — every carrier of the
> sticker inherits it. THE ATTACH TEST (ruling, 2026-09-09): a concern
> that must WAIT for the element to be on screen (measuring, listeners,
> external libraries) uses `{@attach}`; a concern that exists at render
> time (attributes, styles, semantics) is written declaratively —
> attributes and classes that are present in SSR output; wrapping pure
> CSS capability in a runtime attachment is a violation. THE ACTION-ZONE
> LAW: every component's action bands (head/foot/dock button areas)
> carry their own ButtonVariantScope from the band skeleton — head
> ghost, foot ghost+flat — so bare PressButton/IconButton members (and
> raw-snippet content) render quiet by default while explicit props
> always win; a component author NEVER re-derives this per surface.
> ButtonBar is RETIRED with this law (2026-09-09): a component exists
> to carry a law, not a convenience — it had none of its own (zone
> belongs to the bands, flex belongs to utilities).

### Requirement: the press-button rest lane (attribute passthrough)

PressButton and IconButton SHALL pass arbitrary attributes through
VERBATIM onto the control root: the Props interface extends
HTMLAttributes with the family's typed channels omitted, `...rest` spreads FIRST in the markup
with component-owned stamps expanding after (the replacement
semantics of the stamped-attribute law). IconButton forwards its rest
lane into the wrapped PressButton.

#### Scenario: a stamp rides the lane onto the control root

- GIVEN an IconButton carrying `data-jx-canvas-reset` and a title
- THEN both attributes land on the rendered button root itself — no
  intermediate wrapper element exists, and a delegated
  querySelector/click reaches the real control in one hop

#### Scenario: rest never fights the family channels

- GIVEN a PressButton receiving `aria-label="x"` through spread props
- THEN it does not compile — the lane is omitted from the rest
  contract and the ariaLabel prop owns the channel (a rest-borne
  undefined can never strip the family's value)

> (onclick, class,
> style, type — and aria-label, whose single lane is the ariaLabel prop
> / IconButton's text)
>
> (button or anchor — the shared
> HTMLElement contract)
>
> Consequences: semantic stamps
> (`data-jx-canvas-reset`, `data-jx-sysdlg-cancel`, valued variant
> stamps) ride the lane onto the root with NO wrapper element; a
> consumer's `data-testid`/`title`/`aria-*` land unmodified; the
> wrapper-span hack for unstampeable buttons is retired with this law.

### Requirement: the borderless-chrome law (no framed controls inside a bounded surface)

Inside a surface that already carries its own clear boundary (a
border, a material edge — the canvas dock, a floating panel), a
control SHALL NOT add a second frame of its own: boxes inside boxes
read catastrophic (Owner, 2026-09-09: "在一个有明确边界的这种组件
内，尽量不要再出现有 border 的控件，在视觉上会带来灾难性的
问题"). The affordance carries itself: ghost cells under the zone,
hover wash, the active option's fill, the focus ring. The

#### Scenario: the dock's inner controls carry no frames

- GIVEN the playground dock's control rows (a segmented option set,
  a stepper trio, the output projection rows)
- THEN none paints a control frame — the segmented options read as
  ghost cells with the active option filled, the stepper reads as
  three borderless cells around the mono value, and the output rows
  band by tint alone

> control-chrome axis ('bare') is the form lane's expression of the
> same law; decorative SEPARATOR lines between controls are not frames
> and stay legal (the law bans control borders, not boundaries).

### Requirement: the system trio (alert · confirm · prompt on the one alert engine)

The system-dialog family SHALL carry the window.alert /
window.confirm / window.prompt roles through an imperative trio
: each call mounts one host composition of
the family parts at the CENTER pose — Content's pose="center" drops
the anchor chain
and the UA popover centering owns the panel. Resolution is EXACTLY
ONCE: an affirmative action resolves its value, any close without an action
resolves the cancel value; the mount unmounts after
the exit window so the animation plays out.

#### Scenario: confirm answers through a promise

- GIVEN `const ok = await confirm('delete?')` with the panel open
- THEN the Action click resolves true, the Cancel click and Escape
  both resolve false — never a hang, never a double resolve

#### Scenario: prompt returns the typed answer

- GIVEN `const name = await prompt({ title: 'rename' })` with text
  typed into the input
- THEN Enter (or the submit action) resolves the string; Escape
  resolves null

#### Scenario: the system panel is centered, not anchored

- GIVEN a trio-mounted panel
- THEN Content carries pose="center" — no position-anchor chain; the
  UA's popover centering (margin auto, fit-content, inset 0) owns
  the geometry, the window.confirm posture

> (`alert()`, `confirm()`, `prompt()` from the family index; a bare
> string fills the title)
>
> (a system question has no trigger to rise beside)
>
> (void / boolean /
> string)
>
> (false / null)
>
> (Cancel, Escape, programmatic)
>
> Focus: the choice
> postures land on Cancel (the APG safe-landing law); prompt lands on
> its input (the answer is the task) and Enter submits through the
> host's keydown. The prompt input rides the Input component at bare
> chrome (the borderless-chrome law).

### Requirement: the corner context (publish the container's corner, never clip)

A surface with a rounded corner SHALL publish it as an inherited lane
— `--jx-corner` (css custom-property inheritance, the platform's own
context mechanism, SSR-pure) — and any inhabitant sitting FLUSH in
that corner pairs concentrically (`border-*-radius:
var(--jx-corner, 0px)`) instead of poking past the curve.

#### Scenario: the split strip's end cells ride the panel's corner

- GIVEN the system dialog's action strip inside its 8px-corner panel
- THEN the first cell's end-start radius and the last cell's
  end-end radius resolve to the published --jx-corner (measured 8px,
  concentric with the panel), the fill rung's corner no longer pokes
  past the panel's curve, and no overflow clip exists anywhere on
  the surface

#### Scenario: the kernel's cluster pairs the same lane

- GIVEN a CardFooter cluster's end cell inside any surface
- THEN it carries border-end-end-radius: var(--jx-corner, 0px) —
  0px and visually unchanged in square surfaces, concentric the
  moment a surface publishes a corner (the reversal's full-bleed
  start cell pairs end-start the same way)

> Clipping
> the surface (overflow: clip) is RULED OUT (Owner, 2026-09-09, the
> mobile-dev lesson): a clip shears the engrave inner shadow along
> with the overflow, while a button's own radius lets the shadow — and
> the press law — follow the curve natively. The lane is INERT
> wherever no provider exists (the 0px fallback keeps every square
> surface exactly as it was).

### Requirement: the carved action band (the carved-cell law generalized to any surface)

An action band is a CARVED REGION, never a floating row. Wherever a surface mounts a
bar of actions — a foot band, an anchored alert's action strip, a
floating dock's reset row — it SHALL render CardFooter as the
content face (standalone mirror when the host carries no card
ruler): the buttons fill the band vertically edge-to-edge, the cluster rides the inline end flush, and there is
NO padding-block whitespace around the buttons. The host surface

#### Scenario: a sheet footer carves its cluster

- GIVEN an open sheet whose footer snippet renders `<CardFooter>`
- THEN the cluster spans the band to the panel's inline end, its
  buttons stretch the full band height from the rim Separator to
  the panel's bottom edge — no padding whitespace above or below
  the buttons, the leadingSeam is the cluster's left edge

#### Scenario: an anchored alert's strip carves without a ruler

- GIVEN an SystemDialogActions strip (a popover-sized surface that
  rents no banded ruler)
- THEN its Cancel and Action render as ONE full-width ButtonGroup
  whose columns are minmax(auto, 1fr) — the buttons SPLIT the strip
  evenly (a long label may widen its column; the macOS system-alert
  posture), each fills the strip's height, the inter-button seam is
  the 1px hairline (never a gap), and the rim above is a REAL
  Separator instance — the same contrast-ghost ink engine Dialog's
  riding separators paint, never a border-t token line (the ink-law
  parity ruling, 2026-09-09 round 3)

#### Scenario: a chrome bar quiets into the same band

- GIVEN the canvas dock's head row (the drag bar: grip, theme
  toggle, density select, collapse chevron — buttons AND a select)
- THEN the row rides the same carved treatment: the zone quiets
  every press control (ghost + flat, zero hand borders — the
  ButtonBar spirit), controls stretch to fill the band with no
  padding float, the body's rim line below closes the band, and
  FOUR vertical Separators seam EVERY cell boundary — grip|theme,
  theme|select, the select's trailing edge, and the toggle group's
  leading edge, the elastic breathing bracketed between two whisper
  lines (r11) — at the DEFAULT FUSED INK, zero color tokens (the
  Owner-confirmed law, r9: a toolbar seam is a visual aid — it
  whispers; on the dock's uniform acrylic the subtraction reads a
  few 255ths and that subtlety IS the correct practice, "这就是更
  正确的最佳实践"); the one non-press cell rides the FAMILY's
  NativeSelect at bare chrome (r12: never a hand-rolled raw select —
  the designed chevron and control-lane insets are the component's),
  its lane DRIVERS scoped to the chrome's own rhythm
  ([--jx-icon]/[--jx-inset], r14: consumers scale the tokens, never
  the lane — the reservation itself stays the component's calc)

#### Scenario: a non-footer bar uses the same band

- GIVEN the canvas playground dock's reset row (not a footer — a
  floating control panel's last row)
- THEN the reset control renders as the same carved band (bleeding
  to the dock's edges, rim line above, the icon button filling the
  band) — one form serves every action bar

> (Owner
> 2026-09-09: "button 没有在纵向上铺完整个 footer，也没有合理的
> 分割线……padding 留白，这会令人困扰")
>
> (the rim
> line above IS the band's top edge, the group's leadingSeam IS the
> carved left edge, the block height IS the band — min-h a floor,
> never a cap)
>
> owns the bleed craft (negative margins escaping its own padding,
> the rim line) — CardFooter stays geometry-pure. Loose self-padded
> action rows (gap + py utilities wrapping zone buttons) are retired
> with this law; a bar that is not a button cluster keeps whatever
> non-action geometry it legitimately needs.
> THE RAW-FOOT FAIL-SOFT (issue #7, 2026-09-10): a RAW foot snippet's
> bare children — anything that is not a known seat — default to the
> ruler's content span, end-justified (never auto-placed into the
> inset tracks where they squeezed to clipped slivers): the "wrap me
> in CardFooter or own the ruler" contract breaks VISIBLE, never
> broken. One rule, every surface carrying the foot zone (Card,
> Dialog, Sheet).

### Requirement: the anchored-alert form (system-dialog's flesh ruling)

The anchored popover surface is NOT a banded
panel: its Title rides the content flow, its action strip escapes the
body padding through negative margins — a popover-sized surface rents
no banded ruler, and full dialect adoption would be dogma, not law
. What the form SHALL shed
is RECIPE DUPLICATION: SystemDialogAction and SystemDialogCancel render
PressButton with the family's single local
addition preserved.

#### Scenario: the confirm keeps its destructive default on the one ladder

- GIVEN a bare `<SystemDialogAction>delete</SystemDialogAction>`
- THEN it renders PressButton at the fill rung with the
  jx-pair-destructive pair injected (destructive ground/ink), pressing
  through the family's one press law — no local variant recipe exists

#### Scenario: the cancel rides the strip's quiet zone

- GIVEN the same strip's `<SystemDialogCancel>`
- THEN it renders ghost on the flat texture with zero paint props,
  and its data-jx-sysdlg-cancel stamp rides the rest lane onto the
  control root (the APG focus landing still finds it)

> (system-dialog: popover="manual" +
> CSS Anchor Positioning, rising beside its trigger)
>
> (floating-flesh-sweep ruling, 2026-09-09)
>
> (explicit variant; density DEFAULT — the carved strip's
> height IS the Dialog footer's, the Owner parity ruling 2026-09-09)
>
> (the fill rung ships the jx-pair-destructive
> injection as the confirmTone default; consumer pair injections still
> win by layer order)
>
> —
> the family's one ladder,
> one press law, one forced-colors set —
>
> The SystemDialogActions strip carries the
> action-band zone (ghost + flat): the Cancel renders quiet with zero
> paint props, an explicit Action variant always wins. the strip's
> interior is the CARVED ACTION BAND (carved-action-band, 2026-09-09,
> round 3: the even-split + ink-law rulings): the bleed wrapper keeps
> the strip's own craft (the mt/gap breathing arithmetic, the negative
> margins) and renders ONE full-width ButtonGroup with minmax(auto,1fr)
> columns under a real Separator rim — the buttons split the strip
> evenly, fill it vertically, and join by the group's 1px seam; never
> a loose padded row, never a border-t token rim.

### Requirement: sheet speaks the full card dialect

Sheet (the showModal side drawer) is a full-panel floating surface
and SHALL carry its interior in the Card dialect like Dialog: ONE
sticker host with the head/body/foot bands, edge-riding Separators
replacing the hand-drawn border-b/border-t, the × riding the
end-action seat as a zone-inheriting IconButton, the body as CardBody under the RHYTHM escape
hatch, and the
optional foot band under the action-band zone rendering the footer
snippet RAW.

#### Scenario: the drawer renders the kernel bands server-side

- GIVEN an open side sheet with a footer
- THEN its interior host carries data-jx-card with the three bands
  placed by the kernel's rule set (SSR-complete), the head and foot
  lines are Separator instances edge-riding their bands, and the ×
  sits in the end-action seat inheriting the head band's ghost zone

#### Scenario: the drawer keeps its own rhythm under the escape hatch

- GIVEN the sheet's CardBody class override (18px beat, popover ink,
  side-axis height cap)
- THEN the cell's same-property utilities lose to the bang-prefixed
  overrides by the class-append law while the kernel's scroll law and
  gutter compensation stay single-sourced in the cell's own css

#### Scenario: the foot band is RAW — CardFooter is the face

- GIVEN a sheet footer snippet
- THEN the snippet renders RAW inside the foot band (no grid, no
  group, no loose flex row from the sheet) — a CardFooter snippet
  dissolves against the rented ruler and carves its cluster; the
  consumer who passes bare buttons owns their geometry (the r14-9
  contract, dialog verbatim)

> (data-jx-card, card.css imported — the load-bearing
> lesson)
>
> (the hand-painted
> border button retired)
>
> (the drawer's 18px beat and popover ink override the cell's
> utilities with the consumer's `!` — the class-append law)
>
> (dialog's r14-9 law verbatim — the standard face is
> CardFooter, whose cluster is the carved action band; the sheet
> component mounts no layout wrapper of its own)
>
> The slide state machine, edge docking, and the surface material stay
> the mechanism's own (sheet.css), untouched.

### Requirement: the blockquote face (quote and admonition)

The `blockquote` item SHALL be the reading-content quote surface: a native
`<blockquote>` root carrying a frozen two-rung prominence ladder
(`outline | tonal`, own `outline` — quote readability excludes fill
AND ghost) with hue by injection, an optional uppercase `label` row,
an optional `icon` snippet, and an optional `cite` attribution
(`footer > cite`).

#### Scenario: the tuned default

- WHEN a plain quote renders (standalone or through markdown)
- THEN the rule is the 4px inset shadow at the 55% lightened mix, the
  body sits at 0.875em muted, and stretched roots center their
  content vertically

#### Scenario: the rule ladder

- WHEN ruleSize sweeps 1|4|8 in either channel
- THEN the rule's weight grows while paddings never move, and the
  two channels share the rung's single color source

> **The RULE channel** (2026-09-08, the Owner's R2+R3 rulings): the
> left rule is its OWN literal axis pair — `rule` (`shadow | border`,
> own `shadow`) × `ruleSize` (`1 | 4 | 8`, own **4** — the Owner ruled
> the 1px hairline fits xs2-scale contexts only) — NEVER a paint rung
> (the separator ink-geometry precedent). The rule draws at a
> LIGHTENED 55% transparent mix of the outline token (the "muted 太深"
> ruling); the color rides the rung's own border-color source (one hue
> source: a `jx-hue-*` retune moves ground, box, and rule together).
> The inset standard: command-item's inset rule, the elevation
> grammar's WELL tier, kbd's `--shadow-engrave` lineage. Tonal keeps
> its box border plus the shadow rule (shadow-1 there is a stated
> near-no-op for axis uniformity). ps stays FIXED across channels and
> sizes (border consumes geometry, shadow doesn't). Forced colors:
> shadow modes re-materialize as an Npx CanvasText border. The body
> rides **0.875em** of the ambient scale (the "字体要变小" ruling —
> em-based, so the typography trio and prose scopes still rescale it;
> label/cite rows keep their fixed chrome size). The root is a
> **centered flex column** (`flex flex-col justify-center`): an
> externally stretched root centers its content vertically; at auto
> height this is pixel-identical to block flow, and a flex container
> IS a BFC so the markdown rhythm's containment intent survives.
> Hooks: `data-jx-blockquote={variant}` and the compound
> `data-jx-blockquote-rule="{rule}-{size}"`.

### Requirement: the heading face (level as the axis)

The `heading` item SHALL render the native `h1`–`h6` chosen by a `level`
prop (1–6, clamped) with NO paint ladder — the level is the structural
axis. It OWNS the heading channels
the jx-pure face holds for bare headings: bold weight, 1.25 leading,
foreground ink, and the em-based size ladder (`h1` 1.875em → `h5/6`
1em) migrated from the markdown item's sheet so every ambient
font-size rescales the hierarchy
proportionally and the component stands alone outside any face. It

#### Scenario: the ladder scales with ambient size

- WHEN the same `<Heading level={2}>` renders inside containers at
  13px, 14px, and 16px ambient font-size
- THEN the rendered size tracks 1.5em of each ambient — the
  hierarchy ratios hold at every preset

#### Scenario: the element is the level

- WHEN `level={3}` is passed
- THEN the root element is `h3` carrying `data-jx-heading="3"` —
  semantics never move with styling

> (the literal-axis-only precedent)
>
> (the typography trio, or any host)
>
> carries NO block margins — root-level spacing belongs to the
> container's rhythm law and nested headings sit container-tight (the
> GitHub posture). The root stamps `data-jx-heading={level}`.

### Requirement: the prose list face

The `list` item SHALL render the native `<ol|ul>` by `ordered` (with
`start`/`reversed` ol-only passthrough) owning the B8 channels.
**The marker vocabulary** (2026-09-08): `marker` —
`disc|circle|square|decimal|alpha|roman|none` — resolves as
`marker ?? (nav ? 'none' : ordered ? 'decimal' : 'disc')`: omitted
reproduces today's platform-per-element restoration; the value
overrides. Lowercase only (upper = the arbitrary escape hatch).

#### Scenario: the marker matrix

- WHEN each of the seven markers renders
- THEN the stamp matches the value (arbitrary-form utilities where
  the core utility silently no-ops — probe-pinned) and omitted
  markers reproduce the byte-identical platform defaults

> Marker ink keeps the B8 muted law; marker size/spacing deliberately
> absent (ambient scale + the no-margins recorded law). `none` keeps
> the structural indent. **The nav container mode**: `nav?: string`
> (aria-label; presence switches) renders `<nav aria-label
> data-jx-list-nav>` wrapping the list defaulted `list-none ps-0`
> (explicit marker overrides the style, not the indent); class/rest
> stay on the LIST element. Inside face scopes, plain anchors are the
> lawful nav-mode children (the B2 chrome lane); standalone, B2 is not
> re-implemented — the Link part is the prose lane. Hook:
> `data-jx-list={ol|ul}` on the list element.

### Requirement: the typographic link face

The `link` item SHALL be the text link: a native `<a>` with the face's
non-nav paint as its own utilities, absolute `http(s)` hrefs getting
`target="_blank" rel="noreferrer"`, relative hrefs navigating in
place. **The external suffix-icon lane** (2026-09-08): `icon` is
TRI-STATE (the input semantic-glyph law) — `undefined` renders the
default `externalLink` Icon part
inside an aria-hidden span after the children, shown IFF external;
`null` disables the lane; a snippet customizes it.

#### Scenario: the lane's three states

- WHEN an external link renders bare, with `icon={null}`, and with a
  custom snippet
- THEN the default glyph, nothing, and the custom content appear
  respectively — internal links never show the lane

> (inline-core, sync — SSR paints)
>
> The marker is
> em-sized (rides any ambient scale) and lives INSIDE the anchor. The
> component declares the `@jixoai/icon` edge. Hook:
> `data-jx-link={external ? 'external' : 'internal'}` plus the lane's
> `data-jx-link-icon` presence.

### Requirement: the text family (base + Raw exports)

The `text` item SHALL be the Owner-designed prose family. The base `<Text>`
renders `<p>` by default (the Chakra `<Text>` precedent); a `mark`
literal slot switches the element and paint: `strong|em|del|mark|
ins|sub|sup` — ONE vocabulary where the prop value, the Raw export
name, and the HTML element are the same word.

#### Scenario: the modifier matrix

- WHEN `<Text mark="strong" italic fontSize="12px" lineHeight={1.5}>`
  renders
- THEN the strong member's own utilities (`font-semibold`) and the
  modifier utilities (`italic [font-size:12px] leading-[1.5]`) both
  land, the consumer class still merges LAST, and a `<Text>` with no
  modifiers emits zero modifier utilities — the ambient scale flows

#### Scenario: sugar equals the base

- WHEN `<Strong>x</Strong>` and `<Text mark="strong">x</Text>` render
- THEN both produce a `<strong>` with `data-jx-text="strong"` and the
  same class merge behavior — the exports are pure sugar

#### Scenario: the paragraph member keeps the prose law

- WHEN `<P>` renders inside a jx-pure scope
- THEN the face's paragraph channels (flow margins, the line-height
  un-short-circuit) still apply — the member adds no competing
  declarations

> The Raw semantic
> exports `P Strong Em Del Mark Ins Sub Sup` are thin sugar wrappers
> importable from `text.svelte` itself (module re-export) AND the index
> barrel — the learning cost is one component or eight, whichever the
> consumer reaches for. The family is FACE-COMPOSING (no member mounts
> the no-jx-pure escape): the members are semantic hooks and extension
> points over the face's prose channels. Two members DELIBERATELY
> override face channels (recorded settles): `strong` at 600
> (`font-semibold` — the GitHub/Tailwind emphasis weight, settling the
> face B1's 700) and `mark` owning its highlight ground AND its
> `0.05em 0.25em` padding box (mirroring the face's mark so standalone
> and in-face renderings agree). All other members are additive on
> channels the face does not declare for their elements (italic;
> line-through; underline; UA baseline shift for sub/sup).
> Every member stamps `data-jx-text={form}` (form = the mark, or `p`).
>
> The MODIFIER KERNEL (2026-09-08, this change): every member gains
> the common text-modifier props — `lineHeight` (number ⇒ unitless
> ratio, string ⇒ verbatim), `weight`, `italic`, `tracking`, `family`,
> `fontSize` — resolved through the shared kernel
> `lib/text-style.svelte.ts` (`resolveTextStyle`: props → utilities;
> `fontSize` rides the arbitrary-property form; bare `size` naming is
> banned — the AXIS_PROPS collision). The kernel file ships under the
> text item; `inline-code` declares the `@jixoai/text` registry edge
> and consumes the same kernel for its own text modifiers (shared
> kernel, independent components — the Owner's ruling). THE
> AMBIENT-SCALE AMENDMENT rides with it: an ABSENT modifier emits NO
> utility and the ambient channels flow untouched (the trio's
> inheritance, the prose scope's leading); an EXPLICIT modifier emits
> its utility and beats the ambient — including the recorded interplay
> ruling that an explicit member `lineHeight` (utilities layer) beats
> the prose scope's `--jx-ty-leading` residue (components layer): the
> layer law's own posture, now written down for the family.

### Requirement: the markdown face (streaming AST → registry parts)

The `markdown` item SHALL render a markdown source string (a value-domain
payload — the code-card "code strings" precedent) by mapping parser AST
nodes onto registry parts and native elements. It parses through the
framework-free `stream-markdown-parser` core under a PINNED-AXES
contract and owns its renderer outright: every DOM
node, style law, and contract marker is first-party.

#### Scenario: streaming an open code fence

- WHEN `streaming` is true and the source ends inside an open fence
- THEN the in-progress code renders through CodeCard with the partial
  code, and the keyed item never remounts across chunk arrivals while
  it stays the tail (L2) — even when the fence CLOSES but the block
  remains last; its key transitions from `:tail` to the digest (one
  bounded remount, L3) when a successor block appears or the stream
  finalizes

#### Scenario: the tail changes type mid-stream

- WHEN a streaming tail paragraph becomes a heading as tokens arrive
- THEN the tail key's type discriminator swaps and the tail item
  remounts clean — inner state never crosses a type boundary

#### Scenario: non-append input resets deterministically

- WHEN `source` is replaced, shortened, or the component is recycled
  for a new message
- THEN the adapter drops its parser instance and stream cache and
  re-parses from scratch — no stale cache, no throw

#### Scenario: raw HTML never executes

- WHEN the source contains `<script>` or any tag outside the frozen
  html table
- THEN it survives as visible literal text (escaped by interpolation);
  no html node outside the whitelist is ever rendered as markup

#### Scenario: the two spellings are one component

- WHEN `some <b>text</b> and **md**` renders
- THEN both emphases are Strong roots with `data-jx-text="strong"` —
  element, hook, and classes indistinguishable between the html
  spelling and the markdown spelling

#### Scenario: consecutive details blocks are one accordion

- WHEN the source contains two adjacent `<details><summary>` blocks
  (optionally `<details open>`) with markdown bodies
- THEN they render as ONE Accordion group whose items are native
  details/summary AccordionItems — summaries from the summary
  elements, bodies parsing their markdown — and the open attribute
  carries through

#### Scenario: hostile attributes never ride

- WHEN an html anchor carries an unsafe href scheme or an event
  handler attribute
- THEN the href fails re-validation (text, no anchor) and the handler
  attribute is dropped — no html attribute reaches the DOM unsanitized

#### Scenario: a consumer overrides one node type

- WHEN `components={{ link: GlossaryLink }}` is passed
- THEN link nodes render through GlossaryLink with `{ node }` while
  every other node type keeps the default map, and the override can
  delegate children through the exported MarkdownNode

#### Scenario: GFM tables join the responsive laws for free

- WHEN the source contains a GFM table
- THEN it renders through Table with `td[data-label]` carrying the
  header cell text, so the stack law (<30rem card rows) shows labels
  with no consumer opt-in, and column alignment from the delimiter
  row is preserved

#### Scenario: hydration matches the server frame

- WHEN the page prerenders with a given `(source, streaming)`
  snapshot
- THEN the client hydrates the same snapshot to shape-identical DOM —
  parsing is synchronous in both runtimes and keys derive only from
  the snapshot

#### Scenario: every construct renders its registry part

- WHEN a kitchen-sink document renders (quote, headings, lists, task
  items, emphasis of every kind, links, inline code, a rule)
- THEN each component-mapped construct's root carries its valued hook
  (`data-jx-blockquote`, `data-jx-heading`, `data-jx-list`,
  `data-jx-link`, `data-jx-text`, …) — editing that component changes
  the construct's rendering; the box-owning roots carry the
  no-jx-pure scope while the face-composing members do not; task
  items keep their native disabled inputs under the bare-checkbox
  face with no disc marker

#### Scenario: a GitHub alert settles mid-stream with zero remounts

- WHEN a streaming blockquote's first line grows from `> [!NO`
  through `> [!NOTE]` into a full body and the block then closes
- THEN the block renders the plain quote until the marker completes,
  swaps to the tonal alert face as an in-place inner-subtree update
  (the keyed item identity holds), and settles on its digest key at
  L3 exactly once — the marker never costs an extra transition

> (html:true — the equivalence amendment, 2026-09-07: the
> html_block/html_inline rules must run for the frozen tag table to
> see strike/details/kbd; the security floor lives render-side — zero
> {@html}, whitelist→component, everything else escaped; linkify:true,
> typographer:false, breaks:false,
> stream:true, math/containers off, fixIndentedCodeBlock on, no custom
> tags — the axes that reach parse + AST vocabulary; anything else is
> out of the frozen contract and the vocabulary test matrix catches
> drift on a pinned axis)
>
> **Streaming is the keyed-block contract**, not a re-render. The laws
> govern the KEYED ITEM (the generic per-block component), never its
> inner subtree (inner elements swap freely as the tail re-parses;
> stateful inner parts own their transitions through their guards):
>
> - **L1 prefix freeze** — non-tail blocks key on
>   `${index}:${type}:${digest}` where the digest is fnv1a over a
>   canonical stable-stringify of the whole node (key-sorted recursive
>   canonical JSON, undefined dropped, sourceMap excluded — unknown and
>   future fields covered by construction; the serialization is
>   versioned with golden fixtures). Append-only source growth keeps
>   prefix digests invariant, so keyed-each preserves items and DOM.
>   Document-level constructs (link reference definitions) can still
>   alter an earlier block's children; its digest then changes and it
>   remounts — a prefix item remounts ONLY when its semantic digest
>   changes, never on tail growth alone.
> - **L2 tail in place** — while `streaming`, the last top-level block
>   keys `${index}:${type}:tail` (digest dropped, type kept as the
>   transition discriminator): the item persists while its content
>   mutates — including when an open fence closes while remaining the
>   tail (no remount at fence-close). A tail type transition swaps the
>   key — one clean remount, no stale inner state.
> - **L3 bounded key transition** — the tail key swaps to its digest
>   when the block stops being the tail (a successor appears) OR the
>   stream finalizes. A block that also type-transitioned while tail
>   may remount twice in total (transition + finalize). The law bounds
>   remounts to one per semantic event; it never promises exactly-once
>   per block.
> - **L4 final convergence** — `streaming → false` re-parses with final
>   semantics; the frozen prefix stays mounted.
>
> **The parse adapter is a state machine**: every parse derives
> `final = !streaming` (`streaming` defaults false — a static document's
> first parse runs final semantics immediately, never a loading state);
> the parser-instance lifecycle keys on SOURCE history — non-append
> input (replacement, shortening, rollback, message switch) is detected
> against the accumulated source and answered with a fresh parser
> instance, deterministic reset, never a stale cache; a
> `streaming:false → true` restart on an extending source resumes
> streaming on the same instance. The package's module-global plugin
> registry is a TRUSTED PROCESS BOUNDARY (the components-seam trust
> class): the item never mutates it; detection of ambient plugins at
> instance creation emits one dev-mode warning stating that the
> vocabulary AND parser-level URL-security guarantees are BOTH
> suspended (a plugin can override validateLink — probe-verified; only
> the renderer's own laws always stand) — globals apply at creation
> only, so existing instances stay immune to later registrations. The
> component is a pure function of `(source, streaming)`: server render
> and client hydrate the same prop snapshot, so hydration is
> shape-identical (the snapshot law).
>
> **The default map is first-party parts** (2026-09-07, the Owner's
> assembly ruling — every rendered construct without a registry part
> got one; editing the component IS how a consumer changes the markdown
> rendering): `code_block` → CodeCard; `table` → a semantically neutral
> `div[data-kind="table"]` harvest carrier wrapping Table with generated
> thead/tbody, `td[data-label]` header text (the stack law) and column
> alignment; `blockquote` → Blockquote; `heading` → Heading; `list` →
> List (list_item stays native li by recursion); `paragraph`/`inline`
> → P; the emphasis family → the text family's Raw marks; `link` →
> Link; `inline_code` → InlineCode (riding the component default
> `lang="auto"` — 2026-09-08, this change, the Owner ruling: the
> detection capability must reach markdown faces; the zero-work law is
> restated as the detect-sync/highlight-async split — detection is the
> chip's own zero-download fingerprint heuristic, synchronous and
> markup-free, and the highlight is the async in-place upgrade through
> the engine seam, SSR plain, zero layout shift, no per-span keyed
> work); `thematic_break` → Separator. Task-item
> checkboxes mount the BARE Checkbox (2026-09-08, the Owner ruling
> 用真组件): `<Checkbox bare checked disabled>` — the presentation-only
> single input carrying the component paint class, staying the DIRECT
> child (or the parser wrapping paragraph) the container-level
> DOM-shape laws key on (`li:has(> input)` suppression, the
> vertical-align alignment) which the interactive wrapper defeats;
> the source text owns the state; the markdown item declares the
> `@jixoai/checkbox` edge. The ESCAPE LAW
> is scoped, not blanket: box-owning block roots (Blockquote, Heading,
> List) and subtree-free leaves (the InlineCode chip) mount the face's
> `no-jx-pure` reverse scope and own their paint channels; Separator
> rides the neutral carrier div (its `m-0` would beat the rhythm's
> sibling stack — the CodeCard precedent); the face-composing members
> (P, the marks, Link) do NOT escape — an inline escape would descope
> the face rules of their legitimate descendants, so they stay semantic
> hooks over the face's channels. Because a block escape descopes
> container prose (the face's flow margins stop reaching paragraphs
> inside an escaped root), the sheet carries the container-inner
> sibling stack — the flush law's positive counterpart, weaker by
> specificity so container edges stay flush while mid-container blocks
> keep their gaps. The rhythm law needs no retargeting: the
> components' roots ARE the native blockquote/h*/ul/ol elements its
> element-based selectors match. The pure-text floor stays native
> (text, hardbreak, emoji, footnote bits, dl) and `image` stays a
> sanitized bare `<img>` — the image item's REQUIRED width/height
> no-CLS contract cannot be satisfied from markdown syntax (recorded
> with its unlock condition: an unknown-dims posture on the image
> item). Unknown node types fall back to extracted text ONLY (no
> structural recursion into unvocabularyed types). Images whose src
> does not survive sanitization are omitted entirely.
>
> **HTML is markdown spelled differently — the equivalence law**
> (2026-09-07, the Owner's addition): under the html:true amendment
> the parser's structure layer delivers PARSED html nodes
> (`html_inline`/`html_block` carrying tag, attrs, and children —
> probe-verified), so the map routes by semantics through a FROZEN tag
> table and the two spellings land in ONE component: b/strong →
> Strong, i/em → Em, del/s/strike → Del, ins/u → Ins, mark → Mark,
> sub/sup → Sub/Sup, code → InlineCode, kbd → Kbd, a → Link (href
> re-validated at map time — the html path does not inherit
> markdown-it's validateLink), br → native br, img → the sanitized
> native img, hr → Separator, and details/summary → the accordion
> (native-details-built, the W3C-first item) with consecutive
> top-level details runs merged into ONE Accordion group by a pure
> parse-side transform (a synthetic accordion_group block typed
> locally; digests key on its canonical form — a group that grows
> remounts once per semantic event, the link-reference-definition
> precedent; `<details open>` maps to the item's open). Every tag
> outside the table — script, style, iframe, div, span, html-spelled
> tables/headings — renders as ESCAPED LITERAL TEXT, never markup;
> event-handler and dangerous attributes never pass; class/style on
> html tags are dropped. The whitelist is frozen at this spec level:
> adding a tag is a spec change, never a patch.
>
> **GitHub alert detection is the default map's one synthetic
> behavior**: a pure full-line match of `[!NOTE|TIP|IMPORTANT|WARNING|
> CAUTION]` (case-insensitive) on the blockquote's first paragraph's
> first text child routes the node onto Blockquote's tonal rung with a
> status-hue injection (note→info, tip→success, important→primary,
> warning→warning, caution→error — never destructive; the
> action/status law) and the uppercase label row, the marker line
> stripped from the body. Detection is a pure function of the node: a
> half-typed marker does not match (the plain quote renders and keeps
> updating in place under L2 — the marker completing is an
> inner-subtree swap costing zero remounts), and markers not on their
> own first line never trigger.
>
> **The typography trio** (2026-09-07, the Owner's standardization ask):
> a `typography` prop — compact 13px/1.55 with an 8px block stack,
> standard 14px/1.7 at 14px (the default), relaxed 16px/1.75 at 20px,
> calibrated against GitHub's renderer and Tailwind Typography — stamps
> `data-jx-typography` and OWNS the prose scale (deliberately not the
> UI-density ladder; the `density` word belongs to that axis family).
> The block rhythm is a single collapse-immune law: root children are
> flow-root with margins zeroed (the double-attribute selector beats
> every face element rule), the adjacent-sibling stack drives every
> gap, headings breathe at 1.75× (the em ladder itself lives on the
> Heading component — ambient-scaled by construction); container
> content flushes at the edges (GitHub's `li > p` posture); the face's
> element-level `p { line-height: 1.6 }` is un-short-circuited to
> inheritance. The preset also maps onto the ambient density slot for
> CONTEXT-consuming nested chrome (compact→sm, standard→default,
> relaxed→lg — the inherit-then-provide lane; the root never stamps
> `data-density`, so the face's CSS density adoption stays untouched).
>
> **The `components` prop is the payload's content escape AND a trust
> boundary**: per-node-type components receiving `{ node }`, delegating
> children through the exported MarkdownNode. Overrides are trusted
> application code — the security floor covers the default map and
> parser-level demotions, and the docs state this boundary. The root
> stamps `data-jx-markdown` (identity hook) and
> `data-jx-markdown-streaming` while streaming — both names frozen at
> this spec level, boolean-presence semantics, stable for tests and
> consumer selectors.

### Requirement: the prose scope (the typography context)

The `prose` item + `typography` lib SHALL deliver the Owner's prose-scope
ask: app code sets typographic styling on a region; every P /
text-mark / Heading inside picks it up — by CONTEXT, never
per-element props. The shape: a composite `TypoScope` (ELEVEN frozen
knobs: size, leading, family, ink, gradient, ground, align, indent,
initialLetter, wrap, hyphens) on a typed context key OUTSIDE the
axis economy.

#### Scenario: the scope styles the region

- WHEN `<Prose size leading ink indent initialLetter>` wraps P,
  Strong, and Heading
- THEN every member picks the knobs up through inheritance and the
  presence-lane sheet rules — no member carries a style prop

#### Scenario: markdown sovereignty holds

- WHEN a `<Prose size>` wraps a `<Markdown typography="relaxed">`
- THEN the markdown body keeps the preset's 16px scale — the trio's
  root declaration beats the outer scope's inheritance for free

> (the physics-key precedent — prose ink/flow touches
> none of the four hue slots; no vocabulary version bump)
>
> Two
> channels (the density contract): the JS context (types + key + pure
> resolution in the lib; the context pair rides the empirically-proven
> lib posture) with the plugin chain applying AT THE PROVIDER; and the
> CSS channel — the `<Prose>` host emits only-set inherited
> declarations + `--jx-ty-*` vars + PRESENCE-gated `data-jx-ty-*`
> hooks, consumed by a scope-owned residue sheet (`prose.css`, layer
> statement first) keyed on the families' existing hooks: P and the
> marks take ZERO component edits; Heading takes ONE ink utility
> (`text-[var(--jx-ty-ink,var(--foreground))]`). **The gradient
> mechanism**: fill-only (`-webkit-text-fill-color: transparent`,
> NEVER `color: transparent` — currentcolor on marks resolves against
> the inherited solid); marks restore solid ink; print/forced-colors
> restore in the SHEET (the paged clone never re-runs JS providers).
> **Sovereignty by cascade** (verified): the markdown trio's root
> declarations beat inheritance and its §2a (0,2,1) beats the residue
> (0,2,0) inside `[data-jx-markdown]` — an outer Prose can never
> fight a Markdown preset; ink/flow knobs pass through; chrome stays
> unaffected by cascade (element declarations beat inherited color —
> probed); density lane untouched. The knobs: size (inheritance-only),
> leading (P-only lane; headings keep 1.25), family (words → font
> tokens; code/kbd stay mono by face law), ink (curated four-word
> union → foreground tokens + raw escape), gradient
> (structured+raw), ground, align, indent (P-only; the 中文稿纸 2em
> convention), initialLetter (BOTH arms: @supports modern + float
> fallback; suppresses indent), wrap, hyphens. The vocabulary backlog
> is frozen OUT; additions are additive knobs in their own changes.

### Requirement: the glass effect family — blur + liquid (Owner 2026-09-08「把 glass 和 blur 合并成一个 blur」)

Backdrop glass paint SHALL be ONE typed effect family on the
press-button effect convention: `blur({ radius, saturate, fill, brightness })` — and `liquid({ surface, bezel, thickness,
scale, blur, specular, rimSaturate, radius, saturate, fill,
brightness })`
 — plus
`liquid.apple({ variant, tint, interactive, shape, isEnabled })` —
the SEMANTIC layer carrying SwiftUI's glassEffect.

#### Scenario: the stamp channel (stamps carry intent; css composes policies)

- GIVEN a consumer spreads `{…glassAttrs(blur({ radius: '10px' }))}`
  onto any element (and glass.css is loaded — the item's side-effect
  import)
- WHEN the law sheet evaluates
- THEN the element carries `data-jx-effect="blur"` with
  `--jx-glass-radius: 10px` inline, and the paint composes in css
  from the stamp + vars — the DOM can prove which effect and which
  tuning was asked for
- AND a bare `data-jx-effect="blur"` with no vars paints
  computed-equivalent to the retired `.jx-glass` (the same 14px /
  1.35 / 68%-mix values; an identity brightness(1) may append) —
  value parity, not css-byte parity

#### Scenario: the lens is mounted by ONE action, and degradation never breaks the paint

- GIVEN `{@attach liquidGlass(fx)}` with ONE LiquidGlassEffect object
  (the title's ONE-action law is the mount-path singularity: the
  factory returns the attachment — `(element) => cleanup` over the
  `attachLiquidGlass` kernel — and fx FLOWS, never mutates:
  replacing it re-mounts, the 2026-09-09 attachments ruling. The
  ripple.svelte.ts runtime precedent — effects may own runtime JS;
  there is no filterId to pair: the mount mints the per-instance
  id, renders the filter, and writes the pointer var, so a
  mismatched attrs/filter pair is unrepresentable)
- WHEN the attachment mounts
- THEN it stamps the channel + tuning vars, measures the element,
  computes the displacement field IN THE ELEMENT'S OWN PIXEL SPACE,
  canvas-encodes the maps, appends the per-instance SVG filter
  (kube.io's nine-primitive chain, frost INSIDE the filter), and
  only THEN sets `--jx-glass-filter` — a SET pointer never precedes
  its fragment
- WHEN the engine supports `backdrop-filter: url(#…)` (Chromium)
- THEN the law's @supports branch applies the POINTER-ONLY chain
  (no css frost functions under the url() — the frost lives inside
  the filter; a css chain would double-blur)
- WHEN the engine does not support url() (Safari/Firefox), OR the 2D
  canvas is unavailable, OR JS never runs (SSR/no-JS/pre-hydration)
- THEN the UNCONDITIONAL frost base paint stands (the pointer var's
  identity fallback covers the UNSET case; glassAttrs never writes
  the pointer) — same geometry, honest paint; the lens is an
  enhancement, never a dependency; under
  `prefers-reduced-transparency: reduce` both members paint a solid
  fill; in print the filters drop and the fill stays
- AND forced-colors stays the components' own utilities convention
  (`forced-colors:bg-[Canvas]`, the toast precedent) — the law sheet
  is paint-only and carries no forced-colors block; every stamp
  consumer ships its forced-colors treatment in this change (tabs
  indicator, toc rail, docs chrome — the design's consumer map)

#### Scenario: the lens field is kube's source-level recipe, computed per element and pinned by goldens

- GIVEN the displacement field is computed at RUNTIME by the pure
  core (`glass-map.ts` — kube.io's shipped source, ported: the four
  surfaces convex-circle/convex-squircle/concave/lip, the ray-traced
  profile WITH the glass-slab path term
  `d(s) = T.x/T.y·(H(s)·thickness + bezel)`, ÷maximumDisplacement
  normalization, the rounded-rect border sweep at 2× dpr, the
  directional 1.5px specular ring — the maps generated AT THE
  ELEMENT'S ACTUAL SIZE, per the Owner's 2026-09-09 rulings)
- WHEN the spec battery runs
- THEN the pure core satisfies the golden properties — center
  neutrality, strong rim inward-pull, monotone decay, quadrant
  antisymmetry, the kube profile shape (peak at the border, decaying
  inward), and the BAND-UNIFORMITY law: on a 512×256 element the
  encoded profile inside the TOP edge matches the LEFT edge within
  ±2 steps (a stretched-map regression is geometrically incapable of
  passing; the anisotropy law the ruling forced)
- AND the semantic compile table holds: `liquid.apple()` with
  variant regular is deep-equal to `liquid()`'s defaults; clear,
  tint, interactive, shape, and isEnabled compile per the design's
  table — identity and isEnabled:false return the FROST member
  (Apple's no-op maps to the law's own degradation, zero lens cost)
- AND the migration canary (source-scan, NORMALIZED regex
  `jx-glass(?![-\w])` over SHIPPED code — apps/www/src/lib and
  registry/files, COMMENTS STRIPPED before scanning; docs prose may
  name the retired class where it explains the migration) asserts
  zero retired-class hits

#### Scenario: consumers rebase, public APIs hold

- GIVEN tabs (materials glass/liquid), toast (material glass), toc's
  mobile rail, the www docs chrome, and `.jx-surface` acrylic
  existed before the family
- WHEN they adopt the law
- THEN their material/variant enums and DOM contracts stay (the merge
  is at the LAW level: stamps + tuning vars), tabs' liquid material
  upgrades from feTurbulence noise to the mounted lens (its inline
  filter markup DELETES), the `.jx-glass` theme class retires with
  every consumer migrated in the same change (破坏性更新, no alias
  class), and `.jx-surface` acrylic is the declared exception —
  theme-owned selector and motion branches, value-tokenized through
  `--jx-glass-*` (the design's consumer map)

> (builders keep options typed and
> discoverable)
>
> —
> the merged glass+blur paint, every prior hand-tuned glass
> implementation's formula
>
> (the kube.io source-level recipe, the objective facts)
>
> standard, compiled
> DOWN into the physical layer and exposing no physics
>
> (the Owner's
> two-layer ruling, 2026-09-09)
>
> — the SVG lens-refraction member's PHYSICAL layer
>
> The family lives in ONE registry item
> (`@jixoai/glass`: builders, the law sheet, the runtime field core,
> the mount kernel + the `liquidGlass` attachment factory) exactly as
> scroll-run owns the scroll axis; no component family keeps a local
> glass paint formula on the stamp channel. Builders clamp finite
> numerics into their documented ranges and throw on non-finite
> input — a broken value fails loudly at the builder, never silently
> in css.

### Requirement: effects are attachments — the {@attach} channel and the data-jx-attach forwarding law (Owner 2026-09-09)

Element-level effects (glass blur/liquid, press shimmer/pulse/
rainbow/ripple) SHALL mount through Svelte attachments: effect
items export attachment FACTORIES — `liquidGlass(fx)` /
`pressEffect(fx)`, param in, attachment out — so `{@attach
liquidGlass(fx)}` attaches directly.

#### Scenario: the leaf attachment

- GIVEN a consumer renders `<button {@attach pressEffect(shimmer({ speed: 4000 }))}>`
- WHEN the element mounts (client, post-hydration)
- THEN the press loop runs on that element, self-listened — it
  respects `:disabled`/aria-disabled (no-op) and
  prefers-reduced-motion (the runtime's gate), RE-MOUNTS when the
  fx object is replaced (destroy + fresh mount — the param-flow
  law), follows the measured deep-mutation boundary (mutation of a
  `$state`-held fx re-runs via the body's own reads; the channel
  itself never deep-reads — the battery pins BOTH halves), and
  cleans up on destroy
- AND SSR renders the element inert (attachments are client-side;
  the paint never depends on them — glass stays frost-first)

#### Scenario: the component-tag attachment (the uniform form, r4)

- GIVEN a host component (press-button, chip, icon-button) spreads
  `...rest` onto its root element, the root carrying the
  `data-jx-attach="root"` stamp
- WHEN a consumer renders `<PressButton {@attach pressEffect(shimmer())}>`
- THEN the attachment mounts at the host's ROOT ELEMENT through
  Svelte's native forwarding (the symbol prop rides the rest
  spread; flushSync-settled mount, teardown on unmount — the
  promoted spike's assertions) and the battery pins that an extra
  rest prop reaches the root too (the spread is real)
- AND a component's OWN internal mount (tabs' liquid indicator:
  the material enum's business, `data-jx-attach="indicator"`
  stamped, `{@attach internalMount()}` wired internally) needs no
  consumer channel at all — effects reach consumers' surfaces only
  through the uniform `{@attach}` syntax

#### Scenario: action-shaped internals bridge, never swap

- GIVEN the repo's internal helpers return `{destroy}` objects
  (accordion's exclusiveGuard, toast-viewport's bindCard, the
  docs/blueprint scene helpers)
- WHEN they migrate to `{@attach fromAction(helper, () => param)}`
- THEN mount/update/destroy run through fromAction's bridge
  (update on param reference change)
- AND the battery pins the counter-example: attaching a
  `{destroy}`-returning action bare mounts but NEVER tears down
  (the leak that makes fromAction mandatory), and mounting an
  action-shaped function through a factory call crashes at mount
  (the contract violation) — both asserted as documented failure
  modes, not supported forms

#### Scenario: the retirement and the canaries

- GIVEN the breaking migration is complete
- THEN a source scan over the shipped surface (apps/www/src +
  registry/files — routes excluded per the glass-canary precedent;
  comments stripped; migration-prose may NAME the retired syntax
  where it explains the move) finds ZERO `use:[a-zA-Z]` sites, and
  `effect={shimmer|pulse|rainbow|ripple` has zero hits outside the
  builders' own item — both canaries ship as spec source-scans with
  two-directional fixtures (self-tests prove a violation turns
  them red)
- AND the effects live on `/docs/effects.html` (the element-level
  family home; the scroll axis stays the motion domain and out of
  the family — the Owner's 2026-09-09 ruling), with glass's
  component route retired into that home and the catalog's
  `effects` group carrying both residents — glass at the effects
  home, press-button at its own component page (a group is a
  taxonomy lane, not a page)

> (the whole expression IS the
> attachment; `Attachment = (element) => void | cleanup-function`,
> the resolved-svelte contract — there is NO update/destroy-object
> channel and NO action-call form: identity change re-mounts, teardown
> runs the returned cleanup)
>
> Param objects FLOW, never mutate
> (the demo law): replacing the fx object destroys and re-mounts;
> deep mutation is TWO-SIDED, both halves measured — no channel
> deep-reads the param itself (the fromAction getter is
> reference-level), but the attachment body's own property reads on
> a `$state`-held fx register fine-grained deps, so deep mutation
> re-runs the attachment. Action-shaped internals (the repo's `(element, …) =>
> `` {destroy} `` helpers) SHALL bridge via `svelte/attachments`'
> `fromAction(action, () => param)` — a bare syntax swap silently
> leaks them (the verified counter-example). Host components reach
> the SAME syntax: they spread `...rest` onto their root element and
> consumers write `<PressButton {@attach pressEffect(shimmer())}>` —
> Svelte's NATIVE component-tag attachment forwarding (the
> createAttachmentKey symbol prop rides the rest spread; spike-
> verified mount+teardown on the resolved svelte; an undefined value
> skips, the `if (fn)` guard). The r2 `attachments` record prop is
> RETIRED within this change (an over-design corrected by the Owner's
> 2026-09-10 review). The two channels stay orthogonal:
> `data-jx-attach` is the optional named mounting-point STAMP
> (queryable contract-naming); `data-jx-effect` is the paint-stamp
> channel (CSS laws read it); they never merge. Attachments
> self-listen (pointer/keyboard, `:disabled`/aria state) with zero
> coupling to host state machines. No component ships an `effect`
> prop after this change, and no `use:` action syntax remains in the
> scanned surface (breaking, no compat — the Owner's one-step
> ruling).

### Requirement: the spin component renders the ora catalog and the svg posture under one name lane

The Spin component's text posture SHALL draw from a NAMED catalog
of plain-text frame sequences (`spin-catalog.ts`, the
cli-spinners@2.9.2 corpus curated by the objective rule —
text-presentation glyphs only, ≤30 frames, ≤10ch width,
`bouncingBar` excluded as bracket art) with frames VERBATIM and
per-spinner intervals riding; the decorative `[` `]` wrapping is
RETIRED (bare frames only). One `spinner` prop SHALL govern both
postures — `SpinName | TextSpinnerName`, default `'dots'` — with
artifact-first resolution (an svg spinner named like a text one
overrides it; unknown names fall back to frame 0 of `dots` with one
dev warn, never a blank region). Frame cycling SHALL be a FLAT
CSS-animation engine (review round 4): every frame renders once in
the cursor's one-cell grid, JS only fills the animation parameters
(one shared keyframes rule per parameter set, injected
idempotently, plus a NEGATIVE per-frame delay phasing it into its
slot) — no element churn, no JS clock, the cycle is compositor-
smooth and DevTools-Animations-controllable; the static face
(frame 0 alone) holds SSR, first paint, and reduced motion through
a static media kill. The glyph SHALL ride the density ruler:
text frames paint `var(--jx-text)`, the svg posture's ABSENT size
rides `var(--jx-icon)` through CSS (presentation attributes cannot
carry var(); an explicit `size` or slot config pins concrete
attributes). Frame text SHALL render `whitespace-pre` inside a
one-cell grid — every frame of one spinner holds its mono advance
width (simpleDots' blank frame included), so the box never
breathes. Two timings and a mode SHALL shape the text posture: `interval`
and `linger`, both `number | 'auto'` with default 'auto'
resolving the catalog's HAND-TUNED pair per spinner (no formula;
explicit prop > the Defaults slot > the tuned pair), and
`lingerType` `'auto' | 'end' | 'start' | 'both'` ('auto' =
the tuned type) choosing the opacity shape — end fades out,
start fades in through the PREVIOUS frame's window completing
exactly at the handoff (the frame arrives solid as the
predecessor exits) and hides discretely, both breathes; the
SOLID-FRAME law caps the entry fade at interval/2 whenever
linger ≥ interval (a frame always lands solid — degenerate
pairs peaked opacity for a single instant); linger 0 collapses
every type to the discrete blink via steps(1,start) on the duty
stop (same-percentage keyframe stops MERGE — never emit them). The
catalog may carry per-spinner frame overrides (simpleDots' ·)
and a font hint (arc rides font-family: math). All three ride
the family's single Defaults contract, so a context (or the
plugin mounting one) sets them ambiently.

#### Scenario: the default spinner renders bare frames

- GIVEN `<Spin />` with no props
- WHEN it renders server-side
- THEN the markup shows `dots` frame 0 (⠋) with NO bracket
  characters, under `role=status` with the default label

#### Scenario: reduced motion freezes on frame 0

- GIVEN a user agent reporting `prefers-reduced-motion: reduce`
- WHEN the component mounts
- THEN no interval starts and the text stays on frame 0 (and an
  svg root, when present, gets `pauseAnimations()` called)

#### Scenario: a spinner change restarts the cycle

- GIVEN a mounted `<Spin spinner="line" />`
- WHEN `spinner` changes to `arc`
- THEN the old interval clears and the new one runs at `arc`'s
  catalog interval

### Requirement: the svg posture owns the root and freezes under reduced motion

The svg posture SHALL render a component-owned `<svg>` root —
viewBox from the artifact, `size` square edge (default 16 through
the Defaults open literal slot), nature-aware currentColor
painting, `aria-hidden`, `data-jx-spin-svg` — with the artifact's
`d` children (SMIL animate included) crossing through `{@html}`
exclusively (the sink law: payload is build-time-extracted,
RAW-gated; nothing prop-reachable). Under `prefers-reduced-motion:
reduce` the component SHALL call the root's `pauseAnimations()`
(SMIL freeze on first frame) and spin.css's static kill SHALL stop
CSS-keyframed loaders (`:where([data-jx-spin-svg] *)` unlayered
carve-out). The wrapping posture (aria-busy, scrim owning
pointers, the one-cell grid host) SHALL remain byte-equivalent in
law to the pre-change contract.

#### Scenario: the svg root contract holds

- GIVEN `<Spin spinner="blocks-wave" />`
- WHEN it renders
- THEN the root is an `<svg>` carrying the artifact viewBox,
  `width`/`height` from the size slot, `fill="currentColor"`,
  `aria-hidden="true"`, `data-jx-spin-svg` — and its children
  include the nine animated `<rect>` elements verbatim

#### Scenario: the wrapping posture is unchanged

- GIVEN `<Spin label="building"><content/></Spin>`
- WHEN it renders
- THEN the container carries `aria-busy="true"`, the scrim owns
  pointer events over the content cell, and the status pill holds
  the spinner glyph — identical structure to the pre-change
  component modulo the glyph itself
