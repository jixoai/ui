<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import Input from '$lib/ui/input.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import NativeSelect from '$lib/ui/native-select.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import { reveal } from '$lib/reveal';

  // ToC outline: the closing law (the canvas above is the workbench).
  const tocSections = [{ id: 'card-law', label: 'Anatomy & ToC wiring' }];

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
    { name: 'registry/files/ui/section-card.svelte', content: cardSource },
    { name: 'src/lib/ui/section-card-usage.svelte', content: usage },
  ];

  // playground protocol (P1): the page owns the state; the canvas only
  // calls back — snapshot + reset + echo projection + live usage.
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
  <aside class="jx-toc-aside" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="" use:reveal>
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

    <div data-reveal="" use:reveal>
      <ComponentCanvas
        title="section-card"
        description="The content atom of the site grammar: a bordered card, header block (optional eyebrow in brand hue + font-nav title + optional summary), and the body snippet slot. Every page on this site is built from it — and this very canvas page wears two instances right now."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/section-card.svelte"
        {files}
        onreset={resetCanvas}
        echo={[
          { label: 'tone', value: demoTone },
          { label: 'eyebrow', value: demoEyebrow || '—' },
          { label: 'summary', value: showSummary },
        ]}
        resolveFileContent={resolveUsage}
      >
        {#snippet children()}
          <!-- The LIVE instance is driven by the Playground: tone, eyebrow
               presence, and summary presence are live props — flip each
               control to walk the variants. -->
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
        {/snippet}
        {#snippet playground()}
          <div class="jx-play-fields">
            <div class="jx-play-field">
              <NativeSelect
                label="tone"
                value={demoTone}
                onchange={(event) => {
                  demoTone = (event.currentTarget as HTMLSelectElement).value as typeof demoTone;
                }}
              >
                <option value="default">default</option>
                <option value="hero">hero</option>
              </NativeSelect>
            </div>
            <div class="jx-play-field">
              <Input
                type="text"
                label="eyebrow"
                placeholder="empty — the row disappears"
                value={demoEyebrow}
                oninput={(event) => {
                  demoEyebrow = (event.currentTarget as HTMLInputElement).value;
                }}
              />
            </div>
            <div class="jx-play-field">
              <Input
                type="checkbox"
                label="summary"
                checked={showSummary}
                onchange={(event) => {
                  showSummary = (event.currentTarget as HTMLInputElement).checked;
                }}
              />
            </div>
            <p class="jx-play-help">
              Clear the eyebrow to see the optional row collapse. Hero tone pairs with
              <code class="text-accent">headingLevel={1}</code> on a real inner-page head — the
              live instance here stays h2 so this page keeps exactly one h1.
            </p>
          </div>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="card-law" data-reveal="" use:reveal>
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
