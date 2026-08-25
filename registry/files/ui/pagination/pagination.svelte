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

  interface Props extends HTMLAttributes<HTMLElement> {
    /** nav landmark label (announced before the links) */
    label?: string;
    children: Snippet;
  }

  let { label = 'Pagination', class: className = '', children, ...rest }: Props = $props();
</script>

<nav data-jx-pagination="" class={cn('block', className)} aria-label={label} {...rest}>
  {@render children()}
</nav>
