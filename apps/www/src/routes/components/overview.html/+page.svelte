<script lang="ts">
  import CardGrid from '$lib/ui/card-grid.svelte';
  import CopyCommand from '$lib/copy-command.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import { icons } from '$lib/icons';
  import { reveal } from '$lib/reveal';

  // Pure index page (2026-08-20): every demo moved to its own
  // /components/<name>.html route; this page is only the catalog.
  // 18 documented components (form merges input/select/textarea into one
  // route) + 3 framework-free libs (reveal, toc-engine, highlight).
  interface IndexEntry {
    /** Display title = the component page's subject. */
    name: string;
    /** The page the whole card links to. */
    href: string;
    /** Registry items the install command adds. */
    add: string;
    /** Registry type eyebrow. */
    registry: string;
    /** One-line description. */
    summary: string;
  }

  interface IndexGroup {
    id: string;
    label: string;
    items: IndexEntry[];
  }

  function entry(name: string, summary: string): IndexEntry {
    return {
      name,
      href: `/components/${name}.html`,
      add: name,
      registry: 'registry:ui',
      summary,
    };
  }

  const groups: IndexGroup[] = [
    {
      id: 'layout',
      label: 'Layout',
      items: [
        entry(
          'website-scaffold',
          'The presentation-site scaffold: sticky header band, main column, footer, skip link — plus the overlay top layer and systematized view transitions.',
        ),
        entry(
          'scaffold-float',
          "The consumer half of the float provider: portals children into the scaffold's top layer so they ride the immersive slide with the header.",
        ),
        entry(
          'card-grid',
          'Grid + subgrid equalizer: shared header and body rows keep card tops aligned and bodies filled to the tallest.',
        ),
        entry(
          'section-card',
          'The content atom of the site grammar: bordered card, eyebrow in brand hue, font-nav title, text-pretty summary, body slot.',
        ),
      ],
    },
    {
      id: 'overlay',
      label: 'Overlay',
      items: [
        entry(
          'dialog',
          'Native dialog with showModal(): focus trap, Escape, top-layer rendering for free — jixoai surface with hard offset shadow.',
        ),
        entry(
          'popover',
          'The native Popover API base — popover=auto light dismiss, popovertarget trigger, zero JavaScript — on the jixoai hard-shadow surface.',
        ),
        entry(
          'terminal-card',
          'The Broadside hero terminal: traffic-light bar, one-shot typed command, outputs surfacing line by line, 6px hard offset shadow.',
        ),
      ],
    },
    {
      id: 'form',
      label: 'Form',
      items: [
        // One merged page documents the three form atoms.
        {
          name: 'form',
          href: '/components/form.html',
          add: 'input select textarea',
          registry: 'registry:ui',
          summary:
            'The NativeHTML form base: input, select, and textarea share one shell, label, and error contract — every native type passes through.',
        },
      ],
    },
    {
      id: 'display',
      label: 'Display',
      items: [
        entry(
          'code-card',
          'The readonly code surface on Shiki: filename tab, header/footer snippet slots, copy, on-demand grammars/themes, and the zero-download jixoai token theme.',
        ),
        entry(
          'table',
          'Native table semantics restyled: real thead/tbody/tfoot, hairline rows, muted hover, fit-content width with native overflow scroll.',
        ),
        entry(
          'tree-view',
          'ARIA file tree: role=tree with roving tabindex and the arrow-key contract; paths auto-build directory levels from flat file lists.',
        ),
        entry(
          'component-canvas',
          'The documentation workbench: live demo stage, playground pane, and a collapsible code drawer pairing tree-view with code-card.',
        ),
      ],
    },
    {
      id: 'interactive',
      label: 'Interactive',
      items: [
        entry(
          'press-button',
          'The only button in the grammar: hover lifts toward the viewer, active presses back into the page. primary / outline / copied.',
        ),
        entry(
          'theme-toggle',
          'light / dark / system in four variants, driving the shared theme contract with the no-flash inline bootstrap.',
        ),
        entry(
          'language-switcher',
          'Locale switching, anchor-based: a bilingual segmented pair and a dropdown menu for three or more locales.',
        ),
      ],
    },
    {
      id: 'shell',
      label: 'Shell',
      items: [
        entry(
          'terminal-header',
          'The always-dark CRT bezel nav bar: brand wing, nav pills with grouped mega panels, switcher slot at the far right.',
        ),
        entry(
          'terminal-footer',
          'Ghost wordmark footer: a huge hollow brand word over the text-stroke recipe, muted meta row closing the narrative.',
        ),
        entry(
          'hero-section',
          'The Broadside hero: clamp-scaled lead type with a primary accent tail, badge row, copy-command CTA, terminal column.',
        ),
      ],
    },
  ];
</script>

<svelte:head>
  <title>Components · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui component index: 18 documented components across Layout, Overlay, Form, Display, Interactive, and Shell — every one a registry item installable with npx jixoai-ui add."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
  <!-- Index hero. -->
  <div id="gallery" data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="jixoai-ui"
      title="Components"
      summary="The jixoai design language component library — every item is a registry item installable via npx jixoai-ui add."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">18 components</span>
        <span class="pill">3 libs</span>
      </div>
    </SectionCard>
  </div>

  <!-- Grouped index: font-nav heading over an equalized card-grid of
       linked section-cards. -->
  {#each groups as group (group.id)}
    <section id={group.id} aria-label="{group.label} components">
      <h2
        class="font-nav flex items-baseline gap-4 text-lg uppercase tracking-[0.3em]"
        data-reveal=""
        use:reveal
      >
        {group.label}
        <span class="bg-border h-px flex-1" aria-hidden="true"></span>
      </h2>

      <!-- min inherits the card-grid default (320px): two equal columns
           through the laptop band, four on desktop — no 3+1 orphan rows. -->
      <CardGrid class="mt-6">
        {#each group.items as item, index (item.name)}
          <div data-reveal="" use:reveal={{ delay: index * 70, rise: 12 }}>
            <!-- The reveal wrapper stays the grid child; the card re-opts
                 into the shared subgrid rows (homepage law). The card
                 itself carries the press physics: it is one big link. -->
            <SectionCard
              class="relative grid grid-rows-subgrid row-span-2 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-primary hover:shadow-sm active:translate-x-px active:translate-y-px active:shadow-none motion-reduce:transition-none"
              eyebrow={item.registry}
              title={item.name}
              summary={item.summary}
            >
              <div class="pointer-events-none relative z-[1] flex flex-wrap items-center justify-between gap-3">
                <span class="pointer-events-auto inline-flex"><CopyCommand command={`npx jixoai-ui add ${item.add}`} /></span>
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
