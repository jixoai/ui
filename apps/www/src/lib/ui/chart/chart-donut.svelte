<!--
  jixoai chart donut (registry/files/ui/chart/chart-donut.svelte,
  OpenSpec 2026-08-30-add-chart-family).

  The SVG ring: one circle per segment, painted by stroke-dasharray
  (dash = share × circumference, one dash per circle; offset = the
  accumulated lengths before it; the -90° group rotation pins segment
  0 at 12 o'clock) over a full muted track. Segment colors ride the
  theme's --chart-1..5 semantic palette, then a deterministic neutral
  oklch ladder derived from var(--brand-hue) (hue injection stays the
  consumer's job — restyle through the hooks/classes; the palette is
  the component's frozen default).

  The center is a SNIPPET SLOT (the total, a delta, a label — the
  consumer's composition, absolutely positioned over the ring).

  Frozen degenerates: negative and non-finite values are 0-share
  segments (a donut is composition shares — it never invents
  magnitude); a zero total (empty, all-bad, all-non-positive) renders
  the BARE TRACK; shares always sum to the circumference exactly.

  A11y: role="img" + REQUIRED `label`; `table` opts into the
  visually-hidden data table fallback (a REAL sibling table with each
  segment's value and share).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import { donutGeometry } from './chart.svelte';
  import './chart.css';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** the segment values (composition shares of the total) */
    data: readonly number[];
    /** REQUIRED accessible name (role="img"); no default by contract */
    label: string;
    /** the ring's outer size in px */
    size?: number;
    /** the stroke thickness in px */
    thickness?: number;
    /** the center slot — the total, a delta, your composition */
    children?: Snippet;
    /** opt-in visually-hidden data table fallback */
    table?: boolean;
    density?: Density;
    class?: string;
  }

  let {
    data,
    label,
    size = 96,
    thickness = 12,
    children,
    table = false,
    density,
    class: className = '',
    ...rest
  }: Props = $props();

  const resolvedDensity = $derived(resolveDensity(density, getDensityContext()));
  const geo = $derived(donutGeometry(data, size, thickness));
</script>

<div
  {...rest}
  role="img"
  aria-label={label}
  data-jx-chart-donut=""
  data-density={resolvedDensity}
  class={cn('grid', className)}
>
  <svg viewBox="0 0 {size} {size}" width={size} height={size} fill="none" aria-hidden="true" class="[grid-area:1/1]">
    <g transform="rotate(-90 {size / 2} {size / 2})">
      <circle
        class="jx-chart-track"
        cx={size / 2}
        cy={size / 2}
        r={geo?.radius ?? (size - thickness) / 2}
        stroke-width={thickness}
      />
      {#if geo}
        {#each geo.segments as seg (seg.index)}
          <circle
            class="jx-chart-seg"
            cx={size / 2}
            cy={size / 2}
            r={geo.radius}
            stroke-width={thickness}
            stroke-dasharray={seg.dash}
            stroke-dashoffset={seg.offset}
            data-seg={seg.index}
            style={`--jx-chart-seg-color: ${seg.color}`}
          />
        {/each}
      {/if}
    </g>
  </svg>
  {#if children}
    <!-- the center slot is a grid item of the SAME cell (CR-2, 2026-09-02): grid stacking, not absolute overlay -->
    <div data-jx-chart-donut-center="" class="[grid-area:1/1] grid place-items-center">
      {@render children()}
    </div>
  {/if}
</div>

{#if table}
  <table class="jx-chart-table" data-jx-chart-donut-table="">
    <caption>{label}</caption>
    <thead>
      <tr><th scope="col">segment</th><th scope="col">value</th><th scope="col">share</th></tr>
    </thead>
    <tbody>
      {#if geo}
        {#each geo.segments as seg (seg.index)}
          <tr>
            <th scope="row">{seg.index}</th>
            <td>{seg.value > 0 ? seg.value : '—'}</td>
            <td>{Math.round(seg.share * 100)}%</td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
{/if}
