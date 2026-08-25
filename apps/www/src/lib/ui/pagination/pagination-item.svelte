<!--
  jixoai PaginationItem (registry/files/ui/pagination/pagination-item.svelte,
  2026-08-25).
  One cell of the strip — the li wrapping a link, an ellipsis or
  whatever the consumer composes. Pure structure; no behavior.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLLIElement> {
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<li data-jx-pagination-item="" class={cn(className)} {...rest}>
  {@render children()}
</li>
