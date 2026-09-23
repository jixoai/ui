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
  import {
    densityRungOf,
    provideQueryAnchor,
    provideUniversalLanes,
    stampCarriersForLanes,
    type ColorLane,
    type DensityLane,
    type ElevationLane,
    type MotionLane,
    type QueryResult,
    type RadiusLane,
    type ShapeLane,
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import {
    AvatarDefaults,
    normalizeAvatarSize,
    type AvatarVariant,
  } from './avatar-defaults.svelte';
  import { avatarStyles } from './avatar.stylex';
  import './avatar.css';

  interface Props extends Omit<HTMLImgAttributes, 'alt' | 'color'> {
    /** image URL; empty/failed loads fall back to the initials block */
    src?: string;
    /** the person — fuels alt text, the initials fallback and the tooltip */
    name: string;
    /** defaults to `name`; pass "" for a decorative avatar */
    alt?: string;
    /** THE universal size axis (§1, ADOPTED per §13): named steps
     *  small 24 · medium 32 · large 40 (legacy aliases sm/md/lg
     *  normalize onto them), the number lane = the box edge in px
     *  verbatim, auto = inherit (the 32px geometry baseline). The
     *  carrier stamps --jx-size-effective so the initials fallback
     *  scales with the axis */
    size?: SizeLane | QueryResult<SizeLane> | 'sm' | 'md' | 'lg';
    /** silhouette: bevel (default) | rounded (circle) | squircle —
     *  literal slot, own 'bevel' (no collision with the §2 axis) */
    variant?: AvatarVariant;
    /** full name rides a tooltip by default; false opts out */
    tooltip?: boolean;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit
     *  (supply-side — the silhouette sheet reads the variant keys) */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp · query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive · a
     *  coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
  }

  let {
    src,
    name,
    alt = name,
    size,
    variant,
    tooltip = true,
    density,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    onerror,
    style: callerStyle,
    ...rest
  }: Props = $props();
  // the family Defaults is the single read point (explicit-props W3-B
  // / task 3.6): the §13 size adoption — legacy spellings normalize
  // onto the axis' named steps BEFORE the resolve (normalizeAvatarSize),
  // the eight universal axes ride the same record
  const sizeLane = $derived(normalizeAvatarSize(size));
  const d = $derived(AvatarDefaults.resolve({ size: sizeLane, variant, density, shape, radius, color, theme, elevation, motion }));
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the body root's ANCESTORS
  // are the candidate containers — the tooltip shell is not a carrier)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size: sizeLane, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);

  let failed = $state(false);
  // a changed src is a fresh chance: reset the failure state
  $effect(() => {
    void src;
    failed = false;
  });

  /** run the caller's onerror, then swap to the fallback — a throwing
      caller handler must not leave the broken img on screen */
  function handleError(event: Event & { currentTarget: EventTarget & HTMLImageElement }) {
    try {
      onerror?.(event);
    } finally {
      failed = true;
    }
  }

  const decorative = $derived(alt === '');
  // the resolved lane → the geometry ladder: named steps keep the
  // 24/32/40 boxes, a number IS the edge (px verbatim, §13), auto
  // falls to the 32px baseline; the LEGACY spelling keys the
  // silhouette sheet (avatar.css) and the valued hook
  const boxLane = $derived(
    d.size === 'small' ? 24 : d.size === 'medium' ? 32 : d.size === 'large' ? 40 : typeof d.size === 'number' ? d.size : 32,
  );
  const px = $derived(boxLane);
  const legacySize = $derived(
    d.size === 'small' ? 'sm' : d.size === 'medium' ? 'md' : d.size === 'large' ? 'lg' : typeof d.size === 'number' ? String(d.size) : 'md',
  );

  // the payload's own join (the separator serialize law): every string
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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
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
  // the smallest box halves the block: one code point, no overflow, no wrap
  const shown = $derived(boxLane <= 24 ? [...initials][0] : initials);

  // nothing to tip on an empty name, whatever the flag says
  const tipped = $derived(tooltip && name.trim().length > 0);

  // the box atom: sm/lg are fixed rem atoms; md/number/auto ride the
  // CONTEXT-OWNED --jx-avatar-md channel (a list-item media host may
  // fill its box; the number lane stamps its px edge there)
  const shell = $derived(
    cx(avatarStyles.frame, legacySize === 'sm' || legacySize === 'lg' ? SIZE_ATOM[legacySize] : avatarStyles.sizeMd),
  );
  const sizeVar = $derived(typeof d.size === 'number' ? `--jx-avatar-md: ${d.size}px` : '');
  // the #4 composition: carriers + the number-lane box var first, the
  // caller's own style LAST
  const rootStyle = $derived([carriers, sizeVar, callerStyle].filter(Boolean).join('; ') || undefined);
  const hookAttrs = $derived({
    'data-jx-avatar': legacySize,
    'data-jx-avatar-variant': d.variant,
  });
</script>

{#snippet body()}
  {#if src && !failed}
    <img
      bind:this={uniRoot}
      {...hookAttrs}
      class={cn(cx(shell, avatarStyles.imgPosture), className)}
      {src}
      {alt}
      loading="lazy"
      decoding="async"
      width={px}
      height={px}
      onerror={handleError}
      data-density={densityRungOf(d.density)}
      class:dark={d.theme === 'dark'}
      style={rootStyle}
      {...rest}
    />
  {:else}
    <span
      bind:this={uniRoot}
      {...hookAttrs}
      data-jx-avatar-fallback
      class={cn(cx(shell, avatarStyles.fallbackPosture), className)}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      data-density={densityRungOf(d.density)}
      class:dark={d.theme === 'dark'}
      style={rootStyle}
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
