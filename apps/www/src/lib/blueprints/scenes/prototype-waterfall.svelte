<!-- prototype-waterfall blueprint (the prototype family, 2026-09-17):
     CSS columns, verbatim — the balanced v0 strategy, the masonry
     lane for schematic mockups. -->
<script lang="ts">
  import PrototypeWaterfall from '$lib/ui/prototype-waterfall';
  import Stack from '$lib/ui/stack';
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

<Stack direction="column" justify="center" gap="12" class={cx(bpB.prototypeWaterfallStage)}>
  <span class={cx(bpB.prototypeWaterfallLabel)}
    >columns={3} gap={12} strategy="balanced" — CSS columns, browser-equalized</span
  >
  <PrototypeWaterfall columns={3} gap={12} strategy="balanced">
    {#each [['release notes', 3], ['layout shell', 5], ['terminal log', 2], ['data table', 4], ['command palette', 2], ['search corpus', 3]] as [title, lines]}
      <div class={cx(bpB.prototypeWaterfallCard)}>
        <span class={cx(bpB.prototypeWaterfallTitle)}>{title}</span>
        {#each Array(lines) as _, i}
          <span class={cx(bpB.prototypeWaterfallLine)}>line {i + 1}</span>
        {/each}
      </div>
    {/each}
  </PrototypeWaterfall>
</Stack>
