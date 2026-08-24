<!-- dropdown-menu blueprint: the open menu (use:forceShowPopovers calls
     showPopover() on the popover=auto panel) over muted context rows. -->
<script lang="ts">
  import DropdownMenu from '$lib/ui/dropdown-menu/dropdown-menu.svelte';
  import DropdownMenuItem from '$lib/ui/dropdown-menu/dropdown-menu-item.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
</script>

<div class="flex h-full w-full flex-col justify-center gap-5 p-10" use:forceShowPopovers>
  <div class="flex flex-col gap-3 opacity-60">
    <Skeleton class="h-3 w-2/3"></Skeleton>
    <Skeleton class="h-3 w-1/2"></Skeleton>
  </div>
  <DropdownMenu id="bp-dropdown-menu" triggerLabel="workspace" placement="bottom-start">
    <DropdownMenuItem>rename workspace</DropdownMenuItem>
    <DropdownMenuItem>invite member</DropdownMenuItem>
    <DropdownMenuItem>transfer ownership</DropdownMenuItem>
    <hr class="border-border my-1" />
    <DropdownMenuItem destructive>delete workspace</DropdownMenuItem>
  </DropdownMenu>
</div>
