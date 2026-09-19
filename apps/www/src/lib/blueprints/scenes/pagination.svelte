<!-- pagination blueprint: the page window — page 4 of 30 with both
     ellipses and the active fill, and the first-page bound where
     ‹ prev renders as the honest disabled span. Composed parts over
     the exported pageRange math.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Pagination from '$lib/ui/pagination/pagination.svelte';
  import PaginationContent from '$lib/ui/pagination/pagination-content.svelte';
  import PaginationItem from '$lib/ui/pagination/pagination-item.svelte';
  import PaginationLink from '$lib/ui/pagination/pagination-link.svelte';
  import PaginationPrevious from '$lib/ui/pagination/pagination-previous.svelte';
  import PaginationNext from '$lib/ui/pagination/pagination-next.svelte';
  import PaginationEllipsis from '$lib/ui/pagination/pagination-ellipsis.svelte';
  import { pageRange } from '$lib/ui/pagination/pagination-range';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

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

  const href = (page: number): string => `/docs/components?page=${page}`;
</script>

<Stack direction="column" align="start" justify="center" gap="32" class={cx(bpB.paginationStage)}>
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
</Stack>
