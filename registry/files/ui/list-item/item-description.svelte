<!--
  jixoai ItemDescription — the muted secondary line of ItemContent.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    as?: 'span' | 'p' | 'dd';
    class?: string;
    children: Snippet;
  }

  let { as = 'span', class: className = '', children }: Props = $props();
</script>

<svelte:element this={as} data-slot="item-description" class={cn(className)}>{@render children()}</svelte:element>
