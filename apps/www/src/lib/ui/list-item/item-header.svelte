<!--
  jxoai ItemHeader — an optional FULL-ROW slot above the main row
  (labels, meta strips). Presence rewrites the grid template.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  let { class: className = '', children }: { class?: string; children: Snippet } = $props();
</script>

<div data-slot="item-header" class={cn(className)}>{@render children()}</div>
