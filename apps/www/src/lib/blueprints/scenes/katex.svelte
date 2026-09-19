<!-- katex blueprint: the lib's primary consumer surface — a real
     MathBlock with the sync-SSR lane's baked markup (renderToString
     htmlAndMathml; the serialized scene carries the same spans the
     server paints — zero floor, zero upgrade). Fonts ride the npm css
     the lib imports. -->
<script lang="ts">
  import MathBlock from '$lib/ui/math-block/math-block.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
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

<Stack direction="column" align="center" justify="center" gap="16" class={cx(bpA.katexStage)}>
  <MathBlock class={cx(bpA.katexBlock)} copyable={false} tex={'e^{i\\pi} + 1 = 0'} />
  <Stack wrap gap="8" }>
    <Badge>isomorphic renderToString</Badge>
    <Badge>fonts ride the npm css</Badge>
    <Badge>MathML a11y path</Badge>
  </Stack>
</Stack>
