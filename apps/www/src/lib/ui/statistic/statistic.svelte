<!--
  jixoai statistic (registry/files/ui/statistic/statistic.svelte).
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
  import type { Density } from '$lib/density.svelte';
  import { StatisticDefaults } from './statistic-defaults.svelte';

  interface Props {
    density?: Density;
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

  let { density, title, value, prefix, suffix, trend, class: className = '' }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 3.4): density rides the no-opinion axis slot — explicit ??
  // ambient scope, else unstamped
  const d = $derived(StatisticDefaults.resolve({ density }));

  const trendColor = { up: 'text-primary', down: 'text-destructive' } as const;
</script>

<div data-jx-stat="" data-density={d.density} class={cn('flex flex-col [gap:var(--jx-stack)]', className)}>
  <p data-jx-stat-title="" class="font-nav [font-size:var(--jx-text-secondary)] [line-height:var(--jx-line-secondary)] tracking-[0.14em] uppercase text-muted-foreground">{title}</p>
  <p data-jx-stat-value="" class="flex items-baseline [gap:var(--jx-gap)] text-foreground">
    {#if prefix}<span data-jx-stat-affix="" class="[font-size:var(--jx-text)] text-muted-foreground">{@render prefix()}</span>{/if}
    <span data-jx-stat-num="" class="font-mono [font-size:calc(var(--jx-line)*1.5)] [line-height:var(--jx-line)] tabular-nums tracking-[-0.02em]">{value}</span>
    {#if trend}
      <span
        data-jx-stat-trend={trend}
        class={cn('[font-size:var(--jx-text)]', trendColor[trend])}
        aria-label="trend {trend}"
      >
        {trend === 'up' ? '▲' : '▼'}
      </span>
    {/if}
    {#if suffix}<span data-jx-stat-affix="" class="[font-size:var(--jx-text)] text-muted-foreground">{@render suffix()}</span>{/if}
  </p>
</div>
