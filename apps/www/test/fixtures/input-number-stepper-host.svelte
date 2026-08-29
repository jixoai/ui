<!--
  input-number-stepper-host — test fixture (input-picker-bridge.spec.ts).
  Hosts the Input number stepper with bind:value lanes (a plain object
  cannot cross the $bindable boundary): plain stepping, a bounded
  min/max/step lane, and a disabled lane.
-->
<script lang="ts">
  import Input from '$lib/ui/input/input.svelte';
  let plain = $state('');
  let bounded = $state('');
  let locked = $state('');
</script>

<Input type="number" id="ns-plain" bind:value={plain} label="n" />
<p data-testid="plain-value">{plain}</p>

<Input type="number" id="ns-bounded" bind:value={bounded} min={0} max={10} step={5} label="n" />
<p data-testid="bounded-value">{bounded}</p>

<Input type="number" id="ns-locked" bind:value={locked} disabled label="n" />
<p data-testid="locked-value">{locked}</p>
