<!-- progressive-blur blueprint: the docs-rail composition — a scrolling
     list whose top edge diffuses. Satori paints no backdrop-filter, so
     the band is simulated as stacked translucent runs (the ladder
     schematic: lighter inner edge → denser at the scrollport edge) with
     the real component present for structure.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms; the
     opacity ladder rides ternary atoms in the cx slot, the gradient
     runs ride color-mix stops at Tailwind's own oklab interpolation.) -->
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

  const rows = [
    'accordion', 'alert', 'anchor', 'avatar', 'badge', 'card-grid',
    'carousel', 'checkbox', 'combobox', 'command', 'dialog', 'popover',
  ];
</script>

<Stack align="center" justify="center" gap="40" class={cx(bpB.progressiveBlurStage)}>
  <Stack direction="column" gap="8" class={cx(bpB.progressiveBlurRail)}>
    <span class={cx(bpB.progressiveBlurLabel)}
      >the docs rail · same-layer sticky</span
    >
    <div class={cx(bpB.progressiveBlurPort)}>
      <Stack direction="column" class={cx(bpB.progressiveBlurList)} }>
        {#each rows as row, i (row)}
          <div
            class={cx(bpB.progressiveBlurRow, i === 0 || i === 1 ? bpB.progressiveBlurRowDim : bpB.progressiveBlurRowLift)}
          >
            {row}
          </div>
        {/each}
      </Stack>
      <!-- the ladder schematic: translucent runs stacking toward the edge -->
      <div class={cx(bpB.progressiveBlurBand)}>
        <div class={cx(bpB.progressiveBlurRun95)}></div>
        <div class={cx(bpB.progressiveBlurRun80)}></div>
        <div class={cx(bpB.progressiveBlurRun60)}></div>
        <div class={cx(bpB.progressiveBlurRun40)}></div>
      </div>
      <span class={cx(bpB.progressiveBlurCaption)}
        >0.5 → 64px · reveal on scroll</span
      >
    </div>
  </Stack>
</Stack>
