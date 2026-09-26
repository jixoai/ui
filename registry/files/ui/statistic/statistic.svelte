<!--
  jixoai statistic (registry/files/ui/statistic/statistic.svelte).
  The metric readout: a micro-label (font-nav) over a big tabular-num
  value, with optional prefix/suffix snippets and a text-glyph trend
  (▲/▼ — no icon dependency). tone carries the trend's voice through
  the shared law: up=primary (brand emphasis), down=destructive;
  invert with tone="down-good" semantics by passing your own snippets
  — the component never guesses what "good" means for YOUR metric.

  tw4 (2026-08-24): pure token utilities, zero css residue — the trend
  voice maps to color utilities per prop; `jx-stat*` classes are
  semantic hooks, css defines them not.
  tailwindless one-shot Wave 1b batch A (2026-09-17): the paint rides
  the family's stylex ATOMS (statistic.stylex.ts) joined through cx()
  below — the trend voice walks a static two-member table; the
  data-jx-stat* hooks stay attributes. Still zero css.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
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
  import { StatisticDefaults } from './statistic-defaults.svelte';
  import { statisticStyles } from './statistic.stylex';

  interface Props {
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** the metric's name — the micro-label above the value */
    title: string;
    /** the number itself; formatting is yours (Intl.NumberFormat) */
    value: string | number;
    prefix?: Snippet;
    suffix?: Snippet;
    /** 'up' renders ▲ primary · 'down' renders ▼ destructive */
    trend?: 'up' | 'down';
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
    class?: string;
  }

  let {
    density,
    title,
    value,
    prefix,
    suffix,
    trend,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
  }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 3.4 + W3-D3): one record — density resolves through the
  // bridged axis slot (explicit ?? ambient ?? 'auto'; no opinion
  // stamps nothing, the ambient css scope channel keeps flowing) and
  // the seven sibling axes ride the same record (the metric readout
  // is flat content, all no-own; the supply chain is the point)
  const d = $derived(
    StatisticDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner (all
  // string values except $$css, space-joined).
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

  const TREND_CLASS = {
    up: cx(statisticStyles.trendUp),
    down: cx(statisticStyles.trendDown),
  } as const;
</script>

<div
  bind:this={uniRoot}
  data-jx-stat=""
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={cx(statisticStyles.root, className)}
>
  <p data-jx-stat-title="" class={cx(statisticStyles.title)}>{title}</p>
  <p data-jx-stat-value="" class={cx(statisticStyles.value)}>
    {#if prefix}<span data-jx-stat-affix="" class={cx(statisticStyles.affix)}>{@render prefix()}</span>{/if}
    <span data-jx-stat-num="" class={cx(statisticStyles.num)}>{value}</span>
    {#if trend}
      <span
        data-jx-stat-trend={trend}
        class={cx(TREND_CLASS[trend])}
        aria-label="trend {trend}"
      >
        {trend === 'up' ? '▲' : '▼'}
      </span>
    {/if}
    {#if suffix}<span data-jx-stat-affix="" class={cx(statisticStyles.affix)}>{@render suffix()}</span>{/if}
  </p>
</div>
