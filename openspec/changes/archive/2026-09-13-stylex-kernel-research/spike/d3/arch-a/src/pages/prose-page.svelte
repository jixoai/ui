<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { demo } from '../demo.stylex';
  import Prose from '../families/prose/prose.svelte';

  let gradientOn = $state(true);
</script>

<h1 {...stylex.attrs(demo.title)}>prose — the reading-region provider</h1>
<p {...stylex.attrs(demo.note)}>
  The host lane (size/family/ink/ground/align/wrap) is StyleX; the P-only lanes
  (leading, indent, drop cap) and the gradient ink ride presence attrs + the residue
  css — the two-channel law restated. Toggle the gradient knob.
</p>

<section {...stylex.attrs(demo.section)} data-prose-section="knobs">
  <h2 {...stylex.attrs(demo.sectionTitle)}>the eleven-knob surface (subset set)</h2>
  <button {...stylex.attrs(demo.miniButton)} onclick={() => (gradientOn = !gradientOn)}>
    gradient: {gradientOn ? 'on' : 'off'}
  </button>
  <Prose
    size="15px"
    leading={1.9}
    ink={gradientOn ? undefined : 'primary'}
    gradient={gradientOn ? { from: 'var(--primary)', to: 'var(--accent)', angle: 90 } : undefined}
    wrap="pretty"
  >
    <p data-jx-text="p">
      The quick brown fox jumps over the lazy dog — the region's own type scale, leading
      and ink knobs; an outer provider never fights a nested markdown scope (the
      sovereignty contract is cascade, not masking).
    </p>
    <p data-jx-text="p">
      A second paragraph carries the indent lane when set; the drop-cap arm ships both
      engine paths so a browser-class-dependent cap never reads as a bug.
    </p>
  </Prose>
</section>

<section {...stylex.attrs(demo.section)} data-prose-section="indent">
  <h2 {...stylex.attrs(demo.sectionTitle)}>the indent + drop cap lanes (P-only)</h2>
  <Prose indent="2em" initialLetter={3}>
    <p data-jx-text="p">中文稿纸惯例 — first-line indent at two em, suppressed on the drop-cap paragraph.</p>
  </Prose>
</section>
