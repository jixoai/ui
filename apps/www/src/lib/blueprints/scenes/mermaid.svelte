<!-- mermaid blueprint: the diagram surface — prerender paints the
     escaped source floor, hydration swaps the rendered SVG into the
     same box; auto theme follows the site flip, zoom stays a pure
     transform on the pan viewport.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Mermaid from '$lib/ui/mermaid/mermaid.svelte';
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

  const source = 'flowchart LR\n  floor --> svg --> zoom';
</script>

<Stack direction="column" align="center" justify="center" gap="12" class={cx(bpB.mermaidStage)}>
  <Mermaid class={cx(bpB.mermaidFrame)} copyable={false} zoomable={false} {source} />
  <Stack wrap gap="8" }>
    <Badge>source-first floor</Badge>
    <Badge>theme follow</Badge>
    <Badge>zoom · pure transform</Badge>
  </Stack>
</Stack>
