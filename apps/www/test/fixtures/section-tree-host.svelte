<!--
  The section-tree host (document-ontology R2, batch 1): the Section
  numbering value-table fixture. One variant per scenario so ordinals
  assert against the design §1.1b tables — the single-domain decimal
  tree (1/1.1/1.1.1), sibling roots by document order, the nested-
  domain local restart — plus the plain domain-less status-quo lane
  (the 1.3 baseline source) and the keyed-reorder lane (the
  display-currency law gate, remount-free DOM moves only).

  ProviderProbe exposes the route registries on globalThis (fixture
  plumbing, never a component API); `reverse()` drives the keyed each.
-->
<script lang="ts">
  import Section from '../../src/lib/ui/section-card/section-card.svelte';
  import NumberingProvider from '../../src/lib/ui/figure/numbering-provider.svelte';
  import ProviderProbe from './provider-probe.svelte';

  let {
    variant = 'plain',
    childTitle = 'Child A1',
    looseNumbering = undefined,
    looseFloatScope = undefined,
    looseId = undefined,
  }: {
    variant?: 'plain' | 'single' | 'siblings' | 'nested' | 'reorder' | 'loose';
    childTitle?: string;
    looseNumbering?: 'decimal';
    looseFloatScope?: Partial<Record<'figure' | 'table' | 'equation' | 'listing', 'chapter' | 'document'>>;
    looseId?: string;
  } = $props();

  let items = $state([
    { id: 'sec-r1', title: 'R1' },
    { id: 'sec-r2', title: 'R2' },
    { id: 'sec-r3', title: 'R3' },
  ]);

  export function reverse(): void {
    items.reverse();
  }
</script>

{#if variant === 'plain'}
  <!-- the status-quo lane: outside every numbering domain (no provider
       up the tree, no numbering declaration) — byte-for-byte today's
       section-card output; the 1.3 gate snapshots this lane pre-change -->
  <Section
    headingLevel={1}
    eyebrow="The Eyebrow"
    title="Outside Rich"
    summary="The summary line."
    family="docs"
    region="guide"
    headerRegion="head"
    role="entry"
    ordering="tree"
  >
    rich body
  </Section>
  <Section title="Outside Bare">bare body</Section>
{:else if variant === 'single'}
  <NumberingProvider>
    <ProviderProbe />
    <Section numbering="decimal" title="Root A" id="sec-root">
      root body
      <Section title={childTitle} id="sec-a1">
        child body
        <Section title="Grandchild A1a" id="sec-a1a">deep body</Section>
      </Section>
      <Section title="Child A2">second body</Section>
    </Section>
  </NumberingProvider>
{:else if variant === 'siblings'}
  <NumberingProvider>
    <ProviderProbe />
    <Section numbering="decimal" title="First root" id="sec-s1">first body</Section>
    <Section numbering="decimal" title="Second root" id="sec-s2">second body</Section>
  </NumberingProvider>
{:else if variant === 'nested'}
  <NumberingProvider>
    <ProviderProbe />
    <Section numbering="decimal" title="Outer root" id="sec-outer">
      outer body
      <Section numbering="decimal" title="Nested root" id="sec-nested">
        nested body
        <Section title="Nested child" id="sec-nested-child">nested child body</Section>
      </Section>
      <Section title="Outer plain child" id="sec-outer-child">outer child body</Section>
    </Section>
    <Section numbering="decimal" title="Sibling root" id="sec-sibling">sibling body</Section>
  </NumberingProvider>
{:else if variant === 'reorder'}
  <NumberingProvider>
    <ProviderProbe />
    <Section numbering="decimal" title="Reorder root" id="sec-reorder-root">
      {#each items as item (item.id)}
        <Section title={item.title} id={item.id}>{item.title} body</Section>
      {/each}
    </Section>
  </NumberingProvider>
{:else if variant === 'loose'}
  <!-- one Section with pass-through structural props: the invalid-
       shape (floatScope without numbering) and immutable-precondition
       (post-mount prop change) lanes -->
  <NumberingProvider>
    <ProviderProbe />
    <Section
      title="Loose"
      numbering={looseNumbering}
      floatScope={looseFloatScope}
      id={looseId}
    >
      loose body
    </Section>
  </NumberingProvider>
{/if}
