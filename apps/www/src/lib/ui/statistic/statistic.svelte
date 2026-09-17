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
  import type { Density } from '$lib/density.svelte';
  import { StatisticDefaults } from './statistic-defaults.svelte';
  import { statisticStyles } from './statistic.stylex';

  interface Props {
    density?: Density;
    /** the metric's name — the micro-label above the value */
    title: string;
    /** the number itself; formatting is yours (Intl.NumberFormat) */
    value: string | number;
    prefix?: Snippet;
    suffix?: Snippet;
    /** 'up' renders ▲ primary · 'down' renders ▼ destructive */
    trend?: 'up' | 'down';
    class?: string;
  }

  let { density, title, value, prefix, suffix, trend, class: className = '' }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 3.4): density rides the no-opinion axis slot — explicit ??
  // ambient scope, else unstamped
  const d = $derived(StatisticDefaults.resolve({ density }));

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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  const TREND_CLASS = {
    up: cx(statisticStyles.trendUp),
    down: cx(statisticStyles.trendDown),
  } as const;
</script>

<div data-jx-stat="" data-density={d.density} class={cx(statisticStyles.root, className)}>
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
