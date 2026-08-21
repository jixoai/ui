<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import CopyCommand from '$lib/copy-command.svelte';
  import HeroSection from '$lib/ui/hero-section.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import TerminalCard from '$lib/ui/terminal-card.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import ThemeToggle from '$lib/ui/theme-toggle.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import LanguageSwitcher from '$lib/ui/language-switcher.svelte';
  import CardGrid from '$lib/ui/card-grid.svelte';
  import CodeCard from '$lib/ui/code-card.svelte';
  import Table from '$lib/ui/table.svelte';
  import ScaffoldFloat from '$lib/ui/scaffold-float.svelte';
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
    { id: 'language-switcher', label: 'language-switcher' },
    { id: 'card-grid', label: 'card-grid' },
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
      id: 'terminal-card',
      label: 'terminal-card',
      children: [{ id: 'terminal-replay', label: 'Live typing' }],
    },
    {
      id: 'hero-section',
      label: 'hero-section',
      children: [{ id: 'hero-demo', label: 'Demo' }],
    },
    {
      id: 'website-scaffold',
      label: 'app-shell',
      children: [{ id: 'shell-scaffold', label: 'Scaffold + transitions' }],
    },
    {
      id: 'shell',
      label: 'terminal-header / footer',
      children: [{ id: 'shell-code', label: 'Integration' }],
    },
    {
      id: 'code-card',
      label: 'code-card',
      children: [{ id: 'code-card-demo', label: 'Demo' }],
    },
    {
      id: 'table',
      label: 'table',
      children: [{ id: 'table-demo', label: 'Compatibility' }],
    },
  ];

  let replay = $state(0);

  // A literal closing-script tag inside the module script would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const heroUsage = `<script lang="ts">
  import HeroSection from '@ui/hero-section.svelte';
  import TerminalCard from '@ui/terminal-card.svelte';
${close}

<HeroSection
  eyebrow="my-app · v1"
  titleLead="Ship terminals anywhere. "
  titleAccent="One hue."
  summary="..."
  badges={['OKLCH tokens', 'Svelte 5', 'MIT']}
  copyCommand="npx jixoai-ui init --hue 200"
>
  {#snippet secondary()}
    <a href="/docs" class="...">Get started</a>
  {/snippet}
  {#snippet terminal()}
    <TerminalCard barTitle="quick-start — zsh"
      command="npx jixoai-ui init --hue 200"
      outputs={['theme installed', 'hue applied']} />
  {/snippet}
</HeroSection>`;

  const shellUsage2 = `<script lang="ts">
  import AppShell from '@ui/app-shell.svelte';
  import '$lib/app-shell.css';
${close}

<AppShell>
  {#snippet header()}
    <TerminalHeader ... />
  {/snippet}

  {#snippet footer()}
    <TerminalFooter ... />
  {/snippet}

  <!-- default snippet: the page -->
</AppShell>`;

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
  <Toc {sections} title="on this page" scrollRoot=".jx-shell-body" />
</aside>`;

  const shellUsage = `<script lang="ts">
  import TerminalFooter from '@ui/terminal-footer.svelte';
  import TerminalHeader from '@ui/terminal-header.svelte';
  import ThemeToggle from '@ui/theme-toggle.svelte';
${close}

<TerminalHeader
  brand="jixoai-ui"
  domain="ui.jixoai.com"
  subtitle="the jixoai design language"
  items={[
    { href: '/', label: 'Overview', active: true },
    {
      href: '/docs',
      label: 'Docs',
      children: [
        { href: '/docs/tokens', label: 'tokens', description: 'the token sheet' },
        { href: '/docs/components', label: 'components', description: 'the gallery' },
      ],
    },
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
  <title>Components · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai component gallery: press-button, section-card, theme-toggle, reveal, the Combo ToC, the typing terminal, the hero, the app shell, and the terminal chrome — every demo rendered from the registry files this site consumes."
  />
</svelte:head>

<!-- Combo ToC layout law (registry component): the aside precedes main
     content in the DOM; the page grid places it as the right column on
     desktop (sticky, align-self: start) and as a sticky height:0 glass
     single-row rail on mobile. -->
<!-- ToC rides the top layer: authored here, adopted into .jx-top-layer
     by the float portal (immersive sync with the header by construction) -->
<ScaffoldFloat>
  <aside class="docs-aside" aria-label="On this page">
    <Toc {sections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>
</ScaffoldFloat>

<div class="docs-frame">
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
            <span class="pill">9 live components</span>
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
        headerRegion="press-button"
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
        headerRegion="section-card"
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
        headerRegion="theme-toggle"
        eyebrow="registry:ui"
        title="theme-toggle"
        summary="light / dark / system in four variants: full (segmented icon+label selector — click a mode to set it), compact (icon + current, cycles), icon (icon only, cycles), text (label only, cycles). Inline SVG icons, no icon-library dependency; drives the shared theme contract (localStorage “theme”, .dark class, colorScheme) with the no-flash bootstrap."
      >
        <div class="flex flex-col gap-5">
          <div class="flex flex-wrap items-center gap-x-8 gap-y-4">
            <label class="text-muted-foreground flex items-center gap-2 text-xs"><span>full</span><ThemeToggle variant="full" /></label>
            <label class="text-muted-foreground flex items-center gap-2 text-xs"><span>compact</span><ThemeToggle variant="compact" /></label>
            <label class="text-muted-foreground flex items-center gap-2 text-xs"><span>icon</span><ThemeToggle variant="icon" /></label>
            <label class="text-muted-foreground flex items-center gap-2 text-xs"><span>text</span><ThemeToggle variant="text" /></label>
          </div>
          <p class="text-muted-foreground text-pretty text-[13px] leading-6">
            All four control the same live theme — click any of them and the whole site re-themes.
            full sets a mode directly; the other three cycle light → dark → system. The toggle
            adapts to its container: light here, dark in the terminal header above.
          </p>
          <CodeBlock code={toggleUsage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <!-- language-switcher -->
    <div id="language-switcher" data-family="language-switcher" data-region="language-switcher" data-reveal="" use:reveal>
      <SectionCard
        eyebrow="registry:ui"
        title="language-switcher"
        summary="Locale switching in two variants: pair — the bilingual segmented group after the openspecui reference (icon + EN/中文, active fills brand hue); menu — a dropdown for three or more locales (icon + current, hard-shadow list, closes on select / outside click / Escape). Anchor-based: every locale carries its own href, so it works on fully prerendered sites."
      >
        <div class="flex flex-col gap-5">
          <div class="bg-terminal text-terminal-foreground border border-border p-5">
            <div class="flex flex-wrap items-center gap-x-10 gap-y-4">
              <label class="flex items-center gap-2 text-xs text-terminal-foreground/70"><span>pair</span>
                <LanguageSwitcher
                  variant="pair"
                  current="en"
                  locales={[
                    { code: 'en', label: 'EN', href: '#language-switcher' },
                    { code: 'zh', label: '中文', href: '#language-switcher' },
                  ]}
                />
              </label>
              <label class="flex items-center gap-2 text-xs text-terminal-foreground/70"><span>menu</span>
                <LanguageSwitcher
                  variant="menu"
                  current="en"
                  ariaLabel="Language"
                  locales={[
                    { code: 'en', label: 'English', href: '#language-switcher' },
                    { code: 'zh', label: '简体中文', href: '#language-switcher' },
                    { code: 'ja', label: '日本語', href: '#language-switcher' },
                    { code: 'de', label: 'Deutsch', href: '#language-switcher' },
                  ]}
                />
              </label>
            </div>
          </div>
          <p class="text-muted-foreground text-pretty text-[13px] leading-6">
            Open the menu — the list drops with a hard offset shadow and the current locale in brand
            hue. The segmented pair matches the openspecui bilingual reference exactly.
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- card-grid -->
    <div id="card-grid" data-family="card-grid" data-region="card-grid" data-reveal="" use:reveal>
      <SectionCard
        eyebrow="registry:ui"
        title="card-grid"
        summary="Grid + subgrid layout that equalizes cards: the grid owns two shared rows (header / body), and every direct child spans both via subgrid — headers align to one height, bodies fill to the tallest. Deliberately unbalanced demo below: notice the headers share one line and the card bottoms align anyway. Columns are auto-fit minmax (pass min to control collapse); browsers without subgrid fall back to stacked rows."
      >
        <CardGrid class="mt-2">
          <SectionCard eyebrow="Law 01" title="One-Hue Law">
            <p class="text-muted-foreground text-[13px] leading-6">
              Short body. Identity is one variable.
            </p>
          </SectionCard>
          <SectionCard eyebrow="Law 02 — a longer eyebrow wrapping to a second line" title="A registry, not a package">
            <p class="text-muted-foreground text-[13px] leading-6">
              Components live in your repo after npx jixoai-ui add — same-source files, no runtime
              dependency, no version lock, and the registry JSON is served from /r/ on this very
              domain. This body is deliberately the longest of the three so the subgrid stretch is
              obvious: every card bottom aligns to it.
            </p>
          </SectionCard>
          <SectionCard eyebrow="Law 03" title="Dogfooded">
            <p class="text-muted-foreground text-[13px] leading-6">
              This page is built from the registry files it documents.
            </p>
          </SectionCard>
        </CardGrid>
      </SectionCard>
    </div>

    <!-- reveal -->
    <div id="reveal" data-family="reveal" data-reveal="" use:reveal>
      <SectionCard
        headerRegion="reveal"
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
        headerRegion="toc"
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

    <!-- terminal-card -->
    <div id="terminal-card" data-family="terminal-card" data-reveal="" use:reveal>
      <SectionCard
        headerRegion="terminal-card"
        eyebrow="registry:ui"
        title="terminal-card"
        summary="The Broadside hero terminal, composed after the openspecui reference: traffic-light title bar, one large typed command, outputs surfacing line by line, 6px hard offset shadow. One-shot typing entrance (never looping), static block cursor per the motion law; prerendered/no-JS shows the settled terminal and reduced motion renders instantly."
      >
        <div class="flex flex-col gap-7" data-region="terminal-replay">
          <div id="terminal-replay" class="flex flex-col gap-3">
            <h3 class="text-[15px] font-bold tracking-tight">Live typing</h3>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              The exact card from the homepage hero. Replay remounts the component —
              the typing story restarts from the first character.
            </p>
            <div class="max-w-[36rem]">
              {#key replay}
                <TerminalCard
                  barTitle="quick-start — zsh"
                  command="npx jixoai-ui add terminal-card"
                  outputs={[
                    'terminal-card.svelte → src/lib/ui/',
                    'one-shot typing · static cursor · no blink',
                  ]}
                />
              {/key}
            </div>
            <div>
              <PressButton onclick={() => (replay += 1)}>Replay ↻</PressButton>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- hero-section -->
    <div id="hero-section" data-family="hero-section" data-reveal="" use:reveal>
      <SectionCard
        headerRegion="hero-section"
        eyebrow="registry:ui"
        title="hero-section"
        summary="The Broadside hero, composed after the openspecui reference: clamp-scaled bold lead type with a primary accent tail, badge row, a copy-command PRIMARY CTA with copied feedback, and the terminal card in a bottom-aligned second column at min-1100px. The homepage is the full-bleed demo; this is the component rendered in place."
      >
        <div class="flex flex-col gap-7" data-region="hero-demo">
          <div id="hero-demo" class="flex flex-col gap-4">
            <h3 class="text-[15px] font-bold tracking-tight">Demo</h3>
            <div class="border border-border bg-muted/40">
              <HeroSection
                eyebrow="your-app · v0"
                titleLead="Your product line here. "
                titleAccent="Your accent."
                summary="A compact instance with the real composition rules — swap the copy, keep the law."
                badges={['badges', 'copy CTA', 'terminal demo']}
                copyCommand="npx jixoai-ui init --hue 210"
              >
                {#snippet terminal()}
                  <TerminalCard
                    barTitle="demo"
                    command="echo hello jixoai"
                    outputs={['→ composed from the registry files']}
                  />
                {/snippet}
              </HeroSection>
            </div>
            <CodeBlock code={heroUsage} lang="svelte" meta="usage" />
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- app-shell -->
    <div id="app-shell" data-family="app-shell" data-reveal="" use:reveal>
      <SectionCard
        headerRegion="app-shell"
        eyebrow="registry:ui"
        title="app-shell"
        summary="The page scaffold: a sticky, always-visible header band (this page's navigation never scrolls away), the main column, an optional footer band, and a skip link. It also ships the systematized MPA view transitions — cross-document navigation with a persistent site-header and a horizontal-slide + blur crossfade on page-main (navigate this site in Chrome/Edge to feel it; reduced motion crossfades)."
      >
        <div class="flex flex-col gap-7" data-region="shell-scaffold">
          <div id="shell-scaffold" class="flex flex-col gap-3">
            <h3 class="text-[15px] font-bold tracking-tight">Scaffold + transitions</h3>
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              This site runs on it: the header band above is sticky, carries
              view-transition-name "site-header" (it persists across page navigations),
              and this content column animates as "page-main". Route-typed variants
              (from-/to-<route>) follow the view-transitions-toolkit pageswap/pagereveal
              pattern wired in app.html.
            </p>
            <CodeBlock code={shellUsage2} lang="svelte" meta="usage" />
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- shell -->
    <div id="shell" data-family="shell" data-reveal="" use:reveal>
      <SectionCard
        headerRegion="shell"
        eyebrow="registry:ui"
        title="terminal-header / terminal-footer"
        summary="The site shell. The header is an always-dark CRT bezel (never a themed surface) with the brand eyebrow in brand hue, nav pills, and the theme slot at the far right; the footer is a giant ghost wordmark that closes the narrative. Second-level nav (2026-08-20): items may carry children — you are wearing the demo, hover or click the Components pill in the header above. Desktop drops a native popover=auto panel (JS-orchestrated click + hover with a 120ms close grace; light dismiss, Escape and the top layer stay browser-native) with label + description rows; under sm the hamburger panel expands the same group as a nested 0fr→1fr disclosure with an all → escape link for the parent href. This page does not render a second pair, so here is how they attach instead."
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
  /* the aside is adopted into .jx-top-layer by the portal: on mobile it
     pins to the layer's bottom edge (glass rail under the header, riding
     the immersive slide); on desktop it floats over the right column */
  .docs-aside {
    position: fixed;
    left: 0;
    right: 0;
    bottom: auto;
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
      position: absolute;
      top: 96px;
      right: max(1.5rem, calc((100vw - 90rem) / 2 + 1.5rem));
      left: auto;
      width: 14.5rem;
      max-height: calc(100vh - 120px);
      height: auto;
      z-index: auto;
    }
  }
</style>
