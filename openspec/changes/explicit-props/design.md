# Design — the explicit props contract (settled 2026-09-21, two Owner rounds)

> This file is the SPEC OF RECORD for the system. Owner quotes live in
> [proposal.md](./proposal.md); everything here is either an Owner ruling or
> a coordinator decision explicitly delegated by one (「你定吧」).

## §0 The grammar (总纲) — one law, eight axes

> **每根轴 = `named | auto | ${number}` 三车道，外加正交的 `query()` 包装。**
> - `named` — resolves through the plugin alias table (`[$alias]: value`,
>   developer-remappable, addable, removable);
> - `auto` — RESERVED LITERAL: inherit (the resolved context flows; may not
>   be remapped or shadowed). `auto` is the DEFAULT of every axis;
> - `${number}` — RESERVED LITERAL: exact-value escape. The unit is defined
>   PER AXIS (§1–§8): px for size/radius/density, dp for elevation, hue
>   degrees for color, intensity coefficient for motion;
> - `query({ [condition]: <lane value> })` — responsive/container-conditional
>   values, §9. Usable on ANY axis, wraps ANY lane.

The axes: `size · shape · radius · density · color · theme · elevation ·
motion`. `shape` and `theme` are enum-only (no number lane — their domains
are not numeric).

## §1 size — the base scale (root font-size; children em)

- Named: `small | medium | large` (plugin aliases; more can be registered —
  `x-small` etc. are NOT shipped: the number lane already covers fine-tuning,
  t-shirt outward naming does not scale).
- `auto`: inherit the effective font-size context (the resolved
  `--jx-size-effective` of the nearest contributor; ultimately the sheet's
  base).
- `${number}`: root font-size in px. Children of the component root size via
  `em` (the whole point: ONE number moves a family).

LAWS:
- **Unitless line-heights only** inside em-scaled families (else compounding
  explodes).
- **Fixed micro-typography is EXEMPT from em-scaling**: `--text-caption`
  (9px) and `--text-micro` (10px) are absolute semantic rungs (the 2026-09-21
  caption ruling) — they ride rem, never em.
- **slot boundary = scaling boundary**: slotted user content is NOT re-scaled
  (a feature; document it).
- **Native collision rule**: on native-element wrappers (`<input>`, `<select>`
  …), the component's `size` prop is consumed by the family and NEVER
  forwarded; the native attribute keeps working only via explicit rest
  escape (`{...rest}` still forwards everything the family does not own —
  destructured props win, the established pattern). Same rule for `color`
  (§5). 16 families audited (input, native-select, textarea, color-picker,
  range, checkbox, radio, file-input, number-input, cascader, tags-input,
  input-otp, combobox, input-group, date-picker, ghostty-term).

## §2 shape — corner geometry (CSS corner-shape)

- Enum: `round | scoop | bevel | notch | square | squircle | auto`.
- `auto`: inherit the resolved shape context.
- **Degrade table** (the @supports verdict, plugin-wide, §14): when
  `corner-shape` is unsupported (Safari/Firefox TODAY — the degrade path is
  the MAIN path): `scoop|bevel|notch → square`; `squircle → round`;
  `round|square → themselves` (native border-radius semantics).
- **The squircle ×2 law**: when the RESOLVED shape is squircle, the effective
  border-radius doubles (superellipse reads equal-corner at half the radius).
  The ×2 follows the RESOLVED shape (inherited shape × explicit radius is a
  legal composition), and reverses on degrade.
- Per-corner authoring (ticket notches) is NOT a universal-prop concern —
  family-level escape hatch only (corner-shape accepts per-corner values).

## §3 radius — corner size

- Named: `small | medium | large`; `${number}` = px; `auto` = **concentric**.
- **Concentric auto — broadcast, not query**: every component root SUPPLIES
  `--jx-radius-effective` (its own resolved radius, ×2 applied if squircle)
  and its effective inset. A child resolving `auto` computes
  `max(0px, calc(var(--jx-radius-effective) - var(--jx-inset-effective)))` —
  one CSS expression, zero runtime probing, and 「无合适容器」vanishes as a
  concept (max() is the fallback). With borders, the arc center concedes
  `calc(border-width / 2)`.
- `square` (resolved) ⇒ the radius lane is inert by definition.

## §4 density — spacing/leading scale (renamed from `compact`, Owner-agreed)

- Named: `small | medium | large` as the DOCUMENTED vocabulary, backed by the
  EXISTING five kernel rungs — the plugin's default alias table registers
  `2xs|xs|sm|default|lg` alongside (legacy names keep working everywhere;
  the kernel channels `--jx-gap/--jx-stack/--jx-inset/--jx-hit/…` are
  UNCHANGED).
- `${number}`: a scale coefficient (1 = default) applied over the kernel
  channels via calc expressions.
- `auto`: inherit — this is EXACTLY today's `densitySlot` (`explicit ??
  ambient ?? own`, 「无意见不盖章」); the fleet law survives verbatim.
- **Orthogonality ruling**: `size` owns font-size; `density` owns
  line-height coefficient + gaps. They never fight over the same property.

## §5 color — the hue axis of a fixed oklch system

- Named: `primary | secondary | <semantic> | <plugin-registered>` where
  semantic = `error | warn | success | info` (builtin) and plugins may
  register more names. **Resolution order: semantic > palette > raw.**
- `${number}` = **hue degrees** through the primary formula
  (`oklch(L C calc(H ± drift))`, the L/C/drift pairs fixed per theme profile
  — the brand formula IS the system; `--brand-hue` is its living proof).
- `${color}` (raw value) passes through as-is.
- Non-primary named colors keep FIXED hues across jixoai sites (the standing
  theme law); they carry their own oklch triples in the alias table.

## §6 theme — light/dark with a JS-mutable system source

- Enum: `light | dark | system | auto`.
- `system` IS the global source: by default it tracks the OS
  (`prefers-color-scheme`), and it is **JS-mutable** (Owner: 「有些特殊情况下，
  使用了 system 这个字面量，但是我们仍然要强行进行全局修改，所以有这个能力」).
  One mutation point writes the global token source; every `auto`/`system`
  consumer follows on the next paint.
- `auto` = tree inheritance (a dark panel inside a light page), carried by
  the existing class bridge (`.dark` scoping — the boot-splash head-inline
  precedent).
- Theme flips drive the FULL profile: grounds, ink, shadow colors,
  backdrop-filter recipes (existing practice), and the elevation/surface
  pairing (§7).

## §7 elevation — official M3 Expressive (tint DEPRECATED)

- Levels: `level-1 … level5` mapping `-1dp | 0 | 1 | 3 | 6 | 8 | 12 dp`
  (`level-1` = the Owner's own concave rung: inset shadow + the surface
  BELOW base — no official equivalent). `${number}` = exact dp.
- **No surface tint** (Owner: 「跟随官方走」). Elevation expresses through
  (a) the shadow recipe per level and (b) the **surface ladder** this change
  ADDS to the theme: M3-style surface-container roles (`surface`,
  `surface-container-lowest … highest`, six rungs) for light AND dark — in
  dark, surface color steps carry the hierarchy (shadows are weak there);
  in light, shadows lead.
- The ladder obeys the 减色墨律: surface darkening never adds black overlays —
  it steps the surface roles.
- `-1dp` recipe: inset 1px shadow + `surface-container-lowest`-minus-one
  (a new deepest rung) — signals 「可填充的凹陷」.

## §8 motion — intensity, not duration

- Enum: `reduced | subtle | normal | expressive | auto`; `${number}` =
  intensity coefficient (plugin-defined curve maps it per kernel).
- `auto`: inherit; at the root, `reduced` bridges `prefers-reduced-motion`
  (OS preference → global → tree, isomorphic to theme's `system`).
- Maps onto the EXISTING kernels: surface-motion (panel timelines),
  press-effect family, SMIL loaders, View Transitions. The plugin's motion
  table maps intensity → per-kernel curve/duration presets.

## §9 query() — conditional values

- Keys: media conditions are bare (`sm | md | lg | …` — the responsive
  vocabulary, xs|sm|md|lg RESERVED for this use, Owner-ruled); container
  conditions carry `@` (`@sm | @md | …`, Tailwind v4's @container
  convention) and may address a NAMED container (syntax follows Tailwind
  v4's named-container design — resolved in W2 against the Tailwind source).
- Values: any lane value of the wrapped axis (named/auto/number).
- **Semantics: min-width ladder, later keys override at wider matches**
  (mobile-first). Container keys resolve against the NEAREST qualifying
  ancestor container — **a component cannot query itself** (CSS law; never
  document otherwise).
- **Carrier dual-track** (Owner: 编译期脱糖不绝对): the build desugars what
  it can prove into CSS (custom-property re-assignment inside
  media/container blocks — the carrier law §10 makes this possible), and a
  **JS shim shell** exists for what it cannot (SSR gaps, container-type
  supply failures, exotic conditions). The shell is a polyfill lane, not the
  primary path.
- **Container supply duty** (broadcast protocol §11): trees that use `@` keys
  need an ancestor with `container-type`; contributors of containers MUST
  stamp it. The build warns when an `@` key has no qualifying ancestor.

## §10 The carrier law — CSS expressions, not classes

Every axis value resolves to a **CSS expression** (Owner: 「准确来说，是 CSS
表达式…涵盖了 calc 或者一些高级的表达式」) assigned to custom properties on
the component root — vars are the degenerate case; `calc()`, `max()`,
`color-mix()`, var-chains are the general case (the concentric radius of §3
is the canonical example). Consequences:

- ZERO new class identities — the tailwindless ratchet stays UNMOVED (a
  vars carrier cannot trip the class census; classes remain family-owned
  vocabulary only).
- SSR/zero-JS by construction (values are data in the cascade); the JS shim
  of §9 is the only runtime surface, and it is a fallback.
- stylex/tokens pipeline compatibility: the axes land as typed token members
  + slot helpers, not as per-component style objects.

## §11 The broadcast protocol — 「吃也供」(the authoring law)

A component that CONSUMES an axis' context MUST ALSO SUPPLY its resolved
value downward. The supply set (stamped on every family root):

1. `--jx-size-effective` — the resolved root font-size (em base for children);
2. `--jx-radius-effective` + `--jx-inset-effective` — the concentric pair;
3. `--jx-shape-effective` — for the ×2 law and degrade composition;
4. the resolved density scope (today's data-density stamp, unchanged);
5. `container-type` where the family is a layout container (canvas, cards,
   panels) — the `@` query fuel.

Generalized slot helpers land in `defaults.svelte.ts` beside `densitySlot`
(`sizeSlot`, `radiusSlot`, `colorSlot`, … — same `explicit ?? ambient ?? own`
fleet law, same 「无意见不盖章」). This protocol enters the component-authoring
living spec as a Requirement.

## §12 The plugin layer

- **Alias tables** (per axis): `[$alias]: value` rows; `auto` and numbers are
  reserved literals and SHALL NOT be remappable (Owner ruling). Defaults
  ship the documented vocabularies (§1–§8) + legacy density names.
- **@supports verdicts**: corner-shape (and any future capability) detected
  ONCE at the plugin/build layer; degrade classes/vars stamped globally;
  components carry ZERO detection code.
- **query() compile + shim**: the desugarer (media/container blocks over
  custom props) + the JS shell (registered as a progressive module, loaded
  only where needed).
- **Motion map**: intensity → per-kernel curve/duration presets.

## §13 Migration mapping (old → new; additive by default)

| today | becomes |
|---|---|
| `Density = '2xs'\|'xs'\|'sm'\|'default'\|'lg'` (~60 files) | unchanged spellings, re-exposed as density aliases; docs vocabulary `small\|medium\|large` |
| `avatar size: 'sm'\|'md'\|'lg'` | the universal size axis (aliases md→medium) |
| `icon size: number (16)` / `spin size` | number lane verbatim (same semantics) |
| `sheet size: <css width>` / `prose size: <css length>` | RENAMED (e.g. `width`/`measure`) — they are not the scale axis; the collision-free rename is a per-family task |
| `blockquote ruleSize`, `heading level`, `ghostty-term fontSize` | keep (component-specific, no collision) |
| responsive utilities (`xs\|sm\|md\|lg` containers) | RESERVED for query keys (Owner ruling) |

## §14 Degrade general rule

Any new-CSS capability: plugin-level @supports verdict, one global stamp,
documented fallback table (§2's is the first instance). A degrade is a
DESIGNED state with receipts, never silent luck.

## §15 未裁决项 — coordinator dispositions (flag to Owner at review)

1. `notch` degrade target → `square` (assumed; the only safe geometry).
2. Per-corner authoring → family-level only (assumed).
3. Native collision rule → destructured-prop-wins + rest forwarding (§1).
4. Fixed micro-typography exemption → law in §1 (caption/micro stay absolute).
5. Media key thresholds (sm/md/lg px values) → plugin alias table entries
   (same remap rights as any named alias).

## §16 Gates (W5)

1. `verify:explicit-props` — NEW: (a) every family declares the eight axes
   through the shared slot helpers (AST over `*-defaults.svelte.ts`); (b) the
   carrier law — axis values never introduce class identities; (c) the
   broadcast duty — consumers stamp the supply set; (d) native families
   never forward owned props.
2. `verify:mirror` / stylex-payload / tailwindless — UNCHANGED behavior
   expected (ratchet unmoved; the W5 receipt proves it).
3. Meta drift gate (`component-metadata-gen --check`) extended: the shared
   universal block is generated, not hand-copied.
4. verify-all green; vision walkthrough rounds gated on pinned-phase
   captures (the splash-fan capture discipline: pin, assert same-moment,
   then judge).
