<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlayToggle, PlayHelp } from '$lib/playground';

  // ToC outline: the closing law (the canvas above is the workbench).

  // Same-source law: the file tree shows the exact installed copy this site
  // consumes — ?raw imports the bytes, never a retyped duplicate.
  import cardSource from '$lib/ui/section-card/section-card.svelte?raw';

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
    { name: 'registry/files/ui/section-card.svelte', content: cardSource },
    { name: 'src/lib/ui/section-card-usage.svelte', content: usage },
  ];

  // playground protocol (P1): the page owns the state; the canvas only
  // calls back — snapshot + reset + live usage (the controls carry their
  // own readout, so no echo rows).
  // headingLevel stays 2 on the live instance: hero tone pairs with
  // headingLevel={1} for an inner page head, and this page already owns
  // its single h1 (S4.1 unique-h1 law).
  const canvasInitial = {
    tone: 'default' as 'default' | 'hero',
    eyebrow: 'registry:ui',
    summary: true,
  };
  let demoTone = $state(canvasInitial.tone);
  let demoEyebrow = $state(canvasInitial.eyebrow);
  let showSummary = $state(canvasInitial.summary);
  // kit option map: the enum control speaks the typed union directly
  const toneOptions: { value: 'default' | 'hero'; label: string }[] = [
    { value: 'default', label: 'default' },
    { value: 'hero', label: 'hero' },
  ];
  function resetCanvas(): void {
    demoTone = canvasInitial.tone;
    demoEyebrow = canvasInitial.eyebrow;
    showSummary = canvasInitial.summary;
  }

  const demoTitle = $derived(
    demoTone === 'hero' ? 'The inner-page hero head.' : 'The content atom.',
  );
  const demoSummary = $derived(
    demoTone === 'hero'
      ? 'Hero tone: clamp-scaled font-nav title, text-balance, a foreground summary at 78% — this is the head of an inner page, one per route.'
      : 'Default tone: the everyday bordered block — eyebrow row, font-nav title, muted text-pretty summary, and the body snippet slot below the hairline.',
  );

  // live usage: a compact instance mirroring the playground state; free
  // text (eyebrow/title/summary) goes through q() = JSON.stringify
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`<SectionCard${demoTone === 'hero' ? '\n  headingLevel={1}\n  tone="hero"' : ''}${demoEyebrow === '' ? '' : `\n  eyebrow=${q(demoEyebrow)}`}
  title=${q(demoTitle)}${showSummary ? `\n  summary=${q(demoSummary)}` : ''}
>
  <div class="flex flex-wrap gap-3"><span class="pill">body snippet</span></div>
</SectionCard>`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;
</script>

<svelte:head>
  <title>Section card · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai section-card component: the content atom of the site grammar — a bordered card with eyebrow (brand hue, tracked 0.24em), font-nav title, text-pretty summary, and a body snippet slot. tone=hero renders the inner-page head; headingLevel picks h1 or h2."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="section-card — the content atom"
        summary="The content atom of the site grammar: bordered card, eyebrow in brand hue, font-nav title, text-pretty summary, body snippet slot."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">eyebrow · title · summary · body</span>
          <span class="pill">tone=hero</span>
          <span class="pill">headingLevel</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="section-card"
        description="The content atom of the site grammar: a bordered card, header block (optional eyebrow in brand hue + font-nav title + optional summary), and the body snippet slot. Every page on this site is built from it — and this very canvas page wears two instances right now."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/section-card.svelte"
        {files}
        stage="fill"
        onreset={resetCanvas}
        resolveFileContent={resolveUsage}
      >
        {#snippet children()}
          <!-- The LIVE instance is driven by the Playground: tone, eyebrow
               presence, and summary presence are live props — flip each
               control to walk the variants. data-doc-demo-scope: the
               component under test EXISTS to render headings — its title
               is the demo's subject, so this subtree opts out of the
               no-headings lint rule. -->
          <div data-doc-demo-scope="headings-ok">
            <SectionCard
              class="w-full max-w-2xl"
              headingLevel={2}
              tone={demoTone}
              eyebrow={demoEyebrow === '' ? undefined : demoEyebrow}
              title={demoTitle}
              summary={showSummary ? demoSummary : undefined}
            >
              <div class="flex flex-wrap gap-3">
                <span class="pill">body snippet</span>
                <span class="pill">heading: h2</span>
                <span class="pill">tone: {demoTone}</span>
                <span class="pill">{demoEyebrow === '' ? 'no eyebrow' : 'eyebrow on'}</span>
              </div>
            </SectionCard>
          </div>
        {/snippet}
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="tone">
              <PlaySegmented bind:value={demoTone} options={toneOptions} />
            </PlayRow>
            <PlayRow label="summary">
              <PlayToggle bind:value={showSummary} />
            </PlayRow>
            <!-- free text has no kit control: the registry Input keeps its own label -->
            <Input
              type="text"
              label="eyebrow"
              placeholder="empty — the row disappears"
              bind:value={demoEyebrow}
            />
            <PlayHelp>
              Clear the eyebrow to see the optional row collapse. Hero tone pairs with
              <code>headingLevel={1}</code> on a real inner-page head — the
              live instance here stays h2 so this page keeps exactly one h1.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="card-law" data-reveal="">
      <SectionCard
        family="card-law"
        headerRegion="card-law"
        eyebrow="law"
        title="Anatomy & ToC wiring"
        summary="Four optional slots — eyebrow, title, summary, body — and three attributes that make the card legible to the toc-engine. The card is the only place a page writes headings: it renders h1 or h2 itself so the level never skips."
      >
        <div class="flex flex-col gap-5">
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">headingLevel</code> picks h1 (hero head, one per
                route) or h2 (the everyday section) — pages never hand-roll their own heading
                markup on top</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">family</code> stamps <code class="text-accent">data-family</code>
                on the section root — the whole-extent marker the ToC spine reads</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">region</code> stamps a leaf on the root when the body
                carries NO child regions; <code class="text-accent">headerRegion</code> stamps the
                header block only when it does — non-overlapping leaves by construction</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Two tones: the everyday bordered section and the inner-page hero head.">
    <div class="flex flex-wrap items-start gap-6">
      <div class="flex min-w-64 flex-1 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">tone default · h2</span><SectionCard eyebrow="quick start" title="Acquire a Backend." summary="The everyday content atom: eyebrow row, muted summary, body slot."><p class="text-[13px]">body snippet slot</p></SectionCard><p class="text-muted-foreground text-[12.5px]">every section on a page</p></div>
      <div class="flex min-w-64 flex-1 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">tone hero · h1</span><SectionCard tone="hero" eyebrow="registry:ui" title="The hero head." summary="Clamp-scaled title, foreground summary — one per route."><div class="flex flex-wrap gap-3"><span class="pill">hero body</span></div></SectionCard><p class="text-muted-foreground text-[12.5px]">the inner-page head (S4.1 unique-h1 law)</p></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Pages never hand-roll heading markup — the card renders h1/h2 itself so levels never skip."><CodeBlock code={usage} lang="svelte" meta="SectionCard usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The card owns the heading tree: one h1 per route, h2 sections beneath, no skipped levels."><A11yTable keys={[]} aria={[{ name: 'heading structure', value: 'h1 | h2', description: 'headingLevel picks the level; the card is the only heading author on a page' }, { name: 'data-family / data-region', value: 'toc extents', description: 'Machine-readable section extents — not user-facing, but keep the pairing consistent for the rail' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="Site chrome, not a density-scaled control: the card sizes from the page type ramp and theme tokens only."><div class="flex flex-col gap-6"><DensityDemo><SectionCard eyebrow="quick start" title="Acquire a Backend." summary="One paragraph of context."><p class="text-[13px]">Body slot at this density.</p></SectionCard></DensityDemo><TokenTable tokens={[{ name: 'eyebrow', default: '--primary · 0.24em tracking', source: 'color' }, { name: 'border', default: 'border-border hairline', source: 'color' }, { name: 'tone hero', default: 'clamp-scaled title', source: 'component', description: 'text-balance title, foreground summary at 78%' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the SectionCard Props interface — four content slots plus the ToC wiring attributes."><PropsTable props={[{ name: 'title', type: 'string', default: '—', description: 'The font-nav heading (h1 or h2 by headingLevel).', required: true }, { name: 'eyebrow', type: 'string', default: '—', description: 'Optional eyebrow row in brand hue, tracked 0.24em.' }, { name: 'summary', type: 'string', default: '—', description: 'Optional muted text-pretty lead.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The body slot below the hairline.', required: true }, { name: 'headingLevel', type: '1 | 2', default: '2', description: 'The heading level the card renders.' }, { name: 'tone', type: "'default' | 'hero'", default: "'default' · Own default, not ambient", description: 'Everyday bordered section or inner-page hero head.' }, { name: 'family', type: 'string', default: '—', description: 'data-family on the section root (toc-engine parent extent).' }, { name: 'region', type: 'string', default: '—', description: 'data-region on the section root (toc-engine leaf) when the body carries NO child regions.' }, { name: 'headerRegion', type: 'string', default: '—', description: 'data-region on the header block only — the section leaf when the body carries child regions.' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough to the root.' }]} /></SectionCard></div>
</div>
