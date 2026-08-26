<!--
  jixoai badge (registry/files/ui/badge/badge.svelte).
  The inline status chip of the site grammar: Share Tech Mono uppercase
  micro-label, 1px border, radius 0 — the eyebrow's inline cousin.

  Variant grammar (variant-grammar change, 2026-08-26, supersedes the
  tone vocabulary law): variants are the prominence ladder
  fill | tonal | outline (default tonal, NO local hue override — a bare
  Badge is the primary tint); semantic color is hue injection through
  the four global tokens (--jx-fill / --jx-fill-ink / --jx-tonal /
  --jx-outline): neutral metadata class="[--jx-tonal:var(--muted-foreground)]",
  error status class="[--jx-tonal:var(--error)]", success
  class="[--jx-tonal:var(--success)]" (see openspec/changes/variant-grammar).
  Alert rides the same ladder (variant, outline-default) — the shared tone law is retired there too.

  Geometry is the kbd law: height from --jx-line-secondary, inline
  insets only, never block padding. slotStart/slotEnd render icon lanes
  (svg sized to the secondary text) with adaptive inline padding;
  shape square | pill. Forced colors (§6): Canvas ground + CanvasText
  ink, the 1px border survives.

  A plain <span> so it composes anywhere (inside headings, table cells,
  terminal cards); restProps flow through — data-*, title, aria-* land
  verbatim.

  tw4 (2026-08-24): utility-authored — paint is arbitrary-value token
  utilities in the markup (variant rides a deterministic map, so no two
  variant utilities ever collide in the sheet); the variant rides the
  ONE valued hook attribute `data-jx-badge={variant}`.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    /** prominence ladder: fill | tonal | outline (hue: global tokens) */
    variant?: 'fill' | 'tonal' | 'outline';
    /** square = --radius corners (default); pill = rounded-full */
    shape?: 'square' | 'pill';
    /** icon lane before the label (svg sized to the secondary text) */
    slotStart?: Snippet;
    /** icon lane after the label */
    slotEnd?: Snippet;
    /** density policy: explicit, inherited, then default */
    density?: Density;
  }

  let {
    density,
    variant = 'tonal',
    shape = 'square',
    slotStart,
    slotEnd,
    class: className = '',
    children,
    ...rest
  }: Props = $props();
  const resolvedDensity = $derived(resolveDensity(density, getDensityContext()));

  // deterministic per variant — each rung is the SOLE bg/border-color/color
  // source (typed arbitrary utilities; named utilities would sort after these
  // and silently win — the batch-D collision law), so no two variant
  // utilities ever collide in the sheet.
  const variantUtilities = {
    fill: 'bg-(--jx-fill) border-(color:--jx-fill) text-(color:--jx-fill-ink)',
    tonal: 'bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)] border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] text-(color:--jx-tonal)',
    outline: 'bg-[transparent] border-(color:--jx-outline) text-(color:--foreground)',
  } as const;
</script>

<span
  data-jx-badge={variant}
  data-density={resolvedDensity}
  class={cn(
    'inline-flex items-center gap-[calc(var(--jx-gap)/2)] box-border max-w-full [padding-inline:var(--jx-inset)] has-[[data-icon=inline-start]]:pl-[calc(var(--jx-inset)/2)] has-[[data-icon=inline-end]]:pr-[calc(var(--jx-inset)/2)] border font-nav [font-size:var(--jx-text-secondary)] [line-height:var(--jx-line-secondary)] tracking-[0.14em] uppercase whitespace-nowrap rounded-(--radius) forced-color-adjust-auto [@media(forced-colors:active)]:bg-[Canvas] [@media(forced-colors:active)]:border-[CanvasText] [@media(forced-colors:active)]:text-[CanvasText]',
    shape === 'pill' && 'rounded-full',
    variantUtilities[variant],
    className,
  )}
  {...rest}
>
  {#if slotStart}<span data-icon="inline-start" class="inline-flex [&>svg]:size-[var(--jx-text-secondary)]">{@render slotStart()}</span>{/if}
  {@render children?.()}
  {#if slotEnd}<span data-icon="inline-end" class="inline-flex [&>svg]:size-[var(--jx-text-secondary)]">{@render slotEnd()}</span>{/if}
</span>
