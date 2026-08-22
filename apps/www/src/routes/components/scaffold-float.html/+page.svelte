<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import { reveal } from '$lib/reveal';

  // ToC outline: the closing law (the canvas above holds the adoption
  // walkthrough).
  const tocSections = [{ id: 'portal-law', label: 'Move, never clone' }];

  // Same-source law: the file tree shows the exact installed copy this site
  // consumes — ?raw imports the bytes, never a retyped duplicate.
  import floatSource from '$lib/ui/scaffold-float.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // This is the real in-production pattern: the components overview page
  // mounts its Combo ToC rail through the float portal.
  const usage = `<script lang="ts">
  import ScaffoldFloat from '@ui/scaffold-float.svelte';
  import Toc from '@ui/toc.svelte';
${close}

<!-- author it anywhere in the page; on mount the live node is adopted
     into the scaffold's top layer and rides the immersive slide -->
<ScaffoldFloat>
  <aside class="docs-aside" aria-label="On this page">
    <Toc {sections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>
</ScaffoldFloat>`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/scaffold-float.svelte', content: floatSource },
    { name: 'src/lib/ui/scaffold-float-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Scaffold float · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai scaffold-float component: the consumer-side half of the website-scaffold float provider — children are authored in the page with full Svelte ownership, then their live DOM node is adopted into the top layer on mount, so the float rides the immersive hide/reveal with the header by construction."
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
        title="scaffold-float — the portal half"
        summary="The consumer half of the float provider: portals children into the scaffold's top layer so they ride the immersive slide with the header."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">portal half</span>
          <span class="pill">rides the header slide</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="" use:reveal>
      <ComponentCanvas
        title="scaffold-float"
        description="The float portal: render anything into the website scaffold's top layer from anywhere in the page. Nodes keep full Svelte ownership at their authoring position; a context provider adopts the live node into .jx-float-slot on mount, and teardown hands it back."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/scaffold-float.svelte"
        {files}
      >
        {#snippet children()}
          <!-- No LIVE instance here on purpose: the only provider in this
               page's tree is the site's own scaffold, and adopting a demo
               node into the real top layer would hijack the single float
               slot. The concept card stands in; the Playground links to
               the live in-production use. -->
          <SectionCard
            class="w-full max-w-3xl"
            eyebrow="portal 概念 · no LIVE instance"
            title="Authored in the page, adopted by the top layer"
            summary="A float must dock to a website-scaffold provider — and the only one reachable from this page is the site's own shell, whose single float slot is not a demo surface. So this card explains the adoption instead; the overview page runs the real portal for its ToC rail every day."
          >
            <div class="flex flex-col gap-5">
              <pre class="jx-float-diagram" aria-label="float portal adoption diagram"><code>authoring DOM (full Svelte ownership)     .jx-top-layer (scroll-free plane)
────────────────────────────────────     ────────────────────────────────────
&lt;ScaffoldFloat&gt;                           ├── .jx-scaffold-header
  └─ aside.docs-aside          set()      └── .jx-float-slot
       …children…             ──────►          └─ aside.docs-aside ← moved
(hidden anchor stays in place)           (rides the immersive slide)</code></pre>
              <ol class="flex flex-col gap-2 text-[13px] leading-6">
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">1.</span>
                  <span><strong class="font-semibold">author</strong> — the portal renders its children wherever you place it in the page; the nodes are ordinary Svelte-owned DOM, not a serialized snapshot</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">2.</span>
                  <span><strong class="font-semibold">adopt</strong> — on mount it calls <code class="text-accent">api.set(node)</code> from the scaffold's <code class="text-accent">jx-scaffold-float</code> context; the scaffold's effect re-parents the live node into <code class="text-accent">.jx-float-slot</code> (appendChild — moved, never cloned)</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">3.</span>
                  <span><strong class="font-semibold">teardown</strong> — the hidden anchor keeps the authoring position; the release fn returns the node to it so Svelte finds and destroys its own nodes correctly</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">4.</span>
                  <span><strong class="font-semibold">ride</strong> — because the float now lives inside the top layer, the immersive hide/reveal carries it together with the header by construction: no second scroll listener exists anywhere</span></li>
              </ol>
            </div>
          </SectionCard>
        {/snippet}
        {#snippet playground()}
          <div class="jx-play-fields">
            <div class="jx-play-field">
              <PressButton href="/components.html">see it live — overview ToC</PressButton>
            </div>
            <p class="jx-play-help">
              The live example is one click away: the components overview mounts its Combo ToC rail
              through this portal — on desktop it floats over the right column, on mobile it is the
              glass bar under the header, and both ride the immersive slide.
            </p>
          </div>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="portal-law" data-reveal="" use:reveal>
      <SectionCard
        family="portal-law"
        headerRegion="portal-law"
        eyebrow="law"
        title="Move, never clone"
        summary="The portal moves the live DOM node — appendChild re-parents it into the float slot — instead of serializing and re-rendering a copy. That single decision is what keeps state, event listeners, and Svelte ownership intact on both ends of the trip."
      >
        <div class="flex flex-col gap-5">
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>a moved node keeps its listeners, its element state (scroll position, focus),
                and its Svelte hydration anchors — a clone would lose all three</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the hidden anchor at the authoring position is the return ticket: teardown
                hands the node back so Svelte destroys exactly what it created</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the float slot is single-occupancy by design — <code class="text-accent">set()</code>
                replaces the previous occupant, which is why demo floats must never dock to the
                site's own scaffold</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<style>
  .jx-float-diagram {
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
