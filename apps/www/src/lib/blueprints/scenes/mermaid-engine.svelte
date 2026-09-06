<!-- mermaid-engine blueprint: the lib's primary consumer surface — a
     real Mermaid diagram whose palette was derived from live tokens
     (probe → parseColor → hex), rendered through the lazy singleton
     after the pass waits past network-idle. -->
<script lang="ts">
  import Mermaid from '$lib/ui/mermaid/mermaid.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';

  const source = 'flowchart LR\n  probe --> hex --> palette';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-3 p-6">
  <Mermaid class="w-full max-w-[480px]" copyable={false} zoomable={false} {source} />
  <div class="flex flex-wrap gap-2">
    <Badge>lazy singleton</Badge>
    <Badge>token-derived hex</Badge>
    <Badge>strict sanitize</Badge>
  </div>
</div>
