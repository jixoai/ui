<!-- code-card blueprint: the readonly code surface — filename tab head,
     highlighted body, copy footer. Shiki resolves before serialization
     (the pass waits past network-idle), and the same <code> element
     carries the plain fallback paint with zero layout shift. -->
<script lang="ts">
  import CodeCard from '$lib/ui/code-card.svelte';

  const sample = `import { UniPty } from '@unipty/core';

const pty = unipty.spawn(['bash'], {
  terminal: { cols: 80, rows: 24 },
});

pty.resize(120, 36);`;
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <CodeCard class="w-full max-w-[520px]" filename="spawn.ts" lang="ts" code={sample} />
</div>
