<!--
  jixoai ItemGroup (registry/files/ui/list-item/item-group.svelte).
  The vertical stack (role=list) AND the wrap container: items query it
  (@container jx-items) for the narrow actions-wrap. Separators are the
  GROUP's direct children — the hairline belongs to the list, never to
  an item's own decoration.
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** sets the item density for the whole group (gap tuning) */
    size?: 'default' | 'sm' | 'xs';
    class?: string;
    children: Snippet;
  }

  let { size = 'default', class: className = '', children }: Props = $props();

  setContext('jx-item-group', true);
</script>

<div data-slot="item-group" class={cn('jx-item-group', className)} data-size={size} role="list">
  {@render children()}
</div>
