# component-authoring — the Svelte 5 component contracts (living spec)

## Purpose

The Svelte 5 component contracts: the Tier system, native-element-first law, props discipline, and the utility-first styling posture with its documented cascade exceptions.

> Capability owner: `registry/files/ui/**` (mirrored at
> `apps/www/src/lib/ui/**`). Components are Svelte 5 runes-first,
> native-element-first, and follow the Tier system below.

## Current contract (state: 2026-08-25, composition-first-apis merged)

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
with the law `explicit ?? inherited ?? 'default'`; providers are
opt-in (no forced app root). The CSS channel injects values: providers
and density-aware components stamp `data-density`, and ONLY the
canonical theme sheet AND its byte-identical generated mirror carry
density scopes, mapping the derived `--jx-density-*` vocabulary to
inherited `--jx-*` aliases — never component css.
Components consume the aliases and MUST NOT branch on density values
in their own css; `data-size` authority is removed (no alias). Every
scale value is DERIVED from the ruler (`--jx-unit`, text base)
by written equations; the computed four-row table is gate-asserted.
The balance invariant holds at every density: row inline-start inset
== the media/content seam (one ruler mark); media boxes derive from
the line (icon = one line, image = two — the seam never folds into
the object); optical correction is ONE bounded token (±U/2).

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
frozen table in openspec/changes/variant-grammar/design.md §4):
Badge fill/tonal/outline (default tonal, brand hue); InlineCode
tonal/outline (default tonal, locally neutral); Chip all four
(default tonal); PressButton fill/tonal/outline/ghost/link (default
outline); Alert outline/tonal (default outline — no fill/ghost:
banner readability). Valued `data-jx-*` hooks carry the variant
(`data-jx-badge`, `data-jx-alert`, `data-jx-press-button`,
`data-jx-chip`).

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
