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
    content="The jixoai website-scaffold component: a layered overlay architecture — one absolute top layer (header band + float slot) that moves as a unit over the body's scroll plane, with a measured padding reservation, immersive hide/reveal, and systematized view transitions."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
    <div data-reveal="" use:reveal>
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="website-scaffold — the layered shell"
        summary="The presentation-site scaffold: sticky header band, main column, footer, skip link, the overlay top layer, and systematized view transitions."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">top layer</span>
          <span class="pill">immersive slide</span>
          <span class="pill">skip link</span>
          <span class="pill">view transitions</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="" use:reveal>
      <ComponentCanvas
        title="website-scaffold"
        description="The layered overlay architecture: an absolute top layer (header band + float insertion point) rides above the body's own scroll plane — header, children, optional footer, skip link, and the immersive hide/reveal that moves the whole top layer as one unit."
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
              <pre class="jx-arch-diagram" aria-label="scaffold layer diagram"><code>.jx-shell                    min-h-svh · relative
├── .jx-top-layer            absolute overlay · z-40 — ONE moving unit
│   ├── .jx-scaffold-header  the nav band (visible above)
│   └── .jx-float-slot       top-layer context insertion point (ordered)
└── .jx-shell-body           THE scroll container (overflow-y auto)
    ├── main#main            padding-top = measured header height
    └── footer               optional band</code></pre>
              <ul class="flex flex-col gap-2 text-[13px] leading-6">
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">measured reservation</strong> — a ResizeObserver keeps the body's padding-top equal to the header band's height; the mobile disclosure row re-reserves on grow/shrink, so the overlay never covers content</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">immersive hide/reveal</strong> — scrolling down past 8px slides the WHOLE top layer out (translateY -101%); the slightest scroll up returns it; reduced motion swaps to instant</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">view transitions</strong> — the header band keeps view-transition-name <code class="text-accent">site-header</code> and persists across navigations; main#main animates as <code class="text-accent">page-main</code></span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">skip link</strong> — a keyboard-reachable <code class="text-accent">Skip to content</code> target on #main, hidden until focused</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
                  <span><strong class="font-semibold">top-layer context</strong> — the scaffold publishes the
                    <code class="text-accent">jx-top-layer</code> context (adopt/release, ordered multi-node);
                    scaffold-float portals arbitrary children through it and the toc rail mounts
                    itself automatically (Owner request, 2026-08-23) — one adoption mechanism, and
                    everything adopted rides the immersive slide by construction</span></li>
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
              plane of this page. Watch the top layer leave and return as one unit.
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
        title="The overlay law"
        summary="Why absolute instead of position:sticky: one moving unit beats two coordinated ones. The header band and its float slot ride the same transform, so the immersive slide never desynchronizes — and the body reserves the band's height through measurement, not document flow, so the overlay can never clip or push content."
      >
        <div class="flex flex-col gap-5">
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>ONE scroll plane: <code class="text-accent">.jx-shell-body</code> owns every
                scroll on the site — window scrolling and fixed-position demos must target it, not
                the window</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>ONE moving unit: the top layer is a single absolutely positioned strip; the
                float slot lives inside it, so anything portaled there rides the immersive slide
                by construction</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>measurement over flow: a ResizeObserver writes the band's height onto the
                body's padding-top, so disclosure rows and font-size changes re-reserve
                automatically</span></li>
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
