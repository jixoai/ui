# Proposal: R4 acceptance amendments (three Owner rulings)

The Owner's browser acceptance round over `90e73c32` ruled:

1. **2xs 的 lineHeight 有必要缩减** — the secondary leading was a flat
   `1.5` at every density rung; on 2xs's ~10px secondary text the chip
   band reads loose. The ladder becomes per-rung:
   `2xs 1.25 · xs 1.35 · sm 1.45 · default 1.5 · lg 1.5` (tightens
   below default only; the interpolated xs/sm values are the
   implementer's ramp, 2xs anchored at 1.25). The five
   `--jx-density-secondary-line-*` primitives and every scope's
   `--jx-leading-secondary` remap follow; the chip padding formula
   shrinks with it automatically (leading drives the excess term).
2. **高亮配色全面升级 → oklch 统一明暗** — the `--tok-token-*`
   palette carried three FOREIGN-HUE literals (inserted/deleted/
   changed at oklch hues 150/25/85 — hand-copied statics of the
   theme's success/error/warning families) with NO dark pairs, and
   mixed in oklab. The palette v2: inserted/deleted/changed ride
   `var(--success/-error/-warning)` (theme-anchored, dark values by
   construction), every mixed token interpolates `in oklch` (the
   one-hue law's space), and parameter/punctuation gain their dark
   forms — every token now ships a complete light/dark pair so both
   themes read the same emphasis hierarchy (统一明暗). Both twins move
   in lockstep (code-card.css + inline-code.svelte's tokenPalette).
3. **六修饰可调 DEMO** — lineHeight/weight/italic/tracking/family/
   fontSize existed as static tiles only. The text page gains a
   full modifier PLAYGROUND (playState + Play* kit, all six controls,
   live Text + Strong + InlineCode stage, taught-snippet lane, reset),
   the inline-code page a compact chip-focused set.

No spec deltas: (2) brings code INTO compliance with the existing
OKLCH one-hue law; (1) evolves tokens inside the existing density
structure; (3) is docs-site surface.

## Vision-pass outcomes (the measured tunes + two live finds)

- The three dark single-knob tunes (measured hierarchy ratios, both
  surfaces in lockstep): dark comment 58%→**30%**, dark punctuation
  66%→**36%**, dark constant `var(--secondary)`→**mix(secondary 70%,
  black)** — comment quietest again, the yellow-numbers inversion is
  gone; hierarchy now identical across themes.
- **The chip palette moved from markup utilities into inline-code.css**
  (light/dark/.jx-light trio, code-card's twin): the utilities form's
  `dark:` variants sit in the utilities layer where no
  components-layer declaration can beat them — a pinned-`.jx-light`
  canvas stage under a dark page leaked the dark formulas onto light
  grounds (contrast 1.24, illegible). Consumers retune via
  `[--tok-token-…:…]` utilities exactly as before (they still win).
- **The family cascade fix**: `font-mono` rides the conditional-
  emission guarantee — an explicit `family` prop drops the base twin
  (same-property utility order is not guaranteed; found live: the
  IBM Plex Mono demo chip computed JetBrains Mono).
- Lane P also fixed a latent scanner miss (the modifier utilities'
  candidate comment blocks) and widened PlaySegmented to
  `string | number` (docs-site kit only).
- One pre-existing red test fixed (R4 residue): the docs-ambient-
  vocabulary frozen carrier set gained inline-code + separator (both
  minted metas with axis props in R4; the set froze stale — note the
  verify:all composite does NOT run the www spec suite, which is how
  it slipped).
