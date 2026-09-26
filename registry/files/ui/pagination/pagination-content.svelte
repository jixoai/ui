<!--
  jixoai PaginationContent (registry/files/ui/pagination/pagination-content.svelte,
  2026-08-25).
  The ul of the pagination nav: Previous/Next, page links and
  ellipses compose as PaginationItem children of this strip. Paint is
  token utilities, unchanged from the closed component.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { paginationStyles } from './pagination.stylex';

  interface Props extends HTMLAttributes<HTMLUListElement> {
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();

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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<ul
  data-jx-pagination-list=""
  class={cn(cx(paginationStyles.list), className)}
  role="list"
  {...rest}
>
  {@render children()}
</ul>
