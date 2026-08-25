<!--
  composition-c fixture: a conditionally rendered menubar panel — the
  panel's handles must unregister onDestroy (no ghost handle), and the
  trigger's aria-controls stays the deterministic derived id.
-->
<script lang="ts">
  import Menubar from '../../src/lib/ui/menubar/menubar.svelte';
  import MenubarItem from '../../src/lib/ui/menubar/menubar-item.svelte';
  import MenubarTrigger from '../../src/lib/ui/menubar/menubar-trigger.svelte';
  import MenubarPanel from '../../src/lib/ui/menubar/menubar-panel.svelte';
  import MenubarMenuItem from '../../src/lib/ui/menubar/menubar-menu-item.svelte';

  let { withPanel = true }: { withPanel?: boolean } = $props();
</script>

<Menubar label="ghost">
  <MenubarItem id="solo">
    <MenubarTrigger>solo</MenubarTrigger>
    {#if withPanel}
      <MenubarPanel>
        <MenubarMenuItem onselect={() => {}}>only</MenubarMenuItem>
      </MenubarPanel>
    {/if}
  </MenubarItem>
</Menubar>
