<!-- dropdown-menu blueprint: the open menu ({@attach fromAction(forceShowPopovers)} calls
     showPopover() on the popover=auto panel) over muted context rows. -->
<script lang="ts">
  import DropdownMenu from '$lib/ui/dropdown-menu/dropdown-menu.svelte';
  import DropdownMenuItem from '$lib/ui/dropdown-menu/dropdown-menu-item.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { fromAction } from 'svelte/attachments';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

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
</script>

<div class={cx(bpA.dropdownMenuStage)} {@attach fromAction(forceShowPopovers)}>
  <div class={cx(bpA.dropdownMenuMuted)}>
    <Skeleton class={cx(bpA.dropdownMenuSkeletonA)}></Skeleton>
    <Skeleton class={cx(bpA.dropdownMenuSkeletonB)}></Skeleton>
  </div>
  <DropdownMenu id="bp-dropdown-menu" triggerLabel="workspace" placement="bottom-start">
    <DropdownMenuItem>rename workspace</DropdownMenuItem>
    <DropdownMenuItem>invite member</DropdownMenuItem>
    <DropdownMenuItem>transfer ownership</DropdownMenuItem>
    <hr class={cx(bpA.dropdownMenuDivider)} />
    <DropdownMenuItem destructive>delete workspace</DropdownMenuItem>
  </DropdownMenu>
</div>
