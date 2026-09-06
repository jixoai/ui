<!-- math-block blueprint: display math as a figure — the wide
     formula rides the scroll-run strip (host + run + chrome from the
     shared verdict machine) and the copy control carries the raw TeX
     payload. Errors paint in place; no error chrome exists. -->
<script lang="ts">
  import MathBlock from '$lib/ui/math-block/math-block.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
  <MathBlock class="w-full max-w-[520px]" copyable={false} tex={'\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}'} />
  <div class="flex flex-wrap gap-2">
    <Badge>sync SSR · zero flash</Badge>
    <Badge>scroll-run strip</Badge>
    <Badge>copy TeX source</Badge>
  </div>
</div>
