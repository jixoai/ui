<!-- stack blueprint (the Layout family, 2026-09-18): the flow
     primitive over the typed space ladder — three rungs in a row
     column, and the edge-packed toolbar shape. The scene composes the
     component itself (the adoption lane's proof). -->
<script lang="ts">
  import Stack from '$lib/ui/stack';
  import type { StackGap } from '$lib/ui/stack';
  import { bpB } from '$lib/surface/blueprints-b.stylex';

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

<Stack direction="column" justify="center" gap="24" class={cx(bpB.stackStage)}>
  {#each [['4', 'rung 4 · --jx-space-4'], ['12', 'rung 12 · --jx-space-12'], ['24', 'rung 24 · --jx-space-24']] as [rung, label]}
    <Stack direction="column" gap="4">
      <span class={cx(bpB.stackLabel)}>{label}</span>
      <Stack gap={rung as StackGap} align="center">
        <span class={cx(bpB.stackCell)}>cell</span>
        <span class={cx(bpB.stackCell)}>cell</span>
        <span class={cx(bpB.stackCell)}>cell</span>
      </Stack>
    </Stack>
  {/each}
  <Stack justify="between" class={cx(bpB.stackBar)}>
    <span class={cx(bpB.stackBarTitle)}>justify between — edge packing</span>
    <span class={cx(bpB.stackCell)}>actions</span>
  </Stack>
</Stack>
