<!--
  jixoai ItemDivider — the explicit full-strength boundary between
  group rows (replaces ItemSeparator, openspec
  list-item-systemization). Childless + decorative in v1: an empty
  presentation <li>; the automatic adjacency divider (38% mix) is
  structurally exclusive with it — one source per edge.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { ITEM_GROUP_KEY } from './item-group.svelte';

  let { class: className = '' }: { class?: string } = $props();

  const inGroup = getContext(ITEM_GROUP_KEY) !== undefined;
</script>

{#if inGroup}
  <li role="presentation" data-slot="item-divider" class={cn('list-none m-0 p-0', className)}></li>
{:else}
  <div role="presentation" data-slot="item-divider" class={cn(className)}></div>
{/if}
