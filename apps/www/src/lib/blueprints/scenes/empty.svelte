<!-- empty blueprint: the no-data state with a primary action. -->
<script lang="ts">
  import Empty from '$lib/ui/empty/empty.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
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

<Stack align="center" justify="center" class={cx(bpA.emptyStage)}>
  <Empty density="lg" title="No components yet" description="Add the first one from the registry.">
    {#snippet actions()}
      <PressButton variant="fill">Add component</PressButton>
    {/snippet}
  </Empty>
</Stack>
