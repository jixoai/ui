<!--
  The patterns gallery (apps/www/src/routes/patterns.html/+page.svelte,
  2026-08-30, terminal-patterns).

  GALLERY ONLY (the change's layering law): five cards, one per
  pattern item, each linking to its CANONICAL docs route
  (/docs/components/pattern-<name>.html — the same contract as every
  registry:ui item). No pattern documentation lives here — the card
  bodies carry the catalog summary and the install line, nothing else.

  The card set derives from the ONE catalog over a curated id list
  (the featured-projection pattern): an unknown id throws at build
  time, so this gallery can never keep a deleted item alive.
-->
<script lang="ts">
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import { CATALOG, type CatalogEntry } from '$lib/catalog';

  /** the five terminal patterns, gallery order */
  const PATTERN_IDS = [
    'pattern-login',
    'pattern-pricing',
    'pattern-hero-set',
    'pattern-faq',
    'pattern-cta',
  ] as const;

  const cards: CatalogEntry[] = PATTERN_IDS.map((id) => {
    const entry = CATALOG.find((candidate) => candidate.name === id);
    if (!entry) {
      throw new Error(
        `patterns gallery: registry has no item "${id}" — apply the registry.json entries (terminal-patterns task 5.1) or drop it from PATTERN_IDS`,
      );
    }
    return entry;
  });

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
  <title>Patterns · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui pattern gallery — five composed landing sections in the terminal idiom: the ssh login, the pricing comparison, the hero set, the man-page FAQ and the shell-prompt CTA. Each card links to its canonical docs page."
  />
</svelte:head>

<div class={cx(rt.shell, rt.flex, rt.col, rt.gap40)}>
  <div id="gallery" data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="jixoai-ui · patterns"
      title="Patterns — the composition product"
      summary="Five landing sections composed from the atoms you already have: login, pricing, heroes, FAQ, CTA. A pattern adds no primitives — it declares the atoms it composes, and installing it pulls the whole closure. Every card links to the pattern's canonical docs page; the source stays yours after add."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">{cards.length} patterns</span>
        <span class="pill">composition-only</span>
        <span class="pill">terminal idiom</span>
      </div>
    </SectionCard>
  </div>

  <section aria-label="pattern gallery" data-region="pattern-cards">
    <div class={cx(rt.ptGrid)}>
      {#each cards as card (card.name)}
        <a
          href={card.href}
          class={cx(rt.flex, rt.col, rt.gap12, rt.frame, rt.bgCard, rt.p16, rt.ptRadius, rt.ptCardFx)}
        >
          <p class={cx(rt.m0, rt.eyebrowPrimary)}>
            {card.type.replace('registry:', '')}
          </p>
          <h2 class={cx(rt.m0, rt.fontNav, rt.ptHeading, rt.trackTight)}>{card.name}</h2>
          <p class={cx(rt.m0, rt.ptSummary)}>{card.summary}</p>
          <p class={cx(rt.m0, rt.ptMtAuto, rt.fontNav, rt.text12, rt.ptTrack04, rt.inkMuted)}>
            <span class={cx(rt.inkPrimary)} aria-hidden="true">$</span>
            npx jixoai-ui add {card.name}
          </p>
        </a>
      {/each}
    </div>
  </section>
</div>
