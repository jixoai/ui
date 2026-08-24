<!-- shiki blueprint: the lib's one consumer surface — a real CodeCard
     with real Shiki token spans in the zero-download jixoai theme
     (css-variables recipe bound to the --tok-* palette). Grammars and
     themes load on demand; the highlight resolves before serialization
     (the pass waits past network-idle), and the same <code> element
     carries the escaped plain fallback until it does. -->
<script lang="ts">
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';

  const sample = `import { highlightCode } from '@lib/shiki';

// grammar + theme load on first ask, then cache
const html = await highlightCode(source, {
  lang: 'ts',
  theme: 'jixoai',
});`;
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
  <CodeCard class="w-full max-w-[520px]" filename="highlight.ts" lang="ts" code={sample} />
  <div class="flex flex-wrap gap-2">
    <Badge tone="primary">on-demand grammars</Badge>
    <Badge>css-variables theme</Badge>
    <Badge>js engine · no wasm</Badge>
  </div>
</div>
