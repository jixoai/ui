<!--
  jixoai skeleton (registry/files/ui/skeleton/skeleton.svelte).
  The loading placeholder block: muted surface with a terminal-style
  brightness pulse. aria-hidden is set here — the real accessibility
  contract for loading regions belongs to the consumer (aria-busy on the
  container, or a visually-hidden "loading…" live region), never to each
  placeholder block.

  Pure CSS, zero JS. Shape is the consumer's geometry: the element is a
  bare block; width/height/aspect come from the class prop or the parent
  layout. The pulse respects prefers-reduced-motion (static muted block).

  tw4 (2026-08-24): paint as token utilities; the keyframes + the
  reduced-motion kill live in skeleton.css (D1-exempt residue —
  keyframes are not utilities; the kill overrides the animate utility,
  so it rides the unlayered state-machine carve-out).
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
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
  import { SkeletonDefaults } from './skeleton-defaults.svelte';
  import { skeletonStyles } from './skeleton.stylex';
  import './skeleton.css';

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

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (geometry stays the
     *  consumer's — the axis never manufactures width/height) */
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
     *  a coefficient · query() (the pulse's reduced-motion kill rides
     *  the media query, untouched) */
    motion?: MotionLane | QueryResult<MotionLane>;
  }

  let {
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style: consumerStyle,
    ...rest
  }: Props = $props();

  // ── the eight-axis surface (W3-D5 — FIRST-TIME wiring of the
  // contract skeleton-defaults declared back in
  // context-defaults-economy 3.2): one resolution record; the §10
  // carriers JOIN the consumer style attr (the merge law); the supply
  // + the query() anchor ride the standard wiring. The block stays
  // aria-hidden scenery — the surface never changes what it renders
  const d = $derived(
    SkeletonDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement | undefined>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(
    [carriers, consumerStyle ?? undefined].filter(Boolean).join('; ') || undefined,
  );
</script>

<!-- aria-hidden lands after the spread: a placeholder block is scenery
     by contract — restProps (data-*, id…) pass through untouched -->
<div
  bind:this={uniRoot}
  class={cn(cx('jx-skeleton', skeletonStyles.base), className)}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  {...rest}
  aria-hidden="true"
></div>
