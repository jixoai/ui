<!--
  The density four-path matrix host (test fixture,
  context-plugin-system): the plugin root sits INSIDE the provider
  (direction 1: outer provider + inner plugin root) so the provider's
  own stamp stays unchained while the leaf's terminal resolution goes
  through the chain — the two claims one DOM tree proves together.

  plugin: maps any DEFINED density to the existing sm tier and passes
  undefined through untouched (the fleet law: no manufactured stamp —
  a no-opinion consumer stamps NOTHING so ambient css inheritance
  keeps flowing).
-->
<script lang="ts">
  import Provider from './density-provider-host.svelte';
  import Leaf from './context-plugin-density-leaf.svelte';
  import Root from './context-plugin-root.svelte';
  import { definePlugin } from '../../src/lib/context-plugin.svelte';
  import { DENSITY_DEF, type Density } from '../../src/lib/density.svelte';

  let {
    plugins = false,
    provider,
    leaf,
    fallback,
  }: { plugins?: boolean; provider?: Density; leaf?: Density; fallback?: Density } = $props();

  const toSm = definePlugin({
    name: 'matrix-sm',
    targets: [DENSITY_DEF],
    before: (value: Density | undefined): Density | undefined =>
      value === undefined ? undefined : 'sm',
  });
</script>

{#if provider !== undefined}
  <Provider density={provider}>
    {#if plugins}
      <Root plugins={[toSm]}><Leaf size={leaf} fallback={fallback} /></Root>
    {:else}
      <Leaf size={leaf} fallback={fallback} />
    {/if}
  </Provider>
{:else if plugins}
  <Root plugins={[toSm]}><Leaf size={leaf} fallback={fallback} /></Root>
{:else}
  <Leaf size={leaf} fallback={fallback} />
{/if}
