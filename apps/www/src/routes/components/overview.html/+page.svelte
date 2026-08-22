<script lang="ts">
  import CardGrid from '$lib/ui/card-grid.svelte';
  import CopyCommand from '$lib/copy-command.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import { icons } from '$lib/icons';
  import { reveal } from '$lib/reveal';

  // Pure index page (2026-08-20): every demo moved to its own
  // /components/<name>.html route; this page is only the catalog.
  // 56 documented components (form merges input/select/textarea into one
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
        entry(
          'badge',
          'The inline status chip: font-nav micro-label, 1px border, radius 0 — tones inside the one-brand-hue law.',
        ),
        entry(
          'separator',
          'W3C-first: the horizontal separator IS the native <hr>; only the vertical posture takes the ARIA route.',
        ),
        entry(
          'skeleton',
          'The loading placeholder block: muted surface, terminal brightness pulse, aria-hidden scenery — geometry from your layout.',
        ),
        entry(
          'avatar',
          'Native <img> — lazy, async-decoded, intrinsic dimensions — with a CJK-safe initials fallback for failed sources.',
        ),
        entry(
          'alert',
          'Inline notice block with live-region semantics as a prop: role=status polite by default, role=alert when assertive.',
        ),
        entry(
          'progress',
          'The native <progress> element with the jixoai paint: 1px frame, brand fill, terminal stripe sweep when indeterminate.',
        ),
        entry(
          'pagination',
          'A nav landmark of real links: sticky-edge page windows, aria-current on the active page, honest disabled spans at the bounds.',
        ),
        entry(
          'toc',
          'The rule-tracker reading rail: IoM-weighted nodes on the desktop spine, glass terminal rail on mobile — powered by the framework-free toc-engine.',
        ),
        entry(
          'anchor',
          'The heading-anchor link list — real fragment links, read-only scroll spy, aria-current=location. The light sibling of toc.',
        ),
        entry(
          'alert-dialog',
          'The destructive-decision surface: role=alertdialog with required labelled/described wiring, focus landing on Cancel, destructive confirm paint by default.',
        ),
        entry(
          'breadcrumb',
          'A nav landmark over an ordered list of real links: aria-current on the last crumb, and a middle-collapse whose ellipsis is a live link.',
        ),
        entry(
          'kbd',
          'The native keyboard-input glyph with the jixoai chip paint — no key parsing, no platform detection.',
        ),
        entry(
          'toast',
          'Two seams: a DOM-free store (push/dismiss/expiry with hover pause) and a viewport mounted once — corner stack, per-item live regions.',
        ),
        entry(
          'input-otp',
          'N single-char slots with auto-advance, backstep and paste distribution — one joined value through the ElementInternals bridge.',
        ),
        entry(
          'carousel',
          'CSS scroll-snap paging, native scrolling motion, JS only reads the position for the dots — no cloning, no virtual window.',
        ),
        entry(
          'empty',
          'The no-data state of the eight-state machine — terminal illustration, title, description, actions. Nothing more.',
        ),
        entry(
          'statistic',
          'The metric readout: micro-label over tabular-nums with text-glyph trends — good is yours to compose.',
        ),
        entry(
          'result',
          'The thin outcome surface: status glyph + title + description + actions. empty ≠ result by ruling.',
        ),
        entry(
          'descriptions',
          'The enterprise detail view as a real dl — dt/dd pairs in a grid; bordered is CSS, never a table in disguise.',
        ),
        entry(
          'image',
          'The no-CLS native picture: required intrinsic dimensions, lazy decode, alt semantics, failure fallback. Lightbox is a dialog recipe.',
        ),
        entry(
          'badge-indicator',
          "antd Badge's live half: the count/dot overlay riding a corner — zero hides honestly, 99+ caps the count.",
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
        entry(
          'accordion',
          'W3C-first: details/summary with border collapse and opt-in exclusive mode — native toggle, keyboard, SSR state.',
        ),
        entry(
          'tabs',
          'The APG tablist contract in four family files: automatic activation, roving tabindex, deterministic id pairing.',
        ),
        entry(
          'tooltip',
          'Hover-intent hint on the popover laws: popover=manual panel, CSS anchoring, focus opens instantly, Escape closes.',
        ),
        entry(
          'dropdown-menu',
          'The ARIA menu pattern on the popover laws: item-1 focus on open, wrapping arrows, typeahead, focus restore on selection.',
        ),
        entry(
          'hover-card',
          "Tooltip's intent model with an interactive panel: crossings between trigger and card never dismiss, only real exits.",
        ),
        entry(
          'command',
          'The ⌘K palette on a native dialog: deterministic ranking, aria-activedescendant combobox, one execution path — no fuzzy, no cmdk layer.',
        ),
        entry(
          'toggle-group',
          'Joined press-state buttons as one form field — single picks a value, multiple submits one FormData entry per press (bridge multivalue).',
        ),
        entry(
          'navigation-menu',
          'The site-nav bar as a thin coordinator: arrow walking, hover intent with glide, popover panels carrying real links.',
        ),
        entry(
          'menubar',
          "The app menu bar with its own walker: arrows glide between top menus, ↓ opens and focuses, Escape returns.",
        ),
        entry(
          'popconfirm',
          "The LIGHT confirm bubble: light dismiss IS the cancel path, focus lands on Cancel — not an alertdialog by ruling.",
        ),
        entry(
          'transfer',
          'Two fieldsets of real checkboxes and a batch mover — value is the target list, selection is transient.',
        ),
        entry(
          'cascader',
          'A chain of native selects, each listing the children of the previous pick — the joined path submits via the bridge.',
        ),
        entry(
          'float-button',
          'The fixed corner action — plain or menu idiom, corner as a prop, layout untouched.',
        ),
        entry(
          'steps',
          'The wizard ol: completed steps are links back, current is aria-current=step, future stays inert.',
        ),
        entry(
          'timeline',
          'The activity spine: an ol of timestamped entries, pending renders the hollow dot. Zero JS.',
        ),
        entry(
          'spin',
          'The terminal cursor under role=status; wrapping mode owns pointer events through the scrim.',
        ),
        entry(
          'recipes',
          'The deliberate non-components: aspect-ratio, data-table, chart, sidebar as documented composition recipes — where wrapping stops.',
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
    content="The jixoai-ui component index: 56 documented components across Layout, Overlay, Form, Display, Interactive, and Shell — every one a registry item installable with npx jixoai-ui add."
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
        <span class="pill">56 components</span>
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
