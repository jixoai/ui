<!--
  jixoai ItemContent — the required middle slot: the title/description
  column. The second content slot in an item stops stretching (the
  shadcn rule) — this component owns that law.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  let { class: className = '', children }: { class?: string; children: Snippet } = $props();
</script>

<div data-slot="item-content" class={cn(className)}>{@render children()}</div>
