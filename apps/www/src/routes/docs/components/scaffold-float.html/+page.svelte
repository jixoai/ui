<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
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
  <title>Scaffold float · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai scaffold-float component: the consumer-side half of the website-scaffold float provider — children are authored in the page with full Svelte ownership, then their live DOM node is adopted into the top layer on mount, so the float rides the immersive hide/reveal with the header by construction."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (standalone toc law, toc.css) -->

  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="scaffold-float — the portal half"
        summary="The consumer half of the float provider: portals children into the scaffold's top layer so they ride the immersive slide with the header."
      >
        <div class={cx(rt.wrap12)}>
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
          <!-- styled non-heading card (site-polish F10): concept-copy
               must not emit a real heading into the page outline -->
          <div class={cx(rt.sfFloatCard)}>
            <div class={cx(rt.sfFloatHead)}>
              <div class={cx(rt.col10)}>
                <p class={cx(rt.eyebrowPrimary)}>portal concept · no LIVE instance</p>
                <p class={cx(rt.sfHero)}>Authored in the page, adopted by the top layer</p>
                <p class={cx(rt.sfPara)}>A float must dock to a website-scaffold provider — and the only one reachable from this page is the site&rsquo;s own shell. So this card explains the adoption instead; every component page&rsquo;s ToC rail rides the real float plane every day (it adopts itself).</p>
              </div>
            </div>
            <div class={cx(rt.sfFloatBody)}>
            <div class={cx(rt.col20)}>
              <pre class="jx-float-diagram" aria-label="float portal adoption diagram"><code>authoring DOM (full Svelte ownership)     .jx-top-layer (scroll-free plane)
────────────────────────────────────     ────────────────────────────────────
&lt;ScaffoldFloat&gt;                           ├── .jx-scaffold-header
  └─ aside.docs-aside        adopt()      └── .jx-float-slot
       …children…           ──────►          ├─ any dynamic float
(hidden anchor stays in place)              └─ aside.docs-aside ← moved
                                           (rides the immersive slide)</code></pre>
              <ol class={cx(rt.col8, rt.body13)}>
                <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">1.</span>
                  <span><strong class={cx(rt.semibold)}>author</strong> — the portal renders its children wherever you place it in the page; the nodes are ordinary Svelte-owned DOM, not a serialized snapshot</span></li>
                <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">2.</span>
                  <span><strong class={cx(rt.semibold)}>adopt</strong> — on mount it calls <code class={cx(rt.inkAccent)}>api.adopt(node)</code> from the scaffold's <code class={cx(rt.inkAccent)}>jx-top-layer</code> context; the scaffold's effect re-parents the live node into <code class={cx(rt.inkAccent)}>.jx-float-slot</code> in adoption order (moved, never cloned)</span></li>
                <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">3.</span>
                  <span><strong class={cx(rt.semibold)}>teardown</strong> — the hidden anchor keeps the authoring position; the release fn returns the node to it so Svelte finds and destroys its own nodes correctly</span></li>
                <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">4.</span>
                  <span><strong class={cx(rt.semibold)}>ride</strong> — because the float now lives inside the top layer, the immersive hide/reveal carries it together with the header by construction: no second scroll listener exists anywhere</span></li>
              </ol>
            </div>
  </div>
          </div>
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
        <div class={cx(rt.col20)}>
          <ul class={cx(rt.col8, rt.body13)}>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>a moved node keeps its listeners, its element state (scroll position, focus),
                and its Svelte hydration anchors — a clone would lose all three</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>the hidden anchor at the authoring position is the return ticket: teardown
                hands the node back so Svelte destroys exactly what it created</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>the float plane is ordered multi-node — <code class={cx(rt.inkAccent)}>adopt()</code>
                appends in adoption order, so multiple custom floats coexist inside
                <code class={cx(rt.inkAccent)}>.jx-float-slot</code> (static chrome lives in its own slot — the two never mix)</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="One portal shape; the area role decides which top-layer cell the shell grid resolves for the adopted node.">
    <div class={cx(rt.grid760c)}>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>area="float"</span><p class={cx(rt.inkMuted, rt.mt8, rt.text13, rt.lead6)}>Default — the dynamic float slot inside .jx-top-layer; your custom floats.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>area="toc" / "tree"</span><p class={cx(rt.inkMuted, rt.mt8, rt.text13, rt.lead6)}>The static chrome cells — the shell grid resolves each cell; static chrome usually lives in the scaffold's chrome snippet instead.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>multi-node plane</span><p class={cx(rt.inkMuted, rt.mt8, rt.text13, rt.lead6)}>adopt() appends in adoption order — multiple custom floats coexist in the slot.</p></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Author the float anywhere in the page; the provider adopts the live node on mount."><CodeBlock code={usage} lang="svelte" meta="ScaffoldFloat usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The portal is a DOM move, not a visual layer change: reading order and focus follow the authored semantics."><A11yTable keys={[{ key: 'Tab', action: 'Focus order is unaffected — the moved node keeps its listeners, focus, and scroll state' }]} aria={[{ name: 'aria-label', value: 'yours', description: 'Label the floated content yourself (e.g. aside aria-label="On this page")' }, { name: 'role', value: 'inherited', description: 'The portal adds no roles; the adopted subtree keeps its authored semantics' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="No density footprint and no tokens of its own — the portal moves your node; the paint is entirely the floated content's."><div class={cx(rt.col24)}><DensityDemo><div class={cx(rt.sfTint)}>● deploy passing — main #142</div></DensityDemo><TokenTable tokens={[{ name: 'jx-top-layer', default: 'context key', source: 'structural', description: 'The adopt/release contract consumed from the website-scaffold provider' }, { name: '.jx-float-slot', default: 'adoption order', source: 'structural', description: 'Destination cell inside the top layer; children order = adoption order' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the ScaffoldFloat Props interface — a children snippet plus one semantic role."><PropsTable props={[{ name: 'children', type: 'Snippet', default: '—', description: 'The floated content; the live DOM node is adopted into the top layer on mount.', required: true }, { name: 'area', type: "TopLayerArea: 'toc' | 'tree' | 'float'", default: "'float'", description: 'Semantic placement role; the shell grid resolves the cell.' }]} /></SectionCard></div>
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
