<!--
  jixoai chart donut (registry/files/ui/chart/chart-donut.svelte,
  OpenSpec 2026-08-30-add-chart-family).

  The SVG ring: one circle per segment, painted by stroke-dasharray
  (dash = share × circumference, one dash per circle; offset = the
  accumulated lengths before it; the -90° group rotation pins segment
  0 at 12 o'clock) over a full muted track. Segment colors ride the
  theme's --chart-1..5 semantic palette, then a deterministic neutral
  oklch ladder derived from var(--brand-hue) (hue injection stays the
  consumer's job — restyle through the hooks/classes; the palette is
  the component's frozen default).

  The center is a SNIPPET SLOT (the total, a delta, a label — the
  consumer's composition, absolutely positioned over the ring).

  Frozen degenerates: negative and non-finite values are 0-share
  segments (a donut is composition shares — it never invents
  magnitude); a zero total (empty, all-bad, all-non-positive) renders
  the BARE TRACK; shares always sum to the circumference exactly.

  A11y: role="img" + REQUIRED `label`; `table` opts into the
  visually-hidden data table fallback (a REAL sibling table with each
  segment's value and share).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
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
  import { donutGeometry } from './chart.svelte';
  import './chart.css';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
    /** the segment values (composition shares of the total) */
    data: readonly number[];
    /** REQUIRED accessible name (role="img"); no default by contract */
    label: string;
    /** the ring's outer size in px — the open literal (own 96).
     *  §13/W3-D1 (the icon/spin ruling, same semantics): a NUMBER is
     *  ALSO the universal size axis' number lane verbatim — an
     *  explicit number stamps the §1 carrier (the glyph takes no
     *  font-size opinion it was not given); named/auto stay
     *  unadopted on the svg glyph */
    size?: number;
    /** the stroke thickness in px */
    thickness?: number;
    /** the center slot — the total, a delta, your composition */
    children?: Snippet;
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
    size,
    thickness = 12,
    children,
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
  // economy 3.4 + W3-D1): size rides a literal slot (own 96px), the
  // seven other universal axes resolve one record. The §1 number
  // lane rides the size fragment VERBATIM (the icon law): only an
  // explicit number stamps the carrier — the resolved default 96
  // stays the glyph's own geometry, never a font-size opinion
  const d = $derived(
    ChartDefaults.resolve({ size, density, shape, radius, color, theme, elevation, motion }),
  );
  const geo = $derived(donutGeometry(data, d.size, thickness));
  const carriers = $derived(
    stampCarriersForLanes({ ...d, size: typeof size === 'number' ? size : undefined }),
  );
  provideUniversalLanes({
    density,
    size: typeof size === 'number' ? size : undefined,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
  });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived([carriers, style].filter(Boolean).join('; ') || undefined);
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

<div
  {...rest}
  bind:this={uniRoot}
  role="img"
  aria-label={label}
  data-jx-chart-donut=""
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={cn(cx(chartStyles.grid), className)}
>
  <svg viewBox="0 0 {d.size} {d.size}" width={d.size} height={d.size} fill="none" aria-hidden="true" class={cx(chartStyles.stacked)}>
    <g transform="rotate(-90 {d.size / 2} {d.size / 2})">
      <circle
        class="jx-chart-track"
        cx={d.size / 2}
        cy={d.size / 2}
        r={geo?.radius ?? (d.size - thickness) / 2}
        stroke-width={thickness}
      />
      {#if geo}
        {#each geo.segments as seg (seg.index)}
          <circle
            class="jx-chart-seg"
            cx={d.size / 2}
            cy={d.size / 2}
            r={geo.radius}
            stroke-width={thickness}
            stroke-dasharray={seg.dash}
            stroke-dashoffset={seg.offset}
            data-seg={seg.index}
            style={`--jx-chart-seg-color: ${seg.color}`}
          />
        {/each}
      {/if}
    </g>
  </svg>
  {#if children}
    <!-- the center slot is a grid item of the SAME cell (CR-2, 2026-09-02): grid stacking, not absolute overlay -->
    <div data-jx-chart-donut-center="" class={cx(chartStyles.stacked, chartStyles.center)}>
      {@render children()}
    </div>
  {/if}
</div>

{#if table}
  <table class="jx-chart-table" data-jx-chart-donut-table="">
    <caption>{label}</caption>
    <thead>
      <tr><th scope="col">segment</th><th scope="col">value</th><th scope="col">share</th></tr>
    </thead>
    <tbody>
      {#if geo}
        {#each geo.segments as seg (seg.index)}
          <tr>
            <th scope="row">{seg.index}</th>
            <td>{seg.value > 0 ? seg.value : '—'}</td>
            <td>{Math.round(seg.share * 100)}%</td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
{/if}
