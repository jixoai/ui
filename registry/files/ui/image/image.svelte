<!--
  jixoai image (registry/files/ui/image/image.svelte).
  The general-purpose picture on avatar's proven laws: a native <img>,
  lazy, async-decoded, with REQUIRED intrinsic width/height (layout
  never shifts — the ruling made this explicit), alt semantics (text
  by default; alt="" opts into decorative), and a failure fallback
  slot with the src-change reset + composed onerror of avatar.svelte.

  Deliberately NOT here (batch-2 ruling): lightbox/zoom/preview —
  that is a dialog composition recipe (see the recipes page); no
  galleries, no thumbnail navigation, no gesture zoom.

  tw4 (2026-08-24): utility-authored, zero css residue — the img's
  responsive law and the broken-source panel are token utilities in
  the markup (the fallback svg is component-owned, so it takes its
  2rem box directly); the hooks ride `data-jx-image` /
  `data-jx-image-broken` attributes (data-jx-hooks, 2026-08-25).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLImgAttributes } from 'svelte/elements';
  import Icon from '$lib/ui/icon';
  import { cn } from '$lib/utils';
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
  import { ImageDefaults } from './image-defaults.svelte';
  import { imageStyles } from './image.stylex';

  // the payload's own join (separator's serialize law): atoms are
  // objects in dev — composition goes through THIS joiner (all string
  // values except $$css, space-joined; plain strings pass through)
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

  interface Props extends Omit<HTMLImgAttributes, 'alt' | 'width' | 'height' | 'color'> {
    /** the picture's meaning; "" marks it decorative */
    alt: string;
    /** REQUIRED intrinsic width — the no-CLS contract */
    width: number | string;
    /** REQUIRED intrinsic height — the no-CLS contract */
    height: number | string;
    /** rendered width/height classes when different from intrinsic */
    class?: string;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the batch A native rule:
     *  the family owns only the axis names it destructures;
     *  width/height stay the no-CLS contract's own and never see the
     *  axis) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    /** failure state (broken src, offline) — composed slot. CONTRACT:
     *  keep the intrinsic dims in your slot markup; the default
     *  fallback carries them so failure never shifts layout either */
    fallback?: Snippet;
  }

  let {
    alt,
    width,
    height,
    class: className = '',
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    fallback,
    onerror,
    style: consumerStyle,
    ...rest
  }: Props = $props();

  // ── the eight-axis surface (W3-D5 — FIRST-TIME contract, all
  // no-own): one resolution record; the carriers stamp the <img> root
  // AND JOIN the failure panel's dimension literals (the merge law —
  // the surface survives a broken source), the supply + the query()
  // anchor follow the standard wiring (the anchor after the state
  // decl). The failed-state slot branch renders consumer markup — no
  // family root, nothing to stamp
  const d = $derived(
    ImageDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let imgEl = $state<HTMLImageElement | undefined>();
  provideQueryAnchor(() => imgEl ?? null);
  const rootStyle = $derived(
    [carriers, consumerStyle ?? undefined].filter(Boolean).join('; ') || undefined,
  );

  let failed = $state(false);
  // a changed src is a fresh chance (avatar.svelte's proven law)
  $effect(() => {
    void rest.src;
    failed = false;
  });

  function handleError(event: Event & { currentTarget: EventTarget & HTMLImageElement }): void {
    try {
      onerror?.(event);
    } finally {
      failed = true;
    }
  }
</script>

{#if failed && fallback}
  {@render fallback()}
{:else if failed}
  <!-- decorative pictures (alt="") stay decorative through failure;
       content pictures get a name. Size carries the intrinsic dims so
       failure never shifts layout either; the §10 carriers JOIN the
       dimension literals (the merge law — the axis surface survives
       a broken source) -->
  <span
    data-jx-image-broken
    class={cx(imageStyles.broken)}
    style={[carriers || undefined, `width: ${typeof width === 'number' ? `${width}px` : width}; height: ${typeof height === 'number' ? `${height}px` : height}`].filter(Boolean).join('; ')}
    data-density={densityRungOf(d.density)}
    class:dark={d.theme === 'dark'}
    role={alt === '' ? undefined : 'img'}
    aria-label={alt === '' ? undefined : 'image unavailable'}
    aria-hidden={alt === '' || undefined}
  >
    <!-- lucide image glyph through the Icon component; the panel owns
         the layout, the component owns the 2rem box and the lighter
         stroke through its props -->
    <Icon name="image" size={32} strokeWidth={1.5} />
  </span>
{:else}
  <img
    bind:this={imgEl}
    data-jx-image
    class={cn(cx(imageStyles.img), className)}
    data-density={densityRungOf(d.density)}
    class:dark={d.theme === 'dark'}
    style={rootStyle}
    {alt}
    {width}
    {height}
    loading="lazy"
    decoding="async"
    onerror={handleError}
    {...rest}
  />
{/if}
