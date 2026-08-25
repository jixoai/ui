<!--
  composition-c fixture: duplicate MenubarItem ids — both panels derive
  the same `${id}-panel` key; the FIRST registration must win (the
  later registrant's handles never fire).
-->
<script lang="ts">
  import Menubar from '../../src/lib/ui/menubar/menubar.svelte';
  import MenubarItem from '../../src/lib/ui/menubar/menubar-item.svelte';
  import MenubarTrigger from '../../src/lib/ui/menubar/menubar-trigger.svelte';
  import MenubarPanel from '../../src/lib/ui/menubar/menubar-panel.svelte';
  import MenubarMenuItem from '../../src/lib/ui/menubar/menubar-menu-item.svelte';
</script>

<Menubar label="dup">
  <MenubarItem id="dup">
    <MenubarTrigger>first</MenubarTrigger>
    <MenubarPanel>
      <MenubarMenuItem onselect={() => {}}>first panel item</MenubarMenuItem>
    </MenubarPanel>
  </MenubarItem>
  <MenubarItem id="dup">
    <MenubarTrigger>second</MenubarTrigger>
    <MenubarPanel>
      <MenubarMenuItem onselect={() => {}}>second panel item</MenubarMenuItem>
    </MenubarPanel>
  </MenubarItem>
</Menubar>
