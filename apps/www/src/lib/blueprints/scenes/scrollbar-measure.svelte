<!-- scrollbar-measure blueprint: the shadow-DOM probe. Left: the invisible
     measurement chamber (offscreen probes under thin/auto); right: the CSS
     variables it publishes on :root. Composed as representative HTML — the
     probe itself is display-none chrome with no box of its own.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
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

  const widths = [
    { key: '--jx-scrollbar-thin', value: '11px', note: 'macOS classic · thin' },
    { key: '--jx-scrollbar-auto', value: '15px', note: 'default-width lane' },
    { key: 'overlay systems', value: '0px', note: 'nothing reserved — compensation degrades to authored padding' },
  ];
</script>

<Stack align="center" justify="center" gap="40" class={cx(bpB.scrollbarMeasureStage)}>
  <!-- the measurement chamber -->
  <div class={cx(bpB.scrollbarMeasureChamber)}>
    <span class={cx(bpB.scrollbarMeasureLabel)}
      >jx-scrollbar-measure · shadow dom</span
    >
    <div class={cx(bpB.scrollbarMeasureRow)}>
      <div class={cx(bpB.scrollbarMeasureCell)}>
        <span class={cx(bpB.scrollbarMeasureCellLabel)}>thin</span>
        <div class={cx(bpB.scrollbarMeasureThinBar)}></div>
        <div class={cx(bpB.scrollbarMeasureRulerNarrow)}></div>
      </div>
      <div class={cx(bpB.scrollbarMeasureCell)}>
        <span class={cx(bpB.scrollbarMeasureCellLabel)}>auto</span>
        <div class={cx(bpB.scrollbarMeasureAutoBar)}></div>
        <div class={cx(bpB.scrollbarMeasureRulerWide)}></div>
      </div>
    </div>
    <span class={cx(bpB.scrollbarMeasureCaption)}
      >offsetWidth − clientWidth</span
    >
  </div>

  <!-- the published variables -->
  <Stack direction="column" gap="12" class={cx(bpB.scrollbarMeasureVars)}>
    <span class={cx(bpB.scrollbarMeasureVarsLabel)}
      >:root inline style · one-shot, then removed</span
    >
    {#each widths as row (row.key)}
      <div class={cx(bpB.scrollbarMeasureVarRow)}>
        <code class={cx(bpB.scrollbarMeasureVarKey)}>{row.key}</code>
        <code class={cx(bpB.scrollbarMeasureVarValue)}>{row.value}</code>
      </div>
      <span class={cx(bpB.scrollbarMeasureVarNote)}>{row.note}</span>
    {/each}
  </Stack>
</Stack>
