<!-- scroll-area blueprint: the family after the 2026-09-15 rework — one
     hand-drawn law + a platform sibling on the shared kit. Left: the
     styled component — ALWAYS hand-drawn (capsule thumb, full radius,
     the scrollbar-token law's currentColor family; idle-fades with the
     four auto-hide pins). Right: the native-scroll-area sibling — zero
     drawn chrome, the platform bar under the same token law with the
     packaged capability styles (stable gutter, scoped color-scheme).
     (tailwindless BP-B 2026-09-16: utilities → surface atoms; the
     row opacity ladder rides ternary atoms in the cx slot.) -->
<script lang="ts">
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

  const rows = ['layout shell', 'release notes', 'terminal log', 'data table', 'command palette'];
</script>

<Stack align="center" justify="center" gap="40" class={cx(bpB.scrollAreaStage)}>
  <!-- the hand-drawn law (scroll-area) -->
  <Stack direction="column" gap="8" class={cx(bpB.scrollAreaRail)}>
    <span class={cx(bpB.scrollAreaLabel)}
      >scroll-area · hand-drawn, always</span
    >
    <div class={cx(bpB.scrollAreaPort)}>
      <Stack direction="column" class={cx(bpB.scrollAreaListPad)} }>
        {#each rows as row, i (row)}
          <div
            class={cx(bpB.scrollAreaRow, i === 2 ? bpB.scrollAreaRowLit : bpB.scrollAreaRowDim)}
          >
            {row}
          </div>
        {/each}
      </Stack>
      <!-- the capsule thumb — full radius over full-width content -->
      <div class={cx(bpB.scrollAreaThumb)}></div>
      <span class={cx(bpB.scrollAreaCaption)}
        >capsule · idle fade · the four pins</span
      >
    </div>
  </Stack>

  <!-- the platform sibling (native-scroll-area) -->
  <Stack direction="column" gap="8" class={cx(bpB.scrollAreaRail)}>
    <span class={cx(bpB.scrollAreaLabel)}
      >native-scroll-area · the platform bar</span
    >
    <div class={cx(bpB.scrollAreaPort)}>
      <Stack direction="column" class={cx(bpB.scrollAreaListSlim)} }>
        {#each rows as row, i (row)}
          <div
            class={cx(bpB.scrollAreaRow, i === 2 ? bpB.scrollAreaRowLit : bpB.scrollAreaRowFaint)}
          >
            {row}
          </div>
        {/each}
      </Stack>
      <!-- the platform bar + the mirrored reserved gutter -->
      <div class={cx(bpB.scrollAreaBar)}></div>
      <div class={cx(bpB.scrollAreaGutter)}></div>
      <span class={cx(bpB.scrollAreaCaption)}
        >stable gutter · scoped scheme · no drawn chrome</span
      >
    </div>
  </Stack>
</Stack>
