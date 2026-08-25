<!--
  PlaySegmented — the standard small-enum control: a terminal button
  row with one pressed state. Replaces the four divergent enum forms
  (NativeSelect / Input / hand-rolled buttons / page-local fieldsets).
-->
<script lang="ts" generics="T extends string">
  import { getContext } from 'svelte';

  let {
    value = $bindable(),
    options,
  }: {
    value?: T;
    options: readonly { value: T; label: string }[];
  } = $props();

  const row = getContext<{ rowId: string }>('jx-play-row');
</script>

<div class="jx-play-seg" role="group" aria-labelledby={row?.rowId}>
  {#each options as opt (opt.value)}
    <button
      type="button"
      aria-pressed={value === opt.value}
      onclick={() => (value = opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>
