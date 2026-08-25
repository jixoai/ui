<!--
  composition-c fixture: a dropdown-menu whose panel contains a NESTED
  submenu (a raw [role=menu] with its own menuitems) — the scoped
  walker regression for the drive-by fix.
-->
<script lang="ts">
  import DropdownMenu from '../../src/lib/ui/dropdown-menu/dropdown-menu.svelte';
</script>

<DropdownMenu id="c-dd-nested" triggerLabel="actions">
  <button type="button" role="menuitem">outer a</button>
  <button type="button" role="menuitem">outer b</button>
  <div role="menu">
    <button type="button" role="menuitem">nested a</button>
    <button type="button" role="menuitem">nested b</button>
  </div>
</DropdownMenu>
