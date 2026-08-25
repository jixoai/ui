# design — list-item-systemization

> AUTHORITATIVE public contract for the family rewrite. The Codex
> artifact (`.agents/documents/2026-08-25-list-item-systemization/
> codex-r2-response.md`, converged 8.7/10) is PROVENANCE, not a
> normative source — every table an implementer needs is here.
> Review round 1 (review-design.md, BLOCK 5.0) resolved: the
> reactive-policy law (§2), single `data-dividers` ownership (§1/§5),
> self-contained contract (all tables), explicit adapter Reserved
> sets (§3), exhaustive matrix gate (§6/tasks), install-closure proof
> (§7/tasks). Owner rulings: the five form-row adapters SHIP; chevron
> is only `<ItemEnd><ItemChevron /></ItemEnd>`.

## 1. Anatomy

```
group (the surface owner)                     row (GRID presence matrix)
┌ [data-slot=item-group] ───────────┐         ┌ li [data-slot=item-row] ─────────────┐
│ <section aria-labelledby>|<div>    │         │ ┌ a|div.jx-item ───────────────────┐ │
│  [label element]                   │         │ │  'header header header'          │ │
│  ┌ ul [data-slot=item-list] ─────┐ │         │ │  'media  content  end'           │ │
│  │ [data-dividers] lives HERE    │ │         │ │  'footer footer footer'          │ │
│  │ li > row                      │ │         │ └──────────────────────────────────┘ │
│  │ li > row   ← auto divider     │ │         └──────────────────────────────────────┘
│  │ li[role=presentation]         │ │
│  │  = ItemDivider (explicit)     │ │          end lane (flex, inside the end area):
│  └───────────────────────────────┘ │          ItemAfter → ItemActions → ItemChevron
└────────────────────────────────────┘          (metadata → controls → glyph; wraps to
                                                its own full row under the narrow
                                                @container jx-items 30rem law)
```

- The matrix stays **4 bits** (media × end × header × footer): 16
  exhaustive self-contained wide combos + the narrow end-present
  combos, each declaring BOTH `grid-template-columns` AND
  `grid-template-areas` (no cascade path may mint implicit tracks).
  `after`/`actions`/`chevron` are never top-level bits.
- Standalone Item renders its `<a>`/`<div>` root directly; grouped
  Item renders `<li data-slot="item-row">` wrapping the same root —
  native list semantics AND link semantics together. Unlabeled group
  = neutral `<div>` frame + `<ul>`; labeled group = `<section
  aria-labelledby={labelId}>` + visible label OUTSIDE the list.
- `ItemDivider` is **decorative and childless in v1**: an empty
  `<li role="presentation">` painting one full-strength line. (r2's
  optional visible boundary label is cut: authored text hidden from
  the a11y tree is a contradiction; a labeled boundary would be a
  group label instead.)
- `data-dividers` is stamped ONLY on the inner `<ul
  data-slot="item-list">` — it owns row adjacency. The frame keeps
  `data-mode`/`data-inset`/`data-size`/`data-layout`.

## 2. The resolution law (auto-variant) — reactive, SSR-stable

```text
group   := nearest typed ItemGroup context (nested groups shadow outer)
chrome  := variant==='auto' ? (group ? 'none' : 'surface') : variant
size    := item.size ?? group.size ?? 'default'
layout  := item.layout!=='auto' ? item.layout : (group.layout ?? 'standard')
dividers:= (raw prop is OPTIONAL — `dividers?: ItemDividers`, no
          Svelte default; omission must stay distinguishable)
          muted → FORCED 'none' (even when 'auto' is supplied)
          plain → dividers ?? 'none' (explicit 'auto' opts in)
          default → dividers ?? 'auto'

Item  stamps: data-variant · data-item-chrome(surface|none|outline|muted)
              · data-size · data-layout · data-selected (present ⇒ "true")
Group frame stamps: data-mode · data-inset("true" when on) · data-size · data-layout
Group list stamps: data-slot="item-list" · data-dividers
```

**Time model (one law — amended in the impl round):** ItemGroup
creates its context object ONCE; its policy fields are GETTER-BACKED
over the group's prop signals — the zero-boilerplate reactive holder
(a `$state` object plus a sync effect is strictly more code with
desync risk; the getter form reads the prop signals directly and
cannot drift). Every Item re-resolves REACTIVELY when its own props
or any relevant group policy field changes. SSR requires only that
the INITIAL stamps are deterministic before hydration — resolution
is a pure function of (current item props, current group policy),
never a mount-time snapshot. The stamped chrome union is CLOSED: an
explicit `variant="default"` normalizes to `data-item-chrome="none"`
(the transparent escape hatch paints exactly like grouped auto).
Implementation: typed context via a module-local Symbol key with an
exported `ItemGroupPolicy` type (no `createContext` dependency;
`$props.id()` for every generated id).

CSS NEVER infers chrome from descendant context. Group paint targets
`[data-slot="item-group"]` and direct-child `[data-slot="item-row"]`
only; the auto-divider selector is
`[data-slot="item-list"][data-dividers="auto"] > [data-slot="item-row"] + [data-slot="item-row"]`,
with edge resets `:has(+ [data-slot="item-divider"])` /
`[data-slot="item-divider"] + [data-slot="item-row"]`. Explicit
`variant` always wins over `auto` (documented escape hatch).

## 3. Public interfaces

### Shared unions

```ts
type ItemVariant   = 'auto' | 'default' | 'outline' | 'muted';
type ItemChrome    = 'surface' | 'none' | 'outline' | 'muted';   // stamped, resolved
type ItemSize      = 'default' | 'sm' | 'xs';
type ItemLayout    = 'auto' | 'standard' | 'media';
type ItemGroupMode = 'default' | 'muted' | 'plain';
type ItemDividers  = 'auto' | 'none';
type ItemLabelMode = 'for' | 'text';
```

### Structural modules

| module | props (type — default) |
|---|---|
| `Item` | `variant: ItemVariant — 'auto'`; `size: ItemSize — inherited (group, then 'default')`; `layout: ItemLayout — 'auto'`; `selected: boolean — false`; `href: string — undefined`; `class: string — ''`; `children: Snippet — required`; rest `HTMLAttributes<HTMLDivElement>` or `HTMLAnchorAttributes` forwarded to the row root (anchor branch requires `href`; component-owned `data-*`/roles spread LAST so callers cannot break the contract) |
| `ItemGroup` | `mode: ItemGroupMode — 'default'`; `inset: boolean — false` (fixed 0.75rem inline margins; NO responsive enum — a container cannot query its own width); `size: ItemSize — 'default'`; `layout: 'standard'\|'media' — 'standard'`; `dividers: ItemDividers — OPTIONAL, no default` (raw boundary keeps omission distinguishable; resolved per §2: default-mode `?? 'auto'`, plain `?? 'none'`, muted forced `'none'`); `label: string — undefined`; `id`, `class`, `children` |
| `ItemEnd` | `align: 'center'\|'start' — 'center'`; `wrap: 'auto'\|'never' — 'auto'`; `class`, `children` |
| `ItemAfter` | `tone: 'muted'\|'default' — 'muted'`; `class`, `children` |
| `ItemChevron` | `class` only — renders `icons.chevronRight`, `aria-hidden`, never focusable, NO policy/inheritance anywhere |
| `ItemDivider` | `class` only — childless decorative `<li role="presentation">` |
| `ItemMedia` | `variant: 'default'\|'icon'\|'image' — 'default'`; `src?: string` + `alt?: string` (image variant: renders the `<img>` for you); `class`, `children` (icon/avatar content); |
| `ItemContent` / `ItemTitle` / `ItemDescription` / `ItemHeader` / `ItemFooter` | `as` where applicable; `class`, `children`; **rest HTML/ARIA forwarded** (fixes the shipped id-dropping bug) |

### ItemField

| prop | type — default |
|---|---|
| `label` | `string` — required |
| `description` | `string — undefined` |
| `error` | `string — undefined` |
| `id` | `string — $props.id()` (becomes `controlId`) |
| `labelMode` | `ItemLabelMode — 'for'` |
| `variant` / `size` / `layout` | Item passthrough (`'auto'` / inherited / `'auto'`) |
| `class` | `string — ''` |
| `control` | `Snippet<[ItemFieldContext]>` — required |

```ts
interface ItemFieldContext {
  readonly controlId: string;                 // the caller-supplied or generated id
  readonly labelId: string;                   // `${controlId}-label`
  readonly descriptionId: string | undefined; // `${controlId}-description`
  readonly errorId: string | undefined;       // `${controlId}-error`
  readonly describedBy: string | undefined;   // descriptionId then errorId, space-joined
}
```

DOM: `Item > ItemContent(label/description/error) + ItemEnd > control`.
`labelMode='for'` (default): visible label is `<label id={labelId}
for={controlId}>` — click-to-activate for free, no row handlers; the
control gets `aria-describedby={describedBy}` but NOT
`aria-labelledby` (native association is the name source).
`labelMode='text'`: label is `<span id={labelId}>` and the control
MUST receive `aria-labelledby={labelId}` — the mode for
non-labelable controls. Error present ⇒ control gets
`aria-invalid="true"`. ItemField never wraps a control in a second
`<label>` ELEMENT (siblings only — Toggle's own `<label for>`
wrapper coexists legally).

### Adapters (Owner ruling: all five ship)

Each adapter = `ItemField` + the existing control. Prop types derive
from the controls via `ComponentProps<typeof Toggle>` etc. with
compile-time `Omit` — **no `any`, no casts**. Every adapter accepts
the full ItemField prop set above, plus:

| adapter | additional public/bindable props | control-reserved (Omit) sets |
|---|---|---|
| `ItemToggle` | `checked — $bindable(false)`; `controlSize: 'sm'\|'md'\|'lg' — 'md'` (the Toggle footprint; the field's density owns `size` and the native number-typed `size` attr is reserved away); all non-reserved Toggle props | `label` + field-reserved + native `size` |
| `ItemCheckbox` | `checked — $bindable(false)`; `indeterminate — false`; non-reserved Checkbox props | `label`, `error`, `labelSide` + field-reserved + native `size` |
| `ItemRadio` | `group — $bindable()` (the two-way selected VALUE — Svelte's radio law is `bind:group`; `checked` cannot bind on radios and stays an uncontrolled rest attr; `name`/`value` keep native form participation) + non-reserved Radio props | Radio's duplicate label/error props + field-reserved + native `size` |
| `ItemSelect` | `value — $bindable()`; `children: Snippet` (options) forwarded through the control snippet; non-reserved NativeSelect props | `label`, `error` + field-reserved + native `size` |
| `ItemInput` | `type — 'text'`; `value — $bindable()`; non-reserved Input props | Input's duplicate label/error props + field-reserved + native `size` |

**Field-reserved (centralized in every adapter):** `id`,
`aria-labelledby`, `aria-describedby` — the adapter passes computed
values; callers who need custom relations use raw `ItemField`.
Adapters forward `disabled` to their controls (the field itself
carries no disabled prop); value props stay `$bindable`; native semantics, keyboard, and form participation
remain 100% the control's (verified preflight: Toggle/Checkbox/
NativeSelect derive `$props.id()` and forward `id` to the native
element — Radio/Input get the same check at implementation time).

## 4. Paint (terminal rewiring)

| surface | paint |
|---|---|
| standalone `auto` (`chrome=surface`) | 1px `--border` + `--terminal-muted` fill + `--shadow-2xs` + bevel |
| group `default` | frame 1px `--border`, rows transparent, auto dividers, `--shadow-xs` |
| group `default` + `inset` | same + fixed `0.75rem` inline margins |
| group `muted` | `--terminal-muted` slab; NO frame, NO dividers (forced), no shadow |
| group `plain` | nothing — host owns the surface; dividers opt-in via `dividers="auto"` |
| explicit row `outline` / `muted` | frame + terminal-muted / terminal-muted only; never forced row shadow inside a group |
| hover (interactive rows) | `--terminal-hover`; color/border only — press law |
| selected | `--terminal-hover` + `box-shadow: inset 2px 0 0 var(--primary)`; VISUAL ONLY, no `aria-selected`; survives focus |
| focus-visible | inset 1px `--ring` outline |
| auto divider | `border-block-start: 1px solid color-mix(in oklab, var(--border) 38%, transparent)` |
| explicit `ItemDivider` | full-strength `--border`; one source per edge, structurally exclusive with the auto rule |

`layout="media"` switches custom properties only — no new bits:

```css
.jx-item { --jx-item-column-gap:.625rem; --jx-item-row-gap:.375rem;
  --jx-item-media-gutter:.625rem; --jx-item-media-size:2.5rem;
  --jx-item-content-gap:.125rem; --jx-item-end-gap:.375rem; }
.jx-item[data-layout='media'] { --jx-item-column-gap:.75rem;
  --jx-item-media-gutter:.75rem; --jx-item-media-size:3rem;
  --jx-item-content-gap:.25rem; }  /* + top-aligned media */
```

## 5. CSS architecture

`@layer components`, `:where()`-wrapped family rules (utilities win
per the layer law). Six blocks: root/matrix · slot geometry + custom
properties · resolved row paint/states · group frame/list/divider ·
`@container jx-items (max-width: 30rem)` narrow law (end lane → own
full row; `ItemEnd wrap="never"` opts out) · reduced-motion reset.
`var(--card)` is BANNED from Item paint (source-guarded). The group
remains `container: jx-items / inline-size` (on the `<ul>`), so
standalone items keep wide geometry (no imaginary parent).

## 6. A11y contract

1. Unlabeled group: `<div>` + native `<ul>`; grouped Items are
   `<li>` wrapping the row root. Labeled group: `<section
   aria-labelledby>` + label outside the list. Nested groups shadow
   outer policy and own a new inner list.
2. Link rows (`href`) must NOT contain interactive descendants;
   root never gets synthetic `tabindex`/`role=button`/click handlers.
3. `selected` is visual; `aria-current`/widget selection states are
   consumer-owned via rest-forwarding.
4. `ItemChevron` aria-hidden, no focus target; a link's name comes
   from content.
5. Adapter keyboard story = the native control's story, unchanged
   (radio same-name arrows, select popup, space/enter). Label
   activation supplies the row affordance.
6. Component-owned `data-*`/roles/`aria-*` spread LAST: consumer
   rest-attributes cannot silently break the family contract
   (stamps/roles are replaced, not merged).

## 7. Registry + install closure

`registryDependencies` (exact, `separator` REMOVED):
`@jixoai/toggle`, `@jixoai/checkbox`, `@jixoai/radio`,
`@jixoai/native-select`, `@jixoai/input`, `@jixoai/icons`,
`@jixoai/utils`, `@jixoai/jixoai-theme`. Nineteen module files + css
+ barrel, canonical under `registry/files/ui/list-item/`, mirrored
byte-identical. Install-closure gate (extends
`scripts/verify-shadcn-add.mjs`): publish the actual list-item
payload to a local registry → `shadcn add @jixoai/list-item` in a
clean Svelte consumer → import the barrel AND an adapter → Vite
build passes → assert all nineteen files land at canonical targets,
`item-separator.svelte` does not, and the dependency graph resolves
exactly once.

## 8. Svelte-5 implementation law

Typed Symbol-key context with exported `ItemGroupPolicy`; stable
identity, GETTER-backed reactive fields (§2 time model — the
`$state`-holder alternative was considered and rejected as
sync-drift boilerplate). One shared attribute object, two tiny root
branches (anchor/div); component stamps after the rest spread. No
`on:` forwarding, no `asChild`, no `any`. Item class composition
stays reactive (no captured initial `className`). IDs via
`$props.id()` only; deterministic suffixes per ItemFieldContext.
Round-1 review amendments: `ItemDivider` is group-only by contract
(it IS an `<li>`); `ItemField` carries no `disabled` prop — adapters
own forwarding disabled to their controls; `ItemChevron`'s wrapper
span carries `aria-hidden` itself; `ItemMedia` variant="image"
without `src` renders the empty square; the `<ul>` duplicates
`data-size` (the rhythm key for its gap law); `Item` rest-attrs
extend `HTMLAnchorAttributes` (anchor superset, native-select
precedent — div-only attrs not provided on purpose).
