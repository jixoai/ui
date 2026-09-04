<!--
  SYNTHETIC GATE FIXTURE — A3 provider-boundary counterexample: in this
  kind:provider file the legacy helpers are legal ONLY inside provider
  call-argument subtrees (form a) or $derived initializer subtrees (form
  b — the repo's real Table shape). The event-handler read, the template
  read and the plain-statement read all sit OUTSIDE those subtrees and
  must fail. Designed to FAIL with exactly three banned occurrences.
  Never imported.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getDensityContext, provideDensity, resolveDensity } from '$lib/density.svelte';
  import { TableDefaults } from './table-defaults.svelte';

  interface Props {
    density?: 'lg' | 'default' | 'sm' | 'xs';
    children: Snippet;
  }
  let { density, children }: Props = $props();

  // LEGAL (a): inline provider-argument subtree
  provideDensity(() => resolveDensity(density, undefined, 'sm'));

  // LEGAL (b): $derived initializer subtree, then handed to the provider
  const inherited = $derived(resolveDensity(density, getDensityContext(), 'sm'));
  provideDensity(() => inherited);

  const d = $derived(TableDefaults.resolve({ density }));

  // ILLEGAL (c1): plain-statement direct read
  getDensityContext();
</script>

<table data-density={d.density} onclick={() => resolveDensity(density, undefined)}>
  <!-- ILLEGAL (c2): template direct read -->
  {resolveDensity(density, undefined)}
  {@render children()}
</table>
