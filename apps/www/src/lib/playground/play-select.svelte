<!--
  PlaySelect — the standard enum control: typed option map over the
  registry NativeSelect (the page never touches DOM string events).
-->
<script lang="ts" generics="T extends string">
  import { getContext } from 'svelte';
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';

  let {
    value = $bindable(),
    options,
  }: {
    value?: T;
    options: readonly { value: T; label: string }[];
  } = $props();

  const row = getContext<{ rowId: string }>('jx-play-row');
</script>

<NativeSelect bind:value={value} aria-labelledby={row?.rowId} class="text-[12.5px]">
  {#each options as opt (opt.value)}
    <option value={opt.value}>{opt.label}</option>
  {/each}
</NativeSelect>
