<!--
  jixoai chart sparkline (registry/files/ui/chart/chart-sparkline.svelte,
  OpenSpec 2026-08-30-add-chart-family).

  The one-line inline trend for stat rows: no axes, honest min/max
  endpoints (the finite bounds map to the glyph range's extremes — no
  padded lie). Two cell systems (the valued data-jx-chart-sparkline
  hook):

    block   one eighth-block glyph per point (U+2581..2588), 8 levels
    braille points packed two per braille cell (U+2800 matrix), each
            finite point a single dot at its 4-level height

  A single inline <span> — composes inside a sentence, a Statistic
  suffix, a list row. Frozen degenerates: non-finite points keep
  their x position with NO geometry (a blank block cell / a dotless
  braille column); empty or all-non-finite data renders the empty
  span; a constant series renders the midline (block ▅, braille the
  level-1 dot pair).

  A11y: role="img" + REQUIRED `label`; `table` opts into the
  visually-hidden data table fallback (a REAL sibling table).
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Density } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import { ChartDefaults } from './chart-defaults.svelte';
  import { sparkBlocks, sparkBraille } from './chart.svelte';
  import './chart.css';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    /** the series (a value-domain payload) */
    data: readonly number[];
    /** REQUIRED accessible name (role="img"); no default by contract */
    label: string;
    /** the cell system: block (8 levels/point) | braille (2 points/cell) */
    cells?: 'block' | 'braille';
    /** opt-in visually-hidden data table fallback */
    table?: boolean;
    density?: Density;
    class?: string;
  }

  let {
    data,
    label,
    cells = 'braille',
    table = false,
    density,
    class: className = '',
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.4): density rides the no-opinion axis slot (the
  // ensemble provides, the glyph stamps)
  const d = $derived(ChartDefaults.resolve({ density }));
  const glyphs = $derived(cells === 'block' ? sparkBlocks(data) : sparkBraille(data));
</script>

<span
  {...rest}
  role="img"
  aria-label={label}
  data-jx-chart-sparkline={cells}
  data-density={d.density}
  class={cn('jx-chart-glyphs inline-block align-baseline text-primary', className)}
>{glyphs}</span>

{#if table}
  <table class="jx-chart-table" data-jx-chart-sparkline-table="">
    <caption>{label}</caption>
    <thead>
      <tr><th scope="col">point</th><th scope="col">value</th></tr>
    </thead>
    <tbody>
      {#each data as v, i (i)}
        <tr>
          <th scope="row">{i}</th>
          <td>{Number.isFinite(v) ? v : '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
