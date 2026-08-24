<!--
  Minimal ComponentCanvas host (test/fixtures/canvas-plain-host.svelte):
  children only — no playground pane, no reset, no echo. The bare form the
  negative-case assertions need.
-->
<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  const files: TreeFile[] = [
    { name: 'src/lib/ui/demo-usage.svelte', content: '<p>static</p>' },
  ];
</script>

<ComponentCanvas title="host widget" files={files}>
  <p data-testid="stage-demo">demo</p>
</ComponentCanvas>
