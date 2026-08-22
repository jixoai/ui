<script lang="ts">
  import CardGrid from '$lib/ui/card-grid.svelte';
  import CopyCommand from '$lib/copy-command.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import { icons } from '$lib/icons';
  import { reveal } from '$lib/reveal';
  import { CATALOG, catalogByGroup } from '$lib/catalog';

  // Catalog-driven index (2026-08-22, user ruling): the page renders the
  // FULL registry inventory (77 items) from the ONE catalog — overview,
  // header menu, and catalog.spec.ts all derive from it, so "components
  // exist but are not shown" can no longer happen silently. Grouping
  // follows antd's official taxonomy (General/Layout/Navigation/Data
  // Entry/Data Display/Feedback) + Engines & Theme + Docs Tooling.
  const groups = $derived(catalogByGroup());
  const uiCount = $derived(CATALOG.filter((entry) => entry.type === 'registry:ui').length);
  const libCount = $derived(CATALOG.filter((entry) => entry.type === 'registry:lib').length);

  // non-registry guide pages (deliberately OUTSIDE the catalog lock)
  const guides = [
    {
      name: 'recipes',
      href: '/components/recipes.html',
      summary: 'The deliberate non-components and antd concept mappings — where wrapping stops: watermark, image-preview, flex/grid, typography, mentions, tour contract.',
    },
  ];
</script>

<svelte:head>
  <title>Components · jixoai-ui</title>
  <meta
    name="description"
    content="The full jixoai-ui catalog — every registry item, grouped by the antd taxonomy: General, Layout, Navigation, Data Entry, Data Display, Feedback, plus Engines & Theme and Docs Tooling. Installable with npx jixoai-ui add."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
  <!-- Index hero. -->
  <div id="gallery" data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="jixoai-ui"
      title="Components — the full inventory"
      summary="The full registry inventory, grouped by the antd taxonomy (General / Layout / Navigation / Data Entry / Data Display / Feedback) plus Engines & Theme and Docs Tooling. Every card installs with npx jixoai-ui add — nothing is hidden, nothing is invented (catalog.spec.ts locks both directions)."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">{CATALOG.length} registry items</span>
        <span class="pill">{uiCount} components</span>
        <span class="pill">{libCount} engines</span>
        <span class="pill">1 theme</span>
      </div>
    </SectionCard>
  </div>

  <!-- Grouped index: font-nav heading over an equalized card-grid of
       linked section-cards. -->
  {#each groups as group (group.group.id)}
    <section id={group.group.id} aria-label="{group.group.label} components">
      <h2
        class="font-nav flex items-baseline gap-4 text-lg uppercase tracking-[0.3em]"
        data-reveal=""
        use:reveal
      >
        {group.group.label}
        <span class="text-[0.8em] text-muted-foreground tracking-[0.2em]">{group.group.zh}</span>
        <span class="bg-border h-px flex-1" aria-hidden="true"></span>
      </h2>

      <!-- min inherits the card-grid default (320px): two equal columns
           through the laptop band, four on desktop — no 3+1 orphan rows. -->
      <CardGrid class="mt-6">
        {#each group.entries as item, index (item.name)}
          <div data-reveal="" use:reveal={{ delay: index * 70, rise: 12 }}>
            <!-- The reveal wrapper stays the grid child; the card re-opts
                 into the shared subgrid rows (homepage law). The card
                 itself carries the press physics: it is one big link. -->
            <SectionCard
              class="relative grid grid-rows-subgrid row-span-2 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-primary hover:shadow-sm active:translate-x-px active:translate-y-px active:shadow-none motion-reduce:transition-none"
              headingLevel={3}
              eyebrow={item.type.replace('registry:', '')}
              title={item.name}
              summary={item.summary}
            >
              <div class="pointer-events-none relative z-[1] flex flex-wrap items-center justify-between gap-3">
                <span class="pointer-events-auto inline-flex"><CopyCommand command={`npx jixoai-ui add ${item.name}`} /></span>
                <span
                  class="text-muted-foreground/70 flex-none select-none"
                  aria-hidden="true"
                >
                  {@html icons.arrowRight}
                </span>
              </div>
              <!-- Stretched link: overlays the whole card so any click
                   opens the page; the body row above sits at z-1, keeping
                   the copy button its own click target. -->
              <a class="jx-card-link" href={item.href} aria-label={`open the ${item.name} page`}></a>
            </SectionCard>
          </div>
        {/each}
      </CardGrid>
    </section>
  {/each}

  <!-- Guides: real pages that are not registry items (outside the
       catalog lock by definition) -->
  <section id="guides" aria-label="guides">
    <h2
      class="font-nav flex items-baseline gap-4 text-lg uppercase tracking-[0.3em]"
      data-reveal=""
      use:reveal
    >
      Guides
      <span class="text-[0.8em] text-muted-foreground tracking-[0.2em]">指引</span>
      <span class="bg-border h-px flex-1" aria-hidden="true"></span>
    </h2>
    <CardGrid class="mt-6">
      {#each guides as item, index (item.name)}
        <div data-reveal="" use:reveal={{ delay: index * 70, rise: 12 }}>
          <SectionCard
            headingLevel={3}
            class="relative grid grid-rows-subgrid row-span-2 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-primary hover:shadow-sm active:translate-x-px active:translate-y-px active:shadow-none motion-reduce:transition-none"
            eyebrow="guides"
            title={item.name}
            summary={item.summary}
          >
            <div class="pointer-events-none relative z-[1] flex flex-wrap items-center justify-between gap-3">
              <span
                class="text-muted-foreground/70 flex-none select-none"
                aria-hidden="true"
              >
                {@html icons.arrowRight}
              </span>
            </div>
            <a class="jx-card-link" href={item.href} aria-label={`open the ${item.name} page`}></a>
          </SectionCard>
        </div>
      {/each}
    </CardGrid>
  </section>
</div>

<style>
  .jx-card-link {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .jx-card-link:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: -2px;
  }
</style>
