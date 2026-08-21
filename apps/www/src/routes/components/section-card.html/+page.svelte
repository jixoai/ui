<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import Input from '$lib/ui/input.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Select from '$lib/ui/select.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the file tree shows the exact installed copy this site
  // consumes — ?raw imports the bytes, never a retyped duplicate.
  import cardSource from '$lib/ui/section-card.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import SectionCard from '@ui/section-card.svelte';
${close}

<!-- default tone: h2, muted summary, the everyday content atom -->
<SectionCard eyebrow="Quick start" title="Acquire a Backend." summary="One paragraph of context.">
  <p>Body slot: any content.</p>
</SectionCard>

<!-- hero tone: the inner-page head — h1, clamp-scaled title,
     foreground summary -->
<SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui" title="Hero head">
  <div class="flex flex-wrap gap-3"><span class="pill">pills</span></div>
</SectionCard>

<!-- toc-engine wiring: data-region / data-family build the ToC extents;
     headerRegion gives the header block its own leaf when the body
                     carries child regions -->
<SectionCard family="core" headerRegion="spawn" eyebrow="Core" title="spawn">…</SectionCard>`;

  const files: TreeFile[] = [
    { name: 'src/lib/ui/section-card.svelte', content: cardSource },
    { name: 'src/lib/ui/section-card-usage.svelte', content: usage },
  ];

  // Playground state: every variant of the live instance below.
  type DemoTone = 'default' | 'hero';
  let demoTone = $state<DemoTone>('default');
  let demoLevel = $state<1 | 2>(2);
  let demoEyebrow = $state('registry:ui');
  let showSummary = $state(true);

  const demoTitle = $derived(
    demoTone === 'hero' ? 'The inner-page hero head.' : 'The content atom.',
  );
  const demoSummary = $derived(
    demoTone === 'hero'
      ? 'Hero tone: clamp-scaled font-nav title, text-balance, a foreground summary at 78% — this is the head of an inner page, one per route.'
      : 'Default tone: the everyday bordered block — eyebrow row, font-nav title, muted text-pretty summary, and the body snippet slot below the hairline.',
  );
</script>

<svelte:head>
  <title>Section card · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai section-card component: the content atom of the site grammar — a bordered card with eyebrow (brand hue, tracked 0.24em), font-nav title, text-pretty summary, and a body snippet slot. tone=hero renders the inner-page head; headingLevel picks h1 or h2."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="section-card"
      description="The content atom of the site grammar: a bordered card, header block (optional eyebrow in brand hue + font-nav title + optional summary), and the body snippet slot. Every page on this site is built from it — and this very canvas page wears two instances right now."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/section-card.svelte"
      {files}
    >
      {#snippet children()}
        <!-- The LIVE instance is fully driven by the Playground: tone,
             headingLevel, eyebrow presence, and summary presence are
             all live props — flip each control to walk the variants. -->
        <SectionCard
          class="w-full max-w-2xl"
          headingLevel={demoLevel}
          tone={demoTone}
          eyebrow={demoEyebrow === '' ? undefined : demoEyebrow}
          title={demoTitle}
          summary={showSummary ? demoSummary : undefined}
        >
          <div class="flex flex-wrap gap-3">
            <span class="pill">body snippet</span>
            <span class="pill">heading: h{demoLevel}</span>
            <span class="pill">tone: {demoTone}</span>
            <span class="pill">{demoEyebrow === '' ? 'no eyebrow' : 'eyebrow on'}</span>
          </div>
        </SectionCard>
      {/snippet}
      {#snippet playground()}
        <Select
          label="tone"
          value={demoTone}
          onchange={(event) => {
            demoTone = (event.currentTarget as HTMLSelectElement).value as DemoTone;
          }}
        >
          <option value="default">default</option>
          <option value="hero">hero</option>
        </Select>
        <Select
          label="headingLevel"
          value={String(demoLevel)}
          onchange={(event) => {
            demoLevel = Number((event.currentTarget as HTMLSelectElement).value) === 1 ? 1 : 2;
          }}
        >
          <option value="2">2 — h2</option>
          <option value="1">1 — h1</option>
        </Select>
        <Input
          type="text"
          label="eyebrow"
          placeholder="empty — the row disappears"
          value={demoEyebrow}
          oninput={(event) => {
            demoEyebrow = (event.currentTarget as HTMLInputElement).value;
          }}
        />
        <Input
          type="checkbox"
          label="summary"
          checked={showSummary}
          onchange={(event) => {
            showSummary = (event.currentTarget as HTMLInputElement).checked;
          }}
        />
        <p class="jx-pg-note">
          Clear the eyebrow to see the optional row collapse; hero tone pairs with
          <code class="text-accent">headingLevel={1}</code> for an inner-page head.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>
</div>

<style>
  .jx-pg-note {
    color: var(--muted-foreground);
    font-size: 12px;
    line-height: 1.6;
    margin: 0;
  }
</style>
