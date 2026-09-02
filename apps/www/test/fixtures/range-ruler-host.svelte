<!--
  range ruler host (range spec, 2026-09-02): composes the ruler through
  the `ticks` snippet — N RangeTick scales driven by a prop — with the
  bind:value echo so the snap contract is observable the way a consumer
  sees it.
-->
<script lang="ts">
  import Range, { RangeTick } from '../../src/lib/ui/range';

  let { scales = [1], value = $bindable(0), min = 0, max = 100, step = 1 } = $props();
</script>

<Range bind:value {min} {max} {step}>
  {#snippet ticks()}
    {#each scales as s (s)}
      <RangeTick scale={s} />
    {/each}
  {/snippet}
</Range>
<span data-testid="out">{value}</span>
