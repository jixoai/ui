<!--
  jixoai pagination (registry/files/ui/pagination.svelte).
  W3C-first: pagination is a nav landmark of ordinary links — real hrefs
  (server-friendly, works JS-off), aria-current="page" on the active one,
  prev/next at the edges. No state machine, no router coupling: the href
  template decides where page N lives.

    <Pagination page={page} pageCount={total} href={(p) => `/?page=${p}`} />

  The window algorithm keeps the first and last page always reachable and
  shows `siblings` pages around the current one, collapsing the rest
  into ellipses (aria-hidden decoration — screen readers hear the full
  "page 4 of 20" from the labeled nav + current link, not the gaps).

  At the bounds, prev/next render as disabled spans (aria-disabled), not
  dead links — a link that goes nowhere is a lie to every input mode.

  tw4 (2026-08-24): PURE utility migration, zero css residue — every
  state (current page, edge bounds, gaps) is JS-known, so conditional
  utility strings carry the paint; the press poses ride the --jx-press*
  custom-property utilities (the press law's wiring, verbatim).
-->
<script lang="ts" module>
  export type PageItem = number | '…';

  /**
   * Page window with sticky edges: 1 … (n-1, n, n+1) … last.
   * siblings=0 collapses the neighbor run entirely (just the current
   * page between the ellipses); negatives clamp to 0. Tiny page counts
   * never grow ellipses.
   */
  export function pageWindow(page: number, pageCount: number, siblings = 1): PageItem[] {
    const s = Math.max(0, Math.trunc(siblings));
    const items: PageItem[] = [1];
    const from = Math.max(2, page - s);
    const to = Math.min(pageCount - 1, page + s);
    if (from > 2) items.push('…');
    for (let p = from; p <= to; p++) items.push(p);
    if (to < pageCount - 1) items.push('…');
    if (pageCount > 1) items.push(pageCount);
    return items;
  }
</script>

<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    /** the active page, 1-based */
    page: number;
    /** total number of pages */
    pageCount: number;
    /** where page N lives — the template owns the URL shape */
    href: (page: number) => string;
    /** nav landmark label (announced before the links) */
    label?: string;
    /** pages shown either side of the current one (default 1) */
    siblings?: number;
    /** edge link labels — plain text or composed markup via snippet? */
    prevLabel?: string;
    nextLabel?: string;
    class?: string;
  }

  let {
    page,
    pageCount,
    href,
    label = 'Pagination',
    siblings = 1,
    prevLabel = '‹ prev',
    nextLabel = 'next ›',
    class: className = '',
  }: Props = $props();

  const items = $derived(pageWindow(page, pageCount, siblings));
  const totalPagesLabel = $derived(`page ${page} of ${pageCount}`);

  // the page-chip geometry + press poses (the current page rides the
  // law's press, never its shadow — hover/active poses re-point to none)
  const chipPose =
    '[--jx-press-shadow:none] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)]';
  const chipPoseCurrent =
    '[--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none]';
  const chipBase =
    'inline-flex h-[1.875rem] min-w-[1.875rem] items-center justify-center box-border border px-2 font-nav text-xs no-underline tracking-[0.08em] cursor-pointer focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1';
  const pageChip = cn(
    chipBase,
    chipPose,
    'border-border bg-card text-foreground hover:border-primary hover:text-primary',
  );
  const currentPageChip = cn(
    chipBase,
    chipPoseCurrent,
    'border-primary bg-primary text-primary-foreground',
  );
</script>

<nav data-jx-pagination="" class={cn('block', className)} aria-label={label}>
  <!-- visible status line for sighted users; screen readers already get
      the full picture from the nav label + numbered links + aria-current -->
  <p
    data-jx-pagination-status=""
    class="m-0 mb-2 font-nav text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground"
    aria-hidden="true"
  >
    {totalPagesLabel}
  </p>
  <ul data-jx-pagination-list="" class="m-0 flex list-none flex-wrap items-center gap-1 p-0" role="list">
    <li>
      {#if page > 1}
        <a data-jx-page-edge="" class="jx-press {pageChip} uppercase" href={href(page - 1)}>{prevLabel}</a>
      {:else}
        <span
          data-jx-page-edge=""
          data-jx-page-edge-off=""
          class="inline-flex h-[1.875rem] min-w-[1.875rem] items-center justify-center box-border border border-border bg-card px-2 font-nav text-xs uppercase tracking-[0.08em] text-foreground opacity-45 shadow-none cursor-not-allowed"
          aria-disabled="true"
        >
          {prevLabel}
        </span>
      {/if}
    </li>
    {#each items as item, index (index)}
      <li>
        {#if item === '…'}
          <span
            data-jx-page-gap=""
            class="inline-flex items-center px-1 text-muted-foreground select-none"
            aria-hidden="true"
          >
            …
          </span>
        {:else if item === page}
          <a data-jx-page="" data-jx-page-current="" class="jx-press {currentPageChip}" href={href(item)} aria-current="page"
          >
            {item}
          </a>
        {:else}
          <a data-jx-page="" class="jx-press {pageChip}" href={href(item)}>{item}</a>
        {/if}
      </li>
    {/each}
    <li>
      {#if page < pageCount}
        <a data-jx-page-edge="" class="jx-press {pageChip} uppercase" href={href(page + 1)}>{nextLabel}</a>
      {:else}
        <span
          data-jx-page-edge=""
          data-jx-page-edge-off=""
          class="inline-flex h-[1.875rem] min-w-[1.875rem] items-center justify-center box-border border border-border bg-card px-2 font-nav text-xs uppercase tracking-[0.08em] text-foreground opacity-45 shadow-none cursor-not-allowed"
          aria-disabled="true"
        >
          {nextLabel}
        </span>
      {/if}
    </li>
  </ul>
</nav>
