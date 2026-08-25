<!--
  composition regression fixture (Codex impl-r4 B): a consumer who
  tries to CLOBBER the deterministic wire through ...rest — the
  derived id/aria-controls/aria-expanded/tabindex must survive on
  menubar-trigger, navmenu-trigger and command-input.
-->
<script lang="ts">
  import Menubar from '../../src/lib/ui/menubar/menubar.svelte';
  import MenubarItem from '../../src/lib/ui/menubar/menubar-item.svelte';
  import MenubarTrigger from '../../src/lib/ui/menubar/menubar-trigger.svelte';
  import MenubarPanel from '../../src/lib/ui/menubar/menubar-panel.svelte';
  import Command from '../../src/lib/ui/command/command.svelte';
  import CommandInput from '../../src/lib/ui/command/command-input.svelte';
  import CommandList from '../../src/lib/ui/command/command-list.svelte';
  import CommandItem from '../../src/lib/ui/command/command-item.svelte';
</script>

<Menubar label="clobber">
  <MenubarItem id="wire">
    <!-- hostile rest attrs: same names as the derived wire -->
    <MenubarTrigger
      id="consumer-id"
      aria-controls="consumer-controls"
      aria-expanded="false"
      tabindex="9"
    >
      File
    </MenubarTrigger>
    <MenubarPanel>
      <p>panel</p>
    </MenubarPanel>
  </MenubarItem>
</Menubar>

<Command open={true} label="clobber palette">
  <CommandInput id="consumer-input-id" aria-controls="consumer-list" />
  <CommandList>
    <CommandItem label="one" />
  </CommandList>
</Command>
