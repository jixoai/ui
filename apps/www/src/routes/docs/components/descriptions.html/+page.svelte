<!--
  Docs page for the descriptions family (openspec
  2026-08-30-table-grid-toolbar, on top of the composition-first-apis
  base, 2026-08-25).

  docs-demo-standard skeleton: Intro → Install → live demo (the
  columns/bordered playground) → Usage (the ONE h2) → Examples
  (ability-named recipes: vertical terms, responsive columns, extra
  header actions) → Accessibility → Theming → API → See also.

  Composition law: vertical stacking is the Item's own grid re-run
  (grid-cols-1! — the consumer class wins the merge); responsive
  columns are the dl's own 640px container query (the frame rig drags
  the container across it); the extra slot composes a header around
  the dl (antd's title/extra props would fight dl semantics — the
  wrapper IS the composition, recorded in followups.md).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlayRange, PlaySegmented, PlayToggle, PlayHelp } from '$lib/playground';
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
    <Badge>passing</Badge>
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

  // ---- recipe: responsive columns (the frame rig) -------------------------
  // The dl's own container query clamps to one pair per row under 640px of
  // CONTAINER width — the rig drags the wrapper across that line so the same
  // dl re-lays out live. (jsdom cannot run container queries; the law is
  // pinned as the css source in the component's own suite.)
  const responsiveInitial = { frameWidth: 680 };
  let frameWidth = $state(responsiveInitial.frameWidth);
  function resetResponsive(): void {
    frameWidth = responsiveInitial.frameWidth;
  }
  const frameStyle = $derived(`width: min(${frameWidth}px, 100%);`);

  const responsiveUsage = `<!-- the container query is the component's own law
     (descriptions.css: @container (max-width: 640px) ⇒ one pair per row).
     The consumer only owns the container's width: -->
<div style="width: {frameWidth}px">
  <Descriptions columns={3} bordered>
    <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
    <!-- … -->
  </Descriptions>
</div>`;

  // ---- recipe: vertical terms ---------------------------------------------
  const verticalUsage = `<!-- vertical (antd layout="vertical") is the Item's own
     grid re-run: the consumer class wins the tailwind-merge, and the
     important variant pins it against the component's own utility.
     term renders the dt ABOVE the dd — same dl, same semantics. -->
<Descriptions columns={2}>
  <DescriptionsItem term="owner" class="grid-cols-1!">@gaubee</DescriptionsItem>
  <DescriptionsItem term="region" class="grid-cols-1!">iad1 · washington</DescriptionsItem>
  <DescriptionsItem term="status" class="grid-cols-1!"><Badge>passing</Badge></DescriptionsItem>
</Descriptions>`;

  // ---- recipe: extra header actions ----------------------------------------
  let extraEcho = $state('—');
  const extraUsage = `<!-- the extra slot composes AROUND the dl: a header row
     (title + actions) over the list. antd's title/extra props would put
     non-dl content INSIDE the dl — the wrapper keeps the semantics clean
     (recorded in the change's followups). -->
<section class="border border-border">
  <header class="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
    <p class="m-0 font-nav text-xs uppercase tracking-[0.12em]">deploy · iad1</p>
    <div class="flex gap-2">
      <PressButton variant="outline" onclick={redeploy}>redeploy</PressButton>
      <PressButton variant="ghost" onclick={rollback}>rollback</PressButton>
    </div>
  </header>
  <Descriptions columns={2} bordered>
    <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
    <!-- … -->
  </Descriptions>
</section>`;
</script>

<svelte:head>
  <title>Descriptions · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai descriptions family: a dl is a description list — one DescriptionsItem per term/value pair, the term prop renders the dt, children render the dd. Rich cells are just children; the bordered look is CSS on the same dl, never a table in disguise; columns respond via container queries. Recipes: vertical terms, responsive columns, extra header actions."
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
          <span class="pill">vertical · responsive · extra recipes</span>
        </div>
      </SectionCard>
    </div>

    <!-- install -->
    <div id="install" data-reveal="">
      <SectionCard
        family="install"
        headerRegion="install"
        eyebrow="install"
        title="Install"
        summary="One registry item — the root and the Item ship together (the barrel exports both). The recipes below add press-button and badge."
      >
        <CodeBlock code={`npx jixoai-ui add descriptions`} lang="sh" meta="install" />
      </SectionCard>
    </div>

    <div id="descriptions-demo" data-region="descriptions-demo" data-family="descriptions-demo" data-reveal="">
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
              <Badge>passing</Badge>
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
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <!-- usage: the ONE h2 -->
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="The composition contract in one sample: import the family from the registry barrel (@ui/descriptions/index — per-part targets exist per file). There is no items[] prop and no value snippet — rich cells are plain children of the Item."><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>

  <!-- examples -->
  <div id="examples" data-reveal="">
    <SectionCard
      family="examples"
      headerRegion="examples"
      eyebrow="examples"
      title="Examples"
      summary="Ability-named recipes: vertical terms, responsive columns, extra header actions."
    >
      <p class="m-0 text-[13px] leading-6 text-muted-foreground">
        All three compose public structure — the Item's grid, the dl's container query, and a
        wrapper around the list. Nothing here reaches into the registry.
      </p>
    </SectionCard>
  </div>

  <!-- recipe: vertical terms -->
  <div id="descriptions-vertical" data-region="descriptions-vertical" data-family="descriptions-vertical" data-reveal="">
    <ComponentCanvas
      title="with vertical terms"
      description="antd's layout=vertical, composed: each Item re-runs its own grid as one column — the dt stacks above its dd. Same dl, same semantics, the term reads as a field label instead of a row lead."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/descriptions/descriptions-item.svelte"
      files={[
        { name: 'registry/files/ui/descriptions/descriptions-item.svelte', content: descriptionsItemSource },
        { name: 'src/lib/ui/descriptions-vertical-usage.svelte', content: verticalUsage, kind: 'usage' },
      ]}
      stage="fill"
      output={[{ label: 'layout', value: 'vertical · grid-cols-1!' }]}
    >
      <div class="grid w-full max-w-2xl gap-6 min-[720px]:grid-cols-2">
        <Descriptions>
          <DescriptionsItem term="owner" class="grid-cols-1!">@gaubee</DescriptionsItem>
          <DescriptionsItem term="region" class="grid-cols-1!">iad1 · washington</DescriptionsItem>
          <DescriptionsItem term="status" class="grid-cols-1!"><Badge>passing</Badge></DescriptionsItem>
        </Descriptions>
        <Descriptions bordered>
          <DescriptionsItem term="build" class="grid-cols-1!">4f2a1c</DescriptionsItem>
          <DescriptionsItem term="runtime" class="grid-cols-1!">node 24 · bun</DescriptionsItem>
          <DescriptionsItem term="notes" class="grid-cols-1!" />
        </Descriptions>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            The consumer class wins the tailwind-merge against the Item's own grid-cols
            (grid-cols-1!, important-pinned so no layer order can flip it back). Terms keep
            their muted nav voice; the bordered frame paints cell edges exactly as in the
            horizontal law.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- recipe: responsive columns -->
  <div id="descriptions-responsive" data-region="descriptions-responsive" data-family="descriptions-responsive" data-reveal="">
    <ComponentCanvas
      title="with responsive columns"
      description="Drag the frame across the 640px line: the SAME three-column dl re-lays out into one pair per row — the container query reads the dl's own container, never the viewport, so any layout column inherits the law."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/descriptions/descriptions.css"
      files={[
        { name: 'registry/files/ui/descriptions/descriptions.css', content: descriptionsCssSource },
        { name: 'src/lib/ui/descriptions-responsive-usage.svelte', content: responsiveUsage, kind: 'usage' },
      ]}
      stage="fill"
      onreset={resetResponsive}
      output={[
        { label: 'frame', value: `${frameWidth}px` },
        { label: 'container law', value: frameWidth < 640 ? '1 pair / row' : '3 pairs / row' },
      ]}
    >
      <div class="desc-frame-rig" style={frameStyle}>
        <Descriptions columns={3} bordered>
          <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
          <DescriptionsItem term="checks">12 passed</DescriptionsItem>
          <DescriptionsItem term="region">iad1</DescriptionsItem>
          <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
          <DescriptionsItem term="runtime">node 24</DescriptionsItem>
          <DescriptionsItem term="status"><Badge>passing</Badge></DescriptionsItem>
        </Descriptions>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="frame width" hint="drag across 640px">
            <PlayRange bind:value={frameWidth} min={280} max={760} step={8} />
          </PlayRow>
          <PlayHelp>
            The clamp lives in the component's own residue sheet: @container (max-width: 640px)
            ⇒ grid-template-columns: 1fr, unlayered so it beats the root's grid utility. The
            consumer owns nothing but the container's width — drop the same dl into a sidebar
            and it folds the same way.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- recipe: extra header actions -->
  <div id="descriptions-extra" data-region="descriptions-extra" data-family="descriptions-extra" data-reveal="">
    <ComponentCanvas
      title="with extra header actions"
      description="antd's extra slot, composed honestly: a header row (title + actions) wraps the dl instead of living inside it — non-dl content never enters the list, the actions read back through the echo."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/descriptions/descriptions.svelte"
      files={[
        { name: 'registry/files/ui/descriptions/descriptions.svelte', content: descriptionsSource },
        { name: 'src/lib/ui/descriptions-extra-usage.svelte', content: extraUsage, kind: 'usage' },
      ]}
      stage="fill"
      output={[{ label: 'last action', value: extraEcho }]}
    >
      <div class="w-full max-w-2xl">
        <section class="desc-card">
          <header class="desc-card-head">
            <p class="m-0 font-nav text-[0.75rem] uppercase tracking-[0.12em] text-muted-foreground">deploy · iad1 · production</p>
            <div class="flex gap-2">
              <PressButton variant="outline" onclick={() => (extraEcho = 'redeploy queued')}>redeploy</PressButton>
              <PressButton variant="ghost" onclick={() => (extraEcho = 'rollback armed')}>rollback</PressButton>
            </div>
          </header>
          <Descriptions columns={2} bordered>
            <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
            <DescriptionsItem term="runtime">node 24</DescriptionsItem>
            <DescriptionsItem term="checks">12 passed · 0 failed</DescriptionsItem>
            <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
          </Descriptions>
          <p class="m-0 px-4 pb-3 font-mono text-[11.5px] text-muted-foreground" aria-live="polite">
            last action: {extraEcho}
          </p>
        </section>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            A title/extra PROP would put foreign content inside the dl — the wrapper keeps the
            list semantic (nothing but dt/dd groups) while the header owns the chrome. The live
            readout pattern is the same one the table recipes use.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Description layouts" summary="Descriptions is a semantic dl: choose one or more term/value pairs per row and opt into the bordered treatment."><div class="grid gap-3 md:grid-cols-2"><div class="border border-border p-4"><Descriptions><DescriptionsItem term="owner">gaubee</DescriptionsItem></Descriptions></div><div class="border border-border p-4"><Descriptions columns={2} bordered><DescriptionsItem term="status">live</DescriptionsItem><DescriptionsItem term="scope">public</DescriptionsItem></Descriptions></div></div></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'dl', value: 'Descriptions root', description: 'Preserves description-list semantics — wrappers add chrome, never list content.' }, { name: 'dt', value: 'term', description: 'Names each property.' }, { name: 'dd', value: 'value', description: 'Contains the corresponding value.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Descriptions><DescriptionsItem term="density">scoped</DescriptionsItem></Descriptions></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-desc-cols', default: 'columns prop', source: 'structural' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }, { name: '--jx-line-secondary', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Descriptions props"><PropsTable props={[{ name: 'columns', type: 'number', default: '1', description: 'Term/value pairs per row.' }, { name: 'bordered', type: 'boolean', default: 'false', description: 'Paints hairline cell borders.' }, { name: 'density', type: 'Density', description: 'Overrides inherited density.' }]} /></SectionCard></div>

  <div id="see-also" data-reveal="">
    <SectionCard
      family="see-also"
      headerRegion="see-also"
      eyebrow="see also"
      title="See also"
      summary="The surfaces descriptions composes with."
    >
      <div class="flex flex-wrap gap-3">
        <a class="pill" href="/docs/components/table.html">table — the tabular sibling</a>
        <a class="pill" href="/docs/components/badge.html">badge — rich value cells</a>
        <a class="pill" href="/docs/components/press-button.html">press-button — the extra actions</a>
        <a class="pill" href="/docs/components/statistic.html">statistic — the metric readout</a>
      </div>
    </SectionCard>
  </div>
</div>

<style>
  /* the responsive rig: only the width matters — the container query
     does the folding */
  .desc-frame-rig {
    max-width: 100%;
  }

  /* the extra-slot card: consumer chrome around the dl */
  .desc-card {
    border: 1px solid var(--border);
  }
  .desc-card-head {
    align-items: center;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.625rem 1rem;
  }
</style>
