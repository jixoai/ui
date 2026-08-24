<!-- tour blueprint: step 1 of 2 running against real targets in the
     scene — the anchor-name lease lands on the first row, the popover=manual
     panel shows itself on open (forceShowPopovers backs it up), and the
     box-shadow hole tints around the target. -->
<script lang="ts">
  import Tour from '$lib/ui/tour/tour.svelte';
  import type { TourStep } from '$lib/ui/tour/tour.svelte';
  import { forceShowPopovers } from '$lib/blueprints/force-show';

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

<div class="flex h-full w-full flex-col items-start justify-center p-10" use:forceShowPopovers>
  <div class="flex w-full max-w-[420px] flex-col gap-4 border border-border bg-card p-5">
    <div id="bp-tour-workspace" class="flex flex-col gap-1">
      <p class="font-mono text-xs text-muted-foreground">workspace</p>
      <p class="text-sm font-medium">jixoai-labs/ui</p>
    </div>
    <div id="bp-tour-hue" class="flex flex-col gap-1">
      <p class="font-mono text-xs text-muted-foreground">brand hue</p>
      <p class="text-sm font-medium">oklch(0.72 0.16 27)</p>
    </div>
  </div>
  <Tour {steps} open={true} startAt={0} />
</div>
