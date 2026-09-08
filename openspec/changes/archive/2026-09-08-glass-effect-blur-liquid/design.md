# Design: the glass effect unification (r10 — the kube source-level recipe + the two-layer API, 2026-09-09)

Round notes: r1–r8 reviewed the v1 static-map design (history). r9 was
the runtime pivot after the Owner rejected the v1 look. **r10 is the
SOURCE-LEVEL lock**: the Owner's ruling 「我感觉不对劲…你有看它源代码吗」
sent us into kube.io's actual page source — the 354KB HTML, the 285KB
React bundle (the generator lives in it, verbatim), and their SHIPPED
displacement/specular PNG maps (downloaded + decoded). The v2/r9 math
was my derivation; the real recipe differs structurally, and v3 (the
prototype the Owner approved: 「不错这个效果符合预期」) is a line-level
port of THEIR code. The API also grew a second layer per the Owner's
sketch 「liquid({...}) / liquid.apple({...})」: the physical layer is
the objective fact, the semantic layer is SwiftUI's glassEffect
standard compiled down (variant/tint/interactive/shape/isEnabled).

What the source-level audit established (all measured, not estimated):

- **profile = a ray tracer WITH the glass-slab path term**: `d(s) =
  T.x/T.y · (H(s)·thickness + bezel)` — thin-lens versions (v1/v2)
  miss the term that carries the look.
- **four surfaces** ship in their bundle: convex-circle, convex-
  squircle, concave, lip (a smoothstep blend of squircle + concave).
- **scale is absolute element px** (their components pin 54.97 on a
  56px searchbox, 22.26 on a 92px thumb, 133.97 on a 150px circle) —
  no universal fraction; the map is ÷maximumDisplacement normalized
  so scale alone carries magnitude.
- **the chain is 9 primitives in THEIR order**: feGaussianBlur(0–1)
  FIRST → feImage lens at element size → feDisplacementMap →
  feColorMatrix saturate 4–9 → feImage specular → feComposite in →
  feComponentTransfer slope 0.2–0.5 → feBlend × 2. The "specular" is
  NOT a white rim: it is the SATURATED displaced copy clipped by the
  ring's alpha, blended over, plus a faded ring.
- **the specular map is a ~1.5px border ring** with directional
  brightness (decoded peaks: top/bottom 220, left/right 128, alpha
  191/64 — a vertical light axis), black-transparent elsewhere.
- **maps ship at 2× dpr** (their searchbox map is 840×112 for a
  420×56 element) and are swept along the border (uniform px band,
  inward displacement — border R=227 left / R=36 right on the hero,
  center 128 neutral).
- **the element side is ONE url() pointer**: `backdrop-filter:
  url(#id)` + `rgba(255,255,255,.05)` tint + shadow — no css frost
  chain under the lens (the frost lives INSIDE the filter).

The normative implementation is the approved prototype:
`.agents/prototypes/2026-09-09-glass-effect-preview/glass/*.ts`
(strict-checked, node-verified, running live on the preview page).
Lane A moves it into the registry item — the spec battery pins its
goldens, measured against BOTH the prototype and kube's decoded
maps (our port renders 840×112 at the same geometry with border
encodings 225/31 vs their 227/36 — the port is faithful).

## 1. 现状 → 目标（数据流）

```
TODAY (five paints, zero options)          TARGET (one item, two builders + one action)

.jx-glass        ─┐                        glass.ts (typed builders, SSR-safe)
tabs glass        │  hand-coded            ├─ blur({radius,saturate,fill,brightness})
tabs liquid       │  magic numbers         │      → BlurEffect          (zero-JS, css-only)
toast glass       │  no shared law         ├─ liquid({surface,bezel,thickness,scale,blur,
surface acrylic   ─┘                       │        specular,rimSaturate,radius,saturate,
                                            │        fill,brightness})
                                            │      → LiquidGlassEffect  (PHYSICAL — the facts)
                                            ├─ liquid.apple({variant,tint,interactive,
                                            │        shape,isEnabled})
                                            │      → GlassEffect        (SEMANTIC — compiled down)
                                            └─ GlassEffect = Blur | LiquidGlass

   consumer markup  ←─ {…glassAttrs(fx)} ── data-jx-effect="blur|liquid-glass" + --jx-glass-*
                       (liquid: vars only — the POINTER is action-owned, never SSR'd)
                                                      │
   glass.css (THE law, item-owned)  ←────────────────┤ selector reads the stamp,
   ├─ UNCONDITIONAL frost paint (both members —       │ vars carry the tuning
   │  liquid's no-JS/unsupported fallback)            │
   ├─ @supports url() → liquid = POINTER-ONLY chain   │
   │  (frost lives INSIDE the filter; a css frost chain under
   │   url() would double-blur — the v3 lesson)
   ├─ @media print → filters off                     │
   └─ reduced-transparency → solid                   │
                                                      │
   liquid-glass.svelte.ts ←── use:liquidGlass(fx) ────┘ ONE action, ONE effect
   └─ attachLiquidGlass: measure (rect + border-radius or shape override)
        → glass-map fields (§5) → canvas 2× encode → append <filter> (§4)
        → set --jx-glass-filter LAST; ResizeObserver rAF-coalesced

   glass-map.ts (RUNTIME pure core, node-testable)  ←── no script, no artifact, no gate file
   └─ SURFACES · profile (the ray tracer) · computeLensField · computeSpecularField
```

## 2. The module — `registry/files/ui/glass/glass.ts`

The press-button effect convention (builders keep options typed and
discoverable), third instance — plain TS, zero runes, zero DOM
access, SSR-safe. **Two layers (the Owner's ruling): the physical
layer is the objective fact; the semantic layer is the iOS standard
compiled down and exposes NO physics.**

```ts
// — the physical layer: every knob, the objective facts —
export interface LiquidGlassOptions {
  surface?: GlassSurface;  // 'convex-circle' | 'convex-squircle' | 'concave' | 'lip'
                           // default 'convex-squircle' (Apple's preferred profile)
  bezel?: number;          // refraction band width in element px; default 22; [4,80]
  thickness?: number;      // the ray-traced slab thickness; default 30; [2,160]
  scale?: number;          // feDisplacementMap scale in element px; default 55; [0,160]
                           // (kube pins per element: 56px box→55, 92px thumb→22,
                           //  150px circle→134 — no universal fraction; docs say so)
  blur?: number;           // in-chain frost (feGaussianBlur stdDeviation); default 0.2; [0,4]
  specular?: number;       // faded-ring opacity (feFuncA slope); default 0.2; [0,1]
  rimSaturate?: number;    // rim saturation boost (feColorMatrix saturate); default 4; [1,12]
  // — frost fallback + tuning (no-JS / engines without backdrop-filter: url()) —
  radius?: string;         // default '2px'  (tabs liquid today)
  saturate?: number;       // default 1.6    (tabs liquid today)
  fill?: string;           // default = blur()'s
  brightness?: number;     // default 1
}
export interface LiquidGlassEffect {
  readonly type: 'liquid-glass';
  surface: GlassSurface; bezel: number; thickness: number; scale: number;
  blur: number; specular: number; rimSaturate: number;
  radius: string; saturate: number; fill: string; brightness: number;
  shape: 'capsule' | number | null;   // semantic leftovers for the mount
  interactive: boolean;
}

// — the semantic layer: SwiftUI glassEffect's standard —
export interface AppleLiquidOptions {
  variant?: 'regular' | 'clear' | 'identity';  // Glass.regular/.clear/.identity; default 'regular'
  tint?: string;            // Glass.tint(_:) → fill = color-mix(in oklab, TINT 30%, transparent)
  interactive?: boolean;    // Glass.interactive() → stamps --jx-glass-interactive:1
  shape?: 'capsule' | number;  // Shape override; default = the element's border-radius
  isEnabled?: boolean;      // false → identity behavior
}

export interface LiquidFactory {
  (o?: LiquidGlassOptions): LiquidGlassEffect;
  apple(o?: AppleLiquidOptions): GlassEffect;
}
export const liquid: LiquidFactory;

export function blur(o?: BlurOptions): BlurEffect;      // unchanged from r1
export function glassAttrs(fx: GlassEffect): Record<string, string>;
export function glassVars(fx: GlassEffect): string;
```

**The semantic compile table (our standard, pinned by tests):**

| Apple param | compiles to |
| --- | --- |
| `variant: 'regular'` | the physical defaults verbatim |
| `variant: 'clear'` | `{ blur: 0, fill: background 22% mix, rimSaturate 2.5, specular 0.12 }` |
| `variant: 'identity'` \| `isEnabled: false` | **the frost member** — `blur({radius:'2px', saturate:1.6, tint?})`; Apple's no-op maps to the law's own degradation, zero lens cost |
| `tint` | `fill = color-mix(in oklab, <tint> 30%, transparent)` |
| `interactive` | effect flag → `--jx-glass-interactive:1` var → the law's motion css (press scale/brighten); full press choreography composes with the press-effect channel at the consumer |
| `shape` | the mount's radius override ('capsule' = min(w,h)/2; number = px, clamped); unset = element border-radius |

**Numeric discipline**: finite numbers are CLAMPED into range (clamp,
not throw); NaN / ±Infinity / non-finite → TypeError at construction;
`surface` validates against the enum. Builders never touch
`document`. `glassAttrs` NEVER writes the `--jx-glass-filter`
pointer — that is the mount action's exclusive write.

## 3. The law sheet — `glass.css` (item-owned; `.jx-glass` retires)

scroll-run posture unchanged: timestamped intent header, literal
`@layer` wrapper, `:where()` zero-specificity, @supports/@media
nesting inside `@layer components`. Single-load via side-effect
imports.

```css
@layer theme, base, components, utilities;
@layer components {
  /* the UNCONDITIONAL frost paint — both members, every engine.
     For liquid this IS the no-JS / unsupported-engine fallback. */
  :where([data-jx-effect='blur'], [data-jx-effect='liquid-glass']) {
    background: var(--jx-glass-fill, color-mix(in oklab, var(--background, Canvas) 68%, transparent));
    -webkit-backdrop-filter: blur(var(--jx-glass-radius, 14px)) saturate(var(--jx-glass-saturate, 1.35)) brightness(var(--jx-glass-brightness, 1));
    backdrop-filter: blur(var(--jx-glass-radius, 14px)) saturate(var(--jx-glass-saturate, 1.35)) brightness(var(--jx-glass-brightness, 1));
  }

  /* the lens: POINTER-ONLY (r10 — the v3 lesson). The frost lives
     INSIDE the filter chain (feGaussianBlur is the first primitive);
     chaining css frost functions under url() would double-blur. The
     pointer's identity fallback covers the UNSET case only; the
     mount writes the pointer AFTER appending the filter node, so
     SET-but-missing never occurs through the API (hand-writing it
     is documented misuse, not css-solvable). */
  @supports (backdrop-filter: url('#jx-glass-supports-probe')) {
    :where([data-jx-effect='liquid-glass']) {
      -webkit-backdrop-filter: var(--jx-glass-filter, saturate(1));
      backdrop-filter: var(--jx-glass-filter, saturate(1));
    }
  }

  /* print + reduced-transparency blocks unchanged from r9 */

  /* Apple .interactive() — the semantic layer's press feedback. The
     flag var is the state carrier; the motion lives HERE (the demo
     page's :active recipe promoted into law), gated OFF under
     prefers-reduced-motion (motion is an enhancement too). */
  :where([data-jx-effect='liquid-glass'][style*='--jx-glass-interactive:1']) {
    transition: transform .18s cubic-bezier(.2, .9, .3, 1.4), filter .18s ease;
  }
  :where([data-jx-effect='liquid-glass'][style*='--jx-glass-interactive:1']):active {
    transform: scale(.93);
    filter: brightness(1.25);
  }

  @media (prefers-reduced-motion: reduce) {
    :where([data-jx-effect='liquid-glass'][style*='--jx-glass-interactive:1']),
    :where([data-jx-effect='liquid-glass'][style*='--jx-glass-interactive:1']):active {
      transition: none;
      transform: none;
      filter: none;
    }
  }
}
```

The reduced-transparency solid ground reads
`var(--jx-glass-solid-fill, var(--background, Canvas))` — an escape
hatch over the plain background token (the jx-surface
`--jx-surface-solid-fill` precedent; the inline `--jx-glass-fill` is
a translucent mix and cannot serve as the solid).

Cascade note (pinned by test): the @supports block follows the base
block in the sheet, so a mounted lens OVERRIDES the frost paint on
liquid in supporting engines — frost → lens, never unfiltered →
lens. blur() never enters the branch. The law carries NO
forced-colors block (consumer map below, unchanged from r9) and the
fallback VALUES remain the retired `.jx-glass` values
(computed-equivalence, r1 P1-10).

## 4. The liquid mount + filter — `liquid-glass.svelte.ts`

The action `use:liquidGlass(fx)` wraps a framework-agnostic
`attachLiquidGlass(el, fx) → {update, destroy}` (the ripple.svelte.ts
precedent — effects may own runtime JS; the prototype's module is
the normative shape):

- **mount sequence is the render law**: stamp channel + vars →
  measure (`getBoundingClientRect()` rounded; radius = `shape`
  override ?? computed border-radius, clamped into [0, min(w,h)/2])
  → compute fields (§5) → canvas-encode → append the zero-size host
  `<svg>` with the filter to `document.body` → ONLY THEN write
  `--jx-glass-filter`. SET-pointer-before-fragment is
  unrepresentable; pre-mount/SSR/no-JS paint the frost base.
- **resize**: ResizeObserver, rAF-coalesced, size-change-gated
  regeneration. **area cap**: beyond 262,144 raster px (512²) the
  raster downsamples (field stays element-px — uniform band holds),
  feImage stretches back.
- **guards**: no 2D canvas (`getContext('2d')` null — jsdom, ancient
  engines) → stamp vars and return (frost stands, no crash); zero
  box (display:none) → skip, the RO catches the element appearing.
- **update(fx)** re-stamps vars and rebuilds; **destroy** removes
  the host svg, the pointer var, and the RO.

**The chain — kube's own, verbatim order** (region defaults apply;
sRGB; both feImages at element size `x=0 y=0 width={W} height={H}`,
map already element-shaped so no preserveAspectRatio gymnastics):

```
feGaussianBlur   in="SourceGraphic" stdDeviation={fx.blur} → "blurred_source"
feImage          href=LENS_URL    x=0 y=0 width=W height=H → "displacement_map"
feDisplacementMap in="blurred_source" in2="displacement_map"
                 xChannelSelector="R" yChannelSelector="G" scale={fx.scale} → "displaced"
feColorMatrix    in="displaced" type="saturate" values={fx.rimSaturate} → "displaced_saturated"
feImage          href=SPEC_URL    x=0 y=0 width=W height=H → "specular_layer"
feComposite      in="displaced_saturated" in2="specular_layer" operator="in" → "specular_saturated"
feComponentTransfer in="specular_layer" → "specular_faded"
  feFuncA        type="linear" slope={fx.specular}
feBlend          in="specular_saturated" in2="displaced" mode="normal" → "withSaturation"
feBlend          in="specular_faded" in2="withSaturation" mode="normal"   (final)
```

Element chrome (tint/shadow) is CONSUMER styling (kube's own
component css), not law: consumers ship `background` tint (or the
`tint` semantic's compiled fill) + shadow + border-radius; the docs
page documents the recipe.

## 5. The field math — `glass-map.ts` (kube's generator, ported + verified)

Pure TS, zero DOM (browser/vitest/node identical); the normative
code is the prototype's `glass-map.ts` — Lane A moves it verbatim.

```
SURFACES (kube bundle, verbatim):
  convex-circle:   H(s) = √(1 − (1−s)²)
  convex-squircle: H(s) = (1 − (1−s)⁴)^(1/4)
  concave:         H(s) = 1 − √(1 − (1−s)²)
  lip:             smoothstep-blend( squircle(2s), concave(s)+0.1 )
  s = borderDistance / bezel ∈ [0,1)   (0 AT the border → the dome rises inward)

profile — the ray tracer (their Zt, η = 1/1.5, 512 samples):
  numeric slope (finite diff 1e-4) → surface normal n = normalize(−H′, −1)
  Snell: T = refract(I=(0,1), n, 1/1.5)
  d(s) = (T.x / T.y) · ( H(s)·thickness + bezel )     ← the PATH term (v1/v2 lacked it)
  normalize: ÷ maximumDisplacement (max |d| over samples) — the map is shape-only;
  feDisplacementMap's scale carries absolute element px.

sweep — rounded-rect SDF in ELEMENT pixel space (uniform band by construction):
  sd(p) = hypot(max(q,0)) + min(max(qx,qy),0) − r,  q = |p| − (half − r)
  dist = −sd (px inside); outward unit normal by DETERMINISTIC finite
  difference (fixed eps 0.75 — the prototype's choice; corner radial /
  axis-aligned bands by construction)
  encode: R = 128 − n̂x·(d/max)·127, G likewise with n̂y, B=0, A=255
  (−outward = inward ON CONVEX SURFACES: left border encodes > 128,
   right < 128 — matches kube's decoded maps: 227/36 at their borders;
   our port measures 225/31 at the same geometry. CONCAVE flips by
   physics — a diverging lens samples OUTWARD at the border (left
   encodes < 128); lip flips inside the band. The rim-pull golden is
   asserted on the DEFAULT convex surface.)
  dist ≥ bezel → flat interior, neutral 128; dist < 0 → neutral too (shape-safe).
  raster at 2× dpr, area-capped 512² (downsample raster, never the field).

specular — the border ring (their decoded maps; our port now matches
all four anchor values: peak RGB 220/129, peak α 191/65 vs their
220/128 and 191/64):
  gaussian across the border, σ ≈ 1.5 display px, CENTERED ~0.75px
  INSIDE (their decoded peak row sits 1 display px in; 0.75 also
  lands exactly on a 2× pixel center)
  directional RGB peak: 128 + (220−128)·|n̂y|   (vertical light axis)
  directional alpha: 255 · g · (0.25 + 0.5·|n̂y|)  (their 191/64 pair
  fits exactly — a uniform 0.75 α is 2.9× off on the sides)
  black-transparent elsewhere
```

**Golden properties (the spec battery asserts on the PURE core —
node-runnable, no DOM; the icon-gate law restated: derive from
source, trust no artifact; there IS no artifact):**
- center neutrality: element-center encodes (128,128) ±1;
- rim inward pull (the DEFAULT convex-squircle surface): 1px inside
  the left border mid-edge encodes R ≥ 128 + 90 (measured: 225) and
  the right border R ≤ 128 − 90 (measured: 31); |G−128| ≤ 2 there
  (axis symmetry);
- monotone decay: |enc−128| strictly decreasing at 1/8/17/34 px
  inside the border, zero beyond bezel;
- profile shape (holds for ALL FOUR surfaces — measured): argmax|d|
  within s ≤ 0.01 of the border, the border sample ≥ 60% of max,
  and |d| at mid-band (s = 0.5) ≤ 55% of max — edge concentration.
  (convex-squircle's argmax sits at s = 0.0059 with border = 73% —
  a naive "peaks at s=0" golden would contradict the code);
- specular anchors: peak RGB 220 (top) / 129 (left), peak α 191/65 —
  kube's decoded 220/128 and 191/64 within rounding;
- area cap is a HARD cap: a 2000×1200 field rasters at 660×396 =
  261,360 px ≤ 262,144 (floor rounding — round overshoots);
- **band uniformity (the anisotropy law)**: on a 512×256 element,
  top-edge mid-column and left-edge mid-row profiles agree within
  ±2 steps at every sampled depth — a stretched-map regression
  (v1's failure) cannot pass;
- quadrant antisymmetry: |R(x,y) + R(−x,y) − 256| ≤ 2 (G in y);
- semantic compile: apple regular ≡ liquid() defaults (deep-equal);
  clear/identity/tint/shape/isEnabled compile per §2's table;
- clamps + TypeError on non-finite; surface enum validation.

## 6. Consumers rebase (public APIs unchanged)

| consumer | change | stays |
| --- | --- | --- |
| `.jx-glass` users: toc mobile rail (both mirrors), www docs-sections-nav, www tokens demo, www print sim-shell toolbar | class → `data-jx-effect="blur"` + glass.css import; sim-shell's raw formula DELETED (r1 P1-5) — its stale `.jx-glass` COMMENT (~line 66) rewrites too | markup shape; verify-print expectations updated |
| tabs `glass` material | indicator stamps `data-jx-effect="blur"` + tuning vars (10px / 1.5 / 40%); tabs-trigger.css LOSES its glass formula lines | material enum, geometry, motion |
| tabs `liquid` material | inline feTurbulence svg DELETED; the indicator gains `use:liquidGlass(liquid({ radius: '2px', saturate: 1.6 }))` (ONE effect object through ONE channel); indicator chrome (tint/shadow) stays tabs-owned | material enum, hostStyle merge law |
| toast `glass` material | materialGround → `data-jx-effect="blur"` + toast vars (12px / 1 / 55%) | material enum, viewport table |
| `.jx-surface[data-variant='acrylic']` | VALUE-level token rebase (unchanged from r9) | zones, motion kernel |

The one-formula boundary (unchanged): `backdrop-filter: blur(` for
glass paint exists ONLY in glass.css across the stamp-channel
families; surface acrylic the declared exception (source-pin tested
both ways). forced-colors consumer map unchanged from r9 (toast
keeps its precedent; tabs/toc/docs gain Canvas grounds; tokens demo
exempt by declaration).

## 7. Degradation & environment matrix

| environment | blur() | liquid()/liquid.apple() |
| --- | --- | --- |
| Chromium, JS on | frosted | lens from the first painted frame after mount (pointer-only @supports branch) |
| Chromium, JS off / pre-hydration | frosted (zero-JS) | FROST (the unconditional base paint — the lens is an enhancement, never a dependency; docs acceptance asserts frost-not-broken with JS disabled) |
| Safari / Firefox | frosted | frost (the @supports branch never applies) |
| no 2D canvas (jsdom/ancient) | n/a | action stamps vars and returns — frost stands, no crash |
| zero-size box at mount | n/a | generation skipped; the RO builds when it appears |
| hand-written SET pointer to missing fragment | n/a | documented misuse (Chromium drops the chain) — prevented by the API (append-then-point) |
| prefers-reduced-transparency | solid fill | solid fill |
| forced-colors | consumer `forced-colors:bg-[Canvas]` utilities | same |
| print | filters none, fill stays | same |

## 8. Registry wiring

- Item `glass`, type `registry:ui`, files:
  `ui/glass/glass.ts`, `ui/glass/glass.css`,
  `ui/glass/glass-map.ts`, `ui/glass/liquid-glass.svelte.ts`,
  `ui/glass/index.ts`.
- **canonicalMain override → `glass.ts`** (the module is the front
  door — builders first; the action re-exports through index.ts,
  scroll-run's index posture). registryDependencies
  `['@jixoai/jixoai-theme']` ONLY (no dead edges).
- Order law unchanged: registry.json + overrides FIRST, mirror
  files next, `gen-mirror-manifest` LAST.
- `verify-shadcn-add.mjs` CASES += glass. Migration note + canary
  unchanged from r9 (normalized `jx-glass(?![-\w])`, comments
  stripped, sim-shell comment rewritten in-change).

## 9. Docs & adoption surface

- `/docs/components/glass.html`: ComponentCanvas over a visual band;
  playground dock knobs for BOTH layers — physical sliders
  (surface selector incl. all four, bezel/thickness/scale/blur/
  rimSaturate/specular) AND the semantic row (regular/clear/tint/
  interactive/identity — the prototype's demo row is the blueprint);
  source lane emits the exact builder + `use:liquidGlass(fx)`
  snippet; degradation copy (frost-first/lens-on-mount); params
  table (both layers + the compile table); "migrating off
  .jx-glass"; the element-chrome recipe (tint + shadow).
- tabs/toast/tokens copy updates (liquid: noise → lens). Taxonomy/
  docs-nav/availability rows; svelte.config prerender; blueprint
  scene; skills/jixoai-website row. Screenshots to
  `.agents/images/2026-09-08-glass-effect/`.

## 10. Gates & tests map

| gate/test | asserts |
| --- | --- |
| `glass-map.spec.ts` (+ mirror) | the §5 goldens on the pure core (center, rim ≥90 steps inward, decay, band uniformity 512×256, antisymmetry, profile shape, raster 2× + area-cap equivalence) |
| `glass-effect.spec.ts` (+ mirror) | builder defaults + clamps + TypeError; the §2 semantic compile table (regular ≡ defaults, clear/identity/tint/shape/isEnabled); glassAttrs/glassVars (liquid never carries the pointer; interactive var when flagged); law source-pins (base paint, POINTER-ONLY @supports branch, cascade order, print/reduced-transparency, NO forced-colors); one-formula boundary; the migration canary source-scan (normalized regex, comments stripped, self-test fixture both directions); computed-equivalence migration parity; tokens-page named pin; forced-colors consumer pins |
| `liquid-glass-action.spec.ts` (+ mirror, jsdom) | mount stamps + appends the 9-primitive chain at element size (sRGB, exact primitive order, scale/slope/saturate values from fx) + pointer AFTER node + RO connected; shape override ('capsule'/number) beats border-radius; update rebuilds; destroy cleans everything; no-canvas guard; zero-box guard |
| `tabs-indicator.spec` (re-pin) | glass/liquid stamp the channel; liquid carries the action (no inline feTurbulence anywhere) |
| `toast.spec` (re-pin) | glass ground rides data-jx-effect + vars (saturate 1) |
| verify-print / verify-surface / verify:budgets / verify:shadcn-add | sim toolbar selector; surface law semantics; budgets (no artifact exists); glass clean-consumer case |
| mirror + registry gates | byte-identity, dependency shape, canonicalMain override → glass.ts, metadata freshness |

## 11. Non-goals

- tabs `indicator` accepting a GlassEffect builder (enum stays).
- GlassEffectContainer-style multi-element morph/union (Apple's
  container semantics) — motion-domain follow-up.
- WebGL shader mode, elasticity, draggable lenses.
- Surface acrylic selector migration into the stamp channel.
- per-chroma mask shaping (the chroma branch itself is a follow-up
  now — kube ships none; our chain has no chroma path until asked).

## 12. Risks

- `backdrop-filter: url()` Chromium-only — @supports gate + frost
  base + pointer-only branch; source-pinned.
- 8-bit map precision bounds useful scale — clamps; params table
  says so.
- Runtime generation cost — O(w·h) field, 512² raster cap, rAF
  coalescing; single-digit ms at card scale (measured on the
  prototype).
- frost→lens transition on mount — enhancement by design; never
  unfiltered→lens; documented in degradation copy.
- jsdom CI — the canvas guard keeps suites green; lens path covered
  by pure goldens + the Chromium visual pass.
- Hot-component surgery (tabs/toast) — public APIs unchanged,
  suites re-pinned in-change, visual acceptance light+dark.
