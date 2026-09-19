<!-- tour blueprint: step 1 of 2 running against real targets in the
     scene — the anchor-name lease lands on the first row, the popover=manual
     panel shows itself on open (forceShowPopovers backs it up), and the
     box-shadow hole tints around the target.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Tour from '$lib/ui/tour/tour.svelte';
  import type { TourStep } from '$lib/ui/tour/tour.svelte';
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

  const steps: TourStep[] = [
    {
      target: '#bp-tour-workspace',
      title: 'the workspace',
      description: 'every deploy and registry publish runs from here.',
    },
    {
      target: '#bp-tour-hue',
      title: 'the brand hue',
      description: 'one CSS variable paints the whole site.',
    },
  ];
</script>

<Stack direction="column" align="start" justify="center" class={cx(bpB.tourStage)} } {@attach fromAction(forceShowPopovers)}>
  <Stack direction="column" gap="16" class={cx(bpB.tourCard)} }>
    <Stack id="bp-tour-workspace" direction="column" gap="4" }>
      <p class={cx(bpB.tourLabel)}>workspace</p>
      <p class={cx(bpB.tourValue)}>jixoai-labs/ui</p>
    </Stack>
    <Stack id="bp-tour-hue" direction="column" gap="4" }>
      <p class={cx(bpB.tourLabel)}>brand hue</p>
      <p class={cx(bpB.tourValue)}>oklch(0.72 0.16 27)</p>
    </Stack>
  </Stack>
  <Tour {steps} open={true} startAt={0} />
</Stack>
