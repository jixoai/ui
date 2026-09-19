<!-- hover-card blueprint: the rich peek forced shown under its trigger
     ({@attach fromAction(forceShowPopovers)} → showPopover on the popover=manual panel). -->
<script lang="ts">
  import HoverCard from '$lib/ui/hover-card/hover-card.svelte';
  import Avatar from '$lib/ui/avatar/avatar.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { fromAction } from 'svelte/attachments';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
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
</script>

<div class={cx(bpA.hoverCardStage)} {@attach fromAction(forceShowPopovers)}>
  <div class={cx(bpA.hoverCardMuted)}>
    <Skeleton class={cx(bpA.hoverCardSkeletonA)}></Skeleton>
    <Skeleton class={cx(bpA.hoverCardSkeletonB)}></Skeleton>
  </div>
  <p class={cx(bpA.hoverCardBody)}>
    release 77 was deployed by
    <HoverCard id="bp-hover-card" placement="bottom">
      {#snippet trigger()}
        <a class={cx(bpA.hoverCardTrigger)} href="#bp-hover-card">@grace</a>
      {/snippet}
      <Stack align="start" gap="12">
        <Avatar name="Grace Hopper" size="lg" alt="" />
        <Stack direction="column" gap="4">
          <p class={cx(bpA.hoverCardPeekName)}>Grace Hopper</p>
          <p class={cx(bpA.hoverCardPeekNote)}>
            maintainer · 77 registry items published · last deploy 2h ago
          </p>
        </Stack>
      </Stack>
    </HoverCard>
    — 3 commits ahead of main.
  </p>
</div>
