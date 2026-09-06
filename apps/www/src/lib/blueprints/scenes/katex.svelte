<!-- katex blueprint: the lib's primary consumer surface — a real
     MathBlock with the sync-SSR lane's baked markup (renderToString
     htmlAndMathml; the serialized scene carries the same spans the
     server paints — zero floor, zero upgrade). Fonts ride the npm css
     the lib imports. -->
<script lang="ts">
  import MathBlock from '$lib/ui/math-block/math-block.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
  <MathBlock class="w-full max-w-[520px]" copyable={false} tex={'e^{i\\pi} + 1 = 0'} />
  <div class="flex flex-wrap gap-2">
    <Badge>isomorphic renderToString</Badge>
    <Badge>fonts ride the npm css</Badge>
    <Badge>MathML a11y path</Badge>
  </div>
</div>
