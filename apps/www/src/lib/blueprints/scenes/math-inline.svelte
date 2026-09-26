<!-- math-inline blueprint: inline math in prose — the span inherits
     the paragraph's currentColor and baseline; no chrome, no
     controls, katex's hidden MathML carries the screen-reader path.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import MathInline from '$lib/ui/math-inline/math-inline.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<Stack direction="column" align="center" justify="center" gap="16" class={cx(bpB.mathInlineStage)}>
  <p class={cx(bpB.mathInlineBody)}>
    A Gaussian beam narrows to a waist where
    <MathInline tex={'w_0 = \\sqrt{\\lambda / (\\pi \\mathrm{NA})}'} />, the
    Rayleigh range follows
    <MathInline tex={'z_R = \\pi w_0^2 / \\lambda'} />, and the Gouy phase
    shifts by <MathInline tex={'\\arctan(z / z_R)'} /> along the axis.
  </p>
  <Stack wrap gap="8" }>
    <Badge>inherits prose ink</Badge>
    <Badge>zero chrome</Badge>
    <Badge>baseline-true inline</Badge>
  </Stack>
</Stack>
