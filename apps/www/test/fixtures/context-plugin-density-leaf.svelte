<!--
  The density matrix leaf (test fixture, context-plugin-system):
  resolve + stamp with an optional LOCAL fallback — the fourth
  resolution path (explicit / inherited / fallback / no opinion).
-->
<script lang="ts">
  import { getDensityContext, resolveDensity, type Density } from '../../src/lib/density.svelte';

  let { size, fallback }: { size?: Density; fallback?: Density } = $props();

  const inherited = getDensityContext();
  const resolved = $derived(resolveDensity(size, inherited, fallback));
</script>

<span data-testid="matrix-leaf" data-density={resolved}>·</span>
