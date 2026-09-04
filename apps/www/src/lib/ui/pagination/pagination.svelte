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
  import type { Density } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import { PaginationDefaults } from './pagination-defaults.svelte';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** DENSITY override: explicit ?? inherited ?? default */
    density?: Density;
    'data-density'?: string;
    /** nav landmark label (announced before the links) */
    label?: string;
    children: Snippet;
  }

  let { density, 'data-density': _callerDensity, label = 'Pagination', class: className = '', children, ...rest }: Props = $props();

  // THE DEFAULTS READ POINT (context-defaults-economy 3.3): one line —
  // density resolves through the family contract (the no-opinion axis
  // slot: explicit ?? inherited ?? undefined; no opinion stamps
  // nothing, the ambient css scope channel keeps flowing)
  const d = $derived(PaginationDefaults.resolve({ density }));
</script>

<nav data-jx-pagination="" data-density={d.density} class={cn('block', className)} aria-label={label} {...rest}>
  {@render children()}
</nav>
