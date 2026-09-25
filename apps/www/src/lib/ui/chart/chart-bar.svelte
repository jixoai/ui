<!--
  jixoai chart bar (registry/files/ui/chart/chart-bar.svelte, OpenSpec
  2026-08-30-add-chart-family).

  Horizontal bars on the text grid: Unicode block fill, value-
  proportional — floor(value/max × cells) full blocks plus one
  left-eighth partial tail (chart.svelte's barRun). The whole chart
  is ONE shared three-column grid (label lane · run · value lane) —
  every run starts at the same x by construction, and the glyph
  budget re-bins to the track's measured capacity (self-adaptive,
  never scrollable; see the re-bin block below). The mono lock lives
  in chart.css (.jx-chart-glyphs).

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
  import { cn } from '$lib/utils';
  import {
    densityRungOf,
    provideQueryAnchor,
    provideUniversalLanes,
    stampCarriersForLanes,
    type ColorLane,
    type DensityLane,
    type ElevationLane,
    type MotionLane,
    type QueryResult,
    type RadiusLane,
    type ShapeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import { chartStyles } from './chart.stylex';
  import { ChartDefaults } from './chart-defaults.svelte';
  import { barRun, seriesBounds, type ChartVariant } from './chart.svelte';
  import './chart.css';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
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
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
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
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style = '',
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.4 + W3-D1): variant rides a literal slot (own 'fill'),
  // the seven non-size universal axes resolve one record — the
  // contract's `size` key is the donut diameter literal, and the bar
  // carries no size opinion of its own (the size axis forwards
  // ambient through the supply below)
  const d = $derived(
    ChartDefaults.resolve({ variant, density, shape, radius, color, theme, elevation, motion }),
  );
  // the icon law (donut's guard, the 96px-explosion fix): the defaults'
  // open size slot (own 96 = the DONUT's outer diameter) backfills d.size
  // for every part — stamping it here put --jx-size-effective: 96px /
  // font-size 96px on bar/sparkline/line roots (7.38× magnified glyphs,
  // scrolling runs; introduced 3e8c38ec, diagnosed 2026-09-24). Only an
  // explicit number may stamp; these parts carry no size prop at all.
  const carriers = $derived(stampCarriersForLanes({ ...d, size: undefined }));
  provideUniversalLanes({ density, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived([carriers, style].filter(Boolean).join('; ') || undefined);
  const max = $derived(seriesBounds(data)?.max ?? 0);
  // the adaptive re-bin (Owner ruling 2026-09-24: charts are
  // self-adaptive, never scrollable — and 2026-09-25: adaptation is
  // RE-BINNING, never font-scaling): the run's font stays on the
  // density rung; the glyph budget re-bins from pure geometry — the
  // width the CEILING art wants (label lane + value lane + gaps +
  // ceiling × advance) against the space the CONTAINER offers (the
  // first real ancestor box, clamped by the root's own max-width).
  // When that space can hold the ceiling — a shrink-to-fit box
  // FOLLOWS the art, so it always can; a wide grid cell can too —
  // the full resolution stays; when it is tighter (max-width cap,
  // narrow viewport) the budget drops to the real capacity. Reading
  // only container-determined geometry — never the current run's
  // rendered width, never the shrink-to-fit root's own clientWidth —
  // is what makes this bidirectional and ratchet-proof: measured-
  // content feedback loops were tried first and spiraled (the
  // shrink-to-fit demos collapsed toward the 4-glyph floor one rebin
  // at a time — a fallback-font advance at mount was enough to start
  // it — and could never grow back). The advance comes from canvas
  // measureText (grid tracks do NOT shrink under a tight box — the
  // whole grid just overflows — so a rendered-run measure could
  // never see the constraint). A CSS font-size fit predates all this
  // and was rolled back too: hairline ink at wide budgets, ZERO px
  // in the flex demos (inline-size-contained rows contributed no
  // intrinsic width). The 4-glyph floor keeps a degenerate track
  // from erasing the art entirely (clip catches the residue).
  let effCells = $state(cells);
  const run = $derived((v: number) => barRun(v, max, effCells));
  $effect(() => {
    const root = uniRoot;
    const ceiling = cells;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const rebin = () => {
      // used track sizes: "label-lane run-track value-lane" (the
      // label/value lanes are content-determined, not run-dependent)
      const tracks = getComputedStyle(root).gridTemplateColumns.split(' ').map(parseFloat);
      if (tracks.length < 3 || !Number.isFinite(tracks[0]) || !Number.isFinite(tracks[2])) return;
      const gap = parseFloat(getComputedStyle(root).columnGap) || 0;
      const flank = tracks[0] + tracks[2] + 2 * gap;
      // the AVAILABLE box is the container's, never the root's own:
      // a shrink-to-fit root (center-stage flex) FOLLOWS the current
      // content, so sizing against root.clientWidth ratchets — one
      // fallback-font measure at mount locked the a11y demo two
      // glyphs under its ceiling. Walk to the first ancestor with a
      // real box (display:contents rows have none), then clamp by
      // the root's own max-width when present.
      let host: HTMLElement | null = root.parentElement;
      let avail = 0;
      while (host && !(avail = host.clientWidth)) host = host.parentElement;
      if (!avail) return;
      // clamp by the root's own max-width ONLY in absolute px (the
      // a11y demo's 28rem cap): a PERCENTAGE resolves against the
      // walked parent already — parseFloat("100%") = 100px once
      // collapsed the table-fallback chart to a 5-glyph stub
      const maxWRaw = getComputedStyle(root).maxWidth;
      if (maxWRaw.endsWith('px')) {
        const maxW = parseFloat(maxWRaw);
        if (maxW > 0) avail = Math.min(avail, maxW);
      }
      const ink = root.querySelector<HTMLElement>('[data-jx-chart-bar-run]');
      if (!ink || !ink.textContent) return;
      const cs = getComputedStyle(ink);
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) return;
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const advance = ctx.measureText('█').width;
      if (!(advance > 0)) return;
      const next =
        flank + ceiling * advance <= avail
          ? ceiling
          : Math.min(ceiling, Math.max(4, Math.floor((avail - flank) / advance)));
      if (next !== effCells) effCells = next;
    };
    rebin();
    const ro = new ResizeObserver(rebin);
    ro.observe(root);
    document.fonts?.ready.then(rebin).catch(() => {});
    return () => ro.disconnect();
  });

  // the payload's own join (separator's serialize law): objects in
  // dev, joined strings in payloads — never a raw interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // the variant ladder's ink — atom groups at module scope (the
  // dynamic-producer law: data-built STRINGS must resolve to
  // registered identities; the map walks cx() over static members)
  const INK_CLASS: Record<ChartVariant, string> = {
    fill: cx(chartStyles.inkFill),
    tonal: cx(chartStyles.inkTonal),
    outline: cx(chartStyles.inkOutline),
  };
</script>

<div
  {...rest}
  bind:this={uniRoot}
  role="img"
  aria-label={label}
  data-jx-chart-bar={d.variant}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={cn(cx(chartStyles.barRoot), className)}
>
  {#each data as v, i (i)}
    <div data-jx-chart-bar-row="" class={cx(chartStyles.barRow)}>
      <span data-jx-chart-bar-label="" class={cx(chartStyles.barLabel)}>{labels?.[i] ?? ''}</span>
      <span data-jx-chart-bar-run="" class="jx-chart-glyphs {INK_CLASS[d.variant]}">{run(v)}</span>
      {#if values}
        <span data-jx-chart-bar-value="" class={cx(chartStyles.barValue)}>{Number.isFinite(v) ? v : '—'}</span>
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
