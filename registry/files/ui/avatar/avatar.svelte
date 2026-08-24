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
-->
<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements';
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
</script>

{#snippet body()}
  {#if src && !failed}
    <img
      class="jx-avatar jx-avatar-{size} jx-avatar-{variant} {className}"
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
      class="jx-avatar jx-avatar-{size} jx-avatar-{variant} jx-avatar-fallback {className}"
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

<style>
  .jx-avatar {
    flex: none;
    display: inline-block;
    box-sizing: border-box;
    object-fit: cover;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
    color: var(--muted-foreground);
  }
  .jx-avatar-sm {
    width: 24px;
    height: 24px;
  }
  .jx-avatar-md {
    width: 32px;
    height: 32px;
  }
  .jx-avatar-lg {
    width: 40px;
    height: 40px;
  }
  /* silhouettes: variant rules come after the base so 50% overrides
     var(--radius); corner-shape is stated explicitly everywhere — a
     registry install must not lean on the site's global bevel rule */
  .jx-avatar-bevel {
    corner-shape: bevel;
  }
  /* bevel scales with the box: md IS the var(--radius) baseline (8px
     where corner-shape lives), sm/lg ride the same cut proportion
     (24/32 = .75, 40/32 = 1.25 → 6 / 8 / 10px) */
  .jx-avatar-sm.jx-avatar-bevel {
    border-radius: calc(var(--radius) * 0.75);
  }
  .jx-avatar-lg.jx-avatar-bevel {
    border-radius: calc(var(--radius) * 1.25);
  }
  .jx-avatar-rounded {
    corner-shape: round;
    border-radius: 50%;
  }
  .jx-avatar-squircle {
    corner-shape: squircle;
    border-radius: 50%;
  }
  .jx-avatar-fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--muted);
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
  }
</style>
