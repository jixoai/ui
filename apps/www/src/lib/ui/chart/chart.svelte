<!--
  jixoai chart — the ROOT half + the family math (registry/files/ui/
  chart/chart.svelte, OpenSpec 2026-08-30-add-chart-family).

  The chart family is a set of DETERMINISTIC DISPLAY PRIMITIVES, not a
  chart library: every part renders static data with text glyphs and
  inline SVG — zero runtime dependencies, no Recharts, no animation
  system, no tooltips (a recorded future change owns interaction).
  The root carries NO chart state: like the tabs root, it owns only
  the family's shared policy — the density tier provided to the
  subtree — so an ensemble (a stat-card grid of sparklines, a bar list
  beside a donut) adopts ONE tier:

    <Chart density="sm">
      <ChartBar … />  <ChartDonut … />
    </Chart>

  Each part is standalone-complete (resolves its own density opinion)
  — the root is a convenience, never a requirement.

  THE GLYPH MATH lives in this file's module script and is exported
  for unit tests (no DOM, pure functions of props data). Every
  degenerate input is FROZEN, not invented (same input, same output):

    non-finite points   contribute NO geometry (no glyph, no dot, no
                        segment) and never perturb the min/max of the
                        finite points around them — x positions stay
                        honest
    empty / all-bad      each part's documented empty state (the part
                        still names itself; nothing renders)
    constant series      the horizontal midline (block ramp: ▅;
                        braille: the level-1 dot pair)
    zero/negative totals donut renders the bare track; bars render
                        empty runs with the value lane intact (the
                        NUMBER stays visible — the glyph run is the
                        only thing that refuses to lie)

  A11y contract (spec delta): every part is role="img" with a
  REQUIRED accessible name — `label` has no default, the type contract
  enforces it — plus an opt-in visually-hidden data table fallback
  (`table` prop) that mirrors the series as a REAL sibling table (a
  sibling, never a child: role="img" makes its own subtree
  presentational, so the table must live outside it).

  Motion: charts ship ZERO entrance motion — the strongest form of
  the reduced-motion law (final state painted immediately,
  structurally: no WAAPI, no animate-* utilities, nothing to kill).

  Hue: paint consumes tokens only — the theme's --chart-1..5 semantic
  palette (the D5 harmony audit's own chart ramp) plus a neutral
  oklch ladder derived from var(--brand-hue) beyond the fifth segment.
  Hue injection stays the consumer's job (the four global slots for
  the bar's variant grammar).
-->
<script module lang="ts">
  // ---------------------------------------------------------------------
  // The family math — pure, DOM-free, exported for the unit suite
  // (every rule here is FROZEN: same input, same output, every time).
  // The barrel re-exports this surface (`export * from './chart.svelte'`).
  // ---------------------------------------------------------------------

  /** the vertical eighth-block ramp (U+2581..2588), bottom-filled —
   *  the sparkline BLOCK mode's per-point glyph */
  export const BLOCK_RAMP = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'] as const;
  /** the LEFT eighth-block ramp (U+258F..2589 + U+2588), start-filled —
   *  the horizontal bar's partial tail cell (the lower-eighth glyphs
   *  fill from the BOTTOM and cannot express partial horizontal
   *  extent; the block family's left eighths can) */
  export const BAR_RAMP = ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'] as const;
  /** the full block — BAR_RAMP's last step and every full bar cell */
  export const BLOCK = '█';

  /** braille base code point (U+2800) — the blank cell */
  export const BRAILLE_BASE = 0x2800;
  /** dot bits per column, top→bottom rows: the left column is the
   *  FIRST point of a cell pair, the right the second */
  export const BRAILLE_LEFT = [0x01, 0x02, 0x04, 0x08] as const;
  export const BRAILLE_RIGHT = [0x10, 0x20, 0x40, 0x80] as const;

  /** the theme's chart palette size (--chart-1..5) */
  export const CHART_PALETTE_SIZE = 5;

  /** the neutral ladder beyond the semantic palette — oklch lightness
   *  steps at a whisper of the brand hue (token-derived; the theme
   *  sheet's own primary is authored the same way) */
  export const DONUT_NEUTRALS = [
    'oklch(0.72 0.025 var(--brand-hue))',
    'oklch(0.58 0.02 var(--brand-hue))',
    'oklch(0.44 0.015 var(--brand-hue))',
    'oklch(0.32 0.01 var(--brand-hue))',
  ] as const;

  /** the semantic palette first (the theme's own chart ramp), then the
   *  neutral ladder, cycling deterministically */
  export function donutColor(index: number): string {
    if (!Number.isInteger(index) || index < 0) return 'var(--chart-1)';
    if (index < CHART_PALETTE_SIZE) return `var(--chart-${index + 1})`;
    return DONUT_NEUTRALS[(index - CHART_PALETTE_SIZE) % DONUT_NEUTRALS.length];
  }

  /** min/max over the FINITE points only — null when none exist (the
   *  every-part empty guard; non-finite points never perturb bounds) */
  export function seriesBounds(data: readonly number[]): { min: number; max: number } | null {
    let min = Infinity;
    let max = -Infinity;
    for (const v of data) {
      if (Number.isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    return min === Infinity ? null : { min, max };
  }

  /** value → 0..1 against [min,max], clamped. FROZEN edges: a constant
   *  series (min===max) maps to 0.5 (the honest midline — no invented
   *  range); a non-finite value maps to 0 (callers that must not draw
   *  it skip the point BEFORE normalizing) */
  export function normalize(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return 0;
    if (min === max) return 0.5;
    return Math.min(1, Math.max(0, (value - min) / (max - min)));
  }

  /** value → ramp level 0..levels-1 (round-half-up on the normalized
   *  position; 8 block levels, 4 braille levels) */
  export function rampIndex(value: number, min: number, max: number, levels: number): number {
    return Math.round(normalize(value, min, max) * (levels - 1));
  }

  /** one BLOCK-mode sparkline glyph per point; non-finite points keep
   *  their x position as a blank cell (the run length always equals
   *  the data length) */
  export function sparkBlocks(data: readonly number[]): string {
    const b = seriesBounds(data);
    if (!b) return '';
    let out = '';
    for (const v of data) {
      out += Number.isFinite(v) ? BLOCK_RAMP[rampIndex(v, b.min, b.max, 8)] : ' ';
    }
    return out;
  }

  /** one braille cell from a pair of levels (0=top .. 3=bottom);
   *  `null` leaves that column dotless (a non-finite point) */
  export function brailleCell(left: number | null, right: number | null): string {
    let bits = 0;
    if (left !== null) bits |= BRAILLE_LEFT[left];
    if (right !== null) bits |= BRAILLE_RIGHT[right];
    return String.fromCharCode(BRAILLE_BASE + bits);
  }

  /** the BRAILLE-mode sparkline: points packed two per cell (left
   *  column first), each finite point a single dot at its 4-level
   *  height, non-finite points dotless, the trailing odd point riding
   *  the LEFT column in reading order */
  export function sparkBraille(data: readonly number[]): string {
    const b = seriesBounds(data);
    if (!b) return '';
    const level = (v: number): number | null =>
      Number.isFinite(v) ? 3 - rampIndex(v, b.min, b.max, 4) : null;
    let out = '';
    for (let i = 0; i < data.length; i += 2) {
      out += brailleCell(level(data[i]), i + 1 < data.length ? level(data[i + 1]) : null);
    }
    return out;
  }

  /** a horizontal bar's glyph run: value-proportional length against
   *  `cells` (the character-cell budget), full blocks + one partial
   *  left-eighth tail. FROZEN guards: non-finite / non-positive value,
   *  non-positive max or cells → the EMPTY run (the value lane keeps
   *  telling the truth); the run never exceeds `cells` */
  export function barRun(value: number, max: number, cells: number): string {
    if (!Number.isFinite(value) || value <= 0) return '';
    if (!Number.isFinite(max) || max <= 0 || !Number.isFinite(cells) || cells <= 0) return '';
    const len = (value / max) * cells;
    const full = Math.floor(len);
    if (full >= cells) return BLOCK.repeat(cells);
    const frac = len - full;
    if (frac <= 0) return BLOCK.repeat(full);
    const partial = BAR_RAMP[Math.max(0, Math.round(frac * BAR_RAMP.length) - 1)];
    return BLOCK.repeat(full) + partial;
  }

  /** ChartLine's polyline points ("x,y x,y …") in the viewBox's user
   *  units. x is the point's INDEX position (non-finite points are
   *  skipped, never shifted); y maps the finite bounds to the honest
   *  [inset, h-inset] band (a 1-unit marker-radius inset, not a data
   *  lie); a single point centers (x = w/2 — i/(n-1) is undefined) */
  export function linePoints(data: readonly number[], w = 100, h = 40, inset = 1): string {
    const b = seriesBounds(data);
    if (!b) return '';
    const n = data.length;
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const v = data[i];
      if (!Number.isFinite(v)) continue;
      const x = n === 1 ? w / 2 : (i / (n - 1)) * w;
      const y = inset + (1 - normalize(v, b.min, b.max)) * (h - 2 * inset);
      pts.push(`${Number(x.toFixed(2))},${Number(y.toFixed(2))}`);
    }
    return pts.join(' ');
  }

  /** each point DOUBLED — fed to a stroke-linecap="round" polyline it
   *  renders a round marker dot at every point, sized by stroke-width
   *  (which CAN be non-scaling, unlike <circle r>), so markers never
   *  stretch under preserveAspectRatio */
  export function markerPoints(points: string): string {
    if (!points) return '';
    return points
      .split(' ')
      .flatMap((p) => [p, p])
      .join(' ');
  }

  export interface DonutSegment {
    index: number;
    /** the sanitized value (non-finite / negative → 0) */
    value: number;
    /** value / total, 0..1 */
    share: number;
    /** `${dashLength} ${circumference}` — one dash per circle */
    dash: string;
    /** the accumulated offset of every PREVIOUS segment */
    offset: number;
    /** the token-derived stroke color */
    color: string;
  }

  export interface DonutGeometry {
    radius: number;
    circumference: number;
    segments: DonutSegment[];
  }

  /** the ring's dasharray geometry: each segment is its own circle
   *  with one dash of share×circumference, offset by the accumulated
   *  lengths before it (the -90° group rotation pins segment 0 at 12
   *  o'clock). FROZEN zero-total guard: no finite positive values →
   *  null (the part renders the bare track). Negative and non-finite
   *  values are 0-share segments — a donut is composition shares, it
   *  never invents magnitude */
  export function donutGeometry(
    data: readonly number[],
    size: number,
    thickness: number,
  ): DonutGeometry | null {
    const radius = (size - thickness) / 2;
    const c = 2 * Math.PI * radius;
    const clean = data.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
    const total = clean.reduce((a, b) => a + b, 0);
    if (!(total > 0)) return null;
    // offsets accumulate the SERIALIZED dash lengths, so the rendered
    // ring tiles exactly what the browser consumes (no micro-overlap
    // between adjacent segments from raw-vs-rounded drift)
    const cStr = c.toFixed(3);
    let acc = 0;
    const segments = clean.map((v, i) => {
      const share = v / total;
      const lenStr = (share * c).toFixed(3);
      const seg: DonutSegment = {
        index: i,
        value: v,
        share,
        dash: `${lenStr} ${cStr}`,
        offset: -acc,
        color: donutColor(i),
      };
      acc += Number(lenStr);
      return seg;
    });
    return { radius, circumference: c, segments };
  }

  /** the opt-in table fallback's rows: value null marks a non-finite
   *  point (rendered as the em dash, never a JS literal) */
  export function seriesRows(data: readonly number[]): { index: number; value: number | null }[] {
    return data.map((v, i) => ({ index: i, value: Number.isFinite(v) ? v : null }));
  }

  /** ChartBar's variant grammar — the prominence ladder's three
   *  chart-applicable rungs, painted through the four global hue
   *  slots (never a semantic variant name) */
  // The union lives in the family Defaults (r11 same-folder-literal
  // convention) and is re-exported here so the public surface keeps
  // its shape.
  import type { ChartVariant } from './chart-defaults.svelte';
  export type { ChartVariant };
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getDensityContext, provideDensity, resolveDensity, type Density } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import { ChartDefaults } from './chart-defaults.svelte';
  import './chart.css';

  interface Props {
    /** density policy: explicit, inherited — provided to the subtree
     *  so chart ensembles adopt one tier */
    density?: Density;
    class?: string;
    children: Snippet;
  }

  let { density, class: className = '', children }: Props = $props();

  // The CAPTURE is load-bearing and eager (r11 provider contract, the
  // button-group form): getDensityContext() rides the $derived.by
  // ARGUMENT subtree, which evaluates at this statement — BEFORE
  // provideDensity writes the key — so it captures the PARENT's
  // context (not the ensemble's own). Reading it lazily (in the
  // $derived initializer body, or the getter itself) would resolve
  // the very getter it feeds — derived_references_self.
  const resolvedDensity = $derived.by(
    ((inherited) => () => resolveDensity(density, inherited))(getDensityContext()),
  );
  provideDensity(() => resolvedDensity);
  // the family Defaults is the single read point for the STAMP
  // (context-defaults-economy 3.4): the slot's ambient read lands on
  // this ensemble's own provided policy — exactly what the glyphs
  // below see, one resolution for the whole subtree
  const d = $derived(ChartDefaults.resolve({ density }));
</script>

<div data-jx-chart="" data-density={d.density} class={cn('contents', className)}>
  {@render children()}
</div>
