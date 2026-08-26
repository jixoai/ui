<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlayRange, PlayToggle, PlayHelp } from '$lib/playground';

  // ToC outline: the closing law (the canvas above is the workbench).

  // Same-source law: the file tree shows the exact installed copy this site
  // consumes — ?raw imports the bytes, never a retyped duplicate.
  import gridSource from '$lib/ui/card-grid/card-grid.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample, assembled: the static const is the initial-state
  // assembly, the $derived is the live one — same parts, no copied body
  const usageHead = `<script lang="ts">
  import CardGrid from '@ui/card-grid.svelte';
  import SectionCard from '@ui/section-card.svelte';
${close}

`;
  const usageCards = `  <SectionCard eyebrow="alpha" title="Short header" summary="One summary line.">
    <p>Body.</p>
  </SectionCard>
  <SectionCard
    eyebrow="beta"
    title="A deliberately much longer header that wraps"
    summary="A longer summary pushing the shared header row taller — every header aligns to it."
  >
    <ul class="flex flex-col gap-2">
      <li>body fills to the tallest row</li>
      <li>…</li>
    </ul>
  </SectionCard>`;
  const usageOptOut = `

  <!-- not a two-block card? opt the child out of the shared rows -->
  <div data-no-subgrid><!-- anything --></div>`;

  const assembleUsage = (min: number, withOptOut: boolean): string =>
    `${usageHead}<CardGrid min={${min}}>
${usageCards}${withOptOut ? usageOptOut : ''}
</CardGrid>`;

  const usage = assembleUsage(260, true);

  const files: TreeFile[] = [
    { name: 'registry/files/ui/card-grid.svelte', content: gridSource },
    { name: 'src/lib/ui/card-grid-usage.svelte', content: usage },
  ];

  // playground protocol (P1): the page owns the state; the canvas only
  // calls back — snapshot + reset + echo projection + live usage
  const canvasInitial = { minPx: 260, optOut: false };
  let minPx = $state(canvasInitial.minPx);
  let optOut = $state(canvasInitial.optOut);
  function resetCanvas(): void {
    minPx = canvasInitial.minPx;
    optOut = canvasInitial.optOut;
  }
  const usageLive = $derived(assembleUsage(minPx, optOut));
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;
</script>

<svelte:head>
  <title>Card grid · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai card-grid component: a grid + subgrid layout that equalizes cards — every child spans two shared rows (header / body), so headers align to one height and bodies fill to the tallest. Columns are auto-fit minmax; the min prop controls the collapse width."
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
        title="card-grid — the subgrid equalizer"
        summary="Shared header and body rows keep card tops aligned and bodies filled to the tallest: grid + subgrid, works with any two-block card."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">subgrid rows</span>
          <span class="pill">any two-block card</span>
          <span class="pill">min prop</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="card-grid"
        description="Grid + subgrid equalizer: cards span the grid's two shared rows (header / body), so every header aligns to the tallest header and every body fills to the tallest body — no ragged tops, no unequal bottoms. The slider drives the collapse width; the checkbox opts card 03 out."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/card-grid.svelte"
        {files}
        stage="fill"
        onreset={resetCanvas}
        output={[
          { label: 'min', value: `${minPx}px` },
          { label: 'card 03', value: optOut ? 'data-no-subgrid' : 'shared rows' },
        ]}
        resolveFileContent={resolveUsage}
      >
        {#snippet children()}
          <CardGrid min={`${minPx}px`} class="w-full">
            <SectionCard
              eyebrow="card 01"
              title="Short header"
              summary="One summary line — this header is short, yet it reserves the same shared row height as card 02's taller block."
            >
              <div class="flex h-full flex-col justify-between gap-3">
                <p class="text-[13px] leading-6">A short body. The subgrid row still stretches it to the tallest card's extent.</p>
                <p class="jx-grid-hint">body row: shared</p>
              </div>
            </SectionCard>
            <SectionCard
              eyebrow="card 02"
              title="A deliberately much longer header that wraps to two lines"
              summary="The tallest header block sets the shared header row for every card in the grid — resize the stage with the Playground slider and watch the alignment hold at every column count."
            >
              <div class="flex h-full flex-col justify-between gap-3">
                <ul class="flex flex-col gap-1.5 text-[13px] leading-6">
                  <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span><span>headers align to the tallest header</span></li>
                  <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span><span>bodies fill to the tallest body</span></li>
                  <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span><span>rows live on the GRID, not on each card</span></li>
                </ul>
                <p class="jx-grid-hint">body row: shared</p>
              </div>
            </SectionCard>
            {#if optOut}
              <div data-no-subgrid>
                <SectionCard
                  eyebrow="card 03"
                  title="Opted out — data-no-subgrid"
                  summary="This child wraps itself in data-no-subgrid: it keeps its grid cell but leaves the shared rows, so its body stops stretching."
                >
                  <p class="text-[13px] leading-6">A plain auto row — shorter, by choice.</p>
                </SectionCard>
              </div>
            {:else}
              <SectionCard
                eyebrow="card 03"
                title="Opted out — data-no-subgrid"
                summary="This card is the same two-block card as the others while the Playground checkbox is off; flip it to watch the opt-out collapse the shared-row contract."
              >
                <div class="flex h-full flex-col justify-between gap-3">
                  <p class="text-[13px] leading-6">Same law as cards 01 and 02 — spanning and subgridding the shared rows.</p>
                  <p class="jx-grid-hint">body row: shared</p>
                </div>
              </SectionCard>
            {/if}
          </CardGrid>
        {/snippet}
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="min" hint="column collapse width">
              <PlayRange bind:value={minPx} min={180} max={480} step={20} />
            </PlayRow>
            <PlayRow label="opt card 03 out" hint="data-no-subgrid">
              <PlayToggle bind:value={optOut} />
            </PlayRow>
            <PlayHelp>
              columns are <code>auto-fit, minmax(min(100%, min), 1fr)</code> —
              raising the collapse width drops columns; the shared-row alignment holds at every
              count. The toggle wraps card 03 in <code>data-no-subgrid</code>
              so it leaves the shared rows while keeping its cell.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="subgrid-law" data-reveal="">
      <SectionCard
        family="subgrid-law"
        headerRegion="subgrid-law"
        eyebrow="law"
        title="Rows live on the grid"
        summary="The grid defines the two shared rows and every child subgrids into them; a card never measures its siblings. That is why the alignment survives any column count, any card content, and any resize — and why opting out is a single attribute instead of a prop."
      >
        <div class="flex flex-col gap-5">
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the GRID owns <code class="text-accent">grid-template-rows: auto 1fr</code>;
                each child <code class="text-accent">grid-row: span 2</code> +
                <code class="text-accent">grid-template-rows: subgrid</code> — no JS, no
                measurement, no ResizeObserver</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>works with any two-block card: the grid never asks what the child is —
                section-card qualifies unchanged</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the opt-out is an attribute, not a prop: <code class="text-accent">data-no-subgrid</code>
                on a wrapper keeps the cell but restores the child's own rows</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Card grid variants" summary="One layout, three postures: the shared-row grid, the opted-out cell, and the lone-child cap.">
    <div class="grid gap-4 md:grid-cols-3">
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">shared rows (default)</p>
        <p class="text-[13px] leading-6">Every child spans <code class="text-accent">auto 1fr</code> and subgrids — headers align, bodies fill.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">data-no-subgrid opt-out</p>
        <p class="text-[13px] leading-6">A wrapper attribute keeps the cell but restores the child's own rows — not a prop.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">lone child</p>
        <p class="text-[13px] leading-6">auto-fit would stretch a lone card into a banner; it is capped at an editorial measure.</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Feed it any two-block cards; the grid never asks what a child is — section-card qualifies unchanged."><CodeBlock code={usage} lang="svelte" meta="CardGrid usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Pure layout — no semantics added or removed; the entrance stagger respects reduced motion."><A11yTable keys={[{ key: '—', action: 'Not interactive — a layout container; children keep their own semantics' }]} aria={[{ name: '(none)', value: '—', description: 'The grid adds no roles or labels; DOM order is the reading order.' }, { name: 'prefers-reduced-motion', value: 'reduce', description: 'The internal entrance cascade is skipped — cards render fully visible.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Column geometry rides the inline --jx-grid-min token; the entrance stagger is a per-index delay."><div class="flex flex-col gap-5"><DensityDemo><CardGrid min="220px" class="w-full"><SectionCard eyebrow="card 01" title="Shared header" summary="Header row shared across the grid."><p class="text-[13px] leading-6">Body fills to the tallest row.</p></SectionCard><SectionCard eyebrow="card 02" title="Another header" summary="Second card in the density demo."><p class="text-[13px] leading-6">The gap and rows are fixed; density does not rescale the grid.</p></SectionCard></CardGrid></DensityDemo><TokenTable tokens={[{ name: '--jx-grid-min', default: '320px (min prop)', source: 'component', description: 'Column collapse width — auto-fit minmax floor.' }, { name: '--jx-card-i', default: '0–7', source: 'component', description: 'Per-child stagger index driving the entrance delay.' }, { name: 'stagger step', default: '70ms (capped at 8th child)', source: 'structural' }, { name: 'gap', default: '20px (gap-5)', source: 'structural' }, { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Three props — the grid is layout only; everything else is the children's own contract."><PropsTable props={[{ name: 'min', type: 'string', default: "'320px'", description: 'Minimum column width before the grid collapses a column (any CSS length).' }, { name: 'children', type: 'Snippet', default: '—', description: 'The cards; each child spans the two shared rows.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the grid container.' }]} /></SectionCard></div>
</div>

<style>
  .jx-grid-hint {
    color: var(--muted-foreground);
    font-family: var(--font-nav);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    white-space: nowrap;
  }
</style>
