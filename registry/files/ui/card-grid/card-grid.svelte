<!--
  jixoai card grid (registry/files/ui/card-grid/card-grid.svelte).
  Ships its OWN IO-driven stagger (Owner ruling, 2026-08-24, rev.2):
  an internal IntersectionObserver arms the entrance when the grid
  enters the viewport; cards then animate on the TIME axis with
  per-index delays — the cascade completes regardless of scroll
  behavior (a scroll-progress-driven range would freeze mid-opacity
  whenever scrolling stops). Independent of — and coexisting with —
  the site's scroll-driven reveal: consumers must NOT wrap cards in
  data-reveal; the grid owns its children's entrance. The hidden state
  keys on html.js (the theme's liveness flag): no-JS and pre-hydration
  stay fully visible.

  A grid + subgrid layout that equalizes cards visually: the grid defines
  two rows (header / body); every direct child spans both and opts into
  `grid-template-rows: subgrid`, so card HEADERS align to one shared
  height and card BODIES share the tallest body — no more ragged card
  tops or unequal card bottoms. The grid NEVER asks what a child is: any
  two-block card qualifies unchanged (first block = header, second =
  body — section-card's structural separator rides its header row's
  bottom edge, so the lines align across the row through the same
  equalized header row the old border-b used).

  THE FOOT MODE (Owner, 2026-09-03): `foot` declares a THIRD shared row
  — headers align, bodies fill, FEET align at the band bottoms — for
  zone-trio cards (the card component: head/body/foot, integer-placed).
  The mode is EXPLICIT, never presence-inferred: mixed spans in one
  grid silently misplace bands (auto-placement packs a span-2 card into
  a span-3 card's third row), so the landlord — not the tenants —
  declares the row contract. Footed cards in the default two-row mode
  overflow their foot into an implicit row: don't.

  The layout rules are on consumer children on purpose: the cards come
  from the consumer's children snippet, so no markup of ours can carry
  their paint (the subgrid law must reach them through the cascade).
  The jx- prefix keeps the global surface safe.

  Responsive: columns are `auto-fit, minmax(min(100%, --jx-grid-min), 1fr)`
  — pass `min` to control the collapse width. The default 320px is tuned
  for the 90rem page column: two equal columns through the laptop band
  (~60–64rem containers, so 4-card groups land 2×2 instead of a ragged
  3+1) while desktop (~86rem+) keeps four columns. A lone child would
  stretch into a full-width banner (auto-fit collapses every empty
  track), so it is capped at an editorial measure. Cards without subgrid
  support fall back to ordinary stacked rows (no worse than before).

  tw4 (2026-08-24): the grid container's own paint rides utilities;
  every rule that reaches the consumer-authored children (subgrid laws,
  the only-child cap, the entrance state machine) stays in
  card-grid.css — D1-exempt residue.
-->
<script lang="ts">
  import { onMount } from 'svelte';
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
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import { CardGridDefaults } from './card-grid-defaults.svelte';
  import { cardGridStyles } from './card-grid.stylex';
  import './card-grid.css';

  // the payload's own join (separator's serialize law): atoms are
  // objects in dev — composition goes through THIS joiner (all string
  // values except $$css, space-joined; plain strings pass through)
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  interface Props {
    /** Minimum column width before the grid collapses a column. */
    min?: string;
    /** Declare the THIRD shared row (head/body/FOOT equalization) for
        zone-trio cards — explicit, never inferred from the children. */
    foot?: boolean;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) — forwarded to the tenant cards via the §11
     *  broadcast; the landlord stamps nothing itself */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
    size?: SizeLane | QueryResult<SizeLane>;
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
    /** universal elevation axis (§7): official M3 levels · dp · query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive · a
     *  coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    class?: string;
    children: import('svelte').Snippet;
  }

  let {
    min = '320px',
    foot = false,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    children,
  }: Props = $props();

  // the family Defaults is the single read point (explicit-props W3-B):
  // the eight universal axes resolve in one record, all no-own — the
  // landlord forwards, the tenants paint
  const d = $derived(CardGridDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }));
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the root's ANCESTORS are
  // the candidate containers; the grid ITSELF is not a container-type
  // source — the tenants' own reversal containers own that role)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let gridEl = $state<HTMLElement | null>(null);
  provideQueryAnchor(() => gridEl ?? null);
  // the #4 composition: the grid's own --jx-grid-min custom prop first,
  // the axis carriers after (the caller style prop rides the class
  // surface here — the grid predates a style passthrough)
  const rootStyle = $derived(`--jx-grid-min: ${min}${carriers ? `; ${carriers}` : ''}`);

  // the internal entrance: ONE observer on the grid; the first
  // intersection arms .is-entered and the CSS time-cascade takes over
  onMount(() => {
    const grid = gridEl;
    if (!grid) return;
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      grid.classList.add('is-entered');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            grid.classList.add('is-entered');
            io.disconnect();
          }
        }
      },
      { threshold: 0 },
    );
    io.observe(grid);
    return () => io.disconnect();
  });
</script>

<div
  class={cn(
    cx('jx-card-grid', cardGridStyles.grid),
    className,
  )}
  style={rootStyle}
  data-rows={foot ? 'foot' : undefined}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  bind:this={gridEl}
>
  {@render children()}
</div>
