<!-- mermaid-engine blueprint: the lib's primary consumer surface — a
     real Mermaid diagram whose palette was derived from live tokens
     (probe → parseColor → hex), rendered through the lazy singleton
     after the pass waits past network-idle.
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

  const source = 'flowchart LR\n  probe --> hex --> palette';
</script>

<Stack direction="column" align="center" justify="center" gap="12" class={cx(bpB.mermaidEngineStage)}>
  <Mermaid class={cx(bpB.mermaidEngineFrame)} copyable={false} zoomable={false} {source} />
  <Stack wrap gap="8" }>
    <Badge>lazy singleton</Badge>
    <Badge>token-derived hex</Badge>
    <Badge>strict sanitize</Badge>
  </Stack>
</Stack>
