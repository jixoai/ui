<!-- number-input blueprint: the [- NUM +] steppers with committed values —
     an int inside [1,16] and a decimal snapped to a 0.5 step. -->
<script lang="ts">
  import NumberInput from '$lib/ui/number-input.svelte';

  let workers = $state(4);
  let timeout = $state(2.5);
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <div class="flex w-full max-w-[320px] flex-col gap-6">
    <NumberInput label="workers" min={1} max={16} bind:value={workers} />
    <NumberInput label="timeout (s)" min={0.5} max={5} step={0.5} bind:value={timeout} />
  </div>
</div>
