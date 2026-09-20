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
motion`. The per-axis TYPE CONTRACT (frozen — Codex r1 B1):

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
  (`font-size: var(--jx-size-slot-reset, 1em)`) where composition demands
  it. Never claim slotted content is un-scaled — it is not.
- **Context vs cascade** (Codex r1 B8): the Svelte context (ambient slot)
  carries the INTENT; the CSS custom properties carry the RENDER. They are
  two channels of one resolution: the slot resolves the lane, stamps the
  carrier vars as static strings (SSR-safe: no hydration mismatch — vars
  are data, computed once at render). Nested override = inner slot wins,
  exactly like `densitySlot` today.
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
  convention) and address a NAMED container as `@sm/card` — size first,
  then `/`, then the container name (Tailwind v4's own order; verified
  against the shipped tailwindcss 4.3.3 bundle, see
  research/tailwind-container-syntax.md). Container sizes ride their OWN
  `--container-*` scale (Tailwind: `@sm` = 24rem vs viewport `sm` = 40rem —
  the two scales must not collapse into one).
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

### §9.1 The query() interface freeze (Codex r1 B3 — W2 implements THIS)

```ts
// the public API (ships from the kernel lib; the component props accept
// the return value on every axis)
type QueryKey = string;                    // "sm" | "@md" | "@sm/card" …
type AxisQuery<T> = { readonly $query: true; readonly cases: [QueryKey, T][]; readonly base: T };
declare function query<T>(cases: Record<QueryKey, T>, base?: T): AxisQuery<T>;
```

- **Parse**: the object-literal form is sugar; `query()` normalizes to an
  ordered `cases` array (insertion order = the ladder) + an optional
  unconditional `base` (default: the axis default, `auto`).
- **Compile output** (the desugarer, W2): per consumer instance, custom
  property re-assignment blocks — media keys → `@media (min-width: …)`,
  container keys → `@container [<name>] (min-width: …)` — emitted in ladder
  order onto the component's scoped selector. Sizes resolve from the TWO
  scales: viewport `sm` and the `--container-*` namespace (they never
  collapse, per research/tailwind-container-syntax.md).
- **SSR first paint**: the server renders `base` (or the first unconditional
  lane) as the inline var value — a correct-if-unresponsive first paint.
- **The JS shim shell** (the Owner's 垫片 lane): a progressive module
  (`universal-props/query-shim`) loaded ONLY when (a) the build could not
  desugar (dynamic keys, exotic conditions) or (b) a consumer tree failed
  the container-supply check at runtime audit. The shim re-applies the
  ladder with a ResizeObserver per unresolved `@` key — idempotent, no
  hydration mismatch (it only writes vars post-paint).
- **Missing named container** (`@sm/card` with no `container-name: card`
  ancestor): the case never matches (CSS semantics); the build warns, the
  shim logs once in dev.
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
- stylex/tokens pipeline compatibility: the axes land as typed token members
  + slot helpers, not as per-component style objects.

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
| density | `jx.density` (today's) | the `data-density` scope stamp (unchanged) | `default` rung |
| color | `jx.color` | `--jx-color-effective` (a resolved hue/color value) | `var(--primary)` |
| theme | `jx.theme` | the `.dark` class scope (existing bridge) | OS/media default |
| elevation | `jx.elevation` | `--jx-elevation-effective` (level number) | `0` |
| motion | `jx.motion` | `--jx-motion-effective` (intensity) | `normal` |

Plus `container-type` where the family is a layout container (the `@`
query fuel). Generalized slot helpers land in `defaults.svelte.ts` beside
`densitySlot` (`sizeSlot`, `radiusSlot`, `colorSlot`, `shapeSlot`,
`elevationSlot`, `motionSlot` — same `explicit ?? ambient ?? own` fleet
law, same 「无意见不盖章」). Explicit prop > ambient context > own default,
and the CSS carrier always mirrors the resolved lane (SSR-safe static
strings). This protocol enters the component-authoring living spec as a
Requirement.

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
@supports (corner-shape: bevel)      { :root { --jx-shape-scoop: scoop; … } }
@supports not (corner-shape: bevel)  { :root { --jx-shape-scoop: square; … } }
```

No runtime detection, no class identities, the ratchet stays unmoved, and
the squircle ×2 factor rides the same vars (`--jx-radius-factor: 2` vs `1`)
so its degrade reversal is automatic.

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
   expected (ratchet unmoved; the W5 receipt proves it).
3. Meta drift gate (`component-metadata-gen --check`) extended: the shared
   universal block is generated, not hand-copied.
4. verify-all green; vision walkthrough rounds gated on pinned-phase
   captures (the splash-fan capture discipline: pin, assert same-moment,
   then judge).

## §17 The meta/IR pipeline freeze (W4's contract — Codex r1 B4)

The W4 docs/canvas wave implements THIS, not an improvisation:

1. **One shared artifact**: `apps/www/src/lib/universal-props.schema.ts`
   (mirror: `registry/files/lib/`) — the axis grammar types, the alias
   defaults, the query() key grammar, and the PropsTable/docs metadata
   (labels, descriptions) as ONE generated-from-hand source. Nothing else
   hand-copies the vocabulary.
2. **Generator merge rule**: `component-metadata-gen.mjs` (today: same-file
   `interface Props` parsing, defaults read from sibling
   `*-defaults.svelte.ts`, EMPTY on missing defaults) gains a final merge
   step — inject the universal block into EVERY family's generated zone,
   with a pinned **115-family inventory + exemption ledger**
   (`no-style`/pass-through families, e.g. pure containers, listed with
   reasons; a family absent from both is a gate failure, closing the
   empty-on-missing-defaults hole).
3. **IR extension**: `schema/ir.ts` gains `ControlHint` values per axis
   (enum-select incl. `auto`, number spinner with the axis' unit, and a
   `query-editor` composite) + a `universal` block on `ComponentMeta`;
   `schema2form`/`canvas-playground` render from those.
4. **Drift gate**: `--check` fails on any divergence between the shared
   artifact, the injected blocks, and the inventory (W5 wires it).
