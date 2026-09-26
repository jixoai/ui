<!--
  jixoai chart sparkline (registry/files/ui/chart/chart-sparkline.svelte,
  OpenSpec 2026-08-30-add-chart-family).

  The one-line inline trend for stat rows: no axes, honest min/max
  endpoints (the finite bounds map to the glyph range's extremes — no
  padded lie). Two cell systems (the valued data-jx-chart-sparkline
  hook):

    block   one eighth-block glyph per point (U+2581..2588), 8 levels
    braille points packed two per braille cell (U+2800 matrix), each
            finite point a single dot at its 4-level height

  A single inline <span> — composes inside a sentence, a Statistic
  suffix, a list row. Frozen degenerates: non-finite points keep
  their x position with NO geometry (a blank block cell / a dotless
  braille column); empty or all-non-finite data renders the empty
  span; a constant series renders the midline (block ▅, braille the
  level-1 dot pair).

  A11y: role="img" + REQUIRED `label`; `table` opts into the
  visually-hidden data table fallback (a REAL sibling table).
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
  import { sparkBlocks, sparkBraille } from './chart.svelte';
  import './chart.css';

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
    /** the series (a value-domain payload) */
    data: readonly number[];
    /** REQUIRED accessible name (role="img"); no default by contract */
    label: string;
    /** the cell system: block (8 levels/point) | braille (2 points/cell) */
    cells?: 'block' | 'braille';
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
    cells = 'braille',
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
  // economy 3.4 + W3-D1): the seven non-size universal axes resolve
  // one record (the contract's `size` key is the donut diameter
  // literal; the sparkline carries no size opinion — the axis
  // forwards ambient through the supply below)
  const d = $derived(
    ChartDefaults.resolve({ density, shape, radius, color, theme, elevation, motion }),
  );
  // the icon law (donut's guard, the 96px-explosion fix): the defaults'
  // open size slot (own 96 = the DONUT's outer diameter) backfills d.size
  // for every part — stamping it here put --jx-size-effective: 96px /
  // font-size 96px on bar/sparkline/line roots (7.38× magnified glyphs,
  // scrolling runs; introduced 3e8c38ec, diagnosed 2026-09-24). Only an
  // explicit number may stamp; these parts carry no size prop at all.
  const carriers = $derived(stampCarriersForLanes({ ...d, size: undefined }));
  provideUniversalLanes({ density, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLSpanElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived([carriers, style].filter(Boolean).join('; ') || undefined);
  const glyphs = $derived(cells === 'block' ? sparkBlocks(data) : sparkBraille(data));
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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

</script>

<span
  {...rest}
  bind:this={uniRoot}
  role="img"
  aria-label={label}
  data-jx-chart-sparkline={cells}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={cn('jx-chart-glyphs', cx(chartStyles.spark), className)}
>{glyphs}</span>

{#if table}
  <table class="jx-chart-table" data-jx-chart-sparkline-table="">
    <caption>{label}</caption>
    <thead>
      <tr><th scope="col">point</th><th scope="col">value</th></tr>
    </thead>
    <tbody>
      {#each data as v, i (i)}
        <tr>
          <th scope="row">{i}</th>
          <td>{Number.isFinite(v) ? v : '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
