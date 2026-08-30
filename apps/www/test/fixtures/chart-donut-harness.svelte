<!--
  ChartDonut contract-test harness (test/fixtures/chart-donut-harness.svelte).
  The center slot must be a real Svelte 5 snippet, so the fixed
  consumer markup (the running total) lives here. Props mirror the
  ChartDonut API for variation.
-->
<script lang="ts">
  import ChartDonut from '../../src/lib/ui/chart/chart-donut.svelte';

  let {
    data = [4, 3, 2, 1],
    label = 'incident severities',
    size = 96,
    thickness = 12,
    table = false,
    center = true,
  }: {
    data?: number[];
    label?: string;
    size?: number;
    thickness?: number;
    table?: boolean;
    center?: boolean;
  } = $props();

  const total = $derived(data.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0));
</script>

<ChartDonut {data} {label} {size} {thickness} {table}>
  {#if center}
    <span data-harness-center="total">{total}</span>
  {/if}
</ChartDonut>
