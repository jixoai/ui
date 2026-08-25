<script lang="ts">
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import OverviewCard from '$lib/overview-card.svelte';
  import { flatComponents, installTargets, docsComponentGroups } from '$lib/docs-route-model';

  // The UI-module inventory (docs-restructure r2, Codex P1-1): the page
  // renders docsComponentGroups — registry:ui ONLY, from the ONE route
  // model — never the raw catalog. Non-UI install targets (engines,
  // theme, files) live on the registry overview; the recipes guide is a
  // Sections chapter. Locked by test/docs-structure.spec.ts (the page's
  // card set == the 73 ui names, source-guarded + dist-checked).
  //
  // Card law (2026-08-25, Owner rulings): body = ONLY the satori
  // blueprint; no hover-revealed description wing; hover never moves
  // the card (border/shadow only — the press law); the copy control is
  // the top-corner icon (tooltip carries the command).
  const groups = $derived(docsComponentGroups);
</script>

<svelte:head>
  <title>Components · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui component inventory — every registry:ui module grouped by the antd taxonomy: General, Layout, Navigation, Layer, Data Entry, Data Display, Feedback. Installable with npx jixoai-ui add."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
  <!-- Index hero. -->
  <div id="gallery" data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="jixoai-ui · docs"
      title="Components — the UI-module inventory"
      summary="Every registry:ui module, grouped by the antd taxonomy (General / Layout / Navigation / Layer / Data Entry / Data Display / Feedback). Non-UI registry items — the engines, the theme sheet, the file payloads — are install targets documented on the registry overview, not components."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">{flatComponents.length} ui modules</span>
        <span class="pill">{installTargets.length} install targets → registry</span>
      </div>
    </SectionCard>
  </div>

  <!-- Grouped index: font-nav heading over an equalized card-grid of
       blueprint cards. -->
  {#each groups as group (group.group.id)}
    <section id={group.group.id} aria-label="{group.group.label} components" data-region={group.group.id}>
      <h2
        class="font-nav flex items-baseline gap-4 text-lg uppercase tracking-[0.3em]"
        data-reveal=""
      >
        {group.group.label}
        <span class="bg-border h-px flex-1" aria-hidden="true"></span>
      </h2>

      <!-- min inherits the card-grid default (320px): two equal columns
           through the laptop band, four on desktop — no 3+1 orphan rows. -->
      <CardGrid class="mt-6">
        {#each group.entries as item (item.name)}
          <!-- the card re-opts into the shared subgrid rows (homepage
               law); CardGrid owns the staggered entrance -->
          <OverviewCard
            name={item.name}
            type={item.type.replace('registry:', '')}
            summary={item.summary}
            href={item.href}
            command="npx jixoai-ui add {item.name}"
          />
        {/each}
      </CardGrid>
    </section>
  {/each}
</div>
