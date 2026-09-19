<!-- popconfirm blueprint: the light confirm bubble forced shown over its
     trigger ({@attach fromAction(forceShowPopovers)} → showPopover on the popover=auto panel).
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Popconfirm from '$lib/ui/popconfirm/popconfirm.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
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

<Stack direction="column" justify="center" gap="20" class={cx(bpB.popconfirmStage)} } {@attach fromAction(forceShowPopovers)}>
  <Stack direction="column" gap="12" class={cx(bpB.popconfirmSkel)} }>
    <Skeleton class={cx(bpB.popconfirmSkelA)}></Skeleton>
    <Skeleton class={cx(bpB.popconfirmSkelB)}></Skeleton>
  </Stack>
  <Popconfirm
    id="bp-popconfirm"
    title="Delete this row?"
    description="The deploy hook is detached — 12 minutes of logs remain."
    confirmLabel="Delete"
    placement="top"
  >
    <PressButton variant="outline">delete row 3</PressButton>
  </Popconfirm>
</Stack>
