<!--
  async-press-host.svelte — the async two-step harness for the press-button
  loading tests (enhance-picker-feedback, 2026-08-30): a loading button
  (activation counted into data-presses), an href anchor sharing the
  loading pose, and a flash trigger that fires the one-shot success flash
  on the first button via bind:this — exactly the documented idiom.
-->
<script lang="ts">
  import PressButton from '../../src/lib/ui/press-button/press-button.svelte';

  let { loading = false }: { loading?: boolean } = $props();

  let presses = $state(0);
  let anchorPresses = $state(0);
  let btn: { flash: (ms?: number) => void } | undefined;
</script>

<PressButton
  bind:this={btn}
  variant="fill"
  {loading}
  onclick={() => {
    presses += 1;
  }}
>
  deploy
</PressButton>

<PressButton
  variant="outline"
  href="/docs/components.html"
  {loading}
  onclick={() => {
    anchorPresses += 1;
  }}
>
  read the docs
</PressButton>

<button data-flash-trigger onclick={() => btn?.flash(60)}>flash now</button>

<output data-presses={presses}>{presses}</output>
<output data-anchor-presses={anchorPresses}>{anchorPresses}</output>
