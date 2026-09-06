<!-- mermaid blueprint: the diagram surface — prerender paints the
     escaped source floor, hydration swaps the rendered SVG into the
     same box; auto theme follows the site flip, zoom stays a pure
     transform on the pan viewport. -->
<script lang="ts">
  import Mermaid from '$lib/ui/mermaid/mermaid.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';

  const source = 'flowchart LR\n  floor --> svg --> zoom';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-3 p-6">
  <Mermaid class="w-full max-w-[480px]" copyable={false} zoomable={false} {source} />
  <div class="flex flex-wrap gap-2">
    <Badge>source-first floor</Badge>
    <Badge>theme follow</Badge>
    <Badge>zoom · pure transform</Badge>
  </div>
</div>
