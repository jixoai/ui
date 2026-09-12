<!--
  PlayTiming — the standard auto/custom timing pair (spin review
  round 4, 2026-09-12): a PlaySegmented auto|custom switch gating a
  PlayNumber. The bound value stays number | 'auto' end to end —
  'auto' is whatever the consuming component resolves it to (the spin
  catalog's hand-tuned pairs); flipping to custom seeds the number
  from `fallback` (the caller's effective value) so the control never
  starts from a meaningless 0.

  The two effects converge one-way (the PlayNumber lesson): internals
  (mode/custom) push TO value; external value changes resync the
  internals. Own pushes agree with the incoming value and never
  bounce — external resets land, user edits land.
-->
<script lang="ts">
  import PlayNumber from './play-number.svelte';
  import PlaySegmented from './play-segmented.svelte';

  let {
    value = $bindable<'auto' | number>('auto'),
    fallback = 120,
    min = 0,
    max = 3000,
    step = 10,
  }: {
    value?: 'auto' | number;
    fallback?: number;
    min?: number;
    max?: number;
    step?: number;
  } = $props();

  const MODES = [
    { value: 'auto' as const, label: 'auto' },
    { value: 'custom' as const, label: 'custom' },
  ];

  let mode = $state<'auto' | 'custom'>(typeof value === 'number' ? 'custom' : 'auto');
  let custom = $state(typeof value === 'number' ? value : fallback);

  // internals → value (user actions: the segmented click, the number)
  $effect(() => {
    value = mode === 'auto' ? 'auto' : custom;
  });
  // value → internals (external resets: catalog re-anchor, canvas reset)
  $effect(() => {
    if (value === 'auto' || value === undefined) mode = 'auto';
    else {
      mode = 'custom';
      custom = value;
    }
  });
</script>

<div class="flex items-center gap-2">
  <PlaySegmented bind:value={mode} options={MODES} />
  {#if mode === 'custom'}
    <PlayNumber bind:value={custom} {min} {max} {step} />
  {/if}
</div>
