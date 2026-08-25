<!--
  jixoai ItemTitle — the primary line of ItemContent. Heading level is
  the consumer's choice (default span; pass `as` for semantic nesting).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    as?: 'span' | 'h3' | 'h4' | 'dt';
    class?: string;
    children: Snippet;
  }

  let { as = 'span', class: className = '', children }: Props = $props();
</script>

<svelte:element this={as} data-slot="item-title" class={cn(className)}>{@render children()}</svelte:element>
