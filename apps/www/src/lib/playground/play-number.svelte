<!--
  PlayNumber — the standard numeric input (wraps the registry Input;
  a string bridge keeps the bound value a NUMBER — the DOM speaks
  strings, the page state should not).
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import Input from '$lib/ui/input/input.svelte';

  let {
    value = $bindable(0),
    min,
    max,
    step = 1,
  }: {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
  } = $props();

  const row = getContext<{ rowId: string }>('jx-play-row');

  // the DOM bridge: render strings, commit numbers
  let text = $state(String(value ?? 0));
  $effect(() => {
    if (Number(text) !== value) text = String(value ?? 0);
  });
  const commit = (): void => {
    const n = Number(text);
    value = Number.isFinite(n) ? n : 0;
  };
</script>

<Input type="number" bind:value={text} onchange={commit} {min} {max} {step} aria-labelledby={row?.rowId} class="w-20 text-[12.5px]" />
