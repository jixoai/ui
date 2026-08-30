<!--
  ComponentCanvas schema-mode host (test/fixtures/canvas-schema-host.svelte,
  canvas-schema-pipeline 2026-08-30): lowered schema + bind:values +
  onvalue, no playground snippet. The stage projects values as text so
  DOM assertions can read the two-way binding; onvalue is recorded for
  the seam assertions.
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
      loading: { type: 'boolean', default: false },
      depth: { type: 'number', minimum: 0, maximum: 4, multipleOf: 2, default: 2 },
      href: { type: 'string' },
      children: { 'x-ui': { control: 'none', sourceType: 'Snippet' } },
    },
    required: ['href'],
  };

  let values: Record<string, unknown> | undefined = $state(undefined);
  let lastValue: { key: string; value: unknown } | undefined = $state(undefined);
</script>

<ComponentCanvas
  title="schema host"
  {files}
  {schema}
  bind:values
  onvalue={(key, value) => (lastValue = { key, value })}
>
  <p data-testid="stage-demo">{JSON.stringify(values ?? null)}</p>
</ComponentCanvas>
