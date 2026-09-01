<!--
  range bind host (range spec, 2026-09-02): a REAL form host so the
  platform reset path is exercisable, with bind:value + the live echo
  so the $bindable contract is observable the way a consumer sees it.
-->
<script lang="ts">
  import Range from '../../src/lib/ui/range/range.svelte';

  let volume = $state(40);
</script>

<form>
  <Range bind:value={volume} name="volume" label="volume" min={0} max={100} id="rh-range" />
</form>
<span data-testid="out">{volume}</span>
