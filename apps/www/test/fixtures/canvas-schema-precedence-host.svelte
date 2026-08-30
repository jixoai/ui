<!--
  ComponentCanvas escape-hatch host (test/fixtures/
  canvas-schema-precedence-host.svelte, canvas-schema-pipeline
  2026-08-30): BOTH a playground snippet and a schema — the snippet
  must render and the schema rows must NOT duplicate beside it.
-->
<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { CanvasSchema, TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  const files: TreeFile[] = [
    { name: 'src/lib/ui/demo-usage.svelte', content: '<p>static</p>' },
  ];

  const schema: CanvasSchema = {
    type: 'object',
    properties: {
      variant: { enum: ['fill', 'tonal', 'outline'], default: 'fill' },
    },
    required: [],
  };
</script>

<ComponentCanvas title="precedence host" {files} {schema}>
  <p data-testid="stage-demo">demo</p>
  {#snippet playground()}
    <div data-testid="custom-playground">page-owned controls</div>
  {/snippet}
</ComponentCanvas>
