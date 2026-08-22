<!-- hover-card blueprint: the rich peek forced shown under its trigger
     (use:forceShowPopovers → showPopover on the popover=manual panel). -->
<script lang="ts">
  import HoverCard from '$lib/ui/hover-card.svelte';
  import Avatar from '$lib/ui/avatar.svelte';
  import Skeleton from '$lib/ui/skeleton.svelte';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
</script>

<div class="flex h-full w-full flex-col justify-center gap-6 p-10" use:forceShowPopovers>
  <div class="flex flex-col gap-3 opacity-60">
    <Skeleton class="h-3 w-3/4"></Skeleton>
    <Skeleton class="h-3 w-1/2"></Skeleton>
  </div>
  <p class="text-sm leading-6">
    release 77 was deployed by
    <HoverCard id="bp-hover-card" placement="bottom">
      {#snippet trigger()}
        <a class="font-medium underline decoration-dotted underline-offset-4" href="#bp-hover-card">@grace</a>
      {/snippet}
      <div class="flex items-start gap-3">
        <Avatar name="Grace Hopper" size="lg" alt="" />
        <div class="flex flex-col gap-1">
          <p class="text-sm font-medium">Grace Hopper</p>
          <p class="text-muted-foreground text-xs leading-5">
            maintainer · 77 registry items published · last deploy 2h ago
          </p>
        </div>
      </div>
    </HoverCard>
    — 3 commits ahead of main.
  </p>
</div>
