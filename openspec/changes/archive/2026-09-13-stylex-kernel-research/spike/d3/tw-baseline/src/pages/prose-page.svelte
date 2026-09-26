<script lang="ts">
  import Prose from '../ui/prose/index.ts';
</script>

<h1 class="text-lg font-semibold mb-2">prose — the typography context region</h1>
<p class="text-muted-foreground mb-4 max-w-prose">
  The TW form: host lane utilities + the context var bridge; presence lanes in folder css.
</p>

<section data-prose-section="knobs" class="mb-4">
  <h2 class="mb-2">size/leading/ink knobs</h2>
  <Prose size="15px" leading={1.9} wrap="pretty">
    <p data-jx-text="p">
      The quick brown fox jumps over the lazy dog — the region's own type scale, leading and
      wrap law. 中文与 English 混排的 proverb 段落，用于验证 typography context 的 var 桥接。
    </p>
  </Prose>
</section>

<section data-prose-section="indent">
  <h2 class="mb-2">first-line indent</h2>
  <Prose indent="2em" initialLetter={3}>
    <p data-jx-text="p">中文稿纸惯例 — first-line indent at two em, suppressed on the drop-cap paragraph.</p>
  </Prose>
</section>
