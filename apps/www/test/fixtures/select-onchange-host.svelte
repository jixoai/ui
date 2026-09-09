<!-- the issue #6 fixture: bind:value + onchange in lockstep, with a
     readout proving both channels see every commit -->
<script lang="ts">
  import Select from '$lib/ui/select/select.svelte';
  const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma', disabled: true },
  ];
  let bound = $state<string | undefined>(undefined);
  let hooked = $state('—');
</script>

<Select {options} bind:value={bound} onchange={(v) => (hooked = v)} />
<p data-testid="bound-value">{bound ?? '—'}</p>
<p data-testid="onchange-readout">{hooked}</p>
