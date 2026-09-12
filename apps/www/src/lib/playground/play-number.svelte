<!--
  PlayNumber — the standard numeric input (wraps the registry Input;
  a string bridge keeps the bound value a NUMBER — the DOM speaks
  strings, the page state should not).

  The resync effect (spin review round 2, 2026-09-12): typing goes
  through the Input's controlled lane (input events write the bound
  text live) while the page value only commits on change/blur — an
  UNCONDITIONAL resync would see the stale page value on every
  keystroke and snap the field back (16 typed as 32 stayed 16; the
  bug was global to every PlayNumber). The guard: while the field is
  FOCUSED the page value is stale by design — resync only when the
  field is at rest.
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
  let focused = $state(false);
  $effect(() => {
    if (focused) return; // typing in progress — the page value is stale by design
    if (Number(text) !== value) text = String(value ?? 0);
  });
  const commit = (): void => {
    const n = Number(text);
    value = Number.isFinite(n) ? n : 0;
  };
</script>

<Input
  type="number"
  bind:value={text}
  onfocus={() => (focused = true)}
  onblur={() => (focused = false)}
  onchange={commit}
  {min}
  {max}
  {step}
  aria-labelledby={row?.rowId}
  class="w-20 text-[12.5px]"
/>
