<!--
  Test host for the dropdown-menu CUSTOM trigger contract: a trigger
  snippet (not the default button) — the root must adopt its
  [popovertarget] button for aria mirroring and focus restoration.
-->
<script lang="ts">
  import DropdownMenu from '../../src/lib/ui/dropdown-menu/dropdown-menu.svelte';
  import DropdownMenuItem from '../../src/lib/ui/dropdown-menu/dropdown-menu-item.svelte';

  let lastAction = $state('');
</script>

<div data-last-action={lastAction}>
  <DropdownMenu id="custom-menu" triggerLabel="ignored">
    {#snippet trigger()}
      <button type="button" popovertarget="custom-menu" data-custom-trigger>
        custom trigger
      </button>
    {/snippet}
    <DropdownMenuItem onclick={() => (lastAction = 'renamed')}>Rename…</DropdownMenuItem>
  </DropdownMenu>
</div>
