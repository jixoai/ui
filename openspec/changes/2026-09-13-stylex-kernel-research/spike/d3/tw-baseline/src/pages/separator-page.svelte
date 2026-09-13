<script lang="ts">
  import Separator, { type SeparatorVariant } from '../ui/separator/index.ts';
</script>

<h1 class="text-lg font-semibold mb-2">separator — subtraction ink</h1>
<p class="text-muted-foreground mb-4 max-w-prose">
  The TW form: the subtraction-ink law (ghost, 4 mask geometries, blend engine, solid
  exception).
</p>

<section data-sep-section="horizontal" class="mb-4">
  <h2 class="mb-2">horizontal variants</h2>
  <div class="flex flex-col gap-3">
    {#each ['fused', 'dashed', 'dotted', 'fade'] as v (v)}
      <Separator variant={v as SeparatorVariant} />
    {/each}
  </div>
</section>

<section data-sep-section="vertical">
  <h2 class="mb-2">vertical posture</h2>
  <div class="flex gap-4" style="height: 80px">
    {#each ['fused', 'dashed', 'dotted', 'fade'] as v (v)}
      <Separator orientation="vertical" variant={v as SeparatorVariant} />
    {/each}
  </div>
</section>
