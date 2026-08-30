<!--
  Chart family-ensemble harness (test/fixtures/chart-ensemble-harness.svelte).
  Exercises the Chart root's density provision: parts inside the root
  must adopt the provided tier (the family context contract).
-->
<script lang="ts">
  import Chart from '../../src/lib/ui/chart/chart.svelte';
  import ChartBar from '../../src/lib/ui/chart/chart-bar.svelte';
  import ChartSparkline from '../../src/lib/ui/chart/chart-sparkline.svelte';

  let {
    density,
    barData = [3, 5, 2, 8, 7],
    sparkData = [3, 5, 2, 8, 7],
  }: {
    density?: 'lg' | 'default' | 'sm' | 'xs';
    barData?: number[];
    sparkData?: number[];
  } = $props();
</script>

<Chart {density}>
  <ChartBar data={barData} label="deploys per day" />
  <ChartSparkline data={sparkData} label="deploys this week" />
</Chart>
