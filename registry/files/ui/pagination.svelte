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
</script>

<nav class="jx-pagination {className}" aria-label={label}>
  <!-- visible status line for sighted users; screen readers already get
      the full picture from the nav label + numbered links + aria-current -->
  <p class="jx-pagination-status" aria-hidden="true">{totalPagesLabel}</p>
  <ul class="jx-pagination-list" role="list">
    <li>
      {#if page > 1}
        <a class="jx-page-edge" href={href(page - 1)}>{prevLabel}</a>
      {:else}
        <span class="jx-page-edge jx-page-edge-off" aria-disabled="true">{prevLabel}</span>
      {/if}
    </li>
    {#each items as item, index (index)}
      <li>
        {#if item === '…'}
          <span class="jx-page-gap" aria-hidden="true">…</span>
        {:else if item === page}
          <a class="jx-page jx-page-current" href={href(item)} aria-current="page">{item}</a>
        {:else}
          <a class="jx-page" href={href(item)}>{item}</a>
        {/if}
      </li>
    {/each}
    <li>
      {#if page < pageCount}
        <a class="jx-page-edge" href={href(page + 1)}>{nextLabel}</a>
      {:else}
        <span class="jx-page-edge jx-page-edge-off" aria-disabled="true">{nextLabel}</span>
      {/if}
    </li>
  </ul>
</nav>

<style>
  .jx-pagination {
    display: block;
  }
  .jx-pagination-status {
    margin: 0 0 0.5rem;
    font-family: var(--font-nav);
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }
  .jx-pagination-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .jx-page,
  .jx-page-edge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-width: 1.875rem;
    height: 1.875rem;
    padding: 0 0.5rem;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--foreground);
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-decoration: none;
    cursor: pointer;
    transition:
      transform 150ms ease-out,
      box-shadow 150ms ease-out,
      border-color 150ms ease-out;
  }
  .jx-page:hover,
  .jx-page-edge:hover {
    transform: translate(-1px, -1px);
    box-shadow: var(--shadow-xs);
    border-color: var(--primary);
    color: var(--primary);
  }
  .jx-page:focus-visible,
  .jx-page-edge:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  .jx-page-current {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--primary-foreground);
  }
  .jx-page-current:hover {
    color: var(--primary-foreground);
    transform: none;
    box-shadow: none;
  }

  .jx-page-edge {
    text-transform: uppercase;
  }
  .jx-page-edge-off {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
  }

  .jx-page-gap {
    display: inline-flex;
    align-items: center;
    padding: 0 0.25rem;
    color: var(--muted-foreground);
    user-select: none;
  }
</style>
