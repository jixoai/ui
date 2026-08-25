<!-- the minimal provider: provideDensity + the data-density stamp -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { provideDensity, getDensityContext, resolveDensity, type Density } from '../../src/lib/density.svelte';

  let { density, children }: { density: Density; children: Snippet } = $props();

  const inherited = getDensityContext();
  const resolved = $derived(resolveDensity(density, inherited));
  provideDensity(() => resolved);
</script>

<div data-density={resolved}>{@render children()}</div>
