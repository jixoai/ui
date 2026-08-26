<!--
  jixoai press button (registry/files/ui/press-button/press-button.svelte).
  Press law (theme .jx-press): hover grows the shadow only — the body
  never moves; active presses the body +1px into the page while the
  box-shadow's offsets counter-shrink 1px (the theme's *-press poses)
  — the shadow paint stays anchored, no pseudo layer. Variants change
  paint, never physics: fill / tonal / outline / ghost are the
  prominence ladder of the variant grammar (openspec/changes/
  variant-grammar); link is the grammar's one interaction exception —
  no frame, no press shadow, primary text, hover underline. Semantic
  color is hue injection, never a variant: --jx-fill + --jx-fill-ink
  (always together, one class: jx-pair-destructive), --jx-tonal
  (jx-hue-* intent utilities), --jx-outline ride class utilities at
  the call site (arbitrary properties remain the escape hatch;
  destructive action = fill +
  [--jx-fill:var(--destructive)] [--jx-fill-ink:var(--destructive-
  foreground)]; the copied transient is tonal +
  jx-hue-success — copied left the union with the
  semantic names).

  One opt-in effect loop per button, modeled on the animation-svelte
  reference (github.com/SikandarJODD/animations, 2026-08-23 user
  request): shimmer (a conic spark walks the perimeter, additive
  plus-lighter — Owner polish), pulse (sonar rings from the body's own
  silhouette), rainbow (a blended aurora wash on three prime
  timelines), ripple (ink from the activation point — WAAPI-driven,
  removed on animation.finished, round or bevel/diamond silhouette).
  Effects are typed builders exported from the module script:

    import PressButton, { shimmer, pulse, rainbow, ripple }
      from '@ui/press-button.svelte';
    <PressButton variant="fill" effect={shimmer({ speed: 4000 })}>
      deploy
    </PressButton>

  The ripple RUNTIME (spawn geometry, WAAPI lifecycle, reduced-motion
  gate) lives in ./ripple.svelte.ts — extracted verbatim (2026-08-26)
  when Chip needed the same loop; its visual halves stay in this
  folder's press-button.css.

  tw4 (2026-08-24): the button body was already utility-authored
  (variants + the --jx-press* pose wiring ride utilities — the press
  law's wiring is untouched); the effect loops move VERBATIM to
  press-button.css — keyframes, @property registrations, cqw math and
  ::after builds are all D1-exempt machinery, and splitting each
  layer's static half from its animated half would separate one
  logical unit across two sheets. Only the hosts' stacking pose
  (relative z-0) became utilities.
-->
<script module lang="ts">
  /** the prominence ladder + the one interaction exception (link) —
   *  the variant grammar's whole button union; pass-through consumers
   *  (icon-button) import this instead of re-declaring it */
  export type PressButtonVariant = 'fill' | 'tonal' | 'outline' | 'ghost' | 'link';

  /** the one opt-in effect loop — builders keep options typed and discoverable */
  export type PressEffect = ShimmerEffect | PulseEffect | RainbowEffect | RippleEffect;

  export interface ShimmerOptions {
    /** the spark color (any CSS color) */
    color?: string;
    /** the conic arc width of the spark */
    spread?: string;
    /** how far the spark bleeds inward from the border */
    cut?: string;
    /** one slide pass, in ms (the spin runs at 2×) */
    speed?: number;
  }
  export interface ShimmerEffect {
    readonly type: 'shimmer';
    color: string;
    spread: string;
    cut: string;
    speed: number;
  }
  export function shimmer({
    color = 'currentColor',
    spread = '90deg',
    cut = '0.06em',
    speed = 3000,
  }: ShimmerOptions = {}): ShimmerEffect {
    return { type: 'shimmer', color, spread, cut, speed };
  }

  export interface PulseOptions {
    /** the sonar ring color (any CSS color) */
    color?: string;
    /** one ring cycle, in ms */
    duration?: number;
    /** how far the ring expands */
    distance?: string;
    /** slow: expand-and-fade · ring: breathe out and back · ripple: eased expand-fade */
    variant?: 'slow' | 'ring' | 'ripple';
  }
  export interface PulseEffect {
    readonly type: 'pulse';
    color: string;
    duration: number;
    distance: string;
    variant: 'slow' | 'ring' | 'ripple';
  }
  export function pulse({
    color = 'var(--primary)',
    duration = 2500,
    distance = '0.7em',
    variant = 'slow',
  }: PulseOptions = {}): PulseEffect {
    return { type: 'pulse', color, duration, distance, variant };
  }

  export interface RainbowOptions {
    /** base pace — the three prime timelines run at 3s / 5s / 7s when speed is 2000 */
    speed?: number;
    /** the gradient stops, first-to-last around the conic wheel */
    colors?: [string, ...string[]];
  }
  export interface RainbowEffect {
    readonly type: 'rainbow';
    speed: number;
    colors: [string, ...string[]];
  }
  export function rainbow({
    speed = 2000,
    colors = [
      'hsl(0 100% 63%)',
      'hsl(270 100% 63%)',
      'hsl(210 100% 63%)',
      'hsl(195 100% 63%)',
      'hsl(90 100% 63%)',
    ],
  }: RainbowOptions = {}): RainbowEffect {
    return { type: 'rainbow', speed, colors };
  }

  export interface RippleOptions {
    /** the ink color (any CSS color) */
    color?: string;
    /** one ink expansion, in ms */
    duration?: number;
    /** the ink silhouette — round pins against the site-wide bevel law;
     *  bevel cuts the corners into a diamond (a 45° square where
     *  corner-shape is unsupported — the same shape to the eye) */
    shape?: 'round' | 'bevel';
  }
  export interface RippleEffect {
    readonly type: 'ripple';
    color: string;
    duration: number;
    shape: 'round' | 'bevel';
  }
  export function ripple({
    color = 'currentColor',
    duration = 600,
    shape = 'round',
  }: RippleOptions = {}): RippleEffect {
    return { type: 'ripple', color, duration, shape };
  }

  // corner-shape gates the bevel ink's fast path; where it's missing the
  // flat fallback turns a square 45° — the same diamond to the eye
  const bevelInk =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('corner-shape', 'bevel');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import { createRipple } from './ripple.svelte';
  import './press-button.css';

  interface Props {
    /** DENSITY override: explicit ?? inherited ?? default */
    density?: Density;
    /** the ladder rung; semantic hue is injected through the grammar
     *  tokens (--jx-fill/--jx-fill-ink, --jx-tonal, --jx-outline) at
     *  the call site, never a variant */
    variant?: PressButtonVariant;
    /** built by shimmer() / pulse() / rainbow() / ripple() — one loop per button */
    effect?: PressEffect;
    href?: string;
    /** Opens non-internal hrefs (not starting with "/") in a new tab. */
    external?: boolean;
    onclick?: () => void;
    type?: 'button' | 'submit';
    ariaLabel?: string;
    /** square pose: a size-10.5 (42px) frame with no padding — the
     *  icon/toolbar idiom, level with the text button's own band;
     *  press law and every variant ride unchanged */
    square?: boolean;
    /** appended to the composed classes (same-family overrides need
     *  the consumer's `!` — same-property utility order is not
     *  consumer-guaranteed) */
    class?: string;
    children: Snippet;
  }

  let {
    density,
    variant = 'outline',
    effect = undefined,
    href,
    external = undefined,
    onclick,
    type = 'button',
    ariaLabel,
    square = false,
    class: className = '',
    children,
  }: Props = $props();

  const inheritedDensity = getDensityContext();
  const resolvedDensity: Density = $derived(resolveDensity(density, inheritedDensity));

  // the square swaps ONLY geometry: one band (42px, the text button's
  // own height) with the glyph centered — paint, physics and effects
  // are identical to the text pose. The forced-colors trio pins the
  // focus law for every rung: 2px Highlight, offset 2, never removed
  // (design §6 — the site ring var does not survive forced colors).
  const focusForced = 'forced-colors:outline-2 forced-colors:outline-offset-2 forced-colors:[outline-color:Highlight]';
  const base = $derived(
    square
      ? `inline-flex min-h-[var(--jx-hit)] min-w-[var(--jx-hit)] items-center justify-center text-[length:var(--jx-text)] leading-[var(--jx-line)] font-medium ${focusForced}`
      : `inline-flex min-h-[var(--jx-hit)] items-center gap-[var(--jx-gap)] px-[var(--jx-inset)] text-[length:var(--jx-text)] leading-[var(--jx-line)] font-medium ${focusForced}`,
  );
  // the bordered, shadow-bearing body (link opts out entirely). The
  // frame contributes width + physics ONLY: every rung below supplies
  // all three paint channels itself, so no two same-property utilities
  // ever meet in one class list — named border-color utilities sort
  // AFTER arbitrary ones in the sheet, and same-family utility order
  // is not consumer-guaranteed; the map stays collision-free by
  // construction (variant grammar, openspec/changes/variant-grammar).
  // Each rung also carries its design §6 forced-colors degradation:
  // fill → ButtonFace/ButtonText, tonal/outline → Canvas/CanvasText
  // (the color-mix tints do NOT drop on their own — probed), ghost →
  // transparent rest, ButtonFace/ButtonText hover.
  const frame = 'jx-press border';
  const variants = {
    fill: `${frame} [background:var(--jx-fill)] [border-color:var(--jx-fill)] text-[color:var(--jx-fill-ink)] forced-colors:bg-[ButtonFace] forced-colors:border-[ButtonText] forced-colors:text-[ButtonText]`,
    tonal: `${frame} bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)] border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] text-[color:var(--jx-tonal)] forced-colors:bg-[Canvas] forced-colors:border-[CanvasText] forced-colors:text-[CanvasText]`,
    outline: `${frame} bg-transparent [border-color:var(--jx-outline)] text-foreground hover:bg-[color-mix(in_oklab,var(--jx-tonal)_8%,transparent)] forced-colors:bg-[Canvas] forced-colors:border-[CanvasText] forced-colors:text-[CanvasText]`,
    // ghost keeps the box geometry (width-only border + transparent
    // color) but presses without a shadow — r2 blocker fix: the width
    // class is load-bearing, border-transparent alone computes to 0px
    ghost: `jx-press border border-transparent bg-transparent hover:bg-[color-mix(in_oklab,var(--jx-tonal)_8%,transparent)] hover:text-[color:var(--jx-tonal)] [--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none] forced-colors:bg-transparent forced-colors:border-transparent forced-colors:text-[CanvasText] forced-colors:hover:bg-[ButtonFace] forced-colors:hover:text-[ButtonText]`,
    // link: the interaction exception — no frame, no press shadow, primary text
    link: 'text-primary underline-offset-4 hover:underline forced-colors:text-[LinkText]',
  } as const;

  // effect host class (the stacking pose rides utilities: relative z-0
  // keeps the negative-z layers under the in-flow label) + the custom
  // properties its loop reads
  const effectClass = $derived.by(() => {
    if (!effect) return '';
    switch (effect.type) {
      case 'shimmer':
        return 'relative z-0';
      case 'pulse':
        return 'relative z-0';
      case 'rainbow':
        return 'jx-rainbow-host relative z-0';
      case 'ripple':
        return 'relative z-0';
    }
  });
  const effectStyle = $derived.by(() => {
    if (!effect) return '';
    switch (effect.type) {
      case 'shimmer':
        return `--shimmer-color:${effect.color}; --shimmer-spread:${effect.spread}; --shimmer-cut:${effect.cut}; --shimmer-speed:${effect.speed}ms`;
      case 'pulse':
        return `--pulse-color:${effect.color}; --pulse-duration:${effect.duration}ms; --pulse-distance:${effect.distance}`;
      case 'rainbow':
        return `--rainbow-tx:${(effect.speed * 3) / 2}ms; --rainbow-ty:${(effect.speed * 5) / 2}ms; --rainbow-t1:${(effect.speed * 7) / 2}ms; --rainbow-t2:${(effect.speed * 11) / 2}ms; --rainbow-t3:${(effect.speed * 13) / 2}ms; --rainbow-t4:${(effect.speed * 17) / 2}ms; ${effect.colors
          .map((c, i) => `--c${i + 1}:${c}`)
          .join('; ')}`;
      case 'ripple':
        return '';
    }
  });

  // ripple: the shared runtime (./ripple.svelte.ts) — ink circles from
  // the activation point; keyboard activation (click with detail 0)
  // ripples from the center. Reduced motion skips the ink inside the
  // factory — the anchored press already answers the pointer.
  const rippleRuntime = createRipple(() => onclick?.());

  const classes = $derived(
    `${base} ${variants[variant]}${effectClass ? ` ${effectClass}` : ''}${className ? ` ${className}` : ''}`
  );
  const isExternal = $derived(external ?? (href !== undefined && !href.startsWith('/')));
</script>

{#snippet layers()}
  {#if effect?.type === 'ripple'}
    <span class="jx-ripple-layer" aria-hidden="true">
      {#each rippleRuntime.ripples as r (r.key)}
        <span
          class="jx-ripple-dot{effect.shape === 'bevel' && !bevelInk ? ' jx-ripple-flat' : ''}"
          data-shape={effect.shape}
          style="width:{r.size}px; height:{r.size}px; top:{r.y}px; left:{r.x}px;
            --ripple-color:{effect.color}"
          use:rippleRuntime.ink={{ key: r.key, duration: effect.duration }}
        ></span>
      {/each}
    </span>
  {:else if effect?.type === 'shimmer'}
    <span class="jx-shimmer-box" aria-hidden="true">
      <span class="jx-shimmer-slide"><span class="jx-shimmer-spark"></span></span>
    </span>
    <span class="jx-shimmer-cover" aria-hidden="true"></span>
  {:else if effect?.type === 'pulse'}
    <span
      class="jx-pulse-layer"
      class:jx-pulse-slow={effect.variant === 'slow'}
      class:jx-pulse-ring={effect.variant === 'ring'}
      class:jx-pulse-ripple={effect.variant === 'ripple'}
      aria-hidden="true"
    ></span>
  {/if}
{/snippet}

{#if href}
  <a
    {href}
    target={isExternal ? '_blank' : undefined}
    rel={isExternal ? 'noreferrer' : undefined}
    aria-label={ariaLabel}
    data-density={resolvedDensity}
    data-jx-press-button={variant}
    data-jx-shimmer-host={effect?.type === 'shimmer' ? '' : undefined}
    data-jx-pulse-host={effect?.type === 'pulse' ? '' : undefined}
    data-jx-ripple-host={effect?.type === 'ripple' ? '' : undefined}
    class={classes}
    style={effectStyle || undefined}
    onclick={effect?.type === 'ripple' ? rippleRuntime.onclick : undefined}
  >
    {@render layers()}
    {@render children()}
  </a>
{:else}
  <button
    {type}
    onclick={effect?.type === 'ripple' ? rippleRuntime.onclick : onclick}
    aria-label={ariaLabel}
    data-density={resolvedDensity}
    data-jx-press-button={variant}
    data-jx-shimmer-host={effect?.type === 'shimmer' ? '' : undefined}
    data-jx-pulse-host={effect?.type === 'pulse' ? '' : undefined}
    data-jx-ripple-host={effect?.type === 'ripple' ? '' : undefined}
    class={classes}
    style={effectStyle || undefined}
  >
    {@render layers()}
    {@render children()}
  </button>
{/if}
