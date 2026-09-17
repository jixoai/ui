<!-- statistic blueprint: three metric readouts — a trend glyph, an affix
     suffix, and a down-trend, separated by hairlines.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Statistic from '$lib/ui/statistic/statistic.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';

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
</script>

<div class={cx(bpB.statisticStage)}>
  <Statistic density="lg" title="weekly deploys" value="128" trend="up" />
  <div class={cx(bpB.statisticDivider)}></div>
  {#snippet ms()}ms{/snippet}
  <Statistic title="p95 latency" value="412" suffix={ms} />
  <div class={cx(bpB.statisticDivider)}></div>
  <Statistic title="failed deploys" value="3" trend="down" />
</div>
