<!-- math-block blueprint: display math as a figure — the wide
     formula rides the scroll-run strip (host + run + chrome from the
     shared verdict machine) and the copy control carries the raw TeX
     payload. Errors paint in place; no error chrome exists.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import MathBlock from '$lib/ui/math-block/math-block.svelte';
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

<Stack direction="column" align="center" justify="center" gap="16" class={cx(bpB.mathBlockStage)}>
  <MathBlock class={cx(bpB.mathBlockFrame)} copyable={false} tex={'\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}'} />
  <div class={cx(bpB.mathBlockBadges)}>
    <Badge>sync SSR · zero flash</Badge>
    <Badge>scroll-run strip</Badge>
    <Badge>copy TeX source</Badge>
  </div>
</Stack>
