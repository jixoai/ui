# Proposal: the glass effect unification — blur(options) + the NEW liquidGlass(options)

## Why

Owner ruling (2026-09-08): 「把目前的 effect 进行改造：把 glass 和 blur
合并成一个 blur，但是提供 Options 参数来做调整。然后引入 Liquid Glass
这个新的 effect——它有 SVG 版本的，也有好几个参数可以调控。」

The repo's glass/blur paint is scattered across FIVE hand-tuned,
option-less implementations (no two share bytes):

| where | paint | options |
| --- | --- | --- |
| `.jx-glass` theme utility (jixoai.css:332) | blur(14px) saturate(1.35), fill 68% | none — hardcoded |
| tabs indicator material `glass` (tabs-trigger.css:57) | blur(10px) saturate(1.5), fill 40% | none |
| tabs indicator material `liquid` (tabs-list.svelte:496) | `url(#f) blur(2px) saturate(1.6)` over feTurbulence NOISE displacement | none — fixed seed/scale 14 |
| toast material `glass` (toast-viewport.svelte:687) | Tailwind `backdrop-blur-md`, fill 55% | none |
| `.jx-surface[data-variant='acrylic']` (jixoai.css:664) | blur(14px) brightness(2), fill 72% | theme vars, local only |

"glass" and "blur" are the same physics (backdrop blur + saturation +
translucent fill) implemented five times with magic numbers; the ONE
SVG displacement effect (tabs `liquid`) is noise turbulence — wavy
water, not a lens — and is welded inside tabs.

## Scope rulings (plan review 2026-09-08; ruling 2 AMENDED twice — 2026-09-09)

1. **合并落点 = backdrop glass paint family.** The scroll-axis blur
   effects (ramp({blur}), progressBlur, page-transition blur) are
   MOTION effects of the scroll axis, already unified under scroll-run
   (Owner 2026-09-04「统一成一套」) — out of scope here. What merges is
   the glass paint family above into ONE typed effect: `blur()`.
2. **Liquid Glass = kube.io 的源码级配方 + 双层 API** (AMENDED — the v1
   "pre-rendered build-time map" ruling was superseded at r9; r10
   locks the SOURCE-LEVEL port). The Owner walked the v1 prototype
   and ruled (2026-09-09): 「不大对，你读过 https://kube.io/blog/liquid-glass-css-svg/
   这个文章吗」, then — after the re-read — 「我感觉不对劲…你有看它源代
   码吗」. The page's real source (inline filter chains, the React
   bundle's generator, and the SHIPPED displacement/specular maps,
   decoded) is the recipe: a ray-traced profile WITH the glass-slab
   path term `d(s) = T.x/T.y·(H·thickness + bezel)`, four surfaces,
   ÷maximumDisplacement-normalized maps swept along the border at 2×
   dpr, absolute-px `scale`, a 9-primitive chain (in-chain blur →
   displace → saturate 4–9 → the saturated-copy/ring-alpha specular
   pair), and a pointer-only `backdrop-filter: url(#id)` element
   side. v3 — the line-level port — earned the Owner's 「不错这个效果
   符合预期」. **The API is two layers** (Owner's sketch 「liquid({...}) /
   liquid.apple({...})」): `liquid()` = the PHYSICAL objective facts
   (every knob); `liquid.apple()` = the SEMANTIC iOS standard
   (variant/tint/interactive/shape/isEnabled) compiled down, no
   physics exposed. **blur() stays zero-JS; liquid's lens is a
   runtime enhancement** over the unconditional frost base (the
   ripple precedent) — no-JS/pre-hydration paints honest frost. The
   feTurbulence noise route retires when the lens lands (破坏性更新).

## What Changes

- **NEW registry item `glass`** (`registry/files/ui/glass/`, type
  `registry:ui`, the scroll-run shape — a law item, not a wrapper
  component): `glass.ts` (typed builders `blur()` / `liquid()` /
  `liquid.apple()` + `GlassEffect` union + the stamp helpers, the
  press-button effect convention's third instance), `glass.css` (THE
  one law sheet), `glass-map.ts` (the runtime pure field core — the
  four surfaces, the ray-traced profile, lens/specular field
  builders; node-testable, zero DOM), `liquid-glass.svelte.ts` (the
  `use:liquidGlass(fx)` action over `attachLiquidGlass`: measure →
  compute → canvas encode → per-instance filter mount → pointer var
  LAST; ResizeObserver lifecycle), `index.ts`.
- **The law channel**: `data-jx-effect='blur' | 'liquid-glass'` +
  `--jx-glass-*` inline vars (stamps carry intent; css composes
  policies). `.jx-glass` theme class RETIRES.
- **`blur(options)`** subsumes every paint above:
  `{ radius, saturate, fill, brightness }` — defaults are today's
  `.jx-glass` VALUES (14px / 1.35 / 68% fill; computed-equivalent
  paint, an identity brightness(1) may append — r1 P1-10 wording).
- **`liquid(options)`** (physical) + **`liquid.apple(options)`**
  (semantic, compiled down):
  physical `{ surface, bezel, thickness, scale, blur, specular,
  rimSaturate, radius, saturate, fill, brightness }`; semantic
  `{ variant, tint, interactive, shape, isEnabled }`. The lens rides
  a per-instance SVG filter behind
  `@supports (backdrop-filter: url(#…))` as a **pointer-only**
  chain (frost lives inside the filter), mounted by the ONE action
  from the ONE effect object — the r5/r6 atomic-pairing concern is
  closed structurally; v1's `filterId` is gone. Chromium paints the
  lens; Safari/Firefox/no-JS keep the frost paint — same geometry,
  honest paint.
- **Consumers rebase** (public APIs unchanged — the merge is at the
  LAW level): tabs materials `glass`/`liquid` (liquid upgraded from
  noise to lens; its indicator element gains `use:liquidGlass(fx)`;
  tabs gains the `@jixoai/glass` edge), toast material `glass`
  (backdrop-blur-md class retires for the law channel; saturate
  pinned 1 for fidelity), `.jx-glass` users (toc mobile rail, www
  docs-sections-nav, tokens demo, print sim-shell toolbar — its raw
  formula DELETES, r1 P1-5), `.jx-surface` acrylic (VALUE-level
  token rebase — selector and motion branches stay theme-owned; the
  declared exception to the stamp channel, r1 P1-4 ruling).
- **The field is COMPUTED, never hand-edited**: no generator script,
  no committed map artifact, no artifact gate (the v1 PNG/zlib/
  ceiling machinery is void). The pure core is pinned by the spec
  battery's golden properties — including the BAND-UNIFORMITY law
  on a 512×256 element (the anisotropy regression the Owner's ruling
  forced into law) and the semantic compile table; the migration
  canary (normalized `jx-glass(?![-\w])` regex over shipped code
  surfaces, comments stripped) relocates into the same battery as a
  source-scan. The NORMATIVE implementation is the approved
  prototype `.agents/prototypes/2026-09-09-glass-effect-preview/glass/*.ts`
  — Lane A moves it into the item.
- **Docs + playground**: `/docs/components/glass.html` (ComponentCanvas
  + the playground dock: BOTH layers — physical sliders + the
  semantic variant row, live regeneration over a visual band),
  registry.json edges/metadata, taxonomy/docs-nav/availability-chain
  rows, tabs/toast/tokens copy updates.
- **Tests**: NEW glass-map spec (pure field goldens + the kube-faithful
  profile shape), glass-effect spec (builders/law source-pins/compile
  table/canary), liquid-glass-action spec (jsdom mount/update/
  destroy/guards/shape-override); tabs-indicator/toast assertions
  re-pinned; verify-print selector updated.

## Impact

Registry items: NEW `glass` (canonicalMain override → glass.ts —
the module is the item's front door; registryDependencies
`@jixoai/jixoai-theme` only — no dead edges, r1 P1-6/P1-7); edges
added to `tabs`, `toast`, `toc` (+ www-only docs-sections-nav rides
the site's own import); `verify-shadcn-add` CASES gains the glass
clean-consumer case. Theme `jixoai.css` loses `.jx-glass` (law moves
into the item; acrylic block value-tokenized). Mirrors
(registry/files ⇄ apps/www/src/lib) double-write everything — item
registration + mirror overrides land BEFORE manifest regeneration
(r1 P1-6 ordering). Docs site: one new route, three copy updates.
Scripts: verify-print.mjs (sim-toolbar selector) only — NO new
gen/verify scripts (the v1 generator+gate pair is superseded by the
runtime pivot). Tests: three new suites + two re-pinned suites +
mirror copies. No published-package (npm) surface changes —
`@jixoai/<name>` item namespace only.
