<!--
  scroll-run host fixture (round 2): a hand-rolled consumer of the RAW
  contract — the one-cell grid host, the run with its two data hooks,
  and the shared ScrollChrome. jsdom has no layout (scrollWidth is 0),
  so the machine's verdict is always 'none' here — exactly the
  insufficient-content law under test. custom=true mounts the chip
  content snippets (real {#snippet} blocks — plain functions are not
  renderable snippets).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import ScrollChrome from '../../src/lib/ui/scroll-run/scroll-chrome.svelte';
  import { createScrollStamp, type ScrollEffect } from '../../src/lib/ui/scroll-run/scroll-run.svelte';

  let {
    axis = 'horizontal',
    scrollEffect,
    custom = false,
    disabled = false,
  }: {
    axis?: 'horizontal' | 'vertical';
    scrollEffect: ScrollEffect;
    custom?: boolean;
    disabled?: boolean;
  } = $props();

  let hostEl = $state<HTMLDivElement>();
  let runEl = $state<HTMLDivElement>();

  $effect(() => {
    const run = runEl;
    if (!run) return;
    const stamp = createScrollStamp({
      run,
      host: hostEl,
      members: () => [...run.children].filter((c): c is HTMLElement => c instanceof HTMLElement),
      ramps: scrollEffect.type === 'ramp',
    });
    return () => stamp.destroy();
  });
</script>

<div
  bind:this={hostEl}
  class="jx-scroll-host grid [grid-template-columns:minmax(0,1fr)]"
  data-testid="host"
>
  <div
    bind:this={runEl}
    data-jx-scroll-run=""
    data-axis={axis}
    data-testid="run"
    class="flex gap-2"
  >
    <span data-testid="member">lane-01</span>
    <span data-testid="member">lane-02</span>
  </div>
  {#if custom}
    <ScrollChrome
      {scrollEffect}
      run={runEl}
      backwardLabel="Scroll back"
      forwardLabel="Scroll on"
      backwardDisabled={disabled}
      forwardDisabled={disabled}
    >
      {#snippet backwardContent()}<b data-glyph="back">«prev</b>{/snippet}
      {#snippet forwardContent()}<b data-glyph="fwd">next»</b>{/snippet}
    </ScrollChrome>
  {:else}
    <ScrollChrome
      {scrollEffect}
      run={runEl}
      backwardLabel="Scroll back"
      forwardLabel="Scroll on"
      backwardDisabled={disabled}
      forwardDisabled={disabled}
    />
  {/if}
</div>
