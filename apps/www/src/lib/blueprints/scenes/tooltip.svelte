<!-- tooltip blueprint: the hover-intent tip forced shown on both a
     plain trigger and an icon trigger.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Tooltip from '$lib/ui/tooltip/tooltip.svelte';
  import Kbd from '$lib/ui/kbd/kbd.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { fromAction } from 'svelte/attachments';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
  import { bpB } from '../../surface/blueprints-b.stylex';

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

<div class={cx(bpB.tooltipStage)} {@attach fromAction(forceShowPopovers)}>
  <div class={cx(bpB.tooltipSkel)}>
    <Skeleton class={cx(bpB.tooltipSkelA)}></Skeleton>
    <Skeleton class={cx(bpB.tooltipSkelB)}></Skeleton>
  </div>
  <div class={cx(bpB.tooltipRow)}>
    <Tooltip id="bp-tip-1" text="Run the deploy pipeline" placement="top">
      <span class={cx(bpB.tooltipTrigger)}>deploy</span>
    </Tooltip>
    <Tooltip id="bp-tip-2" text="Keyboard shortcut" placement="top">
      <span class={cx(bpB.tooltipIconFrame)}><Kbd>⌘K</Kbd></span>
    </Tooltip>
  </div>
</div>
