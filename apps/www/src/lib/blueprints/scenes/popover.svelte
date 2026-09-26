<!-- popover blueprint: anchored panel forced shown
     ({@attach fromAction(forceShowPopovers)} calls showPopover() on
     every [popover] in the subtree).
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Popover from '$lib/ui/popover/popover.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { fromAction } from 'svelte/attachments';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
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
</script>

<Stack direction="column" justify="center" gap="20" class={cx(bpB.popoverStage)} } {@attach fromAction(forceShowPopovers)}>
  <Stack direction="column" gap="12" class={cx(bpB.popoverSkel)} }>
    <Skeleton class={cx(bpB.popoverSkelA)}></Skeleton>
    <Skeleton class={cx(bpB.popoverSkelB)}></Skeleton>
  </Stack>
  <Popover id="bp-popover" triggerLabel="Share">
    <p class={cx(bpB.popoverBody)}>Link copied to the clipboard — visible to anyone with the URL.</p>
  </Popover>
</Stack>
