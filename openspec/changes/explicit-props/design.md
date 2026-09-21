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
>   PER AXIS (§0.1): px for size/radius, coefficient for density/motion,
>   dp for elevation, hue degrees for color; shape/theme have no number
>   lane;
> - `query({ [condition]: <lane value> })` — responsive/container-conditional
>   values, §9. Usable on ANY axis, wraps ANY lane.

The axes: `size · shape · radius · density · color · theme · elevation ·
motion`.

### §0.1 The per-axis type table (frozen — Codex r1 B1, r3 audit)

| axis | value type | number unit | raw lane | default |
|---|---|---|---|---|
| size | `small \| medium \| large \| auto \| ${number}` | px (root font-size) | — | auto |
| shape | `round \| scoop \| bevel \| notch \| square \| squircle \| auto` | none (enum-only) | — | auto |
| radius | `small \| medium \| large \| auto \| ${number}` | px | — | auto |
| density | `small \| medium \| large \| auto \| ${number}` **+ legacy aliases** | **coefficient** (1 = default, NOT px) | — | auto |
| color | `primary \| secondary \| <semantic> \| <plugin-named> \| auto \| ${number} \| ${color}` | hue degrees (oklch primary formula) | yes (raw color) | auto |
| theme | `light \| dark \| system \| auto` | none (enum-only) | — | auto |
| elevation | `level-1 \| level0 \| level1 \| level2 \| level3 \| level4 \| level5 \| auto \| ${number}` | dp (exact) | — | auto |
| motion | `reduced \| subtle \| normal \| expressive \| auto \| ${number}` | intensity coefficient | — | auto |

**The elevation mapping is EXPLICIT** (Owner's `level${-1~5}` = M3's
`level0..level5` with one prepended concave rung):

`level-1 → −1dp · level0 → 0dp · level1 → 1dp · level2 → 3dp · level3 →
6dp · level4 → 8dp · level5 → 12dp`

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
- **slot 边界的诚实法则** (Codex r1 B8): slotted content renders INSIDE
  the root, so it INHERITS the scaled font-size naturally (CSS cascade —
  card.svelte renders snippets directly under root today, no reset
  wrapper). The law: family PARTS scale with the root; slotted content
  follows plain inheritance; a family MAY offer a reset wrapper escape
  (`font-size: var(--jx-size-base, 1rem)`) where composition demands
  it. The reset target is the SHEET BASE, not `1em` (which would inherit
  the scaled size — Codex r2): `font-size: var(--jx-size-base, 1rem)`,
  where `--jx-size-base` is the theme's un-scaled base. Never claim slotted
  content is un-scaled — it is not.
- **Context vs cascade** (Codex r1 B8): the Svelte context (ambient slot)
  carries the INTENT; the CSS custom properties carry the RENDER. They are
  two channels of one resolution: the slot resolves the lane, stamps the
  carrier vars as static strings (SSR-safe: no hydration mismatch — vars
  are data, static within a render; a runtime context change re-renders
  and re-stamps, the reactive-density precedent). Nested override = inner
  slot wins, exactly like `densitySlot` today.
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
  `max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px)))`
  — **the `var()` fallbacks are LOAD-BEARING** (Codex r1 B9): with no
  supplying ancestor the whole `calc()` would be invalid at computed-value
  time (max() does NOT rescue undefined vars — IACVT applies), so every
  effective var carries an explicit fallback and the root sheet defines
  invariants (`:root { --jx-radius-effective: 0px; --jx-inset-effective: 0px }`).
  Zero runtime probing; 「无合适容器」vanishes as a concept. With borders,
  the arc center concedes `calc(border-width / 2)`.
- `square` (resolved) ⇒ the radius lane is inert by definition.

## §4 density — spacing/leading scale (renamed from `compact`, Owner-agreed)

- Named: `small | medium | large` as the DOCUMENTED vocabulary, **mapped
  VERBATIM onto three of the EXISTING rungs (frozen, Codex r5 B6):
  `small → sm · medium → default · large → lg`** — `xs` and `2xs` remain
  directly addressable aliases (the full five-rung set survives); the
  plugin's default alias table registers all eight names. The kernel
  channels `--jx-gap/--jx-stack/--jx-inset/--jx-hit/…` are UNCHANGED.
- `auto`: inherit — EXACTLY today's `densitySlot` (`explicit ?? ambient ??
  own`, 「无意见不盖章」); the fleet law survives verbatim.
- **The coefficient carrier, frozen** (Codex r2 B2; the channel list
  verbatim per r4 B2 — this IS the census list, kernel internals
  (`--jx-density-*-<rung>` composing scales) stay the kernel's own): the
  CONSUMER-facing channels are exactly —
  `--jx-text`, `--jx-text-secondary`, `--jx-leading`, `--jx-leading-secondary`,
  `--jx-line`, `--jx-line-secondary`, `--jx-gap`, `--jx-gap-end`,
  `--jx-gap-content`, `--jx-stack`, `--jx-inset`, `--jx-hit`, `--jx-row-min`,
  `--jx-icon`, `--jx-image`, `--jx-media-gutter`, `--jx-chip-radius`,
  `--jx-toggle-track`, `--jx-toggle-width`, `--jx-toggle-knob`,
  `--jx-slider-track`, `--jx-textarea-min`, `--jx-color-lane` —
  each splits base/effective: the `-base` vars carry the rung values (W1
  converts the five-rung scopes to define them), the effective channel
  composes
  `--jx-<channel>: calc(var(--jx-<channel>-base) * var(--jx-density-coefficient, 1))`
  — one pattern for the PLAIN channels. **The four DERIVED channels freeze
  against the REAL CSS with the DOUBLE-SCALING LAW stated first** (Codex
  r8 B1 — the trap is real: if a derived formula composes operands that
  are ALREADY effective (base × coef) channels, multiplying by coef AGAIN
  yields coef²): **a derived channel applies the coefficient ZERO times
  when its operands are effective channels, and ONCE when its operands are
  the per-rung base scales.**

  | channel | today (real CSS) | effective form (frozen) |
  |---|---|---|
  | `--jx-row-min` | `--jx-density-row-min-<rung> = max(line + stack-gap + stack-gap, unit × --jx-density-row-floor-<rung>)` (jixoai.css:1081) | `max(calc(var(--jx-unit) * var(--jx-density-row-floor-<rung>)), calc((var(--jx-density-line-<rung>) + var(--jx-density-stack-gap-<rung>) + var(--jx-density-stack-gap-<rung>)) * var(--jx-density-coefficient, 1)))` — base scales × coef ONCE, rung floor absolute |
  | `--jx-hit` | `--jx-density-hit-min-<rung> = max(--jx-density-row-min-<rung>, --jx-hit-floor)`; `--jx-hit-floor = unit × 7` (theme-level, jixoai.css:1012) **with the 2xs scope's OWN override `unit × 6` PRESERVED (jixoai.css:2457)** | `max(var(--jx-hit-floor), calc(var(--jx-unit) * var(--jx-density-row-floor-<rung>)), calc((var(--jx-density-line-<rung>) + var(--jx-density-stack-gap-<rung>) + var(--jx-density-stack-gap-<rung>)) * var(--jx-density-coefficient, 1)))` — the triple max; the content term is the SAME source expression as row-min's (never a reference to the effective --jx-row-min — that would double-scale), floors absolute |
  | `--jx-textarea-min` | `max(var(--jx-hit), calc(var(--jx-line) * 3 + var(--jx-stack) * 2 + 2px))` (jixoai.css:2391) | **UNCHANGED from today** — its operands are the EFFECTIVE `--jx-hit`/`--jx-line`/`--jx-stack` (each already scaled once by its own composition); zero additional coef; the 2px constant absolute |
  | `--jx-color-lane` | `max(var(--jx-hit), calc(var(--jx-icon) + var(--jx-inset) * 2 + 2px))` | **UNCHANGED from today** — same effective-operand law |

  The rung selection stays in the scope blocks (only row-min/hit gain the
  composition layer; the -min-<rung> internals stay the kernel's own).
  The computed fixture covers `sm` AND `2xs` (the scoped hit-floor case)
  across row-min/hit/textarea-min/color-lane. The component root stamps
  `--jx-density-coefficient` when the number lane is used.
  **Precedence**: a NAMED lane sets the rung scope AND resets the
  coefficient to 1 (explicit rung = exact rung, never double-scaled); the
  NUMBER lane sets the coefficient and leaves the rung at ambient; `auto`
  stamps neither (inherit both). SSR: static strings, no computation.
  **Legacy mapping**: `2xs|xs|sm|default|lg` are aliases onto the existing
  rung scopes VERBATIM (zero migration for the 60 slot consumers).
  **The computed-style fixture** (W1 receipt): a probe reads `--jx-gap`
  under ambient-`sm`×0.75, named-`sm`, and auto, asserting all three
  compositions distinctly.
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
  convention) and address a NAMED container as `@sm/card` — size first,
  then `/`, then the container name (Tailwind v4's own order; verified
  against the shipped tailwindcss 4.3.3 bundle, see
  research/tailwind-container-syntax.md). Container sizes ride their OWN
  `--container-*` scale (Tailwind: `@sm` = 24rem vs viewport `sm` = 40rem —
  the two scales must not collapse into one).
- Values: any lane value of the wrapped axis (named/auto/number).
- **Semantics: min-width ladder, later keys override at wider matches**
  (mobile-first). **The desugarer EMITS blocks in REGISTERED-SCALE order
  (narrow → wide), never raw insertion order** — override semantics are
  authoring-order-independent: `{lg:'a', sm:'b'}` and `{sm:'b', lg:'a'}`
  compile to IDENTICAL css (the scale tables own the order, not the
  object). Media and container keys of the same width compose media-first
  (container wins where both match — the ancestor-nesting intuition).
  Container keys resolve against the NEAREST qualifying
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

### §9.1 The query() interface freeze (Codex r1 B3 — W2 implements THIS)

```ts
// the public API (ships from the kernel lib) — ONE standalone-compilable
// FROZEN block (Codex r8 B2; the const-object inference is VERIFIED by
// tsc: mixed named/number cases compile, invalid lanes are rejected):
type ViewportScale = 'xs' | 'sm' | 'md' | 'lg';                        // the registered default table
type ContainerScale = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';  // the --container-* scale
export type QueryKey = ViewportScale | `@${ContainerScale}` | `@${ContainerScale}/${string}`;
type RawCases = { readonly [K in QueryKey]?: string | number };
type QueryCase<T> = readonly [key: QueryKey, value: T];
type QueryResult<T> = { readonly $query: true; readonly cases: readonly QueryCase<T>[]; readonly base: T | undefined };
declare function query<const O extends RawCases, const B extends string | number = never>(cases: O, base?: B): QueryResult<O[keyof O] | B>;

// the eight lane types (§0.1) + the slot signatures:
type SizeLane      = 'small' | 'medium' | 'large' | 'auto' | number;
type ShapeLane     = 'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto';
type RadiusLane    = 'small' | 'medium' | 'large' | 'auto' | number;
type DensityLane   = 'small' | 'medium' | 'large' | 'xs' | '2xs' | 'sm' | 'default' | 'lg' | 'auto' | number;
type ColorLane     = 'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string; // string = raw/plugin names — closed at BUILD by the registration table
type ThemeLane     = 'light' | 'dark' | 'system' | 'auto';
type ElevationLane = 'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number;
type MotionLane    = 'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number;
interface AxisSlotResult<T> { readonly explicit: T; readonly ambient: boolean }
declare function sizeSlot(explicit: SizeLane | QueryResult<SizeLane>, own?: SizeLane): AxisSlotResult<SizeLane>;
declare function shapeSlot(explicit: ShapeLane | QueryResult<ShapeLane>, own?: ShapeLane): AxisSlotResult<ShapeLane>;
declare function radiusSlot(explicit: RadiusLane | QueryResult<RadiusLane>, own?: RadiusLane): AxisSlotResult<RadiusLane>;
declare function densitySlot(explicit: DensityLane | QueryResult<DensityLane>, own?: DensityLane): AxisSlotResult<DensityLane>;
declare function colorSlot(explicit: ColorLane | QueryResult<ColorLane>, own?: ColorLane): AxisSlotResult<ColorLane>;
declare function themeSlot(explicit: ThemeLane | QueryResult<ThemeLane>, own?: ThemeLane): AxisSlotResult<ThemeLane>;
declare function elevationSlot(explicit: ElevationLane | QueryResult<ElevationLane>, own?: ElevationLane): AxisSlotResult<ElevationLane>;
declare function motionSlot(explicit: MotionLane | QueryResult<MotionLane>, own?: MotionLane): AxisSlotResult<MotionLane>;
```

Verified behavior (the W2 battery's fixture pair, proven locally at W0 by
tsc probe): `sizeSlot(query({ sm: 'small', '@md/card': 42 }, 'large'))`
compiles (the const-object inference unions the case values + base, the
slot checks the union ⊆ the lane); `sizeSlot(query({ sm: 'invalid' }))`
REJECTS. Unknown KEYS (`{ badkey: … }`) pass the type layer and are
caught by the build-time key diagnostics (the desugarer's registered
scale tables) — the layer split is type=lanes, build=keys.

- **Parse**: the object-literal form is sugar; `query()` normalizes to an
  ordered `cases` array (normalized to REGISTERED-SCALE order, narrow →
  wide — see the Semantics bullet; insertion order is NOT the ladder) +
  an optional
  unconditional `base` (default: the axis default, `auto`).
- **Compile output** (the desugarer, W2): per consumer instance, custom
  property re-assignment blocks — media keys → `@media (min-width: …)`,
  container keys → `@container [<name>] (min-width: …)` — emitted in ladder
  order onto the component's scoped selector. Sizes resolve from the TWO
  scales: viewport `sm` and the `--container-*` namespace (they never
  collapse, per research/tailwind-container-syntax.md).
- **SSR first paint**: the server renders `base` (or the first unconditional
  lane) as the inline var value — a correct-if-unresponsive first paint.
- **The JS shim shell** (the Owner's 垫片 lane), module API frozen — the
  export entry W2 LANDS in `packages/vite-plugin/package.json` (it does
  not exist today; this change prescribes it, Codex r4 B4):
  `"./universal-props/query-shim": { "types": "./dist/query-shim.d.ts", "import": "./dist/query-shim.js" }`
  exporting `auditTree(root)` — walks the DOM for `[data-jx-query]`
  instances whose `@` keys lack a qualifying ancestor container
  (dev-mode warning, the build check's runtime twin) — and
  `mountQueryShim(instance)` — one ResizeObserver per unresolved `@` key,
  re-stamping the winning lane's vars POST-paint only (idempotent, no
  hydration surface); a per-route manifest of un-desugarable cases drives
  the dynamic `import()` — manifest schema (Codex r5): `{ route: string,
  instances: [{ id: string; key: QueryKey; reason: 'no-container' |
  'dynamic'; module?: string }] }` — W2's first test fixture).
- **Missing named container** (`@sm/card` with no `container-name: card`
  ancestor): the case never matches (CSS semantics); the build warns, the
  shim logs once in dev. **Empty container names (`@md/` — nothing after
  the slash) are REJECTED at parse**: the key grammar demands a non-empty
  name segment; `@md/` is a build error naming the key and the rule.
- **Test matrix** (W2 gate): desugar snapshots × {media, container, named,
  ladder-order, base-default} + shim parity cases + SSR snapshot + the
  no-container warning.

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
- **The stylex closure** (Codex r3 note): per-INSTANCE values cannot be
  static atoms — the split is: the axis THEME surface (alias defaults,
  ladder, composition layers) lands as typed token members consumed by
  atoms/lane-2 sheets exactly like today's channels; the per-instance
  resolved values arrive as INLINE `style` attribute vars on the family
  root (Svelte template strings — SSR-safe, the press-effect/props-table
  inline-var precedents). stylex never sees instance values; it consumes
  the vars they define.

## §11 The broadcast protocol — 「吃也供」(the authoring law)

A component that CONSUMES an axis' context MUST ALSO SUPPLY its resolved
value downward. The COMPLETE supply set, all eight axes (Codex r1 B2 —
this table is the frozen contract; W1 implements it and syncs
`context-coverage.config.json`):

| axis | context key (Svelte) | carrier stamped on root | root-sheet invariant |
|---|---|---|---|
| size | `jx.size` | `--jx-size-effective` (font-size + the var) | `:root{--jx-size-effective:1rem}` |
| shape | `jx.shape` | `--jx-shape-effective` | `:root{--jx-shape-effective:round}` |
| radius | `jx.radius` | `--jx-radius-effective` + `--jx-inset-effective` | both `0px` (§3 fallback law) |
| density | `jx.density` (today's) | the `data-density` scope stamp + `--jx-density-coefficient` (default 1) | `default` rung · coefficient 1 |
| color | `jx.color` | `--jx-color-effective` (a resolved hue/color value) | `var(--primary)` |
| theme | `jx.theme` | the `.dark` class scope (existing bridge) | OS/media default |
| elevation | `jx.elevation` | `--jx-elevation-effective` (level number) | `0` |
| motion | `jx.motion` | `--jx-motion-effective` (intensity) | `normal` |

Plus `container-type` where the family is a layout container (the `@`
query fuel). **The honest W1 delta** (Codex r3 B2): today's theme knows
NEITHER the `-base` split nor the coefficient — W1 converts the existing
five-rung scope blocks to define the `-base` channels and adds the
effective-channel composition layer verbatim per §4's frozen pattern; the
supply row above is the POST-W1 contract. Generalized slot helpers land in `defaults.svelte.ts` beside
`densitySlot` (`sizeSlot`, `radiusSlot`, `colorSlot`, `shapeSlot`,
`elevationSlot`, `motionSlot` — same `explicit ?? ambient ?? own` fleet
law, same 「无意见不盖章」). Explicit prop > ambient context > own default,
and the CSS carrier always mirrors the resolved lane as STATIC STRINGS
PER RENDER (Codex r2 caught the earlier "single computation" phrasing —
the value is
static within a render and SSR-safe, but a runtime context change (e.g.
the JS-mutable theme system) re-renders and re-stamps, exactly like
today's reactive density getter). This protocol enters the
component-authoring living spec as a Requirement.

## §12 The plugin layer

- **Alias tables** (per axis): `[$alias]: value` rows; `auto` and numbers are
  reserved literals and SHALL NOT be remappable (Owner ruling). Defaults
  ship the documented vocabularies (§1–§8) + legacy density names.
  **The alias mechanism is a CSS-VAR INDIRECTION, by design** (Codex r1 B5):
  a named step never inlines its value at use sites — it resolves to
  `var(--jx-<axis>-<alias>)`, and the kernel CSS defines the values. A
  plugin remap = redefining those vars (a tiny generated sheet). This makes
  the registry consumer story PURE CSS: a clean shadcn-add install receives
  the kernel files (vars + ladder), remaps by overriding vars, and needs NO
  runtime resolver — the W5 shadcn-add gate proves a clean consumer
  resolving named steps with alias overrides end-to-end.
- **@supports verdicts**: corner-shape (and any future capability) detected
  ONCE at the plugin/build layer — the verdict rewrites the ladder vars
  inside `@supports` blocks (see §14); components carry ZERO detection code.
- **query() compile + shim**: per the frozen interface, §9.1.
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

Any new-CSS capability: plugin-level @supports verdict, one global
treatment, documented fallback table (§2's is the first instance). A
degrade is a DESIGNED state with receipts, never silent luck.

**The verdict stamps VARS, never classes** (Codex r1 B6 — this closes the
contradiction with §10's zero-class-identity law): the kernel ships the
ladder twice, gated by CSS itself —

```css
/* the ladder — per-shape factors, NOT one global factor (Codex r3 B4) */
@supports (corner-shape: bevel) {
  :root {
    --jx-radius-factor-round: 1;
    --jx-radius-factor-squircle: 2;   /* the ×2 law, live */
    --jx-shape-scoop: scoop;          /* alias ladder intact */
  }
}
@supports not (corner-shape: bevel) {
  :root {
    --jx-radius-factor-round: 1;
    --jx-radius-factor-squircle: 1;   /* degrade reversal, same var */
    --jx-shape-scoop: square;
  }
}
```

**The consumption chain is frozen** (Codex r2/r3 — families read the
ladder, never the capability): the SHAPE lane resolution stamps, as a
static per-render string,
`--jx-radius-factor-effective: var(--jx-radius-factor-<resolved-shape>)`
(the resolved literal picks the alias) — family CSS then writes
`corner-shape: var(--jx-corner-<n>)` (composed from the alias ladder) and
`border-radius: calc(var(--jx-radius-effective, 0px) * var(--jx-radius-factor-effective, 1))`.
Capability verdict, alias choice, squircle ×2 and degrade reversal are
pure var composition, one auditable chain, zero branches: supported +
squircle → r×2; degraded + squircle → r×1 round; round → r×1 always.

No runtime detection, no class identities, the ratchet stays unmoved, and
the ×2 law rides the PER-SHAPE factor vars
(`--jx-radius-factor-squircle: 2` supported vs `1` degraded) so its
reversal is automatic.

**Existing component-level probes are REGISTERED EXCEPTIONS, absorbed in
W2** (Codex r1 B7): `press-effect-runtime.ts`'s inline
`CSS.supports('corner-shape','bevel')` and avatar's component-CSS degrade
predate the verdict layer — W2 either routes them through the ladder vars
or files their exemption in the gate's exception ledger with reasons.

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
   expected. **The ratchet receipt binds the EXACT constants** (Codex r2):
   `files=2, identities=7, occurrences=7, zones={routes:1, site-libs:0,
   ui:6}, forms=42` — W5 asserts these verbatim against
   `scripts/verify-tailwindless.mjs`'s RATCHET; any drift is red, not
   "reviewed".
3. Meta drift gate (`component-metadata-gen --check`) extended: the shared
   universal block is generated, not hand-copied.
4. verify-all green; vision walkthrough rounds gated on pinned-phase
   captures (the splash-fan capture discipline: pin, assert same-moment,
   then judge).

## §17 The meta/IR pipeline contract (artifact = PRESCRIBED for W4; embedded interface text = FROZEN — Codex r6 note, §18)

The W4 docs/canvas wave implements THIS, not an improvisation. The
interfaces are complete and placeholder-free (§18: binding on the change
text; the code delta is W4's to land; code-absence before the wave is not
a defect):

```ts
// universal-props.schema.ts — the ONE shared artifact (www + registry mirror)
export interface UniversalAxisDoc {
  axis: 'size' | 'shape' | 'radius' | 'density' | 'color' | 'theme' | 'elevation' | 'motion';
  label: string;                       // PropsTable display
  description: string;                 // one-line docs prose
  namedSteps: readonly string[];       // the DOCUMENTED vocabulary
  numberUnit: 'px' | 'coefficient' | 'dp' | 'hue' | null;
  rawLane: boolean;                    // color only, true
}
// The shipped rows, verbatim (§0.1 is the source; labels/descriptions are
// the curated docs strings, editable ONLY here):
export const UNIVERSAL_AXES: readonly UniversalAxisDoc[] = [
  { axis: 'size',      label: 'Size',      description: 'the base scale — root font-size; parts size in em',            namedSteps: ['small', 'medium', 'large'],   numberUnit: 'px',         rawLane: false },
  { axis: 'shape',     label: 'Shape',     description: 'corner geometry (CSS corner-shape; §14 degrade table)',        namedSteps: ['round', 'scoop', 'bevel', 'notch', 'square', 'squircle'], numberUnit: null, rawLane: false },
  { axis: 'radius',    label: 'Radius',    description: 'corner size; auto = the concentric broadcast (§3)',            namedSteps: ['small', 'medium', 'large'],   numberUnit: 'px',         rawLane: false },
  { axis: 'density',   label: 'Density',   description: 'spacing/leading scale over the kernel channels (§4)',          namedSteps: ['small', 'medium', 'large'],   numberUnit: 'coefficient', rawLane: false },
  { axis: 'color',     label: 'Color',     description: 'the hue axis of the fixed oklch primary system (§5)',           namedSteps: ['primary', 'secondary', 'error', 'warn', 'success', 'info'], numberUnit: 'hue', rawLane: true },
  { axis: 'theme',     label: 'Theme',     description: 'light/dark profile; system = the JS-mutable global (§6)',       namedSteps: ['light', 'dark', 'system'],    numberUnit: null,         rawLane: false },
  { axis: 'elevation', label: 'Elevation', description: 'official M3 levels over the surface ladder (§7)',              namedSteps: ['level-1', 'level0', 'level1', 'level2', 'level3', 'level4', 'level5'], numberUnit: 'dp', rawLane: false },
  { axis: 'motion',    label: 'Motion',    description: 'intensity across the motion kernels (§8)',                     namedSteps: ['reduced', 'subtle', 'normal', 'expressive'], numberUnit: 'coefficient', rawLane: false },
];

// ir.ts additions — the EXISTING unions/interfaces transcribed verbatim
// (Codex r4 B5 — no placeholders), plus the contract additions:
export type ControlHint =
  | 'segmented' | 'select' | 'toggle' | 'stepper' | 'slider' | 'text' | 'none'
  | 'axis-enum' | 'axis-number' | 'query-editor';   // ← the additions
export interface ComponentMeta {
  source: string;                        // registry source path
  props: Record<string, PropNode>;
  hooks: readonly string[];              // data-jx-* hook attributes
  universal?: readonly UniversalAxisDoc[]; // ← the addition — OPTIONAL at the type level; the drift gate (4.6) enforces PRESENCE for every non-exempt family (Codex r7 B4 — exempt metas legally omit it)
}
// the generator's emitted JSON gains the same `universal` array verbatim;
// the merge output for a normal family = existing fields untouched +
// universal === UNIVERSAL_AXES
```

1. **Generator merge rule**: `component-metadata-gen.mjs` (today: same-file
   `interface Props` parsing, defaults from sibling `*-defaults.svelte.ts`,
   EMPTY on missing defaults) gains a FINAL merge step —
   `meta.universal = UNIVERSAL_AXES` for every family whose directory
   appears in the inventory. Merge precedence: generated zone owns the
   injection; hand-authored annotations may only CURATE (labels/descriptions
   overrides), never delete the block.
2. **The inventory + exemption ledger** — **committed in W0 at
   `research/universal-props.inventory.json`** (115 families, unique,
   sorted, exhaustive against the dir census; exemptions open EMPTY —
   additions are gate-visible deltas), **promoted by W1** to sit beside
   the schema file; the two frozen fixtures (normal `card` + the exempt
   shape) live at `research/universal-props-fixtures.md`. A family in
   NEITHER list is a gate failure (this closes the
   empty-on-missing-defaults hole Codex flagged).
3. **`--check` failure format** (the drift gate): one line per divergence —
   `<family>: <field> expected <value> got <value>` — plus a summary count;
   exit 1.
4. **Fixtures** (committed under `research/`): the NORMAL fixture carries
   `card`'s REAL extracted meta (the generator's own output, verbatim) +
   the universal delta; the EXEMPT fixture is the shape contract (no live
   exemption exists at W0 — see §18). The `--check` gate (W4 wiring)
   loads and asserts BOTH.

## §18 Contract-status vocabulary (Codex r5 — the scope ruling)

To keep "what the change binds" and "what the code has" from colliding
again, EVERY interface/artifact in this change carries exactly one status:

- **FROZEN** — the TEXT here is binding, complete, compilable where it is
  code, placeholder-free. Waves implement it verbatim.
- **PRESCRIBED for W\<n\>** — same binding force, and the code lands in
  wave W\<n\>. The artifact's absence from today's tree is EXPECTED — it
  is the wave's deliverable, never a review blocker.
- **DONE** — the artifact exists in this change's commits already.

Statuses in this change: the §0.1 table, §3/§4 formulas, §9.1 types, §11
supply table, §14 ladder = FROZEN. ir.ts additions (§17), the query-shim
export, universal-props.schema.ts/css, the registry item (§12, registry
spec) = PRESCRIBED for W1-W4 as marked. research/universal-props.inventory.json
= DONE (W0). A completed task's checkbox means its WAVE-scope work is
done — W0's fixture task produced the shape contract + the real card
extract; the `--check` LOADING is W4's gate task (4.6), tracked there,
not hidden inside 0.7.
