<!--
  composition-c fixture: the menubar family + a nested dropdown-menu
  inside a panel — the nested-walker scoping probe (nested menu items
  must never leak into the bar walk OR the panel walk).
-->
<script lang="ts">
  import Menubar from '../../src/lib/ui/menubar/menubar.svelte';
  import MenubarItem from '../../src/lib/ui/menubar/menubar-item.svelte';
  import MenubarTrigger from '../../src/lib/ui/menubar/menubar-trigger.svelte';
  import MenubarPanel from '../../src/lib/ui/menubar/menubar-panel.svelte';
  import MenubarMenuItem from '../../src/lib/ui/menubar/menubar-menu-item.svelte';
  import DropdownMenu from '../../src/lib/ui/dropdown-menu/dropdown-menu.svelte';
</script>

<Menubar label="app">
  <MenubarItem id="file">
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarPanel>
      <MenubarMenuItem onselect={() => {}}>open</MenubarMenuItem>
      <MenubarMenuItem href="/docs">docs</MenubarMenuItem>
      <hr />
      <MenubarMenuItem onselect={() => {}}>close</MenubarMenuItem>
      <!-- a nested dropdown family INSIDE the panel: its menuitems
           must not leak into either walk -->
      <DropdownMenu id="c-menubar-nested" triggerLabel="recent">
        <button type="button" role="menuitem">nested a</button>
        <button type="button" role="menuitem">nested b</button>
      </DropdownMenu>
    </MenubarPanel>
  </MenubarItem>
  <MenubarItem id="edit">
    <MenubarTrigger>Edit</MenubarTrigger>
    <MenubarPanel>
      <MenubarMenuItem onselect={() => {}}>undo</MenubarMenuItem>
      <MenubarMenuItem onselect={() => {}}>redo</MenubarMenuItem>
    </MenubarPanel>
  </MenubarItem>
</Menubar>
