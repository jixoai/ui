<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import NumberingProvider from '$lib/ui/figure/numbering-provider.svelte';
  import Reference from '$lib/ui/reference/reference.svelte';
  import Figure from '$lib/ui/figure/figure.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import referenceSource from '$lib/ui/reference/reference.svelte?raw';

  const usage = `see <Reference to="eq-1" /> and <Reference to="methods" />
<Reference to="eq-1">上式</Reference> — the children escape hatch`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/reference/reference.svelte', content: referenceSource },
    { name: 'src/lib/reference-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Reference · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai Reference: the typed cross-link that resolves its own display grammar from the target — a native fragment anchor with zero grammar knowledge of its own."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · layout"
        title="reference — the 引 primitive"
        summary="A native <a href> that says what the target says: an equation Figure renders Eq (4.5), a numbered Section renders § 3.2.1, an unnumbered one renders its title. Change the target — kind, chapter, order — and every reference follows. Forward references prerender their ?? fallback carrying the edge claim and resolve on hydration."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">native anchor · zero grammar knowledge</span>
          <span class="pill">target-owned display</span>
          <span class="pill">loud fallback — never a throw</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="reference"
        stage="flow"
        description="The resolution matrix under one numbering domain: an equation, a numbered section, an unnumbered section, and a missing id."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/reference/reference.svelte"
        files={canvasFiles}
      >
        <NumberingProvider>
          <SectionCard numbering="decimal" title="Results" headerRegion="results">
            <div class="flex flex-col gap-4 text-[13.5px]">
              <p>the momentum balance of <Reference to="eq-r" /> holds</p>
              <p>the procedure lives in <Reference to="sec-methods" /></p>
              <p>for notation see <Reference to="sec-unnumbered" /></p>
              <p class="text-muted-foreground">a broken one renders <Reference to="eq-nope" /> loudly</p>
              <Figure kind="equation" id="eq-r" caption="the momentum balance">
                <CodeBlock code="p = m · v" lang="ts" meta="eq r" />
              </Figure>
              <SectionCard id="sec-methods" title="Methods" headerRegion="methods">the procedure</SectionCard>
              <SectionCard id="sec-unnumbered" title="Notation" headerRegion="notation">the glossary</SectionCard>
            </div>
          </SectionCard>
        </NumberingProvider>
        {#snippet playground()}
          <p class="text-xs text-muted-foreground">
            static demo — the missing-id reference keeps its ??(eq-nope) marker and warns in the
            console once settled; production renders the marker too.
          </p>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="usage" data-reveal="">
      <SectionCard eyebrow="usage" title="Usage" summary="Address by explicit id; the children snippet replaces the anchor's label text while href semantics remain.">
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>

    <div id="accessibility" data-reveal="">
      <SectionCard eyebrow="a11y" title="Accessibility">
        <A11yTable
          aria={[
            { name: 'a[href]', value: 'native anchor', description: 'Keyboard focus and activation ride the platform; no synthetic tabindex or role.' },
            { name: 'span (missing)', value: 'not navigable', description: 'A dead target degrades to a visible ??(id) marker — no interaction affordance for a broken edge.' },
          ]}
        />
      </SectionCard>
    </div>

    <div id="api" data-reveal="">
      <SectionCard eyebrow="api" title="Reference props">
        <PropsTable
          props={[
            { name: 'to', type: 'string', required: true, description: 'The target\'s explicit id — resolved through the route-page target registry; referenceable targets are numbered Figures and Sections (numbered or not).' },
            { name: 'children', type: 'Snippet', description: 'Escape hatch: replaces the anchor\'s label text (author copy such as connectives); the href and data-ref-to semantics remain.' },
          ]}
        />
      </SectionCard>
    </div>
  </div>
</div>
