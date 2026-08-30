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
</script>

<svelte:head>
  <title>Patterns · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui pattern gallery — five composed landing sections in the terminal idiom: the ssh login, the pricing comparison, the hero set, the man-page FAQ and the shell-prompt CTA. Each card links to its canonical docs page."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
  <div id="gallery" data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="jixoai-ui · patterns"
      title="Patterns — the composition product"
      summary="Five landing sections composed from the atoms you already have: login, pricing, heroes, FAQ, CTA. A pattern adds no primitives — it declares the atoms it composes, and installing it pulls the whole closure. Every card links to the pattern's canonical docs page; the source stays yours after add."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">{cards.length} patterns</span>
        <span class="pill">composition-only</span>
        <span class="pill">terminal idiom</span>
      </div>
    </SectionCard>
  </div>

  <section aria-label="pattern gallery" data-region="pattern-cards">
    <div class="grid gap-4 min-[760px]:grid-cols-2 min-[1100px]:grid-cols-3">
      {#each cards as card (card.name)}
        <a
          href={card.href}
          class="group flex flex-col gap-3 border border-border bg-card p-4 rounded-(--radius)
            transition-[transform,box-shadow,border-color] duration-150
            hover:border-primary hover:shadow-sm
            active:translate-x-px active:translate-y-px active:shadow-none
            motion-reduce:transition-none"
        >
          <p class="m-0 font-nav text-[11px] uppercase tracking-[0.24em] text-primary">
            {card.type.replace('registry:', '')}
          </p>
          <h2 class="m-0 font-nav text-[1.05rem] leading-tight tracking-tight">{card.name}</h2>
          <p class="m-0 min-h-[3.2rem] text-[13px] leading-5 text-muted-foreground">{card.summary}</p>
          <p class="m-0 mt-auto font-nav text-xs tracking-[0.04em] text-muted-foreground">
            <span class="text-primary" aria-hidden="true">$</span>
            npx jixoai-ui add {card.name}
          </p>
        </a>
      {/each}
    </div>
  </section>
</div>
