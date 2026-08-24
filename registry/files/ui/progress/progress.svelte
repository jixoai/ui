<!--
  jixoai progress (registry/files/ui/progress.svelte).
  W3C-first: progress IS the native <progress> element — role, value
  semantics, min/max mapping and the indeterminate state are the
  browser's. Passing no value renders the indeterminate bar natively
  (aria-valuenow omitted by the platform); max defaults to 1 so a 0..1
  fraction works without ceremony, matching how the element itself is
  specified.

  The component adds only the jixoai paint (appearance:none, 1px frame,
  brand fill, terminal stripe for the indeterminate run) and an optional
  label + live value readout — announced politely (role=status) because
  progress changes are exactly the "polite update" case; the bar itself
  stays aria-hidden-free (the native element already exposes values).

  tw4 (2026-08-24): utility-authored — the bar frame, the label/value
  readout, and the indeterminate stripe (arbitrary-value background +
  animate utility, gated on the jx-indeterminate hook) live in the
  markup; ONLY the native ::-webkit/::-moz progress pseudo resets, the
  stripe keyframes, and the reduced-motion kills stay in progress.css
  (D1-exempt residue; the kills override markup utilities, so they
  ride the unlayered :where carve-out).
-->
<script lang="ts">
  import { cn } from '$lib/utils';
  import './progress.css';

  interface Props {
    /** 0..max; omitted ⇒ indeterminate ("activity", not "progress") */
    value?: number;
    /** default 1 (the element's own spec default) */
    max?: number;
    /** visible label above the bar */
    label?: string;
    class?: string;
  }

  let { value, max = 1, label, class: className = '' }: Props = $props();

  const pct = $derived(
    value === undefined || max <= 0 ? null : Math.min(100, Math.max(0, (value / max) * 100)),
  );
</script>

<div data-jx-progress="" class={cn('flex flex-col gap-1.5', className)}>
  {#if label || pct !== null}
    <div data-jx-progress-head="" class="flex items-baseline justify-between gap-3">
      {#if label}<span data-jx-progress-label="" class="font-nav text-xs tracking-[0.1em] uppercase text-muted-foreground">{label}</span>{/if}
      {#if pct !== null}
        <span data-jx-progress-value="" class="text-xs tabular-nums text-foreground" role="status">{Math.round(pct)}%</span>
      {/if}
    </div>
  {/if}
  <progress
    class={cn(
      'jx-progress-bar appearance-none block w-full h-2.5 border border-border rounded bg-muted overflow-hidden',
      value === undefined &&
        'jx-indeterminate relative bg-transparent bg-[repeating-linear-gradient(-55deg,var(--primary)_0_6px,transparent_6px_12px)] bg-[length:24px_100%] animate-[jx-progress-run_900ms_linear_infinite]',
    )}
    aria-label={label ?? 'progress'}
    {value}
    {max}
  >
    {#if pct !== null}{Math.round(pct)}%{/if}
  </progress>
</div>
