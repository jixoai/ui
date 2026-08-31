<!--
  The nested both-directions host (test fixture, context-plugin-system).

  direction 'in'  (外 provider + 内插件): Provider(lg) above the plugin
                  root — the provider's OWN stamp resolves without the
                  chain; the leaf below the root resolves chained.
  direction 'out' (反向 — 内 provider + 外插件): the plugin root above
                  the provider — the provider's resolution sees the
                  chain (its stamp is chained) and the leaf inherits
                  the chained opinion.

  The plugin maps defined densities to 'sm' (idempotent mapping, so
  the chained inherited value survives the leaf's second pass intact).
-->
<script lang="ts">
  import Provider from './density-provider-host.svelte';
  import Leaf from './density-leaf-host.svelte';
  import Root from './context-plugin-root.svelte';
  import { definePlugin } from '../../src/lib/context-plugin.svelte';
  import type { Density } from '../../src/lib/density.svelte';

  let { direction = 'in' }: { direction?: 'in' | 'out' } = $props();

  const toSm = definePlugin({
    name: 'nested-sm',
    targets: ['density'],
    before: (v: Density | undefined): Density | undefined =>
      v === undefined ? v : 'sm',
  });
</script>

{#if direction === 'in'}
  <Provider density="lg">
    <Root plugins={[toSm]}>
      <Leaf />
    </Root>
  </Provider>
{:else}
  <Root plugins={[toSm]}>
    <Provider density="lg">
      <Leaf />
    </Provider>
  </Root>
{/if}
