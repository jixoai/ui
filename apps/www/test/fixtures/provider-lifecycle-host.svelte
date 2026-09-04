<!--
  The numbering-provider lifecycle host (document-ontology R2 batch
  0.3): wraps the probe in the provider; exposes the registries
  captured from inside for teardown/route-switch assertions.
-->
<script lang="ts">
  import NumberingProvider from '../../src/lib/ui/figure/numbering-provider.svelte';
  import ProviderProbe from './provider-probe.svelte';

  let { register = undefined }: { register?: string } = $props();
</script>

<NumberingProvider>
  <ProviderProbe {register} />
</NumberingProvider>
