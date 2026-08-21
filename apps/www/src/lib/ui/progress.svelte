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
-->
<script lang="ts">
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

  const pct = $derived(value === undefined || max <= 0 ? null : Math.min(100, (value / max) * 100));
</script>

<div class="jx-progress {className}">
  {#if label || pct !== null}
    <div class="jx-progress-head">
      {#if label}<span class="jx-progress-label">{label}</span>{/if}
      {#if pct !== null}
        <span class="jx-progress-value" role="status">{Math.round(pct)}%</span>
      {/if}
    </div>
  {/if}
  <progress class="jx-progress-bar" class:jx-indeterminate={value === undefined} {value} {max}>
    {#if pct !== null}{Math.round(pct)}%{/if}
  </progress>
</div>

<style>
  .jx-progress {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
  .jx-progress-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
  }
  .jx-progress-label {
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }
  .jx-progress-value {
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    color: var(--foreground);
  }

  /* the bar: 1px frame on the muted track, brand fill — the native
     ::-webkit-progress-* / ::-moz-progress pseudo-elements are reset so
     both engines paint identically */
  .jx-progress-bar {
    appearance: none;
    display: block;
    width: 100%;
    height: 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--muted);
    overflow: hidden;
  }
  .jx-progress-bar::-webkit-progress-inner {
    display: none;
  }
  .jx-progress-bar::-webkit-progress-bar {
    background: transparent;
  }
  .jx-progress-bar::-webkit-progress-value {
    background: var(--primary);
    transition: width 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .jx-progress-bar::-moz-progress-bar {
    background: var(--primary);
    transition: width 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* indeterminate: the engine animations differ — one authored stripe
     sweep paints the same story on both */
  .jx-indeterminate.jx-progress-bar::-webkit-progress-value {
    background: transparent;
  }
  .jx-indeterminate.jx-progress-bar::-moz-progress-bar {
    background: transparent;
  }
  .jx-indeterminate.jx-progress-bar {
    position: relative;
    background:
      repeating-linear-gradient(
          -55deg,
          var(--primary) 0 6px,
          transparent 6px 12px
        )
        0 0 / 24px 100%;
    animation: jx-progress-run 900ms linear infinite;
  }
  @keyframes jx-progress-run {
    to {
      background-position: 24px 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-progress-bar::-webkit-progress-value,
    .jx-progress-bar::-moz-progress-bar {
      transition: none;
    }
    .jx-indeterminate.jx-progress-bar {
      animation-duration: 4s;
    }
  }
</style>
