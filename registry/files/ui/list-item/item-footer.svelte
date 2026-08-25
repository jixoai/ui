<!--
  jixoai ItemFooter — an optional FULL-ROW slot below the main row.
  Presence rewrites the grid template.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  let { class: className = '', children }: { class?: string; children: Snippet } = $props();
</script>

<div data-slot="item-footer" class={cn(className)}>{@render children()}</div>
