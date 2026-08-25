<!-- pagination blueprint: the page window — page 4 of 30 with both
     ellipses and the active fill, and the first-page bound where
     ‹ prev renders as the honest disabled span. Composed parts over
     the exported pageRange math. -->
<script lang="ts">
  import Pagination from '$lib/ui/pagination/pagination.svelte';
  import PaginationContent from '$lib/ui/pagination/pagination-content.svelte';
  import PaginationItem from '$lib/ui/pagination/pagination-item.svelte';
  import PaginationLink from '$lib/ui/pagination/pagination-link.svelte';
  import PaginationPrevious from '$lib/ui/pagination/pagination-previous.svelte';
  import PaginationNext from '$lib/ui/pagination/pagination-next.svelte';
  import PaginationEllipsis from '$lib/ui/pagination/pagination-ellipsis.svelte';
  import { pageRange } from '$lib/ui/pagination/pagination-range';

  const href = (page: number): string => `/docs/components?page=${page}`;
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-8 p-10">
  {#each [{ current: 4, total: 30, label: 'registry items' }, { current: 1, total: 8, label: 'threads' }] as nav (nav.label)}
    <Pagination label={nav.label}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={nav.current > 1 ? href(nav.current - 1) : undefined} />
        </PaginationItem>
        {#each pageRange({ current: nav.current, total: nav.total }) as page (page)}
          {#if page === 'ellipsis-start' || page === 'ellipsis-end'}
            <PaginationItem><PaginationEllipsis /></PaginationItem>
          {:else}
            <PaginationItem>
              <PaginationLink page={page} isActive={page === nav.current} href={href(page)} />
            </PaginationItem>
          {/if}
        {/each}
        <PaginationItem>
          <PaginationNext href={nav.current < nav.total ? href(nav.current + 1) : undefined} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  {/each}
</div>
