<!-- date-picker blueprint: single mode with a committed date — the
     calendar panel forced open on the committed month, the picked day
     filled primary ({@attach fromAction(forceShowPopovers)}). -->
<script lang="ts">
  import DatePicker from '$lib/ui/date-picker/date-picker.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { fromAction } from 'svelte/attachments';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  // a month away from "today" keeps the today ring out of the frame —
  // the panel view follows the committed value, not the clock
  let deploy = $state('2026-03-18');

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

<Stack direction="column" justify="center" gap="20" class={cx(bpA.datePickerStage)} } {@attach fromAction(forceShowPopovers)}>
  <Stack direction="column" gap="12" class={cx(bpA.datePickerMuted)} }>
    <Skeleton class={cx(bpA.datePickerSkeletonA)}></Skeleton>
    <Skeleton class={cx(bpA.datePickerSkeletonB)}></Skeleton>
  </Stack>
  <div class={cx(bpA.datePickerFrame)}>
    <DatePicker id="bp-date" label="deploy date" bind:value={deploy} />
  </div>
</Stack>
