<!-- popover blueprint: anchored panel forced shown (use:forceShowPopovers
     calls showPopover() on every [popover] in the subtree). -->
<script lang="ts">
  import Popover from '$lib/ui/popover.svelte';
  import Skeleton from '$lib/ui/skeleton.svelte';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
</script>

<div class="flex h-full w-full flex-col justify-center gap-5 p-10" use:forceShowPopovers>
  <div class="flex flex-col gap-3 opacity-60">
    <Skeleton class="h-3 w-3/4"></Skeleton>
    <Skeleton class="h-3 w-2/3"></Skeleton>
  </div>
  <Popover id="bp-popover" triggerLabel="Share">
    <p class="text-sm">Link copied to the clipboard — visible to anyone with the URL.</p>
  </Popover>
</div>
