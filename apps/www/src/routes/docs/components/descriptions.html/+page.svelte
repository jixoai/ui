<!--
  Docs page for the descriptions family (composition-first-apis, 2026-08-25).
  Intents:
  1. Hero summary comes from the registry catalog (CATALOG lookup,
     fail-loud on miss — never hand-write registry copy).
  2. One ComponentCanvas: composed dt/dd pairs — term prop on the Item,
     children as the value (rich cells are just children; a childless
     Item renders the em dash).
  3. Playground protocol: the page owns the snapshot + reset; a
     segmented control drives columns, a toggle flips bordered; the
     drawer's usage file tracks both live.
  4. Usage CodeBlock: the copyable composition sample.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlaySegmented, PlayToggle, PlayHelp } from '$lib/playground';
  import Badge from '$lib/ui/badge/badge.svelte';
  import Descriptions, { DescriptionsItem } from '$lib/ui/descriptions/index';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import descriptionsSource from '$lib/ui/descriptions/descriptions.svelte?raw';
  import descriptionsItemSource from '$lib/ui/descriptions/descriptions-item.svelte?raw';
  import descriptionsCssSource from '$lib/ui/descriptions/descriptions.css?raw';
  import descriptionsIndexSource from '$lib/ui/descriptions/index.ts?raw';

  // catalog sync-binding: the hero summary IS the registry description;
  // a miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'descriptions');
  if (!entry) {
    throw new Error('catalog miss: "descriptions" has no registry meta — fix registry.json');
  }

  // single usage sample: the drawer's usage file and the body CodeBlock share it
  const usage = `<Descriptions columns={2} bordered>
  <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
  <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
  <DescriptionsItem term="status"><!-- rich cells are just children -->
    <Badge tone="primary">passing</Badge>
  </DescriptionsItem>
  <DescriptionsItem term="notes" /><!-- no children ⇒ the em dash -->
</Descriptions>`;

  // Playground protocol: the page owns the snapshot + reset; the segmented
  // control drives columns (PlaySegmented is string-typed — the string is the
  // source, the number a projection), the toggle flips bordered; the drawer's
  // usage file tracks both live.
  const canvasInitial = { columns: '2', bordered: true };
  let columnsOption = $state(canvasInitial.columns);
  let bordered = $state(canvasInitial.bordered);
  const columns = $derived(Number(columnsOption));
  function resetCanvas(): void {
    columnsOption = canvasInitial.columns;
    bordered = canvasInitial.bordered;
  }
  const usageLive = $derived(
    usage.replace(
      '<Descriptions columns={2} bordered>',
      `<Descriptions columns={${columns}}${bordered ? ' bordered' : ''}>`,
    ),
  );
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const columnOptions = [1, 2, 3].map((value) => ({ value: String(value), label: String(value) }));

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/descriptions/descriptions.svelte', content: descriptionsSource },
    { name: 'registry/files/ui/descriptions/descriptions-item.svelte', content: descriptionsItemSource },
    { name: 'registry/files/ui/descriptions/descriptions.css', content: descriptionsCssSource },
    { name: 'registry/files/ui/descriptions/index.ts', content: descriptionsIndexSource },
    { name: 'src/lib/ui/descriptions-usage.svelte', content: usage, kind: 'usage' },
  ];

  // ToC outline: pairs with +page.ts, in page order.
</script>

<svelte:head>
  <title>Descriptions · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai descriptions family: a dl is a description list — one DescriptionsItem per term/value pair, the term prop renders the dt, children render the dd. Rich cells are just children; the bordered look is CSS on the same dl, never a table in disguise; columns respond via container queries."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data display"
        title="descriptions — composed dt/dd pairs, never a table"
        summary={entry.summary}
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">dl · never a table</span>
          <span class="pill">term prop → dt · children → dd</span>
          <span class="pill">columns via container query</span>
          <span class="pill">bordered hairline frame</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="descriptions"
        stage="fill"
        description="One Item per pair: the term prop renders the dt, children render the dd — the status badge is just children, the childless notes Item falls back to the em dash."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/descriptions/descriptions.svelte"
        files={canvasFiles}
        onreset={resetCanvas}
        output={[
          { label: 'columns', value: columns },
          { label: 'bordered', value: bordered },
        ]}
        resolveFileContent={resolveUsage}
      >
        <div class="w-full max-w-2xl">
          <Descriptions {columns} {bordered}>
            <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
            <DescriptionsItem term="checks">12 passed · 0 failed</DescriptionsItem>
            <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
            <DescriptionsItem term="region">iad1 · washington</DescriptionsItem>
            <DescriptionsItem term="status">
              <Badge tone="primary">passing</Badge>
            </DescriptionsItem>
            <DescriptionsItem term="notes" />
          </Descriptions>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="columns" hint="term/value pairs per row (1–4, clamped)">
              <PlaySegmented bind:value={columnsOption} options={columnOptions} />
            </PlayRow>
            <PlayRow label="bordered" hint="hairline frame on the same dl">
              <PlayToggle bind:value={bordered} />
            </PlayRow>
            <PlayHelp>
              columns and bordered are HOW-props — they change how the grid paints, never what
              renders. Narrow containers clamp to one pair per row via a container query; a
              childless Item renders the em dash, never a blank cell.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="descriptions-base" data-reveal="">
      <SectionCard
        family="descriptions-base"
        headerRegion="descriptions-base"
        eyebrow="law"
        title="Usage"
        summary="The composition contract in one sample: import the family from the registry barrel (@ui/descriptions/index — per-part targets exist per file). There is no items[] prop and no value snippet — rich cells are plain children of the Item."
      >
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>
  </div>
</div>
