<!-- chart blueprint: the deterministic display trio — block-glyph bars
     on the text grid, a braille sparkline, and the dasharray donut
     with its hidden-table fallback present-but-clipped. -->
<script lang="ts">
  import ChartBar from '$lib/ui/chart/chart-bar.svelte';
  import ChartSparkline from '$lib/ui/chart/chart-sparkline.svelte';
  import ChartDonut from '$lib/ui/chart/chart-donut.svelte';
  import Stack from '$lib/ui/stack';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

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

<div class={cx(bpA.chartStage)}>
  <ChartBar
    label="weekly deploys by weekday"
    data={[3, 5, 2, 8, 7]}
    labels={['mon', 'tue', 'wed', 'thu', 'fri']}
    cells={18}
  />
  <div class={cx(bpA.chartRow)}>
    <Stack direction="column" gap="12" class={cx(bpA.chartColumn)}>
      <span class={cx(bpA.chartLabel)}>lead latency</span>
      <ChartSparkline label="lead latency trend" data={[2, 4, 3, 6, 5, 8, 7]} cells="braille" />
      <span class={cx(bpA.chartLabel)}>cycle time</span>
      <ChartSparkline label="cycle time trend" data={[8, 7, 7, 5, 6, 3, 2]} cells="block" />
    </Stack>
    <ChartDonut label="bundle share by layer" data={[46, 27, 17, 10]} />
  </div>
</div>
