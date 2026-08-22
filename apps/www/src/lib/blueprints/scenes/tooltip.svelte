<!-- tooltip blueprint: the hover-intent tip forced shown on both a
     plain trigger and an icon trigger. -->
<script lang="ts">
  import Tooltip from '$lib/ui/tooltip.svelte';
  import Kbd from '$lib/ui/kbd.svelte';
  import Skeleton from '$lib/ui/skeleton.svelte';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
</script>

<div class="flex h-full w-full flex-col justify-center gap-6 p-10" use:forceShowPopovers>
  <div class="flex flex-col gap-3 opacity-60">
    <Skeleton class="h-3 w-1/2"></Skeleton>
    <Skeleton class="h-3 w-2/3"></Skeleton>
  </div>
  <div class="flex items-center gap-6">
    <Tooltip id="bp-tip-1" text="Run the deploy pipeline" placement="top">
      <span class="border-border bg-background text-sm shadow-xs inline-flex border px-3.5 py-2.5">deploy</span>
    </Tooltip>
    <Tooltip id="bp-tip-2" text="Keyboard shortcut" placement="top">
      <span class="inline-flex"><Kbd>⌘K</Kbd></span>
    </Tooltip>
  </div>
</div>
