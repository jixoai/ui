<!--
  jixoai prototype waterfall (registry/files/ui/prototype-waterfall/
  prototype-waterfall.svelte).

  The layout family, alpha track (layout-family-alpha change,
  2026-09-11): the standardized waterfall primitive the design
  studio's property panel edits live (design-studio-r2 §6). Same
  three laws as prototype-flex (single root + rest spread with
  omission transparency; zero vocabulary translation; inline style
  only — any host). The engine is CSS multi-column:

  - columns: the CSS `columns` shorthand, verbatim — number is the
    count form, a length string ('14rem') the auto-width form; one
    property, both shapes, no branching.
  - strategy 'balanced' (v0's only member, per the r2 ruling):
    column-fill: balance — the browser equalizes column heights.
    A future 'ordered' (JS-measured shortest-column placement)
    extends the union non-breakingly; the prop ships now for that
    seam.
  - THE DECLARED TRADEOFFS (honest, not hidden): children flow in
    column order (newspaper order, not shortest-column-first), and
    break-inside stays the CONSUMER's call — the component never
    overrides it.

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
  import { PrototypeWaterfallDefaults } from './prototype-waterfall-defaults.svelte';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
    /** the CSS columns shorthand, verbatim: number = the count
     *  form, a length string ('14rem') = the auto-width form */
    columns?: number | string;
    /** column gap: number → px, string → verbatim */
    gap?: number | string;
    /** v0: 'balanced' only — column-fill: balance (browser-equalized
     *  column heights); 'ordered' (JS placement) is the future seam */
    strategy?: 'balanced';
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
    columns = undefined,
    gap = undefined,
    strategy = undefined,
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
  // (omission transparency — omitted props never serialize). A bare
  // number is the legal unit-less `columns` count form — no px
  // coercion here (unlike gap, which needs a unit).
  const gapStyle = $derived(typeof gap === 'number' ? `${gap}px` : gap);
  const fillStyle = $derived(strategy === 'balanced' ? 'balance' : undefined);

  // ── the eight-axis surface (W3-D2 — FIRST-TIME contract, all
  // no-own: the alpha lane's zero-translation posture extends to the
  // paint axes; the carriers join the CONSUMER style attr — the
  // merge law the layout family's spec pins — and the style:
  // directives below stay untouched)
  const d = $derived(
    PrototypeWaterfallDefaults.resolve({
      density,
      size,
      shape,
      radius,
      color,
      theme,
      elevation,
      motion,
    }),
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
  data-jx-prototype-waterfall
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  style:columns={columns}
  style:column-gap={gapStyle}
  style:column-fill={fillStyle}
>
  {@render children?.()}
</div>
