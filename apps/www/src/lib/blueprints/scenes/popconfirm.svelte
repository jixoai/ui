<!-- popconfirm blueprint: the light confirm bubble forced shown over its
     trigger (use:forceShowPopovers → showPopover on the popover=auto panel). -->
<script lang="ts">
  import Popconfirm from '$lib/ui/popconfirm/popconfirm.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
</script>

<div class="flex h-full w-full flex-col justify-center gap-5 p-10" use:forceShowPopovers>
  <div class="flex flex-col gap-3 opacity-60">
    <Skeleton class="h-3 w-3/4"></Skeleton>
    <Skeleton class="h-3 w-1/2"></Skeleton>
  </div>
  <Popconfirm
    id="bp-popconfirm"
    title="Delete this row?"
    description="The deploy hook is detached — 12 minutes of logs remain."
    confirmLabel="Delete"
    placement="top"
  >
    <PressButton variant="outline">delete row 3</PressButton>
  </Popconfirm>
</div>
