# component-authoring — delta

## ADDED Requirements

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
