<!--
  density-throwing-plugin-host — test fixture (paint-axis.spec.ts,
  context-plugin-v2 D3-C, W2 task 3.4).

  The REAL-PATH throw probe (retires density-plugin-boom-host's
  structural seam plant — the global scope symbol the v2 kernel
  privatized): a genuine definePlugin product whose before
  hook throws, provided through the kernel's own root. resolveDensity
  applies its chain through the canonical DENSITY_DEF — the hook's
  error must PROPAGATE out of both lanes (the legacy direct call and
  the densitySlot); the v2 kernel catches nothing and normalizes
  nothing (error transparency on the true registration path).
-->
<script lang="ts">
  import { definePlugin, provideContextPlugins } from '../../src/lib/context-plugin.svelte';
  import { DENSITY_DEF } from '../../src/lib/density.svelte';
  import DensityProbe from './density-slot-probe.svelte';
  import DirectProbe from './density-direct-probe.svelte';

  const boom = definePlugin({
    name: 'density-boom',
    targets: [DENSITY_DEF],
    before: (): never => {
      throw new Error('plugin-boom');
    },
  });

  provideContextPlugins([boom]);
</script>

<DensityProbe kind="own-sm" testid="boom-slot" />
<DirectProbe testid="boom-direct" />
