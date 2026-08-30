<!--
  jixoai chart line (registry/files/ui/chart/chart-line.svelte,
  OpenSpec 2026-08-30-add-chart-family).

  The SVG trend on the jx token surface: ONE polyline over three
  hairline grid rules (top/mid/bottom, var(--border), non-scaling —
  grid GEOMETRY, never guessed axes: no ticks, no labels, no
  generated domains). The brand stroke rides --chart-1 (the theme's
  own chart palette); the optional area fill is the 12% tonal under-
  curve wash; markers are round linecap dots via the doubled-point
  polyline trick (stroke-width CAN be non-scaling, <circle r> cannot
  — dots never stretch under the viewBox scale).

  Axes are AUTHORED SLOTS, never guessed: xAxis / yAxis snippets
  render inside the svg (draw your own rules and labels — the
  component supplies no domain it did not read from your data).

  Sizing: a fixed 5:2 viewBox (100×40) + width 100% + height auto —
  the aspect holds, dots stay round, and the consumer constrains
  geometry with utilities (the layer law).

  Frozen degenerates: non-finite points are SKIPPED (x positions of
  the survivors stay honest); empty / all-non-finite data renders the
  grid shell alone; a single point renders its marker centered; a
  constant series is the honest horizontal midline; the area wash
  needs at least two finite points (a one-point area is nothing).

  A11y: role="img" + REQUIRED `label`; `table` opts into the
  visually-hidden data table fallback (a REAL sibling table).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import { linePoints, markerPoints } from './chart.svelte';
  import './chart.css';

  interface Props extends SVGAttributes<SVGSVGElement> {
    /** the series (a value-domain payload) */
    data: readonly number[];
    /** REQUIRED accessible name (role="img"); no default by contract */
    label: string;
    /** the 12% tonal wash under the curve */
    area?: boolean;
    /** round dot markers at every finite point */
    markers?: boolean;
    /** authored axis slots — the consumer's own rules/labels, rendered
     *  inside the svg AFTER the data (axes never guessed) */
    xAxis?: Snippet;
    yAxis?: Snippet;
    /** opt-in visually-hidden data table fallback */
    table?: boolean;
    density?: Density;
    class?: string;
  }

  let {
    data,
    label,
    area = false,
    markers = true,
    xAxis,
    yAxis,
    table = false,
    density,
    class: className = '',
    ...rest
  }: Props = $props();

  const resolvedDensity = $derived(resolveDensity(density, getDensityContext()));

  // viewBox constants — the 5:2 frame; y band [1, 39] (the documented
  // 1-unit marker-radius inset; the DATA range maps the full band)
  const W = 100;
  const H = 40;

  const points = $derived(linePoints(data, W, H, 1));
  const dots = $derived(markerPoints(points));

  // the area wash: the line's points closed along the inset baseline
  // (first x = 0, last x = W for any multi-point series — linePoints's
  // own index mapping)
  const areaPoints = $derived.by(() => {
    if (!area || !points) return '';
    if (points.split(' ').length < 2) return '';
    return `${points} ${W},${H - 1} 0,${H - 1}`;
  });
</script>

<svg
  {...rest}
  role="img"
  aria-label={label}
  data-jx-chart-line=""
  data-density={resolvedDensity}
  viewBox="0 0 {W} {H}"
  fill="none"
  class={cn('h-auto w-full max-w-full', className)}
>
  <!-- the hairline grid: geometry, never axes -->
  <line class="jx-chart-grid" x1="0" y1="1" x2="{W}" y2="1" vector-effect="non-scaling-stroke" stroke-width="1" />
  <line class="jx-chart-grid" x1="0" y1="{H / 2}" x2="{W}" y2="{H / 2}" vector-effect="non-scaling-stroke" stroke-width="1" />
  <line class="jx-chart-grid" x1="0" y1="{H - 1}" x2="{W}" y2="{H - 1}" vector-effect="non-scaling-stroke" stroke-width="1" />
  {#if areaPoints}
    <polygon class="jx-chart-area" points={areaPoints} />
  {/if}
  {#if points}
    <polyline
      class="jx-chart-path"
      points={points}
      vector-effect="non-scaling-stroke"
      stroke-width="1.5"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  {/if}
  {#if markers && dots}
    <polyline
      class="jx-chart-mark"
      points={dots}
      vector-effect="non-scaling-stroke"
      stroke-width="3"
      stroke-linecap="round"
    />
  {/if}
  {#if yAxis}
    <g data-jx-chart-line-axis="y">{@render yAxis()}</g>
  {/if}
  {#if xAxis}
    <g data-jx-chart-line-axis="x">{@render xAxis()}</g>
  {/if}
</svg>

{#if table}
  <table class="jx-chart-table" data-jx-chart-line-table="">
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
