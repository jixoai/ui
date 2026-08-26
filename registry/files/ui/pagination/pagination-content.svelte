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

  interface Props extends HTMLAttributes<HTMLUListElement> {
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<ul
  data-jx-pagination-list=""
  class={cn('m-0 flex list-none flex-wrap items-center gap-[var(--jx-gap)] p-0', className)}
  role="list"
  {...rest}
>
  {@render children()}
</ul>
