<!--
  jixoai Pagination root (registry/files/ui/pagination/pagination.svelte,
  composition-first, 2026-08-25).
  W3C-first: pagination is a nav landmark of ordinary links. The root
  now owns ONLY the landmark — the closed compute-and-render component
  (page/pageCount/href props, the audit's finding) died. Links are
  authored as parts; the page-window math lives in the exported pure
  helper pagination-range.ts (pageRange) —

    <Pagination>
      <PaginationContent>
        <PaginationItem><PaginationPrevious {href} /></PaginationItem>
        {#each pageRange({ current, total }) as page (page)}
          {#if page === 'ellipsis-start' || page === 'ellipsis-end'}
            <PaginationItem><PaginationEllipsis /></PaginationItem>
          {:else}
            <PaginationItem>
              <PaginationLink {page} isActive={page === current} href={href(page)} />
            </PaginationItem>
          {/if}
        {/each}
        <PaginationItem><PaginationNext {href} /></PaginationItem>
      </PaginationContent>
    </Pagination>

  aria-current="page" on the active link carries the full "page N of M"
  story together with this label — the closed component's status line
  is caller markup now (its copy needed the numbers the root no longer
  holds).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
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
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import { PaginationDefaults } from './pagination-defaults.svelte';
  import { paginationStyles } from './pagination.stylex';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    'data-density'?: string;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the link parts ride plain
     *  inheritance) */
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
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    /** nav landmark label (announced before the links) */
    label?: string;
    children: Snippet;
  }

  let {
    density,
    'data-density': _callerDensity,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    label = 'Pagination',
    class: className = '',
    style: consumerStyle,
    children,
    ...rest
  }: Props = $props();

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
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

  // THE DEFAULTS READ POINT (context-defaults-economy 3.3 + W3-D2):
  // one record — density resolves through the bridged axis slot
  // (explicit ?? inherited ?? 'auto'; no opinion stamps nothing, the
  // ambient css scope channel keeps flowing), the seven sibling axes
  // ride the same record (the landmark shell is no-own; the size
  // axis scales the root, the links inherit)
  const d = $derived(
    PaginationDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(
    [carriers, consumerStyle ?? undefined].filter(Boolean).join('; ') || undefined,
  );
</script>

<nav
  bind:this={uniRoot}
  data-jx-pagination=""
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={cn(cx(paginationStyles.nav), className)}
  aria-label={label}
  {...rest}
>
  {@render children()}
</nav>
