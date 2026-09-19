<!--
  jixoai grid (registry/files/ui/grid/grid.svelte).
  The Layout family's GRID primitive: two-dimensional track
  arrangement over the typed space ladder. Numeric cols compile to
  the blowout-proof repeat(N, minmax(0, 1fr)) atom (the grid-law
  vocabulary — a bare 1fr track overflows on wide children); the
  rows lane carries the disclosure vocabulary ('collapse' = 0fr,
  'open' = 1fr — the 0fr→1fr collapse the canvas drawer and the
  header drawer ride; grid-template-rows animates, height:auto
  never does). Bespoke track forms (auto-fit/minmax pairs, named
  areas) stay in surface modules — an open string domain cannot be
  pre-atomized, and this family ships atoms only.

  Props are STRUCTURAL (never-ambient, no Defaults contract — the
  stack twin's classification). Single root, rest-spread BEFORE the
  component's own stamp; omitted props add nothing.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { gridStyles, type GridGap } from './grid.stylex';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** equal track count — the blowout-proof repeat(N, minmax(0,1fr)) */
    cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    /** the disclosure lane: collapse (0fr) | open (1fr) */
    rows?: 'collapse' | 'open';
    /** the typed space ladder rung (token-bound) */
    gap?: GridGap;
    /** the flow's contents */
    children?: Snippet;
  }

  let {
    cols,
    rows,
    gap,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  // the payload's own join (the serialize law)
  const cx = (
    ...styles: (object | undefined | string | false)[]
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

  const COLS_ATOM: Record<number, object> = {
    1: gridStyles.cols1,
    2: gridStyles.cols2,
    3: gridStyles.cols3,
    4: gridStyles.cols4,
    5: gridStyles.cols5,
    6: gridStyles.cols6,
    7: gridStyles.cols7,
    8: gridStyles.cols8,
    9: gridStyles.cols9,
    10: gridStyles.cols10,
    11: gridStyles.cols11,
    12: gridStyles.cols12,
  };
  const ROWS_ATOM = {
    collapse: gridStyles.rowsCollapse,
    open: gridStyles.rowsOpen,
  } as const;
  const GAP_ATOM: Record<GridGap, object> = {
    '2': gridStyles.gap2,
    '4': gridStyles.gap4,
    '6': gridStyles.gap6,
    '8': gridStyles.gap8,
    '10': gridStyles.gap10,
    '12': gridStyles.gap12,
    '14': gridStyles.gap14,
    '16': gridStyles.gap16,
    '18': gridStyles.gap18,
    '20': gridStyles.gap20,
    '24': gridStyles.gap24,
    '28': gridStyles.gap28,
    '32': gridStyles.gap32,
    '40': gridStyles.gap40,
    '48': gridStyles.gap48,
    '80': gridStyles.gap80,
  };

  const tracks = $derived(
    cx(
      gridStyles.base,
      cols && COLS_ATOM[cols],
      rows && ROWS_ATOM[rows],
      gap && GAP_ATOM[gap],
    ),
  );
</script>

<div class={cn(tracks, className)} {...rest} data-jx-grid="">
  {@render children?.()}
</div>
