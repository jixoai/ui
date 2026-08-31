<!--
  The hue context host (test fixture, context-plugin-system):
  createHueContext during component init — the layout's wiring in
  miniature. The span renders the exposed projection so the spec sees
  reactive updates without touching the runtime's timers.
-->
<script lang="ts">
  import { createHueContext } from '../../src/lib/hue-runtime.svelte';

  const ctx = createHueContext();
</script>

<span data-testid="hue-host" data-hue={ctx.hue}>·</span>
