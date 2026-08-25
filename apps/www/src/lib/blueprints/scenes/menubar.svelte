<!-- menubar blueprint: the application bar with the File menu open.
     The panels are popover=manual — forceShowPopovers would open ALL of
     them, so a targeted showPopover() on mount opens exactly one (the
     same mechanism force-show.ts itself uses). (composition-first-apis
     2026-08-25: Item/Trigger/Panel parts replace the items[] data +
     keyed panel snippet; the raw menuitem buttons stay verbatim.) -->
<script lang="ts">
  import Menubar from '$lib/ui/menubar/menubar.svelte';
  import MenubarItem from '$lib/ui/menubar/menubar-item.svelte';
  import MenubarTrigger from '$lib/ui/menubar/menubar-trigger.svelte';
  import MenubarPanel from '$lib/ui/menubar/menubar-panel.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    const panel = document.getElementById('file-panel') as
      | (HTMLElement & { showPopover?(): void })
      | null;
    try {
      panel?.showPopover?.();
    } catch {
      // already showing / not yet connected — nothing to do
    }
  });
</script>

<div class="flex h-full w-full flex-col justify-center gap-8 p-10">
  <div class="flex flex-col gap-3 opacity-60">
    <Skeleton class="h-3 w-2/3"></Skeleton>
    <Skeleton class="h-3 w-1/2"></Skeleton>
  </div>
  <Menubar label="app">
    <MenubarItem id="file">
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarPanel>
        <div class="flex min-w-40 flex-col">
          <button type="button" role="menuitem" class="hover:bg-muted px-2.5 py-1 text-left text-[13px]">
            new workspace
          </button>
          <button type="button" role="menuitem" class="hover:bg-muted px-2.5 py-1 text-left text-[13px]">
            open registry…
          </button>
          <button type="button" role="menuitem" class="hover:bg-muted px-2.5 py-1 text-left text-[13px]">
            export snapshot
          </button>
        </div>
      </MenubarPanel>
    </MenubarItem>
    <MenubarItem id="edit">
      <MenubarTrigger>Edit</MenubarTrigger>
      <MenubarPanel>
        <div class="flex min-w-40 flex-col">
          <button type="button" role="menuitem" class="hover:bg-muted px-2.5 py-1 text-left text-[13px]">
            rename
          </button>
          <button type="button" role="menuitem" class="hover:bg-muted px-2.5 py-1 text-left text-[13px]">
            duplicate
          </button>
        </div>
      </MenubarPanel>
    </MenubarItem>
    <MenubarItem id="view">
      <MenubarTrigger>View</MenubarTrigger>
      <MenubarPanel>
        <div class="flex min-w-40 flex-col">
          <button type="button" role="menuitem" class="hover:bg-muted px-2.5 py-1 text-left text-[13px]">
            toggle tree
          </button>
          <button type="button" role="menuitem" class="hover:bg-muted px-2.5 py-1 text-left text-[13px]">
            split editor
          </button>
        </div>
      </MenubarPanel>
    </MenubarItem>
  </Menubar>
</div>
