<!--
  density-slot-host — test fixture (paint-axis.spec.ts).

  The density axis slot's three-state regression (design 轴槽
  [X-9]): bare (no provider — no-opinion stays undefined, a declared
  own is a REAL opinion), explicit/provider precedence, and nested
  shadowing — plus the legacy direct path for the same states.
-->
<script lang="ts">
  import Provider from './density-provider-host.svelte';
  import DensityProbe from './density-slot-probe.svelte';
  import DirectProbe from './density-direct-probe.svelte';
</script>

<!-- ① no provider: no-opinion resolves undefined (the fleet law — no
     stamp, the ambient css scope channel flows); own is an opinion -->
<section data-testid="density-bare">
  <DensityProbe kind="no-own" testid="bare-no-own" />
  <DensityProbe kind="own-sm" testid="bare-own-sm" />
  <DirectProbe testid="bare-direct" />
</section>

<!-- ② explicit beats the provider; the provider beats own -->
<Provider density="xs">
  <DensityProbe kind="no-own" testid="xs-no-own" />
  <DensityProbe kind="own-sm" testid="xs-own-sm" />
  <DensityProbe kind="own-sm" explicit="lg" testid="xs-explicit" />
</Provider>

<!-- ③ nested providers shadow — nearest wins -->
<Provider density="sm">
  <Provider density="xs">
    <DensityProbe kind="no-own" testid="nested-no-own" />
  </Provider>
</Provider>
