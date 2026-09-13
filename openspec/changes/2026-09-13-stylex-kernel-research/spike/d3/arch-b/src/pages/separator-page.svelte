<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { demo } from '../demo.stylex';
  import Separator, { type SeparatorVariant } from '../families/separator/separator.svelte';
</script>

<h1 {...stylex.attrs(demo.title)}>separator — the subtraction ink law</h1>
<p {...stylex.attrs(demo.note)}>
  Zero color tokens: the contrast ghost adapts over ANY ground (near-black lifts,
  near-white dims). Shaped variants are masks; fade rides the blend engine; solid is the
  one additive exception.
</p>

<section {...stylex.attrs(demo.ground)} data-sep-section="horizontal">
  <h2 {...stylex.attrs(demo.sectionTitle)}>horizontal × 7 variants</h2>
  {#each ['fused', 'dashed', 'dense', 'dotted', 'wavy', 'fade', 'solid'] as v (v)}
    <Separator variant={v as SeparatorVariant} />
  {/each}
</section>

<section {...stylex.attrs(demo.ground)} data-sep-section="vertical">
  <h2 {...stylex.attrs(demo.sectionTitle)}>vertical posture</h2>
  <div style="display:flex;gap:16px;height:80px">
    {#each ['fused', 'dashed', 'dotted', 'fade'] as v (v)}
      <Separator orientation="vertical" variant={v as SeparatorVariant} />
    {/each}
  </div>
</section>
