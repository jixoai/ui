<!-- highlight blueprint: the CONTRACT the engine matrix plugs into —
     ONE HighlightBackend interface, two output models (markup backends
     write token spans and survive the print freeze; range backends
     paint zero markup via the CSS Custom Highlight API and degrade on
     paper), the zero-dependency HIGHLIGHT_KEY seam, and the
     prop -> context -> app-default resolution lane. The core item
     ships NO engine — the six factories install as their own registry
     items (highlight-shiki is code-card's pinned default). The
     DETECTION lane (highlight-lang-detector, 2026-09-07) is its own
     optional family: lang='auto' runs the three rings (langDetector
     prop -> HIGHLIGHT_DETECT_KEY context -> backend.detector), the DLD
     answers through a four-layer lazy waterfall, and a bare install
     carries zero detector bytes. Terminal diagram idiom; no live
     component (the surface is lib-level). -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const engines = [
    { factory: 'shiki()', model: 'markup' },
    { factory: 'prismjs()', model: 'markup' },
    { factory: 'highlightJs()', model: 'markup' },
    { factory: 'sugarHigh()', model: 'markup' },
    { factory: 'treeSitter()', model: 'markup' },
    { factory: 'microLighter()', model: 'range' },
  ];
  const detection = [
    { factory: 'defaultLangDetector()', model: 'L1->L4 lazy' },
    { factory: 'betlangDetector()', model: 'L4 only' },
    { factory: '<HighlightDetectDefault>', model: 'children' },
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

<div class={cx(bpA.highlightStage)}>
  <div class={cx(bpA.highlightPanel)}>
    <div class={cx(bpA.highlightHead)}>
      <span class={cx(bpA.highlightTitle)}>highlight</span>
      <span class={cx(bpA.highlightSub)}
        >the engine-agnostic contract</span
      >
    </div>
    <div class={cx(bpA.highlightGrid)}>
      <Stack direction="column" gap="4">
        <span class={cx(bpA.highlightColumnLabel)}
          >engine items (lazy-loaded)</span
        >
        {#each engines as engine (engine.factory)}
          <Stack align="baseline" justify="between" gap="12">
            <span class={cx(bpA.highlightEngineName)}>{engine.factory}</span>
            <span
              class={cx(bpA.highlightEngineModel, engine.model === 'range' ? bpA.highlightEngineModelBold : undefined)}>{engine.model}</span
            >
          </Stack>
        {/each}
      </Stack>
      <span class={cx(bpA.highlightArrow)}>-></span>
      <Stack direction="column" gap="4">
        <pre class={cx(bpA.highlightIfaceCode)}>HighlightBackend
  highlight(el, code, opts)</pre>
        <pre class={cx(bpA.highlightIfaceNote)}>seam: HIGHLIGHT_KEY (plain getContext)
resolve: backend prop
  -> context default -> app default</pre>
      </Stack>
    </div>
    <div class={cx(bpA.highlightGrid, bpA.highlightGridDivided)}>
      <Stack direction="column" gap="4">
        <span class={cx(bpA.highlightColumnLabel)}
          >detection items (optional)</span
        >
        {#each detection as detector (detector.factory)}
          <Stack align="baseline" justify="between" gap="12">
            <span class={cx(bpA.highlightEngineName)}>{detector.factory}</span>
            <span class={cx(bpA.highlightEngineModel)}>{detector.model}</span>
          </Stack>
        {/each}
      </Stack>
      <span class={cx(bpA.highlightArrow)}>-></span>
      <Stack direction="column" gap="4">
        <pre class={cx(bpA.highlightIfaceCode)}>lang='auto'
  detect({'{ code, filename }'})</pre>
        <pre class={cx(bpA.highlightIfaceNote)}>rings: langDetector prop
  -> HIGHLIGHT_DETECT_KEY -> backend.detector
null cascades · reject terminal</pre>
      </Stack>
    </div>
    <div class={cx(bpA.highlightFoot)}>
      zero npm deps · zero engine imports ride the core · markup survives print, ranges do not (pin a markup backend for
      paper) · DLD = four-layer waterfall (filename -> shebang -> structure -> betlang), zero detector bytes until a card
      enters auto
    </div>
  </div>
</div>
