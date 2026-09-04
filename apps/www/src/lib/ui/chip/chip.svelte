<!--
  jixoai chip (registry/files/ui/chip/chip.svelte).
  The grammar's compact ACTIVATION: a control-scale pill that filters,
  toggles, and navigates — the badge's micro-label voice on the hit
  lane. Not a badge (display, sub-lane height) and deliberately not a
  PressButton wrapper: the composition borrows the press law
  (.jx-press), the ripple runtime and the effect builders from the
  press-button folder, but the anatomy is its own.

  Variant grammar (openspec/changes/variant-grammar, frozen r1): the
  four-step ladder consumed as GLOBAL tokens — fill (solid ground +
  same-hue border), tonal (12%/45% tint recipe), outline (structural
  border + 8% hover overlay, border unchanged), ghost (transparent
  rest, tonal hover, geometry preserved via the transparent border).
  Semantic hue is INJECTED into --jx-fill/--jx-fill-ink/--jx-tonal/
  --jx-outline from the outside (class="jx-hue-error"),
  never named as a variant.

  Scale law (Owner ruling, 2026-09-01, supersedes the 2026-08-29
  hit-lane floor): the chip is the badge's ACTIVATION TWIN — badge
  geometry verbatim (height from --jx-line-secondary, inline insets
  only, never block padding); the ONLY structural difference from a
  Badge is the activation root (button/anchor + press physics + the
  focus law). Pseudo-element lane expansion stays rejected: the real
  box is the target.

  Effect loops: press-button's typed builders pass through the effect
  prop; ripple is the DEFAULT — undefined resolves to the ripple()
  defaults, null explicitly disables every loop. The runtime
  (createRipple) and the layer paint live in the press-button folder;
  this file imports them, never copies.

  Forced colors (design §6, explicit degradation): fill →
  ButtonFace/ButtonText, tonal/outline → Canvas/CanvasText (the
  color-mix tints drop), ghost transparent at rest / ButtonFace on
  hover; the focus ring stays 2px Highlight, offset 2, never removed.
-->
<script module lang="ts">
  // corner-shape gates the bevel ink's fast path; where it's missing the
  // flat fallback turns a square 45° — the same diamond to the eye
  const bevelInk =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('corner-shape', 'bevel');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { type Density } from '$lib/density.svelte';
  import { ChipDefaults, type ChipShape, type ChipVariant } from './chip-defaults.svelte';
  import { ripple, type PressEffect } from '../press-button/press-button.svelte';
  import { createRipple } from '../press-button/ripple.svelte';
  // the effect layers' paint (shimmer / pulse / ripple) — shared sheet
  import '../press-button/press-button.css';

  interface Props {
    /** DENSITY override: explicit ?? ambient scope, else unstamped */
    density?: Density;
    /** the grammar ladder — prominence, never semantic hue; omitted →
     *  the ambient paint zone, else the frozen own 'tonal' */
    variant?: ChipVariant;
    /** square keeps the site radius; pill rounds fully */
    shape?: ChipShape;
    /** one press-button effect builder per chip — undefined resolves
     *  to the ripple() defaults (ink from the activation point);
     *  null explicitly disables every loop */
    effect?: PressEffect | null;
    href?: string;
    /** Opens non-internal hrefs (not starting with "/") in a new tab. */
    external?: boolean;
    onclick?: () => void;
    type?: 'button' | 'submit';
    ariaLabel?: string;
    /** appended to the composed classes (same-family overrides need
     *  the consumer's `!` — same-property utility order is not
     *  consumer-guaranteed) */
    class?: string;
    /** leading lane — svg sized var(--jx-text-secondary) */
    slotStart?: Snippet;
    /** trailing lane — svg sized var(--jx-text-secondary) */
    slotEnd?: Snippet;
    children: Snippet;
  }

  let {
    density,
    variant,
    shape,
    effect = undefined,
    href,
    external = undefined,
    onclick,
    type = 'button',
    ariaLabel,
    class: className = '',
    slotStart,
    slotEnd,
    children,
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 2.3): variant rides the paint axis slot (zone ambient,
  // frozen own 'tonal'), shape/density their literal/no-opinion slots
  const d = $derived(ChipDefaults.resolve({ variant, shape, density }));

  // undefined resolves to the ripple() defaults — press-point ink is
  // the chip's resting attention; null opts out of every loop
  const activeEffect = $derived(effect === undefined ? ripple() : effect);

  // badge geometry verbatim (the badge's activation twin): height from
  // the secondary line, inline insets only; slot lanes replace their
  // side's padding (the data-icon law, badge dialect: the inset halves
  // — the lane carries the edge). The focus utilities pin the §6
  // forced-colors ring: 2px Highlight, offset 2.
  const base =
    'inline-flex items-center justify-center gap-[calc(var(--jx-gap)/2)] box-border max-w-full [padding-inline:var(--jx-inset)] has-[[data-icon=inline-start]]:pl-[calc(var(--jx-inset)/2)] has-[[data-icon=inline-end]]:pr-[calc(var(--jx-inset)/2)] font-nav [font-size:var(--jx-text-secondary)] [line-height:var(--jx-line-secondary)] tracking-[0.14em] uppercase whitespace-nowrap forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-offset-2 forced-colors:focus-visible:[outline-color:Highlight]';
  const silhouette = $derived(d.shape === 'pill' ? 'rounded-full' : 'rounded-(--radius)');
  // the bordered, shadow-bearing body (ghost presses without a shadow).
  // TW4 collision law (batch D probe, 2026-08-26): a rung is the SOLE
  // border-color source — named border paints (.border-border) sort
  // AFTER arbitrary values and would silently win, so the frame never
  // carries one; typed arbitrary forms (bg-[color-mix(…)],
  // [border-color:var(…)], text-[color:var(…)]) are preferred over raw
  // arbitrary properties (they emit @supports fallbacks). These strings
  // are byte-aligned with press-button's landed variant-grammar map.
  const frame = 'jx-press border';
  const variants = {
    fill: `${frame} [background:var(--jx-fill)] [border-color:var(--jx-fill)] text-[color:var(--jx-fill-ink)] forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText] forced-colors:border-[ButtonText]`,
    tonal: `${frame} bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)] border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] text-[color:var(--jx-tonal)] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:border-[CanvasText]`,
    outline: `${frame} bg-transparent [border-color:var(--jx-outline)] text-foreground hover:bg-[color-mix(in_oklab,var(--jx-tonal)_8%,transparent)] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:border-[CanvasText]`,
    // ghost keeps the box geometry (1px border, transparent color) but
    // presses without a shadow; hover derives entirely from --jx-tonal
    ghost: `jx-press border border-transparent bg-transparent text-foreground hover:bg-[color-mix(in_oklab,var(--jx-tonal)_8%,transparent)] hover:text-[color:var(--jx-tonal)] [--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none] forced-colors:bg-transparent forced-colors:text-[CanvasText] forced-colors:border-transparent forced-colors:hover:bg-[ButtonFace] forced-colors:hover:text-[ButtonText]`,
  } as const;

  // effect host class (the stacking pose rides utilities: relative z-0
  // keeps the negative-z layers under the in-flow label) + the custom
  // properties its loop reads — press-button's wiring, replicated
  const effectClass = $derived.by(() => {
    if (!activeEffect) return '';
    switch (activeEffect.type) {
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
    if (!activeEffect) return '';
    switch (activeEffect.type) {
      case 'shimmer':
        return `--shimmer-color:${activeEffect.color}; --shimmer-spread:${activeEffect.spread}; --shimmer-cut:${activeEffect.cut}; --shimmer-speed:${activeEffect.speed}ms`;
      case 'pulse':
        return `--pulse-color:${activeEffect.color}; --pulse-duration:${activeEffect.duration}ms; --pulse-distance:${activeEffect.distance}`;
      case 'rainbow':
        return `--rainbow-tx:${(activeEffect.speed * 3) / 2}ms; --rainbow-ty:${(activeEffect.speed * 5) / 2}ms; --rainbow-t1:${(activeEffect.speed * 7) / 2}ms; --rainbow-t2:${(activeEffect.speed * 11) / 2}ms; --rainbow-t3:${(activeEffect.speed * 13) / 2}ms; --rainbow-t4:${(activeEffect.speed * 17) / 2}ms; ${activeEffect.colors
          .map((c, i) => `--c${i + 1}:${c}`)
          .join('; ')}`;
      case 'ripple':
        return '';
    }
  });

  // ripple: the shared runtime (../press-button/ripple.svelte.ts) —
  // ink circles from the activation point; keyboard activation (click
  // with detail 0) ripples from the center. Reduced motion skips the
  // ink inside the factory — the anchored press already answers the
  // pointer.
  const rippleRuntime = createRipple(() => onclick?.());

  const classes = $derived(cn(base, silhouette, variants[d.variant], effectClass, className));
  const isExternal = $derived(external ?? (href !== undefined && !href.startsWith('/')));
</script>

{#snippet start()}
  {#if slotStart}
    <span data-icon="inline-start" class="inline-flex [&>svg]:size-[var(--jx-text-secondary)]">
      {@render slotStart()}
    </span>
  {/if}
{/snippet}

{#snippet end()}
  {#if slotEnd}
    <span data-icon="inline-end" class="inline-flex [&>svg]:size-[var(--jx-text-secondary)]">
      {@render slotEnd()}
    </span>
  {/if}
{/snippet}

{#snippet layers()}
  {#if activeEffect?.type === 'ripple'}
    <span class="jx-ripple-layer" aria-hidden="true">
      {#each rippleRuntime.ripples as r (r.key)}
        <span
          class="jx-ripple-dot{activeEffect.shape === 'bevel' && !bevelInk ? ' jx-ripple-flat' : ''}"
          data-shape={activeEffect.shape}
          style="width:{r.size}px; height:{r.size}px; top:{r.y}px; left:{r.x}px;
            --ripple-color:{activeEffect.color}"
          use:rippleRuntime.ink={{ key: r.key, duration: activeEffect.duration }}
        ></span>
      {/each}
    </span>
  {:else if activeEffect?.type === 'shimmer'}
    <span class="jx-shimmer-box" aria-hidden="true">
      <span class="jx-shimmer-slide"><span class="jx-shimmer-spark"></span></span>
    </span>
    <span class="jx-shimmer-cover" aria-hidden="true"></span>
  {:else if activeEffect?.type === 'pulse'}
    <span
      class="jx-pulse-layer"
      class:jx-pulse-slow={activeEffect.variant === 'slow'}
      class:jx-pulse-ring={activeEffect.variant === 'ring'}
      class:jx-pulse-ripple={activeEffect.variant === 'ripple'}
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
    data-density={d.density}
    data-jx-chip={d.variant}
    data-jx-shimmer-host={activeEffect?.type === 'shimmer' ? '' : undefined}
    data-jx-pulse-host={activeEffect?.type === 'pulse' ? '' : undefined}
    data-jx-ripple-host={activeEffect?.type === 'ripple' ? '' : undefined}
    class={classes}
    style={effectStyle || undefined}
    onclick={activeEffect?.type === 'ripple' ? rippleRuntime.onclick : undefined}
  >
    {@render layers()}
    {@render start()}
    {@render children()}
    {@render end()}
  </a>
{:else}
  <button
    {type}
    onclick={activeEffect?.type === 'ripple' ? rippleRuntime.onclick : onclick}
    aria-label={ariaLabel}
    data-density={d.density}
    data-jx-chip={d.variant}
    data-jx-shimmer-host={activeEffect?.type === 'shimmer' ? '' : undefined}
    data-jx-pulse-host={activeEffect?.type === 'pulse' ? '' : undefined}
    data-jx-ripple-host={activeEffect?.type === 'ripple' ? '' : undefined}
    class={classes}
    style={effectStyle || undefined}
  >
    {@render layers()}
    {@render start()}
    {@render children()}
    {@render end()}
  </button>
{/if}
