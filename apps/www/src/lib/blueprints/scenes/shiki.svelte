<!-- shiki blueprint: the lib's one consumer surface — a real CodeCard
     with real Shiki token spans in the zero-download jixoai theme
     (css-variables recipe bound to the --tok-* palette). Grammars and
     themes load on demand; the highlight resolves before serialization
     (the pass waits past network-idle), and the same <code> element
     carries the escaped plain fallback until it does.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';

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

  const sample = `import { highlightCode } from '@lib/shiki';

// grammar + theme load on first ask, then cache
const html = await highlightCode(source, {
  lang: 'ts',
  theme: 'jixoai',
});`;
</script>

<div class={cx(bpB.shikiStage)}>
  <CodeCard class={cx(bpB.shikiCard)} filename="highlight.ts" lang="ts" code={sample} />
  <div class={cx(bpB.shikiBadges)}>
    <Badge>on-demand grammars</Badge>
    <Badge>css-variables theme</Badge>
    <Badge>js engine · no wasm</Badge>
  </div>
</div>
