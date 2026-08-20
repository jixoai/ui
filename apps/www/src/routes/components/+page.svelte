<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import CopyCommand from '$lib/copy-command.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import ThemeToggle from '$lib/ui/theme-toggle.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import { reveal } from '$lib/reveal';

  // Combo ToC outline (registry component). Ids match the data-region /
  // data-family extents marked in the content below — this page IS the demo.
  const sections = [
    { id: 'gallery', label: 'Gallery' },
    {
      id: 'press-button',
      label: 'press-button',
      children: [{ id: 'press-variants', label: 'Variants' }],
    },
    {
      id: 'section-card',
      label: 'section-card',
      children: [{ id: 'section-nesting', label: 'Nesting' }],
    },
    { id: 'theme-toggle', label: 'theme-toggle' },
    {
      id: 'reveal',
      label: 'reveal',
      children: [{ id: 'reveal-demo', label: 'Live demo' }],
    },
    {
      id: 'toc',
      label: 'toc',
      children: [{ id: 'toc-contract', label: 'Content contract' }],
    },
    {
      id: 'shell',
      label: 'terminal-header / footer',
      children: [{ id: 'shell-code', label: 'Integration' }],
    },
  ];

  // A literal closing-script tag inside the module script would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const pressUsage = `<script lang="ts">
  import PressButton from '@ui/press-button.svelte';
${close}

<PressButton variant="primary" href="/docs.html">Read the docs</PressButton>
<PressButton variant="outline" onclick={save}>Save</PressButton>`;

  const cardUsage = String.raw`<SectionCard
  eyebrow="Quick start"
  title="Acquire a Backend. Spawn a shell."
  summary="One paragraph of text-pretty context."
>
  <p>Body slot: any content.</p>
</SectionCard>`;

  const toggleUsage = `<script lang="ts">
  import ThemeToggle from '@ui/theme-toggle.svelte';
${close}

<!-- pair with the no-flash inline bootstrap in app.html (localStorage
     "theme" light|dark|system, .dark class, colorScheme, html.js) -->
<ThemeToggle variant="full" />
<ThemeToggle variant="compact" />
<ThemeToggle variant="icon" />
<ThemeToggle variant="text" />`;

  const revealUsage = `<script lang="ts">
  import { reveal } from '@lib/reveal';
${close}

<!-- the hidden state is a STATIC attribute in the markup (never mount-time
     JS), so flat-file loads never flash content -->
<div data-reveal="" use:reveal={{ delay: 70, rise: 12 }}>
  <SectionCard eyebrow="Law" title="Reveal" />
</div>

<hr data-reveal="rule" use:reveal />`;

  const tocContractCode = String.raw`<!-- content contract: non-overlapping leaves carry data-region;
     parent extents carry data-family. Ids match the outline. -->
<div data-family="core">
  <h2 id="core">Core usage</h2>
  <section id="spawn" data-region="core-spawn">…</section>
  <section id="write" data-region="core-write">…</section>
</div>

<!-- the aside precedes main content in the DOM; the page grid places it
     right on desktop (sticky) and as a sticky height:0 rail on mobile -->
<aside class="docs-aside">
  <Toc {sections} title="on this page" />
</aside>`;

  const shellUsage = `<script lang="ts">
  import TerminalFooter from '@ui/terminal-footer.svelte';
  import TerminalHeader from '@ui/terminal-header.svelte';
  import ThemeToggle from '@ui/theme-toggle.svelte';
${close}

<TerminalHeader
  brand="jixoai/ui"
  domain="ui.jixoai.com"
  subtitle="the jixoai design language"
  items={[
    { href: '/', label: 'Overview', active: true },
    { href: 'https://github.com/jixoai/ui', label: 'GitHub', external: true },
  ]}
>
  {#snippet switcher()}
    <ThemeToggle />
  {/snippet}
</TerminalHeader>

<!-- … page content … -->

<TerminalFooter
  ghost="JIXOAI/UI"
  links={[{ label: 'GitHub', href: 'https://github.com/jixoai/ui' }]}
/>`;
</script>

<svelte:head>
  <title>Components · jixoai/ui</title>
  <meta
    name="description"
    content="The jixoai component gallery: press-button, section-card, theme-toggle, reveal, the Combo ToC, and the terminal shell — every demo rendered from the registry files this site consumes."
  />
</svelte:head>

<!-- Combo ToC layout law (registry component): the aside precedes main
     content in the DOM; the page grid places it as the right column on
     desktop (sticky, align-self: start) and as a sticky height:0 glass
     single-row rail on mobile. -->
<div class="docs-frame">
  <aside class="docs-aside" aria-label="On this page">
    <Toc {sections} title="on this page" />
  </aside>

  <div class="docs-main">
    <!-- Gallery family: page head. -->
    <div data-family="gallery">
      <div id="gallery" data-region="gallery" data-reveal="" use:reveal>
        <SectionCard
          headingLevel={1}
          tone="hero"
          eyebrow="Gallery"
          title="Every component, rendered from the registry"
          summary="Each section below consumes the exact same-source copy this site installed from registry/files — nothing is reimplemented for the showcase. The table of contents tracking this page is itself the toc component: the Rule Tracker on the right (desktop) or the glass Terminal Rail above (mobile)."
        >
          <div class="flex flex-wrap gap-3">
            <span class="pill">7 live components</span>
            <span class="pill">2 framework-free libs</span>
            <span class="pill">1 dogfooded ToC</span>
            <span class="pill">zero network</span>
          </div>
        </SectionCard>
      </div>
    </div>

    <!-- press-button -->
    <div id="press-button" data-family="press-button" data-reveal="" use:reveal>
      <SectionCard
        eyebrow="registry:ui"
        title="press-button"
        summary="The brutalist press-physics button: hover lifts toward the viewer (shadow xs grows), active presses back into the page. The shadow is the affordance — there is no other button style in the grammar."
      >
        <div class="flex flex-col gap-7" data-region="press-variants">
          <div id="press-variants" class="flex flex-col gap-3">
            <h3 class="text-[15px] font-bold tracking-tight">Variants, one physics</h3>
            <div class="flex flex-wrap items-center gap-3">
              <PressButton variant="primary">primary</PressButton>
              <PressButton variant="outline">outline</PressButton>
              <CopyCommand command="npx jixoai-ui add press-button" label="copied (press me)" />
            </div>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              The third button is the copied feedback state — click it: the command is copied and
              the variant flips to <code class="text-accent">copied</code> (secondary surface) for
              1.6s. Reduced-motion users get instant state changes.
            </p>
          </div>
          <CodeBlock code={pressUsage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <!-- section-card -->
    <div id="section-card" data-family="section-card" data-reveal="" use:reveal>
      <SectionCard
        eyebrow="registry:ui"
        title="section-card"
        summary="The content atom of the site grammar: a bordered card, header block with eyebrow (brand hue, Share Tech Mono, tracked 0.24em), font-nav title, text-pretty summary, and a body snippet slot."
      >
        <div class="flex flex-col gap-7" data-region="section-nesting">
          <div id="section-nesting" class="flex flex-col gap-3">
            <h3 class="text-[15px] font-bold tracking-tight">Self-nesting</h3>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              Cards compose with themselves — a card inside a card body keeps the same border and
              header law at a smaller scale. This is how dense reference pages stay coherent.
            </p>
            <SectionCard eyebrow="inner" title="A card, nested">
              <p class="text-muted-foreground text-pretty text-[13px] leading-6">
                Same component, same markup, no special variant. The outer card's body slot simply
                renders another one.
              </p>
            </SectionCard>
          </div>
          <CodeBlock code={cardUsage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <!-- theme-toggle -->
    <div id="theme-toggle" data-family="theme-toggle" data-region="theme-toggle" data-reveal="" use:reveal>
      <SectionCard
        eyebrow="registry:ui"
        title="theme-toggle"
        summary="light / dark / system in four variants: full (segmented icon+label selector — click a mode to set it), compact (icon + current, cycles), icon (icon only, cycles), text (label only, cycles). Inline SVG icons, no icon-library dependency; drives the shared theme contract (localStorage “theme”, .dark class, colorScheme) with the no-flash bootstrap."
      >
        <div class="flex flex-col gap-5">
          <div class="bg-terminal text-terminal-foreground border border-border p-5">
            <div class="flex flex-wrap items-center gap-x-8 gap-y-4">
              <label class="flex items-center gap-2 text-xs text-terminal-foreground/70"><span>full</span><ThemeToggle variant="full" /></label>
              <label class="flex items-center gap-2 text-xs text-terminal-foreground/70"><span>compact</span><ThemeToggle variant="compact" /></label>
              <label class="flex items-center gap-2 text-xs text-terminal-foreground/70"><span>icon</span><ThemeToggle variant="icon" /></label>
              <label class="flex items-center gap-2 text-xs text-terminal-foreground/70"><span>text</span><ThemeToggle variant="text" /></label>
            </div>
          </div>
          <p class="text-muted-foreground text-pretty text-[13px] leading-6">
            All four control the same live theme — click any of them and the whole site re-themes.
            full sets a mode directly; the other three cycle light → dark → system.
          </p>
          <CodeBlock code={toggleUsage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <!-- reveal -->
    <div id="reveal" data-family="reveal" data-reveal="" use:reveal>
      <SectionCard
        eyebrow="registry:lib"
        title="reveal"
        summary="The scroll-reveal action. Motion is restrained to exactly two patterns: entrance (opacity + rise, or a rule that draws in) and press physics. Every animated element on this site uses one of them."
      >
        <div class="flex flex-col gap-7" data-region="reveal-demo">
          <div id="reveal-demo" class="flex flex-col gap-3">
            <h3 class="text-[15px] font-bold tracking-tight">Live demo</h3>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              Scroll these blocks in and out — each carries a static
              <code class="text-accent">data-reveal=""</code> attribute in the prerendered markup
              and staggers 90ms behind its sibling. The initial-state law: the hidden state lives
              in the template, never in mount-time JS, so flat-file page loads never flash content
              before the animation runs.
            </p>
            <div class="grid gap-3 min-[760px]:grid-cols-3">
              {#each [0, 1, 2] as index (index)}
                <div
                  class="border border-border bg-card shadow-xs px-4 py-5"
                  data-reveal=""
                  use:reveal={{ delay: index * 90, rise: 12 }}
                >
                  <p class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">
                    block {index + 1}
                  </p>
                  <p class="text-muted-foreground mt-2 text-[12.5px] leading-5">
                    threshold 0 · first-pixel entry · unobserve after reveal
                  </p>
                </div>
              {/each}
            </div>
            <div class="bg-border mt-2 h-px w-full" data-reveal="rule" use:reveal></div>
            <p class="text-muted-foreground text-[12.5px]">
              ↑ the rule variant: <code class="text-accent">data-reveal="rule"</code> draws a
              horizontal line scaleX(0 → 1) instead of rising.
            </p>
          </div>
          <CodeBlock code={revealUsage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <!-- toc -->
    <div id="toc" data-family="toc" data-reveal="" use:reveal>
      <SectionCard
        eyebrow="registry:ui"
        title="toc — the Combo ToC"
        summary="You are looking at it. Desktop gets the Rule Tracker: a scroll-progress spine, square weight-driven nodes on level-1 entries, and the pick + parent markers. Mobile gets the Terminal Rail: a glass single-row viewport where page scroll drives the row to the current entry, and expanding changes ONLY the height."
      >
        <div class="flex flex-col gap-7" data-region="toc-contract">
          <div id="toc-contract" class="flex flex-col gap-3">
            <h3 class="text-[15px] font-bold tracking-tight">Content contract</h3>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              The engine (registry item <code class="text-accent">toc-engine</code>) computes IoM
              weights — intersection area over min(block, viewport) — and a single line pick: the
              viewport-top line on desktop, the sticky-bar bottom + 2em (76px) on mobile. A line in
              a margin between blocks belongs to the block below. Your content only owes the
              wrapper attributes:
            </p>
            <CodeBlock code={tocContractCode} lang="svelte" meta="contract" />
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- shell -->
    <div id="shell" data-family="shell" data-reveal="" use:reveal>
      <SectionCard
        eyebrow="registry:ui"
        title="terminal-header / terminal-footer"
        summary="The site shell. The header is an always-dark CRT bezel (never a themed surface) with the brand eyebrow in brand hue, nav pills, and the theme slot at the far right; the footer is a giant ghost wordmark that closes the narrative. This page does not render a second pair — you're wearing one — so here is how they attach instead."
      >
        <div class="flex flex-col gap-7" data-region="shell-code">
          <div id="shell-code" class="flex flex-col gap-3">
            <h3 class="text-[15px] font-bold tracking-tight">Integration</h3>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              The ghost wordmark recipe: clamp(3rem, 11vw, 9rem), transparent fill, 1px
              text-stroke of the border color at 55%, with an @supports fallback — decorative,
              aria-hidden, unselectable.
            </p>
            <CodeBlock code={shellUsage} lang="svelte" meta="shell" />
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<style>
  /* Combo ToC page grid (registry toc.css law): mobile = aside sticky at
   * height 0 with the glass rail overflowing; desktop = right column. */
  .docs-frame {
    display: block;
    padding-block: 0 1rem;
  }
  .docs-aside {
    position: sticky;
    top: 0;
    height: 0;
    z-index: 30;
  }
  .docs-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-top: 68px;
    padding-inline: 1rem;
  }
  @media (min-width: 900px) {
    .docs-frame {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 14.5rem;
      column-gap: 2.5rem;
      max-width: 90rem;
      margin-inline: auto;
      padding-block: 2.5rem 1rem;
      padding-inline: 1.5rem;
    }
    .docs-main {
      grid-column: 1;
      grid-row: 1;
      padding-top: 0;
      padding-inline: 0;
    }
    .docs-aside {
      grid-column: 2;
      grid-row: 1;
      position: sticky;
      top: 20px;
      align-self: start;
      max-height: calc(100vh - 40px);
      height: auto;
      z-index: auto;
    }
  }
</style>
