<!--
  Test host for the dropdown-menu contract: a default trigger with five
  items (one destructive) and an hr separator; the last action surfaces
  as a data attribute so tests read selection through the DOM.
-->
<script lang="ts">
  import DropdownMenu from '../../src/lib/ui/dropdown-menu/dropdown-menu.svelte';
  import DropdownMenuItem from '../../src/lib/ui/dropdown-menu/dropdown-menu-item.svelte';

  let lastAction = $state('');
</script>

<div data-last-action={lastAction}>
  <DropdownMenu id="host-menu" triggerLabel="Actions">
    <DropdownMenuItem onclick={() => (lastAction = 'rename')}>Rename…</DropdownMenuItem>
    <DropdownMenuItem onclick={() => (lastAction = 'duplicate')}>Duplicate</DropdownMenuItem>
    <DropdownMenuItem onclick={() => (lastAction = 'copy link')}>Copy link</DropdownMenuItem>
    <hr />
    <DropdownMenuItem destructive onclick={() => (lastAction = 'delete')}>Delete</DropdownMenuItem>
  </DropdownMenu>
</div>
