<!--
  Test host for the menubar contract (composition-first-apis: the
  family composes Item/Trigger/Panel/MenuItem parts — items[] and the
  keyed panel snippet are dead): two top menus with action items.
-->
<script lang="ts">
  import Menubar from '../../src/lib/ui/menubar/menubar.svelte';
  import MenubarItem from '../../src/lib/ui/menubar/menubar-item.svelte';
  import MenubarTrigger from '../../src/lib/ui/menubar/menubar-trigger.svelte';
  import MenubarPanel from '../../src/lib/ui/menubar/menubar-panel.svelte';
  import MenubarMenuItem from '../../src/lib/ui/menubar/menubar-menu-item.svelte';
</script>

<Menubar label="app">
  <MenubarItem id="file">
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarPanel>
      <MenubarMenuItem onselect={() => {}}>File action a</MenubarMenuItem>
      <MenubarMenuItem onselect={() => {}}>File action b</MenubarMenuItem>
    </MenubarPanel>
  </MenubarItem>
  <MenubarItem id="edit">
    <MenubarTrigger>Edit</MenubarTrigger>
    <MenubarPanel>
      <MenubarMenuItem onselect={() => {}}>Edit action a</MenubarMenuItem>
      <MenubarMenuItem onselect={() => {}}>Edit action b</MenubarMenuItem>
    </MenubarPanel>
  </MenubarItem>
</Menubar>
