<!--
  The reorder host (document-ontology R2 batch 4.1): the keyed-each
  display-currency gate rig. One provider, two REAL domain roots —

    · the FIGURE lane: a declared Section (the numbering root) whose
      keyed {#each} array holds the Figures, plus References pointing
      at their ids;
    · the SECTION lane: a second declared root whose keyed each holds
      undeclared child Sections (the 2.1/2.2/2.3 sibling form), plus
      References pointing at their ids.

  reverse() drives items.reverse() on BOTH $state arrays — the keyed
  identities stay, Svelte only MOVES the DOM (the strong fixture the
  design demands; a static label swap is the banned weak form because
  it hides behind unmount/remount).

  INSTANCE-PRESERVATION COUNTER (the counter-evidence): every row is
  a Self instance carrying `beats` — per-instance $state that a
  pulse() increments through the reactive `pulse` prop. A remount
  would reset it to a single beat; a moved instance keeps counting.
  The accumulator is a plain shadow variable so the effect writes
  `beats` without ever reading it (no self-retrigger loop), and the
  template mirrors it as data-beats for DOM-level assertions.

  ProviderProbe exposes the route registry on globalThis (the
  fixture-plumbing precedent — never a component API).

  Number expectations: the figure lane root is the first top-level
  domain (its Figures read 1.1–1.3); the section lane root is the
  second (its children read 2.1–2.3). References: Fig (1.1…) / § 2.1…
-->
<script module lang="ts">
  export interface ReorderItem {
    /** the keyed {#each} identity — stable across items.reverse() */
    key: string;
    /** the explicit address — numbers move, ids never do */
    id: string;
    /** caption/title copy */
    label: string;
  }
</script>

<script lang="ts">
  import NumberingProvider from '../../src/lib/ui/figure/numbering-provider.svelte';
  import ProviderProbe from './provider-probe.svelte';
  import Figure from '../../src/lib/ui/figure/figure.svelte';
  import Section from '../../src/lib/ui/section-card/section-card.svelte';
  import Reference from '../../src/lib/ui/reference/reference.svelte';
  import Self from './reorder-host.svelte';

  let {
    mode = 'root',
    item = undefined,
    pulse = 0,
  }: {
    /** root renders the lanes; row modes render one keyed entry */
    mode?: 'root' | 'figure-row' | 'section-row';
    item?: ReorderItem;
    pulse?: number;
  } = $props();

  // ── the keyed arrays (root mode) ─────────────────────────────────
  let figureItems = $state<ReorderItem[]>([
    { key: 'f-a', id: 'fig-alpha', label: 'Alpha' },
    { key: 'f-b', id: 'fig-beta', label: 'Beta' },
    { key: 'f-c', id: 'fig-gamma', label: 'Gamma' },
  ]);
  let sectionItems = $state<ReorderItem[]>([
    { key: 's-a', id: 'sec-r-alpha', label: 'R Alpha' },
    { key: 's-b', id: 'sec-r-beta', label: 'R Beta' },
    { key: 's-c', id: 'sec-r-gamma', label: 'R Gamma' },
  ]);
  let pulseCount = $state(0);

  /** the law gate's driver: items.reverse() on both keyed arrays —
   *  instance identities kept, DOM order only */
  export function reverse(): void {
    figureItems.reverse();
    sectionItems.reverse();
  }

  /** increments every row's per-instance counter through the pulse
   *  prop — the remount counter-evidence feed */
  export function tap(): void {
    pulseCount += 1;
  }

  // ── the per-row instance counter (row modes) ─────────────────────
  let beats = $state(0);
  let shadow = 0; // plain accumulator: the effect writes beats, never reads
  $effect(() => {
    if (pulse > 0) {
      shadow += 1;
      beats = shadow;
    }
  });
</script>

{#if mode === 'figure-row'}
  <div data-row={item!.key} data-beats={beats}>
    <Figure kind="figure" id={item!.id} caption={item!.label}>
      <div data-content={item!.key}>{item!.label} content</div>
    </Figure>
  </div>
{:else if mode === 'section-row'}
  <div data-row={item!.key} data-beats={beats}>
    <Section title={item!.label} id={item!.id}>{item!.label} body</Section>
  </div>
{:else}
  <NumberingProvider>
    <ProviderProbe />
    <Section numbering="decimal" title="Figure lane" id="sec-fig-lane">
      {#each figureItems as entry (entry.key)}
        <Self mode="figure-row" item={entry} pulse={pulseCount} />
      {/each}
      <div data-refs="figures">
        <Reference to="fig-alpha" />
        <Reference to="fig-beta" />
        <Reference to="fig-gamma" />
      </div>
    </Section>
    <Section numbering="decimal" title="Section lane" id="sec-sec-lane">
      {#each sectionItems as entry (entry.key)}
        <Self mode="section-row" item={entry} pulse={pulseCount} />
      {/each}
      <div data-refs="sections">
        <Reference to="sec-r-alpha" />
        <Reference to="sec-r-beta" />
        <Reference to="sec-r-gamma" />
      </div>
    </Section>
  </NumberingProvider>
{/if}
