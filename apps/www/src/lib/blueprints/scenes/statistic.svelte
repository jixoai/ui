<!-- statistic blueprint: three metric readouts — a trend glyph, an affix
     suffix, and a down-trend, separated by hairlines. -->
<script lang="ts">
  import Statistic from '$lib/ui/statistic.svelte';
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <Statistic title="weekly deploys" value="128" trend="up" />
  <div class="bg-border h-14 w-px"></div>
  {#snippet ms()}ms{/snippet}
  <Statistic title="p95 latency" value="412" suffix={ms} />
  <div class="bg-border h-14 w-px"></div>
  <Statistic title="failed deploys" value="3" trend="down" />
</div>
