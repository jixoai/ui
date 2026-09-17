<!-- icon-button blueprint: the two variants in one row — a normal
     icon+text button beside two icon-only squares, one tooltip forced
     shown so the "text becomes the tip" law reads in the static pass. -->
<script lang="ts">
  import IconButton from '$lib/ui/icon-button/icon-button.svelte';
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

<div class={cx(bpA.iconButtonStage)} {@attach fromAction(forceShowPopovers)}>
  <div class={cx(bpA.iconButtonRow)}>
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
          class={cx(bpA.iconButtonIcon)}
        >
          <path d="m6 3 14 9-14 9Z" />
        </svg>
      {/snippet}
    </IconButton>
    <IconButton iconOnly text="copy command" placement="bottom">
      {#snippet icon()}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          class={cx(bpA.iconButtonIcon)}
        >
          <rect width="14" height="14" x="8" y="8" rx="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      {/snippet}
    </IconButton>
    <IconButton iconOnly text="open github" placement="bottom">
      {#snippet icon()}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          class={cx(bpA.iconButtonIcon)}
        >
          <path d="M7 17 17 7" />
          <path d="M7 7h10v10" />
        </svg>
      {/snippet}
    </IconButton>
  </div>
  <div class={cx(bpA.iconButtonMuted)}>
    <Skeleton class={cx(bpA.iconButtonSkeletonA)}></Skeleton>
    <Skeleton class={cx(bpA.iconButtonSkeletonB)}></Skeleton>
  </div>
</div>
