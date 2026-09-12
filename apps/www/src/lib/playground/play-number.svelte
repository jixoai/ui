<!--
  PlayNumber — the standard numeric input (wraps the registry Input;
  a string bridge keeps the bound value a NUMBER — the DOM speaks
  strings, the page state should not).

  Event-driven commits (spin review round 3, 2026-09-12): commits
  fire ONLY from DOM events — oninput covers typing AND the −/+
  stepper pair (Input's steppers commit through input events, never
  change), onchange is the belt. The resync effect serves EXTERNAL
  value changes alone (resets, catalog re-anchoring) and can never
  fight the commits: it reacts to value, the commits react to the
  user, and the numeric-diff guard keeps our own commits from
  echoing. An earlier two-effect shape had text→value commits as a
  REACTION — external resets were promptly reverted by the stale
  text (interval 400 stayed 400 after the page said 130).
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

  // external value changes resync the field; own commits agree
  // numerically and never trigger this
  $effect(() => {
    if (Number(text) !== value) text = String(value ?? 0);
  });

  const commit = (): void => {
    const n = Number(text);
    if (Number.isFinite(n) && n !== value) value = n;
  };
</script>

<Input
  type="number"
  bind:value={text}
  oninput={commit}
  onchange={commit}
  {min}
  {max}
  {step}
  aria-labelledby={row?.rowId}
  class="w-20 text-[12.5px]"
/>
