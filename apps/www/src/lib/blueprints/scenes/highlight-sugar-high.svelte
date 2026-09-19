<!-- highlight-sugar-high blueprint: the MINIMAL engine — ~10KB in the
     TS lane (the matrix's smallest), 29 canonical languages with
     JS/TS/JSX as native strength, highlight(code, { lang }) returns
     the HTML string directly (no DOM dependency). Zero options: the
     engine IS the minimal config (the spec's exemption). Bar lengths
     follow the upstream README baseline (measured on 2.2.2): sugar-high
     9.9KB vs prism 14.6KB vs hljs 29.5KB. Terminal diagram idiom; no
     live component (the surface is lib-level). -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  // bar widths/fills map to REGISTERED atom identities at module scope
  // (the producer law — never dynamic class strings)
  const bars = [
    { label: 'sugar-high', kb: '9.9KB', width: bpA.highlightSugarHighBarW42, fill: bpA.highlightSugarHighBarFillPrimary, bold: true },
    { label: 'prism', kb: '14.6KB', width: bpA.highlightSugarHighBarW62, fill: bpA.highlightSugarHighBarFillMuted, bold: false },
    { label: 'highlight.js', kb: '29.5KB', width: bpA.highlightSugarHighBarW126, fill: bpA.highlightSugarHighBarFillMuted, bold: false },
  ];

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

<div class={cx(bpA.highlightSugarHighStage)}>
  <div class={cx(bpA.highlightSugarHighPanel)}>
    <div class={cx(bpA.highlightSugarHighHead)}>
      <span class={cx(bpA.highlightSugarHighTitle)}>highlight-sugar-high</span>
      <span class={cx(bpA.highlightSugarHighSub)}>the ~10KB engine</span>
    </div>
    <Stack direction="column" gap="4">
      <span class={cx(bpA.highlightSugarHighOutLabel)}>direct output · no DOM dependency</span>
      <Stack align="center" gap="10">
        <span class={cx(bpA.highlightSugarHighOutCode)}>highlight(code, {'{'} lang {'}'})</span>
        <span class={cx(bpA.highlightSugarHighOutArrow)}>-></span>
        <span class={cx(bpA.highlightSugarHighOutChip)}>html string</span>
      </Stack>
    </Stack>
    <Stack direction="column" gap="6">
      <span class={cx(bpA.highlightSugarHighBarsLabel)}
        >bundle weight (upstream README baseline, 2.2.2)</span
      >
      {#each bars as bar (bar.label)}
        <Stack align="center" gap="10">
          <span class={cx(bpA.highlightSugarHighBarLabel, bar.bold ? bpA.highlightSugarHighBarLabelBold : undefined)}>{bar.label}</span>
          <span class={cx(bpA.highlightSugarHighBarTrack, bar.width, bar.fill)}></span>
          <span class={cx(bpA.highlightSugarHighBarValue)}>{bar.kb}</span>
        </Stack>
      {/each}
    </Stack>
    <div class={cx(bpA.highlightSugarHighFoot)}>
      <span>29 canonical languages · JS/TS/JSX native strength · markup output, survives print</span>
      <span>zero options — the engine itself is the minimal config (no langs channel)</span>
    </div>
  </div>
</div>
