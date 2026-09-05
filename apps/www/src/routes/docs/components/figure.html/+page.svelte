<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Figure from '$lib/ui/figure/figure.svelte';
  import NumberingProvider from '$lib/ui/figure/numbering-provider.svelte';
  import Reference from '$lib/ui/reference/reference.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import figureSource from '$lib/ui/figure/figure.svelte?raw';

  const usage = `<NumberingProvider>
  <Section numbering="decimal" title="Results">
    <Figure kind="equation" id="eq-1" caption="the momentum balance">
      <CodeCard lang="ts">p = m·v</CodeCard>
    </Figure>
    <p>see <Reference to="eq-1" /></p>
  </Section>
</NumberingProvider>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/figure/figure.svelte', content: figureSource },
    { name: 'src/lib/figure-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Figure · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai Figure: the numbered, captioned, referenceable floating unit (the ontology's 浮 line primitive) — the wrapper owns structure (number/anchor/caption), any point nests inside."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · layout"
        title="figure — the 浮 primitive"
        summary="A native <figure> that numbers itself from its Section's numbering domain: chapter-scoped per kind (Eq 4.5) or document-continuous by declaration, the caption riding label + number + text, the id making it referenceable. The line carries structure; the point inside carries meaning — code today, math and industry points as they land."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">native &lt;figure&gt;</span>
          <span class="pill">kind axis · figure/table/equation/listing</span>
          <span class="pill">display currency — reorder renumbers</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="figure"
        stage="fill"
        description="Two kinds under one numbering domain; the paragraph's Reference resolves the second equation's number from the registry."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/figure/figure.svelte"
        files={canvasFiles}
      >
        <div data-doc-demo-scope="headings-ok">
        <NumberingProvider>
          <SectionCard numbering="decimal" title="Results" eyebrow="4" headerRegion="results">
            <div class="flex flex-col gap-5">
              <Figure kind="equation" id="eq-4-1" caption="the momentum balance">
                <CodeBlock code="p = m · v" lang="ts" meta="eq 4.1" />
              </Figure>
              <Figure kind="equation" id="eq-4-2" caption="the energy bound" citedIn={['§ 4.1']}>
                <CodeBlock code="E ≤ mc²" lang="ts" meta="eq 4.2" />
              </Figure>
              <p class="text-[13.5px]">the bound of <Reference to="eq-4-2" /> follows from <Reference to="eq-4-1" />.</p>
            </div>
          </SectionCard>
        </NumberingProvider>
        </div>
        {#snippet playground()}
          <p class="text-xs text-muted-foreground">
            static demo — numbering is DOM-order display currency: reorder the figures in markup and
            the numbers (and every reference) follow.
          </p>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="usage" data-reveal="">
      <SectionCard eyebrow="usage" title="Usage" summary="Wrap any point; declare the domain on the Section; address by explicit id. A Figure outside every domain renders unnumbered with a dev warning.">
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>

    <div id="accessibility" data-reveal="">
      <SectionCard eyebrow="a11y" title="Accessibility">
        <A11yTable
          aria={[
            { name: 'figure/figcaption', value: 'native elements', description: 'The platform announces the figure role and its caption; no extra ARIA.' },
            { name: 'data-jx-number', value: 'text content', description: 'The number is real heading/caption text — screen readers read it.' },
          ]}
        />
      </SectionCard>
    </div>

    <div id="api" data-reveal="">
      <SectionCard eyebrow="api" title="Figure props">
        <PropsTable
          props={[
            { name: 'kind', type: "'figure' | 'table' | 'equation' | 'listing'", required: true, description: 'The counter membership and display word (single-source labels; the customization axis is the R5 preset round).' },
            { name: 'id', type: 'string', description: 'Optional explicit address — a Figure without an id still numbers but is not referenceable; numbers are display currency, never addresses.' },
            { name: 'caption', type: 'string', description: 'Caption body text after the label + number; omitted renders label + number only.' },
            { name: 'citedIn', type: 'string[]', description: 'The MANUAL backlink lane (Owner 2026-09-04): display strings rendered verbatim in the caption tail and emitted as a JSON data attribute. Automatic backlink rendering is a documented gap — see the component header.' },
            { name: 'children', type: 'Snippet', required: true, description: 'The content slot — any point (CodeCard today, the R6 industry points as they land).' },
            { name: 'class', type: 'string', description: 'Passes through to the figure root.' },
          ]}
        />
      </SectionCard>
    </div>
  </div>
</div>
