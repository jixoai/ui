<!--
  Test host for the pagination family contract (composition-first,
  2026-08-25): the composed nav over the pageRange helper at two
  positions (middle of the window, first page bound), an onclick-only
  link (the honest button form) and a child()-escape Previous that
  receives the merged link props.
-->
<script lang="ts">
  import Pagination from '../../src/lib/ui/pagination/pagination.svelte';
  import PaginationContent from '../../src/lib/ui/pagination/pagination-content.svelte';
  import PaginationItem from '../../src/lib/ui/pagination/pagination-item.svelte';
  import PaginationLink from '../../src/lib/ui/pagination/pagination-link.svelte';
  import PaginationPrevious from '../../src/lib/ui/pagination/pagination-previous.svelte';
  import PaginationNext from '../../src/lib/ui/pagination/pagination-next.svelte';
  import PaginationEllipsis from '../../src/lib/ui/pagination/pagination-ellipsis.svelte';
  import { pageRange } from '../../src/lib/ui/pagination/pagination-range';
  import { cn } from '../../src/lib/utils';

  const total = 20;
  const href = (page: number): string => `/items?page=${page}`;

  let clicks = $state(0);
</script>

{#snippet windowed(current: number)}
  <Pagination>
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious href={current > 1 ? href(current - 1) : undefined} />
      </PaginationItem>
      {#each pageRange({ current, total }) as item (item)}
        {#if item === 'ellipsis-start' || item === 'ellipsis-end'}
          <PaginationItem><PaginationEllipsis /></PaginationItem>
        {:else}
          <PaginationItem>
            <PaginationLink page={item} isActive={item === current} href={href(item)} />
          </PaginationItem>
        {/if}
      {/each}
      <PaginationItem>
        <PaginationNext href={current < total ? href(current + 1) : undefined} />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
{/snippet}

<div data-testid="at-middle">{@render windowed(5)}</div>
<div data-testid="at-first">{@render windowed(1)}</div>

<div data-testid="button-form">
  <PaginationLink page={2} onclick={() => (clicks += 1)}>two</PaginationLink>
</div>

<div data-testid="child-escape">
  <PaginationPrevious href="/items?page=4">
    {#snippet child({ props })}
      <a {...props} class={cn(props.class, 'text-primary')}>‹ prev</a>
    {/snippet}
  </PaginationPrevious>
</div>
