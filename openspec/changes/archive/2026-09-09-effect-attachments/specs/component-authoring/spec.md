## ADDED Requirements

### Requirement: effects are attachments — the {@attach} channel and the data-jx-attach forwarding law (Owner 2026-09-09)

Element-level effects (glass blur/liquid, press shimmer/pulse/
rainbow/ripple) SHALL mount through Svelte attachments: effect
items export attachment FACTORIES — `liquidGlass(fx)` /
`pressEffect(fx)`, param in, attachment out — so `{@attach
liquidGlass(fx)}` attaches directly (the whole expression IS the
attachment; `Attachment = (element) => void | cleanup-function`,
the resolved-svelte contract — there is NO update/destroy-object
channel and NO action-call form: identity change re-mounts, teardown
runs the returned cleanup). Param objects FLOW, never mutate
(the demo law): replacing the fx object destroys and re-mounts;
deep mutation is TWO-SIDED, both halves measured — no channel
deep-reads the param itself (the fromAction getter is
reference-level), but the attachment body's own property reads on
a `$state`-held fx register fine-grained deps, so deep mutation
re-runs the attachment. Action-shaped internals (the repo's `(element, …) =>
`` {destroy} `` helpers) SHALL bridge via `svelte/attachments`'
`fromAction(action, () => param)` — a bare syntax swap silently
leaks them (the verified counter-example). Host components reach
the SAME syntax: they spread `...rest` onto their root element and
consumers write `<PressButton {@attach pressEffect(shimmer())}>` —
Svelte's NATIVE component-tag attachment forwarding (the
createAttachmentKey symbol prop rides the rest spread; spike-
verified mount+teardown on the resolved svelte; an undefined value
skips, the `if (fn)` guard). The r2 `attachments` record prop is
RETIRED within this change (an over-design corrected by the Owner's
2026-09-10 review). The two channels stay orthogonal:
`data-jx-attach` is the optional named mounting-point STAMP
(queryable contract-naming); `data-jx-effect` is the paint-stamp
channel (CSS laws read it); they never merge. Attachments
self-listen (pointer/keyboard, `:disabled`/aria state) with zero
coupling to host state machines. No component ships an `effect`
prop after this change, and no `use:` action syntax remains in the
scanned surface (breaking, no compat — the Owner's one-step
ruling).

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

## MODIFIED Requirements

### Requirement: the glass effect family — blur + liquid (Owner 2026-09-08「把 glass 和 blur 合并成一个 blur」)

Backdrop glass paint SHALL be ONE typed effect family on the
press-button effect convention (builders keep options typed and
discoverable): `blur({ radius, saturate, fill, brightness })` —
the merged glass+blur paint, every prior hand-tuned glass
implementation's formula — and `liquid({ surface, bezel, thickness,
scale, blur, specular, rimSaturate, radius, saturate, fill,
brightness })` — the SVG lens-refraction member's PHYSICAL layer
(the kube.io source-level recipe, the objective facts) — plus
`liquid.apple({ variant, tint, interactive, shape, isEnabled })` —
the SEMANTIC layer carrying SwiftUI's glassEffect standard, compiled
DOWN into the physical layer and exposing no physics (the Owner's
two-layer ruling, 2026-09-09). The family lives in ONE registry item
(`@jixoai/glass`: builders, the law sheet, the runtime field core,
the mount kernel + the `liquidGlass` attachment factory) exactly as
scroll-run owns the scroll axis; no component family keeps a local
glass paint formula on the stamp channel. Builders clamp finite
numerics into their documented ranges and throw on non-finite
input — a broken value fails loudly at the builder, never silently
in css.

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
