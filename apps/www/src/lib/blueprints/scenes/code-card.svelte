<!-- code-card blueprint: the readonly code surface — filename tab head,
     highlighted body, copy footer. Shiki resolves before serialization
     (the pass waits past network-idle), and the same <code> element
     carries the plain fallback paint with zero layout shift. -->
<script lang="ts">
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
  import Stack from '$lib/ui/stack';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  const sample = `import { UniPty } from '@unipty/core';

const pty = unipty.spawn(['bash'], {
  terminal: { cols: 80, rows: 24 },
});

pty.resize(120, 36);`;

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

<Stack align="center" justify="center" class={cx(bpA.codeCardStage)}>
  <CodeCard class={cx(bpA.codeCardCard)} filename="spawn.ts" lang="ts" code={sample} />
</Stack>
