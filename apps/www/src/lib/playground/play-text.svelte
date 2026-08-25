<!--
  PlayText — the standard free-text control (wraps the registry Input).
  Born from the sweep feedback: free-text props (dialog titles, trigger
  labels) had to ride a raw Input; now they get the row + naming for
  free.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import Input from '$lib/ui/input/input.svelte';

  let {
    value = $bindable(''),
    placeholder = '',
    type = 'text',
  }: {
    value?: string;
    placeholder?: string;
    type?: string;
  } = $props();

  const row = getContext<{ rowId: string }>('jx-play-row');
</script>

<Input {type} bind:value {placeholder} aria-labelledby={row?.rowId} class="w-40 text-[12.5px]" />
