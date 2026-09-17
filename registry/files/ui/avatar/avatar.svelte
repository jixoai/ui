<!--
  jixoai avatar (registry/files/ui/avatar/avatar.svelte).
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
  the radius stays variant-owned so no two radius utilities can collide).
  data-jx-hooks (2026-08-25): the `jx-avatar*` hook classes are gone —
  size and silhouette ride the valued attributes `data-jx-avatar={size}`
  and `data-jx-avatar-variant={variant}` (one per dimension, exact-match
  queryable); the initials block adds boolean `data-jx-avatar-fallback`.

  tailwindless one-shot Wave 1 (2026-09-17): frame/sizes/postures ride
  avatar.stylex.ts atoms (joined through the payload's own cx()); the
  silhouette geometry rides avatar.css keyed on the data contract
  above — the class channel carries paint, the data channel carries
  shape.
-->
<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import Tooltip from '$lib/ui/tooltip/tooltip.svelte';
  import { AvatarDefaults, type AvatarSize, type AvatarVariant } from './avatar-defaults.svelte';
  import { avatarStyles } from './avatar.stylex';
  import './avatar.css';

  interface Props extends Omit<HTMLImgAttributes, 'alt'> {
    /** image URL; empty/failed loads fall back to the initials block */
    src?: string;
    /** the person — fuels alt text, the initials fallback and the tooltip */
    name: string;
    /** defaults to `name`; pass "" for a decorative avatar */
    alt?: string;
    /** sm 24px · md 32px (default) · lg 40px — literal slot, own 'md' */
    size?: AvatarSize;
    /** silhouette: bevel (default) | rounded (circle) | squircle —
     *  literal slot, own 'bevel' */
    variant?: AvatarVariant;
    /** full name rides a tooltip by default; false opts out */
    tooltip?: boolean;
  }

  let {
    src,
    name,
    alt = name,
    size,
    variant,
    tooltip = true,
    class: className = '',
    onerror,
    ...rest
  }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 3.4): size/variant ride literal slots (own 'md'/'bevel',
  // never reads context — ambient capability pends a future axis)
  const d = $derived(AvatarDefaults.resolve({ size, variant }));

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
  const px = $derived(d.size === 'sm' ? 24 : d.size === 'lg' ? 40 : 32);

  // the payload's own join (separator's serialize law): every string
  // declaration except the $$css marker, space-joined — atoms are
  // objects in dev, raw interpolation would render [object Object]
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // one geometry, deterministic per combination: the size owns the box
  // (md is CONTEXT-OWNED: --jx-avatar-md injected by a list-item media
  // host fills its box, zero override fights; everywhere else the
  // fallback keeps the classic 2rem); the silhouette owns the corners
  // (avatar.css, keyed on the data contract — bevel's cut scales with
  // the box: md IS the var(--radius) baseline)
  const SIZE_ATOM = {
    sm: avatarStyles.sizeSm,
    md: avatarStyles.sizeMd,
    lg: avatarStyles.sizeLg,
  } as const;

  const initials = $derived.by(() => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '?';
    if (words.length === 1) return [...words[0]].slice(0, 2).join('').toUpperCase();
    return (words[0][0] + words.at(-1)![0]).toUpperCase();
  });
  // icon size halves the block: one code point, no overflow, no wrap
  const shown = $derived(d.size === 'sm' ? [...initials][0] : initials);

  // nothing to tip on an empty name, whatever the flag says
  const tipped = $derived(tooltip && name.trim().length > 0);

  const shell = $derived(cx(avatarStyles.frame, SIZE_ATOM[d.size]));
</script>

{#snippet body()}
  {#if src && !failed}
    <img
      data-jx-avatar={d.size}
      data-jx-avatar-variant={d.variant}
      class={cn(cx(shell, avatarStyles.imgPosture), className)}
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
      data-jx-avatar={d.size}
      data-jx-avatar-variant={d.variant}
      data-jx-avatar-fallback
      class={cn(cx(shell, avatarStyles.fallbackPosture), className)}
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
