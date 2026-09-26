<!-- highlight-shiki blueprint: the DEFAULT engine of the matrix — the
     shiki() adapter over lib/shiki, zero new downloads. Grammars and
     themes load on demand as lazy chunks (cache after first ask); the
     default jixoai theme is the css-variables recipe bound to --tok-*
     (zero download). Markup output: real token spans, survives the
     print freeze. shiki({ langs }) slims one instance without touching
     the shared facade registry. Terminal diagram idiom; no live
     component (the surface is lib-level). -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const lazy = ['grammar · ts.textmate', 'theme · css-variables', 'jixoai: --tok-* recipe'];
  const spans = ['<span', '  class="tok-kw">', '  const', '</span>'];

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

<Stack align="center" justify="center" class={cx(bpA.highlightShikiStage)}>
  <Stack direction="column" gap="12" class={cx(bpA.highlightShikiPanel)} }>
    <Stack align="center" justify="between" class={cx(bpA.highlightShikiHead)} }>
      <span class={cx(bpA.highlightShikiTitle)}>highlight-shiki</span>
      <span class={cx(bpA.highlightShikiSub)}>the default engine</span>
    </Stack>
    <Stack align="center" gap="12">
      <Stack direction="column" gap="4" class={cx(bpA.highlightShikiLazyCol)}>
        <span class={cx(bpA.highlightShikiColLabel)}>on demand (lazy chunk)</span>
        {#each lazy as line (line)}
          <span class={cx(bpA.highlightShikiLazyLine)}>{line}</span>
        {/each}
      </Stack>
      <span class={cx(bpA.highlightShikiArrow)}>-></span>
      <Stack direction="column" gap="4" class={cx(bpA.highlightShikiAdapterCard)} }>
        <span class={cx(bpA.highlightShikiAdapterTitle)}>shiki()</span>
        <span class={cx(bpA.highlightShikiAdapterLine)}>highlight(el, code,</span>
        <span class={cx(bpA.highlightShikiAdapterLine)}>{'  { lang, theme })'}</span>
        <span class={cx(bpA.highlightShikiCardNote)}>DEFAULT_SHIKI_BACKEND · the stock singleton</span>
      </Stack>
      <span class={cx(bpA.highlightShikiArrow)}>-></span>
      <Stack direction="column" gap="4" class={cx(bpA.highlightShikiOutCol)}>
        <span class={cx(bpA.highlightShikiColLabel)}>markup output</span>
        {#each spans as line (line)}
          <span class={cx(bpA.highlightShikiOutLine)}>{line}</span>
        {/each}
      </Stack>
    </Stack>
    <Stack direction="column" class={cx(bpA.highlightShikiFoot)} }>
      <span>TextMate-grade accuracy · markup survives print · code-card's pinned default</span>
      <span>shiki({'{'} langs {'}'}) slims the instance — an allowlist, never the shared registry</span>
    </Stack>
  </Stack>
</Stack>
