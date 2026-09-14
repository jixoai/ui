<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { demo } from '../demo.stylex';
  import CodeCard from '../families/code-card/code-card.svelte';

  const SAMPLE = `// the scroll law: horizontal ALWAYS (tabs stay tabs, long lines never wrap)
export function hubulate(seed: number, opts: { stride: number; label: string; deep?: (v: number) => boolean }): number[] {
  const out: number[] = [];        // the veil host fades the edges only where more content sits
  for (let i = 0; i < 40; i++) out.push((seed * i * opts.stride) % 97);
  return out.filter((v) => (opts.deep ? opts.deep(v) : v > 0)).map((v) => v + 1);
}`;
</script>

<h1 {...stylex.attrs(demo.title)}>code-card — readonly code surface</h1>
<p {...stylex.attrs(demo.note)}>
  Card/head/foot paint + fill/vscroll branches + the subtraction-ink edge veils
  (StyleX-side); the --tok palette keeps its ancestor-scoped .dark adaptations in the
  css residue. Scroll the long line — the veils appear only where more content sits.
</p>

<section {...stylex.attrs(demo.section)} data-cc-section="basic">
  <h2 {...stylex.attrs(demo.sectionTitle)}>the card (head + scrollport + copy)</h2>
  <CodeCard code={SAMPLE} lang="ts" filename="hub.ts" maxHeight="140px" />
</section>
