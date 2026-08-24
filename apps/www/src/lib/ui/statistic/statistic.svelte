<!--
  jixoai statistic (registry/files/ui/statistic.svelte).
  The metric readout: a micro-label (font-nav) over a big tabular-num
  value, with optional prefix/suffix snippets and a text-glyph trend
  (▲/▼ — no icon dependency). tone carries the trend's voice through
  the shared law: up=primary (brand emphasis), down=destructive;
  invert with tone="down-good" semantics by passing your own snippets
  — the component never guesses what "good" means for YOUR metric.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** the metric's name — the micro-label above the value */
    title: string;
    /** the number itself; formatting is yours (Intl.NumberFormat) */
    value: string | number;
    prefix?: Snippet;
    suffix?: Snippet;
    /** 'up' renders ▲ primary · 'down' renders ▼ destructive */
    trend?: 'up' | 'down';
    class?: string;
  }

  let { title, value, prefix, suffix, trend, class: className = '' }: Props = $props();
</script>

<div class="jx-stat {className}">
  <p class="jx-stat-title">{title}</p>
  <p class="jx-stat-value">
    {#if prefix}<span class="jx-stat-affix">{@render prefix()}</span>{/if}
    <span class="jx-stat-num">{value}</span>
    {#if trend}
      <span class="jx-stat-trend jx-stat-trend-{trend}" aria-label="trend {trend}">
        {trend === 'up' ? '▲' : '▼'}
      </span>
    {/if}
    {#if suffix}<span class="jx-stat-affix">{@render suffix()}</span>{/if}
  </p>
</div>

<style>
  .jx-stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .jx-stat-title {
    margin: 0;
    font-family: var(--font-nav);
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }
  .jx-stat-value {
    margin: 0;
    display: flex;
    align-items: baseline;
    gap: 0.375rem;
    color: var(--foreground);
  }
  .jx-stat-num {
    font-family: var(--font-mono);
    font-size: 1.75rem;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }
  .jx-stat-affix {
    font-size: 0.8125rem;
    color: var(--muted-foreground);
  }
  .jx-stat-trend {
    font-size: 0.75rem;
  }
  .jx-stat-trend-up {
    color: var(--primary);
  }
  .jx-stat-trend-down {
    color: var(--destructive);
  }
</style>
