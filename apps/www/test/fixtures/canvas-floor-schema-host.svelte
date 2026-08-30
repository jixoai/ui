<!--
  ComponentCanvas schema + floor coexistence host (test/fixtures/
  canvas-floor-schema-host.svelte, canvas-floor-lab 2026-08-30): the
  canvas-schema-pipeline mode and the canvas-floor-lab floor in ONE
  surface — schema rows render (the precedence-free default), the
  stage toggles still project scoped attributes, and the two-file
  drawer renders tabs. The regression guard for "schema mode must not
  regress" against the floor rework.
-->
<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { CanvasSchema, TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  const files: TreeFile[] = [
    { name: 'registry/files/ui/schema-floor/schema-floor.svelte', content: '<p>source</p>' },
    { name: 'src/lib/ui/schema-floor-usage.svelte', content: '<p>usage</p>' },
  ];

  const schema: CanvasSchema = {
    type: 'object',
    properties: {
      variant: { enum: ['fill', 'tonal'], default: 'fill' },
    },
    required: [],
  };

  let theme = $state<'light' | 'dark'>('light');
</script>

<ComponentCanvas
  title="schema floor"
  id="schema-floor"
  {files}
  {schema}
  bind:theme
>
  <p data-testid="stage-demo">demo</p>
</ComponentCanvas>
