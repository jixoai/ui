<!--
  PlayToggle — the standard boolean control (wraps the registry Toggle;
  one geometry source). The row label is the accessible name.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import Toggle from '$lib/ui/toggle/toggle.svelte';

  let { value = $bindable(false), disabled = false }: { value?: boolean; disabled?: boolean } = $props();

  const row = getContext<{ rowId: string }>('jx-play-row');
</script>

<Toggle bind:checked={value} {disabled} aria-labelledby={row?.rowId} />
