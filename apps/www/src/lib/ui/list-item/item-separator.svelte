<!--
  jixoai ItemSeparator — a hairline BETWEEN group items. Must be a
  direct child of ItemGroup; inside the role=list group it renders as
  li[role=presentation] (r3, Codex P1-2: a bare <hr> broke the list
  semantics) wrapping the separator.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import Separator from '$lib/ui/separator/separator.svelte';

  const inGroup = getContext('jx-item-group') === true;
</script>

{#if inGroup}
  <li role="presentation" data-slot="item-separator" class="jx-item-separator list-none">
    <Separator />
  </li>
{:else}
  <Separator data-slot="item-separator" class="jx-item-separator" />
{/if}
