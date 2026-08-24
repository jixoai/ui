<!--
  jixoai avatar (registry/files/ui/avatar.svelte).
  NativeHTML first: it IS an <img> — lazy, async-decoded, intrinsic
  width/height so layout never shifts.

  Fallback: when the image fails to load (or no src is given), the img
  is swapped for an initials block derived from `name` —
    "Ada Lovelace"      → "AL"   (first char of first + last word)
    "Gaubee"            → "Ga"   (single word: first 2 chars, CJK-safe
                                   by code-point slicing)
  At icon size (sm 24px) the block halves to ONE code point: two full-
  width glyphs cannot fit 24px and a badge must never wrap.

  Silhouettes (variant — one geometry, three corners):
    bevel     corner-shape: bevel + var(--radius) scaled to the box —
              md is the token baseline (8px), sm/lg keep the same cut
              proportion (6 / 8 / 10px); square where corner-shape is
              unsupported
    rounded   corner-shape: round + border-radius: 50% — a true circle
    squircle  corner-shape: squircle + border-radius: 50% — the
              superellipse; degrades to the circle without corner-shape

  Name tooltip: ON by default the full name rides a tooltip (hover-
  intent + focus, tooltip.svelte laws) — an avatar crops identity to
  initials, the tooltip gives it back. Pass tooltip={false} when the
  name is already visible beside the avatar.

  alt defaults to `name` (the avatar is content); pass alt="" explicitly
  for decorative avatars next to a visible name — the fallback block
  honors it too (aria-hidden, no label).

  Sizes are one geometry prop:  sm 24 · md 32 (default) · lg 40.

  tw4 (2026-08-24): utility-authored, zero css residue — sizes and
  silhouettes ride deterministic per-combination utility maps (corner-
  shape has no scale utility, so it rides arbitrary-property utilities;
  the radius stays variant-owned so no two radius utilities can collide);
  the `jx-avatar*` classes stay as semantic hooks only.
-->
<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import Tooltip from '$lib/ui/tooltip/tooltip.svelte';

  interface Props extends Omit<HTMLImgAttributes, 'alt'> {
    /** image URL; empty/failed loads fall back to the initials block */
    src?: string;
    /** the person — fuels alt text, the initials fallback and the tooltip */
    name: string;
    /** defaults to `name`; pass "" for a decorative avatar */
    alt?: string;
    /** sm 24px · md 32px (default) · lg 40px */
    size?: 'sm' | 'md' | 'lg';
    /** silhouette: bevel (default) | rounded (circle) | squircle */
    variant?: 'bevel' | 'rounded' | 'squircle';
    /** full name rides a tooltip by default; false opts out */
    tooltip?: boolean;
  }

  let {
    src,
    name,
    alt = name,
    size = 'md',
    variant = 'bevel',
    tooltip = true,
    class: className = '',
    onerror,
    ...rest
  }: Props = $props();

  let failed = $state(false);
  // a changed src is a fresh chance: reset the failure state
  $effect(() => {
    void src;
    failed = false;
  });

  /** run the caller's onerror, then swap to the fallback — a throwing
   *  caller handler must not leave the broken img on screen */
  function handleError(event: Event & { currentTarget: EventTarget & HTMLImageElement }) {
    try {
      onerror?.(event);
    } finally {
      failed = true;
    }
  }

  const decorative = $derived(alt === '');
  const px = $derived(size === 'sm' ? 24 : size === 'lg' ? 40 : 32);

  // one geometry, deterministic per combination: the size owns the box,
  // the silhouette owns the corners (bevel's cut scales with the box —
  // md IS the var(--radius) baseline, sm/lg ride the same proportion)
  const sizeUtilities = { sm: 'w-6 h-6', md: 'w-8 h-8', lg: 'w-10 h-10' } as const;
  const variantUtilities = {
    bevel: {
      sm: '[corner-shape:bevel] rounded-[calc(var(--radius)*0.75)]',
      md: '[corner-shape:bevel] rounded-(--radius)',
      lg: '[corner-shape:bevel] rounded-[calc(var(--radius)*1.25)]',
    },
    rounded: { sm: '[corner-shape:round] rounded-full', md: '[corner-shape:round] rounded-full', lg: '[corner-shape:round] rounded-full' },
    squircle: { sm: '[corner-shape:squircle] rounded-full', md: '[corner-shape:squircle] rounded-full', lg: '[corner-shape:squircle] rounded-full' },
  } as const;

  const initials = $derived.by(() => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '?';
    if (words.length === 1) return [...words[0]].slice(0, 2).join('').toUpperCase();
    return (words[0][0] + words.at(-1)![0]).toUpperCase();
  });
  // icon size halves the block: one code point, no overflow, no wrap
  const shown = $derived(size === 'sm' ? [...initials][0] : initials);

  // nothing to tip on an empty name, whatever the flag says
  const tipped = $derived(tooltip && name.trim().length > 0);

  const shell = $derived(
    cn(
      'jx-avatar flex-none box-border object-cover border border-border bg-card text-muted-foreground',
      sizeUtilities[size],
      variantUtilities[variant][size],
      `jx-avatar-${size} jx-avatar-${variant}`,
    ),
  );
</script>

{#snippet body()}
  {#if src && !failed}
    <img
      class={cn(shell, 'inline-block', className)}
      {src}
      {alt}
      loading="lazy"
      decoding="async"
      width={px}
      height={px}
      onerror={handleError}
      {...rest}
    />
  {:else}
    <span
      class={cn(shell, 'jx-avatar-fallback inline-flex items-center justify-center bg-muted font-nav text-xs tracking-[0.06em] uppercase whitespace-nowrap overflow-hidden', className)}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
    >
      {shown}
    </span>
  {/if}
{/snippet}

<!-- one body, two shells — the tooltip wraps it only when tipped -->
{#if tipped}
  <Tooltip text={name}>
    {@render body()}
  </Tooltip>
{:else}
  {@render body()}
{/if}
