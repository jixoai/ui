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
  import './press-button.css';

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
    data-jx-shimmer-host={effect?.type === 'shimmer' ? '' : undefined}
    data-jx-pulse-host={effect?.type === 'pulse' ? '' : undefined}
    data-jx-ripple-host={effect?.type === 'ripple' ? '' : undefined}
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
    data-jx-shimmer-host={effect?.type === 'shimmer' ? '' : undefined}
    data-jx-pulse-host={effect?.type === 'pulse' ? '' : undefined}
    data-jx-ripple-host={effect?.type === 'ripple' ? '' : undefined}
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
