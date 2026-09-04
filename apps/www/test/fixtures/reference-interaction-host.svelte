<!--
  The reference interaction host (document-ontology R2 batch 4.3):
  the three interaction-state rig — click fragment / keyboard focus /
  the SSR-hydrate forward shape — over REAL targets (a Figure inside
  a declared numbering root), not hand-built registry entries.

    · eq-ix: present from mount → its Reference renders the resolved
      native anchor immediately (the click + keyboard lane);
    · eq-late: absent until `late` flips true → its Reference starts
      in the ??(eq-late) FALLBACK ANCHOR shape (the exact form the
      static pass emits — an edge claim carrying href + data-ref-to),
      then follows once the target mounts (the hydrate lane; clicking
      the fallback anchor still lands the hash).

  ProviderProbe exposes the route registry on globalThis (fixture
  plumbing, never a component API). Numbers: the lane root is the
  only top-level domain, so eq-ix reads 1.1 and the late figure 1.2.
-->
<script lang="ts">
  import NumberingProvider from '../../src/lib/ui/figure/numbering-provider.svelte';
  import ProviderProbe from './provider-probe.svelte';
  import Figure from '../../src/lib/ui/figure/figure.svelte';
  import Section from '../../src/lib/ui/section-card/section-card.svelte';
  import Reference from '../../src/lib/ui/reference/reference.svelte';

  /** mounts the forward reference's destination (default: absent —
   *  the Reference renders its fallback-anchor claim shape) */
  let { late = false }: { late?: boolean } = $props();
</script>

<NumberingProvider>
  <ProviderProbe />
  <Section numbering="decimal" title="Interaction lane" id="sec-ix">
    <Figure kind="equation" id="eq-ix" caption="present from mount">
      <div data-content="eq-ix">E = mc&sup2;</div>
    </Figure>
    {#if late}
      <Figure kind="equation" id="eq-late" caption="late arrival">
        <div data-content="eq-late">a&sup2; + b&sup2; = c&sup2;</div>
      </Figure>
    {/if}
    <div data-refs>
      <Reference to="eq-ix" />
      <Reference to="eq-late" />
    </div>
  </Section>
</NumberingProvider>
