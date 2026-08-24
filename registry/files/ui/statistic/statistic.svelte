<!--
  jixoai statistic (registry/files/ui/statistic.svelte).
  The metric readout: a micro-label (font-nav) over a big tabular-num
  value, with optional prefix/suffix snippets and a text-glyph trend
  (▲/▼ — no icon dependency). tone carries the trend's voice through
  the shared law: up=primary (brand emphasis), down=destructive;
  invert with tone="down-good" semantics by passing your own snippets
  — the component never guesses what "good" means for YOUR metric.

  tw4 (2026-08-24): pure token utilities, zero css residue — the trend
  voice maps to color utilities per prop; `jx-stat*` classes are
  semantic hooks, css defines them not.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

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

  const trendColor = { up: 'text-primary', down: 'text-destructive' } as const;
</script>

<div class={cn('jx-stat flex flex-col gap-1', className)}>
  <p class="jx-stat-title font-nav text-[0.6875rem] tracking-[0.14em] uppercase text-muted-foreground">{title}</p>
  <p class="jx-stat-value flex items-baseline gap-1.5 text-foreground">
    {#if prefix}<span class="jx-stat-affix text-[0.8125rem] text-muted-foreground">{@render prefix()}</span>{/if}
    <span class="jx-stat-num font-mono text-[1.75rem] leading-[1.1] tabular-nums tracking-[-0.02em]">{value}</span>
    {#if trend}
      <span
        class={cn(`jx-stat-trend jx-stat-trend-${trend} text-xs`, trendColor[trend])}
        aria-label="trend {trend}"
      >
        {trend === 'up' ? '▲' : '▼'}
      </span>
    {/if}
    {#if suffix}<span class="jx-stat-affix text-[0.8125rem] text-muted-foreground">{@render suffix()}</span>{/if}
  </p>
</div>
