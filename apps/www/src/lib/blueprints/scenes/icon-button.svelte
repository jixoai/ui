<!-- icon-button blueprint: the two variants in one row — a normal
     icon+text button beside two icon-only squares, one tooltip forced
     shown so the "text becomes the tip" law reads in the static pass. -->
<script lang="ts">
  import IconButton from '$lib/ui/icon-button.svelte';
  import Skeleton from '$lib/ui/skeleton.svelte';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
</script>

<div class="flex h-full w-full flex-col justify-center gap-6 p-10" use:forceShowPopovers>
  <div class="flex flex-wrap items-center gap-4">
    <IconButton text="deploy">
      {#snippet icon()}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          class="size-4"
        >
          <path d="m6 3 14 9-14 9Z" />
        </svg>
      {/snippet}
    </IconButton>
    <IconButton variant="icon-only" text="copy command" placement="bottom">
      {#snippet icon()}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          class="size-4"
        >
          <rect width="14" height="14" x="8" y="8" rx="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      {/snippet}
    </IconButton>
    <IconButton variant="icon-only" text="open github" placement="bottom">
      {#snippet icon()}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          class="size-4"
        >
          <path d="M7 17 17 7" />
          <path d="M7 7h10v10" />
        </svg>
      {/snippet}
    </IconButton>
  </div>
  <div class="flex flex-col gap-3 opacity-60">
    <Skeleton class="h-3 w-3/4"></Skeleton>
    <Skeleton class="h-3 w-1/2"></Skeleton>
  </div>
</div>
