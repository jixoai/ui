<!-- menubar blueprint: the application bar with the File menu open.
     The panels are popover=manual — forceShowPopovers would open ALL of
     them, so a targeted showPopover() on mount opens exactly one (the
     same mechanism force-show.ts itself uses). (composition-first-apis
     2026-08-25: Item/Trigger/Panel parts replace the items[] data +
     keyed panel snippet; the raw menuitem buttons stay verbatim.
     tailwindless BP-B 2026-09-16: utilities → surface atoms, the
     hover wash a pseudo value object on the item atom.) -->
<script lang="ts">
  import Menubar from '$lib/ui/menubar/menubar.svelte';
  import MenubarItem from '$lib/ui/menubar/menubar-item.svelte';
  import MenubarTrigger from '$lib/ui/menubar/menubar-trigger.svelte';
  import MenubarPanel from '$lib/ui/menubar/menubar-panel.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { onMount } from 'svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

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

<Stack direction="column" justify="center" gap="32" class={cx(bpB.menubarStage)}>
  <Stack direction="column" gap="12" class={cx(bpB.menubarSkel)} }>
    <Skeleton class={cx(bpB.menubarSkelA)}></Skeleton>
    <Skeleton class={cx(bpB.menubarSkelB)}></Skeleton>
  </Stack>
  <Menubar label="app">
    <MenubarItem id="file">
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarPanel>
        <Stack direction="column" class={cx(bpB.menubarPanel)} }>
          <button type="button" role="menuitem" class={cx(bpB.menubarItem)}>
            new workspace
          </button>
          <button type="button" role="menuitem" class={cx(bpB.menubarItem)}>
            open registry…
          </button>
          <button type="button" role="menuitem" class={cx(bpB.menubarItem)}>
            export snapshot
          </button>
        </Stack>
      </MenubarPanel>
    </MenubarItem>
    <MenubarItem id="edit">
      <MenubarTrigger>Edit</MenubarTrigger>
      <MenubarPanel>
        <Stack direction="column" class={cx(bpB.menubarPanel)} }>
          <button type="button" role="menuitem" class={cx(bpB.menubarItem)}>
            rename
          </button>
          <button type="button" role="menuitem" class={cx(bpB.menubarItem)}>
            duplicate
          </button>
        </Stack>
      </MenubarPanel>
    </MenubarItem>
    <MenubarItem id="view">
      <MenubarTrigger>View</MenubarTrigger>
      <MenubarPanel>
        <Stack direction="column" class={cx(bpB.menubarPanel)} }>
          <button type="button" role="menuitem" class={cx(bpB.menubarItem)}>
            toggle tree
          </button>
          <button type="button" role="menuitem" class={cx(bpB.menubarItem)}>
            split editor
          </button>
        </Stack>
      </MenubarPanel>
    </MenubarItem>
  </Menubar>
</Stack>
