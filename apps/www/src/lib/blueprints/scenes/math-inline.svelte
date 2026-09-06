<!-- math-inline blueprint: inline math in prose — the span inherits
     the paragraph's currentColor and baseline; no chrome, no
     controls, katex's hidden MathML carries the screen-reader path. -->
<script lang="ts">
  import MathInline from '$lib/ui/math-inline/math-inline.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
  <p class="max-w-[520px] text-left text-base leading-7">
    A Gaussian beam narrows to a waist where
    <MathInline tex={'w_0 = \\sqrt{\\lambda / (\\pi \\mathrm{NA})}'} />, the
    Rayleigh range follows
    <MathInline tex={'z_R = \\pi w_0^2 / \\lambda'} />, and the Gouy phase
    shifts by <MathInline tex={'\\arctan(z / z_R)'} /> along the axis.
  </p>
  <div class="flex flex-wrap gap-2">
    <Badge>inherits prose ink</Badge>
    <Badge>zero chrome</Badge>
    <Badge>baseline-true inline</Badge>
  </div>
</div>
