<script lang="ts">
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import { rt } from '$lib/surface/routes.stylex';
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

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<svelte:head>
  <title>Components · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui component inventory — every registry:ui module grouped by the antd taxonomy: General, Layout, Navigation, Layer, Data Entry, Data Display, Feedback. Installable with npx jixoai-ui add."
  />
</svelte:head>

<div class={cx(rt.shell, rt.flex, rt.col, rt.gap40)}>
  <!-- Index hero. -->
  <div id="gallery" data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="jixoai-ui · docs"
      title="Components — the UI-module inventory"
      summary="Every registry:ui module, grouped by the antd taxonomy (General / Layout / Navigation / Layer / Data Entry / Data Display / Feedback). Non-UI registry items — the engines, the theme sheet, the file payloads — are install targets documented on the registry overview, not components."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">{flatComponents.length} ui modules</span>
        <span class="pill">{installTargets.length} install targets → registry</span>
      </div>
    </SectionCard>
  </div>

  <!-- Grouped index: font-nav heading over an equalized card-grid of
       blueprint cards. -->
  {#each groups as group (group.group.id)}
    <section id={group.group.id} aria-label="{group.group.label} components" data-region={group.group.id}>
      <h2 class={cx(rt.cgHeading)} data-reveal="">
        {group.group.label}
        <span class={cx(rt.grow, rt.cgRule)} aria-hidden="true"></span>
      </h2>

      <!-- min inherits the card-grid default (320px): two equal columns
           through the laptop band, four on desktop — no 3+1 orphan rows. -->
      <CardGrid class={cx(rt.mt24)}>
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
