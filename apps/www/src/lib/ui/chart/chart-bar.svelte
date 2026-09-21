<!--
  jixoai chart bar (registry/files/ui/chart/chart-bar.svelte, OpenSpec
  2026-08-30-add-chart-family).

  Horizontal bars on the text grid: Unicode block fill, value-
  proportional — floor(value/max × cells) full blocks plus one
  left-eighth partial tail (chart.svelte's barRun). One row per datum:
  a label lane (inline-start), the glyph run, a value lane
  (inline-end). The mono lock lives in chart.css (.jx-chart-glyphs).

  Data honesty (frozen semantics, unit-tested): non-finite and
  non-positive values render an EMPTY run — the glyph lane refuses to
  lie; the value lane keeps showing the number (non-finite as the em
  dash). The scale is the max of the finite values; an all-non-positive
  series renders empty runs (max must be > 0).

  Variant grammar: fill | tonal | outline — the run's INK through the
  four global hue slots (valued data-jx-chart-bar hook), so intensity
  composes with hue injection like every other painted surface:
  variant = how, jx-hue-* = which voice.

  A11y: role="img" + REQUIRED `label` (aria-label; the type contract
  has no default). `table` opts into the visually-hidden data table
  fallback (a REAL sibling table — role="img" makes this subtree
  presentational, so the mirror lives outside it).
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
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import { chartStyles } from './chart.stylex';
  import { ChartDefaults } from './chart-defaults.svelte';
  import { barRun, seriesBounds, type ChartVariant } from './chart.svelte';
  import './chart.css';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
    /** the series — one row per datum (a value-domain payload, the
     *  chart family's whole contract) */
    data: readonly number[];
    /** REQUIRED accessible name (role="img"); no default by contract */
    label: string;
    /** parallel label lane (zipped by index; absent → empty lane) */
    labels?: readonly (string | number)[];
    /** the ink's prominence rung through the global hue slots */
    variant?: ChartVariant;
    /** the bar-length budget in character cells */
    cells?: number;
    /** the inline-end value lane (raw numbers — formatting is yours) */
    values?: boolean;
    /** opt-in visually-hidden data table fallback */
    table?: boolean;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
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
    class?: string;
  }

  let {
    data,
    label,
    labels,
    variant,
    cells = 20,
    values = true,
    table = false,
    density,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style = '',
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.4 + W3-D1): variant rides a literal slot (own 'fill'),
  // the seven non-size universal axes resolve one record — the
  // contract's `size` key is the donut diameter literal, and the bar
  // carries no size opinion of its own (the size axis forwards
  // ambient through the supply below)
  const d = $derived(
    ChartDefaults.resolve({ variant, density, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived([carriers, style].filter(Boolean).join('; ') || undefined);
  const max = $derived(seriesBounds(data)?.max ?? 0);
  const run = $derived((v: number) => barRun(v, max, cells));

  // the payload's own join (separator's serialize law): objects in
  // dev, joined strings in payloads — never a raw interpolation
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

  // the variant ladder's ink — atom groups at module scope (the
  // dynamic-producer law: data-built STRINGS must resolve to
  // registered identities; the map walks cx() over static members)
  const INK_CLASS: Record<ChartVariant, string> = {
    fill: cx(chartStyles.inkFill),
    tonal: cx(chartStyles.inkTonal),
    outline: cx(chartStyles.inkOutline),
  };
</script>

<div
  {...rest}
  bind:this={uniRoot}
  role="img"
  aria-label={label}
  data-jx-chart-bar={d.variant}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={cn(cx(chartStyles.barRoot), className)}
>
  {#each data as v, i (i)}
    <div data-jx-chart-bar-row="" class={cx(chartStyles.barRow)}>
      <span data-jx-chart-bar-label="" class={cx(chartStyles.barLabel)}>{labels?.[i] ?? ''}</span>
      <span data-jx-chart-bar-run="" class="jx-chart-glyphs {INK_CLASS[d.variant]}">{run(v)}</span>
      {#if values}
        <span data-jx-chart-bar-value="" class={cx(chartStyles.barValue)}>{Number.isFinite(v) ? v : '—'}</span>
      {/if}
    </div>
  {/each}
</div>

{#if table}
  <table class="jx-chart-table" data-jx-chart-bar-table="">
    <caption>{label}</caption>
    <thead>
      <tr><th scope="col">row</th><th scope="col">value</th></tr>
    </thead>
    <tbody>
      {#each data as v, i (i)}
        <tr>
          <th scope="row">{labels?.[i] ?? i}</th>
          <td>{Number.isFinite(v) ? v : '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
