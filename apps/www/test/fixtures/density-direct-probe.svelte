<!--
  density-direct-probe — test fixture (paint-axis.spec.ts).

  The LEGACY direct path probe: `resolveDensity(explicit,
  getDensityContext())` inline — the pre-slot consumer shape. Under a
  throwing plugin it must throw exactly like the slot path (D3-C
  error transparency: the chain's errors cross resolveDensity
  uncaught on both lanes).
-->
<script lang="ts">
  import { getDensityContext, resolveDensity } from '$lib/density.svelte';

  let { testid }: { testid?: string } = $props();

  const inherited = getDensityContext();
  const resolved = $derived.by(() => {
    try {
      return resolveDensity(undefined, inherited) ?? 'none';
    } catch (error) {
      return `THREW:${(error as Error).message}`;
    }
  });
</script>

<span data-density-direct={resolved} data-testid={testid}></span>
