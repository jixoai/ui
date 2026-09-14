<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { demo } from '../demo.stylex';
  import Range from '../families/range/range.svelte';

  let v1 = $state(30);
  let v2 = $state(45);
</script>

<h1 {...stylex.attrs(demo.title)}>range — native base + law mount (folder-css boundary)</h1>
<p {...stylex.attrs(demo.note)}>
  The input stays native (platform owns pointer/keyboard/RTL); the thumb/track geometry
  law (container-query units on vendor pseudo-elements) rides the carried css residue —
  the boundary StyleX cannot cross. The scaffolding (label/readout/ruler/error) is
  StyleX-authored.
</p>

<section {...stylex.attrs(demo.section)} data-range-section="basic">
  <h2 {...stylex.attrs(demo.sectionTitle)}>the slider (density-geometric)</h2>
  <Range bind:value={v1} label="volume" min={0} max={100} step={5} id="rng-basic" />
</section>

<section {...stylex.attrs(demo.section)} data-range-section="ticks">
  <h2 {...stylex.attrs(demo.sectionTitle)}>the tick ruler (step marks + end tick)</h2>
  <Range bind:value={v2} label="gain" min={0} max={100} step={10} ticks id="rng-ticks" />
</section>

<section {...stylex.attrs(demo.section)} data-range-section="error">
  <h2 {...stylex.attrs(demo.sectionTitle)}>the error law (dashed-ring thumb)</h2>
  <Range bind:value={v2} label="invalid" min={0} max={100} step={10} error="out of range" id="rng-err" />
</section>
