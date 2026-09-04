<!--
  The Reference host (document-ontology R2 batch 3): the provider wrap
  + the batch-0.3 probe (exposes the live registry instance on
  globalThis) + the five-state reference matrix. Registrations are
  driven BY THE SPEC through the exposed registry — the Figure/Section
  components that would register entries land in batches 1/2; batch 3
  gates the Reference resolution machine against hand-built entries
  (accessor thunks included, matching the frozen entry shapes).

  The matrix: eq-1 (equation figure), sec-1 (numbered section),
  sec-unnumbered (null number → bare title), nope (never registered —
  the settle-missing state), eq-late (forward reference, rendered only
  under `forward` and registered by the spec pre-settle), eq-static
  (children escape hatch).
-->
<script lang="ts">
  import NumberingProvider from '../../src/lib/ui/figure/numbering-provider.svelte';
  import ProviderProbe from './provider-probe.svelte';
  import Reference from '../../src/lib/ui/reference/reference.svelte';

  /** renders the forward-reference line (eq-late stays unregistered
   *  until the spec registers it — the not-yet-registered scenario) */
  let { forward = false }: { forward?: boolean } = $props();
</script>

<NumberingProvider>
  <ProviderProbe />
  <Reference to="eq-1" />
  <Reference to="sec-1" />
  <Reference to="sec-unnumbered" />
  <Reference to="nope" />
  {#if forward}
    <Reference to="eq-late" />
  {/if}
  <Reference to="eq-static">上式</Reference>
</NumberingProvider>
