<!-- range blueprint: mid-commit sliders — the ringed disc thumb over the
     primary fill, the second one with the tick ruler. -->
<script lang="ts">
  import Range from '$lib/ui/range/range.svelte';

  let volume = $state(40);
  let gain = $state(6);
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <div class="flex w-full max-w-[440px] flex-col gap-8">
    <Range label="volume" min={0} max={100} bind:value={volume} />
    <Range label="gain" min={0} max={10} step={0.5} ticks bind:value={gain} />
  </div>
</div>
