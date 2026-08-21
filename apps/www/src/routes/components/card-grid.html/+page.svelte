<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import CardGrid from '$lib/ui/card-grid.svelte';
  import Input from '$lib/ui/input.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the file tree shows the exact installed copy this site
  // consumes — ?raw imports the bytes, never a retyped duplicate.
  import gridSource from '$lib/ui/card-grid.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import CardGrid from '@ui/card-grid.svelte';
  import SectionCard from '@ui/section-card.svelte';
${close}

<CardGrid min="260px">
  <SectionCard eyebrow="alpha" title="Short header" summary="One summary line.">
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
  </SectionCard>

  <!-- not a two-block card? opt the child out of the shared rows -->
  <div data-no-subgrid><!-- anything --></div>
</CardGrid>`;

  const files: TreeFile[] = [
    { name: 'src/lib/ui/card-grid.svelte', content: gridSource },
    { name: 'src/lib/ui/card-grid-usage.svelte', content: usage },
  ];

  // Playground state: the min prop drives the auto-fit column count; the
  // checkbox wraps the third card in [data-no-subgrid] to show the opt-out.
  let minPx = $state(260);
  let optOut = $state(false);
</script>

<svelte:head>
  <title>Card grid · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai card-grid component: a grid + subgrid layout that equalizes cards — every child spans two shared rows (header / body), so headers align to one height and bodies fill to the tallest. Columns are auto-fit minmax; the min prop controls the collapse width."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
    <div data-reveal="" use:reveal>
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
  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="card-grid"
      description="Grid + subgrid equalizer: cards span the grid's two shared rows (header / body), so every header aligns to the tallest header and every body fills to the tallest body — no ragged tops, no unequal bottoms. Works with any two-block card; section-card qualifies unchanged."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/card-grid.svelte"
      {files}
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
        <Input
          type="range"
          label="min — column collapse width"
          min="180"
          max="480"
          step="20"
          value={minPx}
          oninput={(event) => {
            minPx = Number((event.currentTarget as HTMLInputElement).value);
          }}
        />
        <p class="jx-pg-note">
          <code class="text-accent">min = {minPx}px</code> — columns are
          <code class="text-accent">auto-fit, minmax(min(100%, min), 1fr)</code>, so raising the
          collapse width drops columns; the shared-row alignment holds at every count.
        </p>
        <Input
          type="checkbox"
          label="opt card 03 out — data-no-subgrid"
          checked={optOut}
          onchange={(event) => {
            optOut = (event.currentTarget as HTMLInputElement).checked;
          }}
        />
      {/snippet}
    </ComponentCanvas>
  </div>
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
  .jx-pg-note {
    color: var(--muted-foreground);
    font-size: 12px;
    line-height: 1.6;
    margin: 0;
  }
</style>
