<!-- highlight-highlightjs blueprint: the flagship VOLUME channel —
     lib/core with zero languages bundled, then registerLanguage() per
     need (register ONLY what you ship; highlightJs({ langs }) defaults
     to the curated set, an instance allowlist never the shared
     registry). hljs 11.12 ships NO tsx/jsx/svelte/vue — those reject
     with a use-shiki hint. The jixoai theme maps hljs-* classes to
     --tok-* in item CSS (zero download). Terminal diagram idiom; no
     live component (the surface is lib-level). -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  const core = ['lib/core', '(no languages inside)', '+ registerLanguage', 'ts · js · css · bash'];
  const gap = ['tsx · jsx', 'svelte · vue', '-> reject', 'use shiki'];

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

<div class={cx(bpA.highlightHighlightjsStage)}>
  <div class={cx(bpA.highlightHighlightjsPanel)}>
    <div class={cx(bpA.highlightHighlightjsHead)}>
      <span class={cx(bpA.highlightHighlightjsTitle)}>highlight-highlightjs</span>
      <span class={cx(bpA.highlightHighlightjsSub)}>core + selective registration</span>
    </div>
    <div class={cx(bpA.highlightHighlightjsBoard)}>
      <div class={cx(bpA.highlightHighlightjsCard)}>
        {#each core as line, i (line)}
          <span class={cx(bpA.highlightHighlightjsCardLine, i === 0 ? bpA.highlightHighlightjsCardLineBold : undefined)}>{line}</span>
        {/each}
        <span class={cx(bpA.highlightHighlightjsCardNote)}>register ONLY what you ship</span>
      </div>
      <div class={cx(bpA.highlightHighlightjsGapCard)}>
        <span class={cx(bpA.highlightHighlightjsGapLabel)}>not in hljs 11.12</span>
        {#each gap as line (line)}
          <span class={cx(bpA.highlightHighlightjsGapLine)}>{line}</span>
        {/each}
      </div>
    </div>
    <div class={cx(bpA.highlightHighlightjsFoot)}>
      <span>markup output · survives print · hljs-* classes map to --tok-* (zero download)</span>
      <span>highlightJs({'{'} langs {'}'}) = the flagship slim channel vs the full bundle</span>
    </div>
  </div>
</div>
