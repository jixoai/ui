<!--
  jixoai ItemActions — the trailing slot: controls, chevrons, buttons.
  Wraps (flex-wrap) and right-aligns; drops to its own full row when
  the group is narrow (the presence matrix in item.css).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  let { class: className = '', children }: { class?: string; children: Snippet } = $props();
</script>

<span data-slot="item-actions" class={cn(className)}>{@render children()}</span>
