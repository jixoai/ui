<!--
  jixoai press button (registry/files/ui/press-button.svelte).
  Press law (theme .jx-press): hover grows the shadow only — the body
  never moves; active presses the body +1px into the page while the
  box-shadow's offsets counter-shrink 1px (the theme's *-press poses)
  — the shadow paint stays anchored, no pseudo layer. Variants change
  paint, never physics: primary / secondary / outline / ghost /
  destructive / link / copied.

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
    <PressButton variant="primary" effect={shimmer({ speed: 4000 })}>
      deploy
    </PressButton>
-->
<script module lang="ts">
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
    duration = 1500,
    distance = '8px',
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

  interface Props {
    variant?:
      | 'primary'
      | 'secondary'
      | 'outline'
      | 'ghost'
      | 'destructive'
      | 'link'
      | 'copied';
    /** built by shimmer() / pulse() / rainbow() / ripple() — one loop per button */
    effect?: PressEffect;
    href?: string;
    /** Opens non-internal hrefs (not starting with "/") in a new tab. */
    external?: boolean;
    onclick?: () => void;
    type?: 'button' | 'submit';
    ariaLabel?: string;
    children: Snippet;
  }

  let {
    variant = 'outline',
    effect = undefined,
    href,
    external = undefined,
    onclick,
    type = 'button',
    ariaLabel,
    children,
  }: Props = $props();

  const base = 'inline-flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium';
  // the bordered, shadow-bearing body (link opts out entirely)
  const frame = 'jx-press border border-border';
  const variants = {
    primary: `${frame} bg-primary text-primary-foreground`,
    secondary: `${frame} bg-secondary text-secondary-foreground`,
    outline: `${frame} bg-background hover:bg-muted`,
    // ghost keeps the box geometry (transparent border) but presses without a shadow
    ghost: `jx-press border-transparent bg-transparent hover:bg-muted [--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none]`,
    destructive: `${frame} bg-destructive text-destructive-foreground`,
    link: 'text-primary underline-offset-4 hover:underline',
    copied: `${frame} bg-secondary text-secondary-foreground`,
  } as const;

  // effect host class + the custom properties its loop reads
  const effectClass = $derived.by(() => {
    if (!effect) return '';
    switch (effect.type) {
      case 'shimmer':
        return 'jx-shimmer-host';
      case 'pulse':
        return 'jx-pulse-host';
      case 'rainbow':
        return 'jx-rainbow-host';
      case 'ripple':
        return 'jx-ripple-host';
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

  // ripple: ink circles from the activation point; keyboard activation
  // (click with detail 0) ripples from the center. Reduced motion skips
  // the ink — the anchored press already answers the pointer.
  let ripples = $state<{ x: number; y: number; size: number; key: number }[]>([]);
  let rippleSeq = 0;
  const spawnRipple = (
    host: HTMLElement,
    clientX: number,
    clientY: number,
    fromPointer: boolean
  ): void => {
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const px = fromPointer ? clientX : rect.left + rect.width / 2;
    const py = fromPointer ? clientY : rect.top + rect.height / 2;
    const key = ++rippleSeq;
    ripples = [...ripples, { x: px - rect.left - size / 2, y: py - rect.top - size / 2, size, key }];
  };
  // WAAPI owns the ink lifecycle: the dot expands by script and leaves
  // the DOM when the animation finishes — no timer racing the paint
  const ink = (dot: HTMLElement, params: { key: number; duration: number }) => {
    const anim = dot.animate(
      [
        { transform: 'scale(0)', opacity: 1 },
        { transform: 'scale(2)', opacity: 0 },
      ],
      { duration: params.duration, easing: 'ease-out', fill: 'both' }
    );
    const clear = () => {
      ripples = ripples.filter((r) => r.key !== params.key);
    };
    anim.finished.then(clear, clear);
    return {
      destroy() {
        anim.cancel();
      },
    };
  };
  const onRippleClick = (event: MouseEvent & { currentTarget: HTMLElement }): void => {
    spawnRipple(event.currentTarget, event.clientX, event.clientY, event.detail > 0);
    onclick?.();
  };

  const classes = $derived(
    `${base} ${variants[variant]}${effectClass ? ` ${effectClass}` : ''}`
  );
  const isExternal = $derived(external ?? (href !== undefined && !href.startsWith('/')));
</script>

{#snippet layers()}
  {#if effect?.type === 'shimmer'}
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
    class={classes}
    style={effectStyle || undefined}
    onclick={effect?.type === 'ripple' ? onRippleClick : undefined}
  >
    {#if effect?.type === 'ripple'}
      <span class="jx-ripple-layer" aria-hidden="true">
        {#each ripples as r (r.key)}
          <span
            class="jx-ripple-dot{effect.shape === 'bevel' && !bevelInk ? ' jx-ripple-flat' : ''}"
            data-shape={effect.shape}
            style="width:{r.size}px; height:{r.size}px; top:{r.y}px; left:{r.x}px;
              --ripple-color:{effect.color}"
            use:ink={{ key: r.key, duration: effect.duration }}
          ></span>
        {/each}
      </span>
    {/if}
    {@render layers()}
    {@render children()}
  </a>
{:else}
  <button
    {type}
    onclick={effect?.type === 'ripple' ? onRippleClick : onclick}
    aria-label={ariaLabel}
    class={classes}
    style={effectStyle || undefined}
  >
    {#if effect?.type === 'ripple'}
      <span class="jx-ripple-layer" aria-hidden="true">
        {#each ripples as r (r.key)}
          <span
            class="jx-ripple-dot{effect.shape === 'bevel' && !bevelInk ? ' jx-ripple-flat' : ''}"
            data-shape={effect.shape}
            style="width:{r.size}px; height:{r.size}px; top:{r.y}px; left:{r.x}px;
              --ripple-color:{effect.color}"
            use:ink={{ key: r.key, duration: effect.duration }}
          ></span>
        {/each}
      </span>
    {/if}
    {@render layers()}
    {@render children()}
  </button>
{/if}

<style>
  /* All layers sit at NEGATIVE z-index under the in-flow label but
     above the host's own background: the host carries relative z-0
     (its own stacking context), so nothing escapes and the label is
     never occluded — no content wrapper needed. */

  /* shimmer — a conic spark walks the perimeter (animation-svelte
     reference, Owner polish 2026-08-23): a height-sized square slides
     edge-to-edge (container queries) while a 3× conic spark rotates in
     90° steps with holds. The BOX owns the clip (not the host) and
     bleeds 1px past the border so the 2px blur keeps its edge; the
     spark blends plus-lighter — additive light over the host fill. */
  .jx-shimmer-host {
    position: relative;
    z-index: 0;
  }
  .jx-shimmer-box {
    position: absolute;
    inset: -1px;
    z-index: -2;
    container-type: size;
    filter: blur(2px);
    overflow: hidden;
    mix-blend-mode: plus-lighter;
    pointer-events: none;
  }
  .jx-shimmer-slide {
    position: absolute;
    inset: 0;
    height: 100cqh;
    aspect-ratio: 1;
    animation: jx-shimmer-slide var(--shimmer-speed) ease-in-out infinite alternate;
  }
  .jx-shimmer-spark {
    position: absolute;
    inset: -100%;
    background: conic-gradient(
      from calc(270deg - (var(--shimmer-spread) * 0.5)),
      transparent 0,
      var(--shimmer-color) var(--shimmer-spread),
      transparent var(--shimmer-spread)
    );
    animation: jx-shimmer-spin calc(var(--shimmer-speed) * 2) infinite linear;
  }
  .jx-shimmer-cover {
    position: absolute;
    inset: var(--shimmer-cut);
    z-index: -1;
    background: inherit;
    border-radius: inherit;
    corner-shape: inherit;
    pointer-events: none;
  }
  @keyframes jx-shimmer-slide {
    to {
      translate: calc(100cqw - 100%) 0;
    }
  }
  @keyframes jx-shimmer-spin {
    0% {
      rotate: 0deg;
    }
    15%,
    35% {
      rotate: 90deg;
    }
    65%,
    85% {
      rotate: 270deg;
    }
    100% {
      rotate: 360deg;
    }
  }

  /* pulse — sonar rings cast by a silhouette copy of the body */
  .jx-pulse-host {
    position: relative;
    z-index: 0;
  }
  .jx-pulse-layer {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: inherit;
    border-radius: inherit;
    corner-shape: inherit;
    pointer-events: none;
  }
  .jx-pulse-slow {
    animation: jx-pulse-slow var(--pulse-duration) ease-out infinite;
  }
  .jx-pulse-ring {
    /* ease-in-out: symmetric breathing — ease-out darted back to a
       zero-spread crawl each half-cycle, reading as a blink */
    animation: jx-pulse-ring var(--pulse-duration) ease-in-out infinite;
  }
  .jx-pulse-ripple {
    animation: jx-pulse-ripple var(--pulse-duration) cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }
  /* slow: full-color expansion, fade only at the extent — an alpha fade
     running across the whole cycle washes the ring into the page before
     it ever reads (the ripple variant's color-mix keeps the fade
     hue-safe: oklab premultiplied, no gray detour) */
  @keyframes jx-pulse-slow {
    0% {
      box-shadow: 0 0 0 0 var(--pulse-color);
    }
    70% {
      box-shadow: 0 0 0 var(--pulse-distance) var(--pulse-color);
    }
    100% {
      box-shadow: 0 0 0 var(--pulse-distance) color-mix(in oklab, var(--pulse-color) 0%, transparent);
    }
  }
  @keyframes jx-pulse-ring {
    0%,
    100% {
      box-shadow: 0 0 0 0 var(--pulse-color);
    }
    50% {
      box-shadow: 0 0 0 var(--pulse-distance) var(--pulse-color);
    }
  }
  @keyframes jx-pulse-ripple {
    0% {
      box-shadow: 0 0 0 0 color-mix(in oklab, var(--pulse-color) 100%, transparent);
    }
    100% {
      box-shadow: 0 0 0 var(--pulse-distance) color-mix(in oklab, var(--pulse-color) 0%, transparent);
    }
  }

  /* rainbow — an aurora wash (Owner spec, 2026-08-23 r4→r7): ONE
     heavily blurred ::after hugging the body (inset -0.2rem, blur
     1rem) that WANDERS by percentage (±8% x · ±5% y). FOUR background
     layers, each PANNED INDEPENDENTLY by its own registered
     percentage on its own PRIME timeline (7s / 11s / 13s / 17s at the
     default pace) — one animation per background, four different
     trajectories (diagonal, anti-diagonal, horizontal, vertical via
     calc(100% − var)); per-layer background-size oversizing makes the
     percentage pans travel. Layer stacking blends through
     background-blend-mode (screen / overlay / soft-light over the
     base conic); the whole wash then blends with the variant fill —
     screen on primary, color elsewhere — so the fill keeps its
     luminosity and the aurora brings the hues. */
  .jx-rainbow-host {
    position: relative;
    z-index: 0;
  }
  .jx-rainbow-host::after {
    content: '';
    position: absolute;
    inset: -0.2rem;
    z-index: -1;
    border-radius: inherit;
    corner-shape: inherit;
    background:
      conic-gradient(from 0deg, var(--c1), var(--c2), var(--c3), var(--c4), var(--c5), var(--c1)),
      conic-gradient(from 130deg, var(--c2), var(--c4), var(--c1), var(--c5), var(--c3), var(--c2)),
      linear-gradient(90deg, var(--c5), transparent 55%, var(--c3)),
      conic-gradient(from 250deg, var(--c4), var(--c1), var(--c4));
    background-position:
      var(--jx-bp1, 0%) calc(100% - var(--jx-bp1, 0%)),
      calc(100% - var(--jx-bp2, 0%)) var(--jx-bp2, 0%),
      var(--jx-bp3, 0%) 50%,
      50% var(--jx-bp4, 0%);
    background-size: 220%, 260%, 300%, 340%;
    background-blend-mode: normal, screen, overlay, soft-light;
    filter: blur(1rem);
    mix-blend-mode: color;
    translate: var(--jx-rx, 0%) var(--jx-ry, 0%);
    animation:
      jx-rainbow-x var(--rainbow-tx, 3s) ease-in-out infinite alternate,
      jx-rainbow-y var(--rainbow-ty, 5s) ease-in-out infinite alternate,
      jx-rainbow-p1 var(--rainbow-t1, 7s) ease-in-out infinite alternate,
      jx-rainbow-p2 var(--rainbow-t2, 11s) ease-in-out infinite alternate,
      jx-rainbow-p3 var(--rainbow-t3, 13s) ease-in-out infinite alternate,
      jx-rainbow-p4 var(--rainbow-t4, 17s) ease-in-out infinite alternate;
    pointer-events: none;
  }
  .jx-rainbow-host.bg-primary::after {
    mix-blend-mode: screen;
  }
  @property --jx-rx {
    syntax: '<length-percentage>';
    inherits: false;
    initial-value: 0%;
  }
  @property --jx-ry {
    syntax: '<length-percentage>';
    inherits: false;
    initial-value: 0%;
  }
  @property --jx-bp1 {
    syntax: '<length-percentage>';
    inherits: false;
    initial-value: 0%;
  }
  @property --jx-bp2 {
    syntax: '<length-percentage>';
    inherits: false;
    initial-value: 0%;
  }
  @property --jx-bp3 {
    syntax: '<length-percentage>';
    inherits: false;
    initial-value: 0%;
  }
  @property --jx-bp4 {
    syntax: '<length-percentage>';
    inherits: false;
    initial-value: 0%;
  }
  @keyframes jx-rainbow-x {
    from {
      --jx-rx: -8%;
    }
    to {
      --jx-rx: 8%;
    }
  }
  @keyframes jx-rainbow-y {
    from {
      --jx-ry: -5%;
    }
    to {
      --jx-ry: 5%;
    }
  }
  @keyframes jx-rainbow-p1 {
    from {
      --jx-bp1: 0%;
    }
    to {
      --jx-bp1: 100%;
    }
  }
  @keyframes jx-rainbow-p2 {
    from {
      --jx-bp2: 0%;
    }
    to {
      --jx-bp2: 100%;
    }
  }
  @keyframes jx-rainbow-p3 {
    from {
      --jx-bp3: 0%;
    }
    to {
      --jx-bp3: 100%;
    }
  }
  @keyframes jx-rainbow-p4 {
    from {
      --jx-bp4: 0%;
    }
    to {
      --jx-bp4: 100%;
    }
  }

  /* ripple — ink from the activation point (WAAPI drives the dot:
     scale 0→2, opacity 1→0, removed on finished); the layer clips
     the ink to the body silhouette. shape: round pins against the
     site-wide bevel law; bevel cuts half-side corners into a diamond
     (flat 45° square where corner-shape is unsupported) */
  .jx-ripple-host {
    position: relative;
    z-index: 0;
  }
  .jx-ripple-layer {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    border-radius: inherit;
    corner-shape: inherit;
    pointer-events: none;
  }
  .jx-ripple-dot {
    position: absolute;
    border-radius: 9999px;
    /* the site-wide bevel law must not reach the ink — round is round */
    corner-shape: round;
    background: var(--ripple-color);
  }
  .jx-ripple-dot[data-shape='bevel'] {
    /* half-side cuts: the octagon degenerates into the diamond */
    border-radius: 50%;
    corner-shape: bevel;
  }
  .jx-ripple-dot.jx-ripple-flat {
    /* no corner-shape support: a square turned 45° is the same diamond */
    border-radius: 0;
    rotate: 45deg;
  }

  /* effect loops under reduced motion: every loop freezes and the
     traveling light vanishes (a frozen stripe mid-surface reads as a
     defect); the ripple is skipped in JS too (WAAPI never spawns) */
  @media (prefers-reduced-motion: reduce) {
    .jx-shimmer-slide,
    .jx-shimmer-spark,
    .jx-pulse-slow,
    .jx-pulse-ring,
    .jx-pulse-ripple,
    .jx-rainbow-host::after {
      animation: none;
    }
    .jx-shimmer-box,
    .jx-ripple-layer {
      display: none;
    }
  }
</style>
