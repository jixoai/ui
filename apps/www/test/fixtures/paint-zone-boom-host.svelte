<!--
  paint-zone-boom-host — test fixture (paint-axis.spec.ts).

  A BROKEN zone provider with the wide-family probe inside: the
  payload getter throws a custom error. The axis's ambient read has
  NO catch on it (D3-C error transparency: nothing on the path
  swallows), so the error must propagate out of the slot, never a
  silent identity (the THREW stamp).
-->
<script lang="ts">
  import { providePaintZone } from '$lib/paint.svelte';
  import { WideProbeDefaults } from './paint-axis-probe.svelte';

  providePaintZone(() => {
    throw new Error('paint-zone-boom');
  });

  const resolved = $derived.by(() => {
    try {
      return WideProbeDefaults.resolve({}).variant;
    } catch (error) {
      return `THREW:${(error as Error).message}`;
    }
  });
</script>

<span data-paint-boom={resolved} data-testid="paint-boom"></span>
