<!-- the minimal density-aware leaf: resolve + stamp (no providing) -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getDensityContext, resolveDensity, type Density } from '../../src/lib/density.svelte';

  let { size, children }: { size?: Density; children?: Snippet } = $props();

  const inherited = getDensityContext();
  const resolved = $derived(resolveDensity(size, inherited));
</script>

<span data-density={resolved}>{@render children?.()}</span>
