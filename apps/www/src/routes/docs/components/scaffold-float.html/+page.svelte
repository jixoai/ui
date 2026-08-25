<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // ToC outline: the closing law (the canvas above holds the adoption
  // walkthrough).

  // Same-source law: the file tree shows the exact installed copy this site
  // consumes — ?raw imports the bytes, never a retyped duplicate.
  import floatSource from '$lib/ui/scaffold-float/scaffold-float.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // Generic portal usage. NOTE (Owner request, 2026-08-23): the Combo ToC
  // no longer needs this wrapper — inside a website-scaffold it adopts
  // ITSELF through the same jx-top-layer context. ScaffoldFloat is for
  // your own custom floats.
  const usage = `<script lang="ts">
  import ScaffoldFloat from '@ui/scaffold-float.svelte';
  import Toc from '@ui/toc.svelte';
${close}

<!-- author it anywhere in the page; on mount the live node is adopted
     into the scaffold's top layer and rides the immersive slide -->
<ScaffoldFloat>
  <div class="status-strip">● deploy passing — main #142</div>
</ScaffoldFloat>

<!-- (the toc now lives in the scaffold's chrome snippet — this demo
     out for embedded demos) -->
<aside class="docs-aside" aria-label="On this page">
  <Toc {sections} title="on this page" scrollRoot=".jx-shell-body" />
</aside>`;

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
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (standalone toc law, toc.css) -->

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
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

    <div data-reveal="">
      <ComponentCanvas
        title="scaffold-float"
        description="The float portal: render anything into the website scaffold's top layer from anywhere in the page. Nodes keep full Svelte ownership at their authoring position; a context provider adopts the live node into .jx-float-slot on mount, and teardown hands it back. Static chrome (toc rails, nav trees) belongs in the scaffold's chrome snippet instead — this is the DYNAMIC path."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/scaffold-float.svelte"
        {files}
        stage="fill"
      >
        {#snippet children()}
          <!-- No LIVE instance here on purpose: the only provider in this
               page's tree is the site's own scaffold (this page's toc
               lives in its static chrome slot, not the float plane). A
               demo float would stack page chrome atop page chrome; the
               concept card stands in. -->
          <SectionCard
            class="w-full max-w-3xl"
            eyebrow="portal 概念 · no LIVE instance"
            title="Authored in the page, adopted by the top layer"
            summary="A float must dock to a website-scaffold provider — and the only one reachable from this page is the site's own shell. So this card explains the adoption instead; every component page's ToC rail rides the real float plane every day (it adopts itself)."
          >
            <div class="flex flex-col gap-5">
              <pre class="jx-float-diagram" aria-label="float portal adoption diagram"><code>authoring DOM (full Svelte ownership)     .jx-top-layer (scroll-free plane)
────────────────────────────────────     ────────────────────────────────────
&lt;ScaffoldFloat&gt;                           ├── .jx-scaffold-header
  └─ aside.docs-aside        adopt()      └── .jx-float-slot
       …children…           ──────►          ├─ any dynamic float
(hidden anchor stays in place)              └─ aside.docs-aside ← moved
                                           (rides the immersive slide)</code></pre>
              <ol class="flex flex-col gap-2 text-[13px] leading-6">
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">1.</span>
                  <span><strong class="font-semibold">author</strong> — the portal renders its children wherever you place it in the page; the nodes are ordinary Svelte-owned DOM, not a serialized snapshot</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">2.</span>
                  <span><strong class="font-semibold">adopt</strong> — on mount it calls <code class="text-accent">api.adopt(node)</code> from the scaffold's <code class="text-accent">jx-top-layer</code> context; the scaffold's effect re-parents the live node into <code class="text-accent">.jx-float-slot</code> in adoption order (moved, never cloned)</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">3.</span>
                  <span><strong class="font-semibold">teardown</strong> — the hidden anchor keeps the authoring position; the release fn returns the node to it so Svelte finds and destroys its own nodes correctly</span></li>
                <li class="flex gap-2"><span class="text-primary" aria-hidden="true">4.</span>
                  <span><strong class="font-semibold">ride</strong> — because the float now lives inside the top layer, the immersive hide/reveal carries it together with the header by construction: no second scroll listener exists anywhere</span></li>
              </ol>
            </div>
          </SectionCard>
        {/snippet}
        {#snippet playground()}
          <PlayFields>
            <PressButton href="/docs/components.html">see it live — overview ToC</PressButton>
            <PlayHelp>
              The live example is one click away: every component page's Combo ToC rail now rides
              the top layer — on desktop it floats over the right column, on mobile it is the
              glass bar under the header, and it slides with the header on immersive scroll. The
              rail adopts itself through the same <code>jx-top-layer</code>
              context this portal exposes.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="portal-law" data-reveal="">
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
              <span>the float plane is ordered multi-node — <code class="text-accent">adopt()</code>
                appends in adoption order, so multiple custom floats coexist inside
                <code class="text-accent">.jx-float-slot</code> (static chrome lives in its own slot — the two never mix)</span></li>
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
