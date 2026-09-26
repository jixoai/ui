<!--
  jixoai prototype grid (registry/files/ui/prototype-grid/prototype-grid.svelte).

  The layout family, alpha track (layout-family-alpha change,
  2026-09-11): the standardized grid primitive the design studio's
  property panel edits live (design-studio-r2 §6). Same three laws
  as prototype-flex (single root + rest spread with omission
  transparency; zero vocabulary translation; inline style only —
  any host), plus the track coercion per the design-studio-r2
  ruling (2026-09-11, cross-branch precedent — the studio's
  prototype-canvas, not an in-repo item):

  - cols/rows: number → repeat(N, minmax(0, 1fr)) — the
    no-max-content-blowout track form (css-architecture grid law
    vocabulary); string → verbatim (named/hybrid tracks).
  - gap: number → px, string → verbatim.
  - areas: a single verbatim grid-template-areas string
    ('"head head" "side main"'); an array-join form is a recorded
    future enhancement, deliberately not guessed in v0.

  Original requirement input: Owner 2026-09-11 — the layout family
  alpha track (Flex/Grid/Waterfall) for the design studio, meta
  stamped alpha, single-root + rest spread as the stamp
  precondition.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
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
  import { PrototypeGridDefaults } from './prototype-grid-defaults.svelte';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
    /** column tracks: number → repeat(N, minmax(0, 1fr)), string → verbatim */
    cols?: number | string;
    /** row tracks, same two forms as cols */
    rows?: number | string;
    /** grid gap: number → px, string → verbatim */
    gap?: number | string;
    /** grid-template-areas string, verbatim */
    areas?: string;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
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
  }

  let {
    cols = undefined,
    rows = undefined,
    gap = undefined,
    areas = undefined,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = undefined,
    style: consumerStyle,
    children,
    ...rest
  }: Props = $props();

  // undefined stays undefined: Svelte drops the style declaration
  // (omission transparency — omitted props never serialize).
  const trackStyle = (value: number | string | undefined): string | undefined =>
    typeof value === 'number' ? `repeat(${value}, minmax(0, 1fr))` : value;
  const columnsStyle = $derived(trackStyle(cols));
  const rowsStyle = $derived(trackStyle(rows));
  const gapStyle = $derived(typeof gap === 'number' ? `${gap}px` : gap);

  // ── the eight-axis surface (W3-D2 — FIRST-TIME contract, all
  // no-own: the alpha lane's zero-translation posture extends to the
  // paint axes; the carriers join the CONSUMER style attr — the
  // merge law the layout family's spec pins — and the style:
  // directives below stay untouched)
  const d = $derived(
    PrototypeGridDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(
    [carriers, consumerStyle ?? undefined].filter(Boolean).join('; ') || undefined,
  );
</script>

<div
  {...rest}
  bind:this={uniRoot}
  class={className}
  data-jx-prototype-grid
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  style:display="grid"
  style:grid-template-columns={columnsStyle}
  style:grid-template-rows={rowsStyle}
  style:grid-template-areas={areas}
  style:gap={gapStyle}
>
  {@render children?.()}
</div>
