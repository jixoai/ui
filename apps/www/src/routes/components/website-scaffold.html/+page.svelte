<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import { reveal } from '$lib/reveal';

  // ToC outline: the closing law (the canvas above holds the architecture).
  const tocSections = [{ id: 'shell-law', label: 'The overlay law' }];

  // Same-source law: the file tree shows the exact installed copy this site
  // consumes — ?raw imports the bytes, never a retyped duplicate.
  import scaffoldSource from '$lib/ui/website-scaffold.svelte?raw';
  import scaffoldCss from '$lib/website-scaffold.css?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import WebsiteScaffold from '@ui/website-scaffold.svelte';
  import '@ui/website-scaffold.css';
  import TerminalFooter from '@ui/terminal-footer.svelte';
  import TerminalHeader from '@ui/terminal-header.svelte';
${close}

<!-- the layout root: one header band overlay, one body scroll plane -->
<WebsiteScaffold>
  {#snippet header()}
    <TerminalHeader brand="my-app" items={[...]} />
  {/snippet}

  <!-- default snippet → main#main; the body reserves the band's height -->
  <RouterOutlet />

  {#snippet footer()}
    <TerminalFooter ghost="MY-APP" />
  {/snippet}
</WebsiteScaffold>`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/website-scaffold.svelte', content: scaffoldSource },
    { name: 'registry/files/ui/website-scaffold.css', content: scaffoldCss },
    { name: 'src/lib/ui/website-scaffold-usage.svelte', content: usage },
  ];

  // The playground drives the REAL top layer this page already lives in:
  // scrolling the body demonstrates the immersive hide/reveal live.
  function scrollBodyBy(px: number): void {
    const body = document.querySelector('.jx-shell-body');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    body?.scrollBy({ top: px, behavior: reduce ? 'auto' : 'smooth' });
  }
</script>

<svelte:head>
  <title>Website scaffold · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai website-scaffold component: a grid shell — a named container host whose ONE grid both layers subgrid (columns shared, placement by named areas), forms driven by container queries, per-zone immersive motion, and systematized view transitions."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->
  <aside class="jx-toc-aside" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="" use:reveal>
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="website-scaffold — the grid shell"
        summary="The presentation-site scaffold: header band, main column, footer, skip link, the chrome plane over the scroll plane, and systematized view transitions."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">one grid, two subgrid layers</span>
          <span class="pill">container-query forms</span>
          <span class="pill">skip link</span>
          <span class="pill">view transitions</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="" use:reveal>
      <ComponentCanvas
        title="website-scaffold"
        description="The grid shell: .jx-shell-host is the named container (the ONE responsive truth source); both layers span the same grid and subgrid its named columns — header, children, optional footer, skip link, and the per-zone immersive law."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/website-scaffold.svelte"
        {files}
      >
        {#snippet children()}
          <!-- A scaffold cannot nest inside itself: the shell owns the
               viewport's single scroll plane, and a second 100svh overlay
               would trap the page. This site IS the running instance —
               the card below documents the layers instead. -->
          <SectionCard
            class="w-full max-w-3xl"
            eyebrow="架构 · no nested LIVE instance"
            title="This page is already the demo"
            summary="You are reading main#main inside .jx-shell-body right now — the nav band above is .jx-top-layer. A second scaffold cannot nest here without trapping the page in two competing scroll planes, so the LIVE area holds the architecture; use the Playground buttons to drive the real top layer."
          >
            <div class="flex flex-col gap-5">
              <pre class="jx-arch-diagram" aria-label="scaffold layer diagram"><code>.jx-shell-host              container: jx-shell (inline-size) · 100dvh
└── .jx-shell                ONE grid · cols [rail][content][toc] per form
    ├── .jx-top-layer        grid-row 1 · col-subgrid · rows [header][tocbar][stage]
    │   ├── .jx-scaffold-header     the nav band (visible above)
    │   └── .jx-float-slot          subgrid — adopted nodes land by [data-area]
    └── .jx-shell-body        grid-row 1 · col-subgrid · THE scroll container
        ├── main#main         [content] column · padding = --jx-header-h (+tocbar)
        └── footer            in the content flow</code></pre>
              <ul class="flex flex-col gap-2 text-[13px] leading-6">
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">one measurement</strong> — a single ResizeObserver publishes <code class="text-accent">--jx-header-h</code>; the body's chrome reservation, the toc compaction offset and the shared <code class="text-accent">--jx-toc-line</code> all derive from it in CSS. Disclosure rows re-reserve automatically</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">per-zone immersive law</strong> — scroll DOWN past 8px: the header leaves upward and the tree bottom bar slides down; the toc and the catalog rail NEVER leave — they compact by exactly the header height (Owner ruling, 2026-08-24); the slightest scroll UP returns everything; reduced motion swaps to instant</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">view transitions</strong> — the header band keeps view-transition-name <code class="text-accent">site-header</code> and persists across navigations; main#main animates as <code class="text-accent">page-main</code></span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">skip link</strong> — a keyboard-reachable <code class="text-accent">Skip to content</code> target on #main, hidden until focused</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">top-layer context</strong> — the scaffold publishes the
                    <code class="text-accent">jx-top-layer</code> context: <code class="text-accent">adopt(node, {'{'} area {'}'})</code> with
                    semantic roles (<code class="text-accent">toc | tree | float</code>); the shell grid resolves the
                    physical cell per container form — one adoption mechanism, many cells, zero
                    per-breakpoint JS (Owner request, 2026-08-23)</span></li>
              </ul>
            </div>
          </SectionCard>
        {/snippet}
        {#snippet playground()}
          <div class="jx-play-fields">
            <div class="jx-play-field">
              <div class="flex flex-col gap-2">
                <PressButton onclick={() => scrollBodyBy(360)}>scroll body ↓ 360px</PressButton>
                <PressButton onclick={() => scrollBodyBy(-360)}>scroll body ↑ 360px</PressButton>
              </div>
            </div>
            <p class="jx-play-help">
              These buttons scroll <code class="text-accent">.jx-shell-body</code> — the real scroll
              plane of this page. Watch the zones split: chrome leaves, the toc rail compacts.
            </p>
          </div>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="shell-law" data-reveal="" use:reveal>
      <SectionCard
        family="shell-law"
        headerRegion="shell-law"
        eyebrow="law"
        title="The grid law"
        summary="Why one grid instead of absolute positioning: the two layers share the SAME named columns through subgrid, so chrome and content can never drift apart — and forms are container queries on the host, so an embedded scaffold shows the right form at any width. Placement is declarative; motion stays per-zone transforms."
      >
        <div class="flex flex-col gap-5">
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>ONE scroll plane: <code class="text-accent">.jx-shell-body</code> owns every
                scroll on the site — window scrolling and fixed-position demos must target it, not
                the window</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>ONE grid, two layers: both layers span the same shell grid and subgrid its
                columns — the toc rail and the content column align by construction, and adopted
                nodes land in named areas through their [data-area] role</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>declarative placement, one measurement: every position is a named area on
                the grid; the only measured value left is --jx-header-h (the live header height)
                feeding the reservation, the compaction offset and the anchor line</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<style>
  .jx-arch-diagram {
    background: color-mix(in oklab, var(--muted) 40%, var(--background));
    border: 1px solid var(--border);
    color: var(--muted-foreground);
    font-size: 11.5px;
    line-height: 1.7;
    margin: 0;
    overflow-x: auto;
    padding: 0.9rem 1rem;
    white-space: pre;
  }
</style>
