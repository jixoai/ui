<!-- highlight-lang-detector blueprint: the DLD default detector — a
     FOUR-layer waterfall where every layer is its own lazy module (a
     hit short-circuits; the deeper layers never load a byte). L1
     filename tables, L2 shebang/modeline, L3 Markdown-guarded
     structural probes (never a programming fingerprint), L4 betlang
     statistics (wasm via @jixoai/ui-betlang-wasm, ?url in the browser,
     real bytes under vitest). lang-canonical.ts is the authority every
     layer derives from. 'Four layers' counts the waterfall only — the
     card's detection rings stay three. betlangDetector() is L4
     standalone. Terminal diagram idiom; no live component (the
     surface is lib-level). -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const layers = [
    { id: 'L1', name: 'filename', reads: 'ext + basename tables', out: 'typescript' },
    { id: 'L2', name: 'shebang', reads: 'interp + modeline', out: 'python' },
    { id: 'L3', name: 'structure', reads: 'json/svg/yaml/toml probes', out: 'json' },
    { id: 'L4', name: 'statistical', reads: 'betlang wasm · 48 labels', out: 'rust 0.97' },
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

<Stack align="center" justify="center" class={cx(bpA.highlightLangDetectorStage)}>
  <Stack direction="column" gap="12" class={cx(bpA.highlightLangDetectorPanel)} }>
    <Stack align="center" justify="between" class={cx(bpA.highlightLangDetectorHead)} }>
      <span class={cx(bpA.highlightLangDetectorTitle)}>highlight-lang-detector</span>
      <span class={cx(bpA.highlightLangDetectorSub)}>the DLD waterfall</span>
    </Stack>
    <Stack direction="column" gap="4">
      {#each layers as layer (layer.id)}
        <Stack align="baseline" gap="12">
          <span class={cx(bpA.highlightLangDetectorLayerId)}>{layer.id}</span>
          <span class={cx(bpA.highlightLangDetectorLayerName)}>{layer.name}</span>
          <span class={cx(bpA.highlightLangDetectorLayerReads)}>{layer.reads}</span>
          <span class={cx(bpA.highlightLangDetectorLayerOut)}>{'->'} {layer.out}</span>
        </Stack>
      {/each}
      <span class={cx(bpA.highlightLangDetectorLayersNote)}>hit short-circuits · every layer its own lazy module · miss falls through</span>
    </Stack>
    <Stack direction="column" class={cx(bpA.highlightLangDetectorFoot)} }>
      <span>detect({'{ code, filename }'}) -> {'{ lang, source, confidence? }'} · null = no opinion (cascade)</span>
      <span>framework-free · wasm rides @jixoai/ui-betlang-wasm (npm, betlang =0.1.1)</span>
      <span>optional capability: a bare code-card install carries zero DLD bytes</span>
    </Stack>
  </Stack>
</Stack>
