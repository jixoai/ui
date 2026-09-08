## ADDED Requirements

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
the mount action) exactly as scroll-run owns the scroll axis; no
component family keeps a local glass paint formula on the stamp
channel. Builders clamp finite numerics into their documented ranges
and throw on non-finite input — a broken value fails loudly at the
builder, never silently in css.

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

- GIVEN `use:liquidGlass(fx)` with ONE LiquidGlassEffect object (the
  ripple.svelte.ts runtime precedent — effects may own runtime JS;
  there is no filterId to pair: the action mints the per-instance
  id, renders the filter, and writes the pointer var, so a mismatched
  attrs/filter pair is unrepresentable)
- WHEN the action mounts
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
