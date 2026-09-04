<!--
  jixoai chart bar (registry/files/ui/chart/chart-bar.svelte, OpenSpec
  2026-08-30-add-chart-family).

  Horizontal bars on the text grid: Unicode block fill, value-
  proportional — floor(value/max × cells) full blocks plus one
  left-eighth partial tail (chart.svelte's barRun). One row per datum:
  a label lane (inline-start), the glyph run, a value lane
  (inline-end). The mono lock lives in chart.css (.jx-chart-glyphs).

  Data honesty (frozen semantics, unit-tested): non-finite and
  non-positive values render an EMPTY run — the glyph lane refuses to
  lie; the value lane keeps showing the number (non-finite as the em
  dash). The scale is the max of the finite values; an all-non-positive
  series renders empty runs (max must be > 0).

  Variant grammar: fill | tonal | outline — the run's INK through the
  four global hue slots (valued data-jx-chart-bar hook), so intensity
  composes with hue injection like every other painted surface:
  variant = how, jx-hue-* = which voice.

  A11y: role="img" + REQUIRED `label` (aria-label; the type contract
  has no default). `table` opts into the visually-hidden data table
  fallback (a REAL sibling table — role="img" makes this subtree
  presentational, so the mirror lives outside it).
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Density } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import { ChartDefaults } from './chart-defaults.svelte';
  import { barRun, seriesBounds, type ChartVariant } from './chart.svelte';
  import './chart.css';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** the series — one row per datum (a value-domain payload, the
     *  chart family's whole contract) */
    data: readonly number[];
    /** REQUIRED accessible name (role="img"); no default by contract */
    label: string;
    /** parallel label lane (zipped by index; absent → empty lane) */
    labels?: readonly (string | number)[];
    /** the ink's prominence rung through the global hue slots */
    variant?: ChartVariant;
    /** the bar-length budget in character cells */
    cells?: number;
    /** the inline-end value lane (raw numbers — formatting is yours) */
    values?: boolean;
    /** opt-in visually-hidden data table fallback */
    table?: boolean;
    density?: Density;
    class?: string;
  }

  let {
    data,
    label,
    labels,
    variant,
    cells = 20,
    values = true,
    table = false,
    density,
    class: className = '',
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.4): variant rides a literal slot (own 'fill'), density
  // the no-opinion axis slot (the ensemble provides, the glyph stamps)
  const d = $derived(ChartDefaults.resolve({ variant, density }));
  const max = $derived(seriesBounds(data)?.max ?? 0);
  const run = $derived((v: number) => barRun(v, max, cells));

  const ink = {
    fill: 'text-[color:var(--jx-fill)]',
    tonal: 'text-[color:color-mix(in_oklab,var(--jx-tonal)_70%,transparent)]',
    outline: 'text-[color:var(--jx-outline)]',
  } as const;
</script>

<div
  {...rest}
  role="img"
  aria-label={label}
  data-jx-chart-bar={d.variant}
  data-density={d.density}
  class={cn(
    'inline-flex flex-col [gap:var(--jx-gap)] [font-size:var(--jx-text)] tabular-nums',
    className,
  )}
>
  {#each data as v, i (i)}
    <div data-jx-chart-bar-row="" class="grid grid-cols-[auto_1fr_auto] items-baseline [gap:var(--jx-gap)]">
      <span data-jx-chart-bar-label="" class="min-w-0 truncate text-muted-foreground">{labels?.[i] ?? ''}</span>
      <span data-jx-chart-bar-run="" class="jx-chart-glyphs {ink[d.variant]}">{run(v)}</span>
      {#if values}
        <span data-jx-chart-bar-value="" class="text-foreground">{Number.isFinite(v) ? v : '—'}</span>
      {/if}
    </div>
  {/each}
</div>

{#if table}
  <table class="jx-chart-table" data-jx-chart-bar-table="">
    <caption>{label}</caption>
    <thead>
      <tr><th scope="col">row</th><th scope="col">value</th></tr>
    </thead>
    <tbody>
      {#each data as v, i (i)}
        <tr>
          <th scope="row">{labels?.[i] ?? i}</th>
          <td>{Number.isFinite(v) ? v : '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
