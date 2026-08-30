<!-- chart blueprint: the deterministic display trio — block-glyph bars
     on the text grid, a braille sparkline, and the dasharray donut
     with its hidden-table fallback present-but-clipped. -->
<script lang="ts">
  import ChartBar from '$lib/ui/chart/chart-bar.svelte';
  import ChartSparkline from '$lib/ui/chart/chart-sparkline.svelte';
  import ChartDonut from '$lib/ui/chart/chart-donut.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center gap-7 p-10 font-mono">
  <ChartBar
    label="weekly deploys by weekday"
    data={[3, 5, 2, 8, 7]}
    labels={['mon', 'tue', 'wed', 'thu', 'fri']}
    cells={18}
  />
  <div class="flex items-center gap-10">
    <div class="flex min-w-0 flex-col gap-3">
      <span class="text-muted-foreground text-xs">lead latency</span>
      <ChartSparkline label="lead latency trend" data={[2, 4, 3, 6, 5, 8, 7]} cells="braille" />
      <span class="text-muted-foreground text-xs">cycle time</span>
      <ChartSparkline label="cycle time trend" data={[8, 7, 7, 5, 6, 3, 2]} cells="block" />
    </div>
    <ChartDonut label="bundle share by layer" data={[46, 27, 17, 10]} />
  </div>
</div>
