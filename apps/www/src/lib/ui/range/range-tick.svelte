<!--
  jixoai range-tick (registry/files/ui/range/range-tick.svelte; the
  ruler componentization ruling, 2026-09-02).

  One SCALE of the range's tick ruler, composed declaratively inside
  the parent's `ticks` snippet — the parent (range.svelte) owns the
  ruler surface and every event on it (pointerdown snap + wheel);
  RangeTick only draws:

    <Range bind:value={v} min={0} max={100} step={1}>
      {#snippet ticks()}
        <RangeTick scale={1} />  <- one mark per step (short)
        <RangeTick scale={5} />  <- one mark per 5 steps (medium)
        <RangeTick scale={10} /> <- one mark per 10 steps (long)
      {/snippet}
    </Range>

  The parent registers the scales through context and ranks them BY
  VALUE (order-independent): the default length grades ascending
  (n=1 → 100%, n=3 → 33%/67%/100%) — the ruler metaphor, minor ticks
  short, major ticks long. Consumers restyle a strip freely through
  `class` (tailwind utilities outrank the component face) and arbitrary
  variants on `data-jx-tick-scale`.
-->
<script module lang="ts">
  /** the parent-owned registration channel (provided by range.svelte) */
  export const RANGE_TICK_CONTEXT = Symbol('jixoai-range-tick');

  export interface RangeTickContext {
    /** register this strip's scale; returns the unregister */
    register: (scale: number) => () => void;
    /** the live sorted-unique scale list (order-independent ranking) */
    scales: () => number[];
    /** percent of the travel axis per input-step (mark period = pct × scale) */
    stepPct: () => number;
  }
</script>

<script lang="ts">
  import { getContext, hasContext } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** draw one mark every `scale` input-steps (positive finite; invalid falls back to 1) */
    scale?: number;
    /** mark length override — number = % of the ruler axis, string = raw css length */
    length?: number | string;
    class?: string;
  }

  let { scale = 1, length, class: className, ...rest }: Props = $props();

  const guardedScale = $derived(Number.isFinite(scale) && scale > 0 ? scale : 1);

  // standalone usage renders nothing — the strip only exists on a range
  const ctx = hasContext(RANGE_TICK_CONTEXT)
    ? getContext<RangeTickContext>(RANGE_TICK_CONTEXT)
    : null;

  $effect(() => ctx?.register(guardedScale));

  // the mark period is the snap geometry × the scale (E-3's law, layered)
  const markPct = $derived(ctx ? ctx.stepPct() * guardedScale : 100);
  const markLen = $derived.by(() => {
    if (length != null) return typeof length === 'number' ? `${length}%` : length;
    if (!ctx) return '100%';
    const scales = ctx.scales();
    const rank = scales.indexOf(guardedScale);
    const n = Math.max(1, scales.length);
    const graded = (((rank === -1 ? scales.length : rank) + 1) / n) * 100;
    return `${Math.round(graded * 100) / 100}%`;
  });
</script>

{#if ctx}
  <div
    data-jx-tick-scale={guardedScale}
    class={cn('jx-range-tick', className)}
    style="--jx-tick-step: {markPct}%; --jx-tick-len: {markLen}"
    {...rest}
  ></div>
{/if}
