<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
  import HighlightDetectDefault from '$lib/ui/highlight-detect-default';
  import { AUTO_LANG } from '$lib/highlight/lang-detector';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site
  // runs — the wrapper IS the whole item (~10 lines of wiring).
  import wrapperSource from '$lib/ui/highlight-detect-default/highlight-detect-default.svelte?raw';

  const close = '</' + 'script>';

  const demoCode = `// nobody named the language — the filename did it (L1), and the
// wasm never loads for this card
const proof = 'detection is optional, by item';
export { proof };`;

  const usage = `<script lang="ts">
  import CodeCard from '$lib/ui/code-card';
  import HighlightDetectDefault from '$lib/ui/highlight-detect-default';
${close}

<!-- every lang="auto" card below eats the DLD default; siblings
     outside stay untouched; nested wrappers take the nearest -->
<HighlightDetectDefault>
  <CodeCard filename="main.ts" lang="auto" code={sample} />
</HighlightDetectDefault>

<!-- the zero-component twin (form ②) — the wrapper's body, hand-written
     at any subtree root instead:
     setContext(HIGHLIGHT_DETECT_KEY, { detector: defaultLangDetector() }) -->`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/highlight-detect-default/highlight-detect-default.svelte', content: wrapperSource },
    { name: 'src/lib/highlight-detect-default-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Highlight detect default · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai HighlightDetectDefault: the DLD context provider as a ~10-line children wrapper — one setContext makes defaultLangDetector() (the four-layer filename/shebang/structure/statistics waterfall) the detection default for every lang=auto card in the wrapped subtree."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · data-display"
        title="highlight-detect-default — the detection wrapper"
        summary="The convenience form of the DLD wiring: install @jixoai/highlight-detect-default and wrap a subtree — every &lt;CodeCard lang=&quot;auto&quot;&gt; below eats defaultLangDetector() as its context ring, while the langDetector prop and the backend's own detector keep their priority. The component is ~10 lines of pure wiring (its body IS the hand-written form ②); the detector itself, its four-layer waterfall and the betlang wasm live in the @jixoai/highlight-lang-detector lib item this one depends on. The deep story — the three rings, the null cascade, the layer table — lives on the code-card page's lang=&quot;auto&quot; section."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">children wrapper · form ①</span>
          <span class="pill">context spreads downward only</span>
          <span class="pill">zero styling · zero behavior beyond wiring</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="highlight-detect-default"
        stage="fill"
        description="The wrapped card enters lang=auto with nothing but a filename — L1's extension table answers typescript after hydration (prerendered output stays plain by law). The sibling outside the wrapper is untouched: an ordinary lang=ts card that never consults a detector."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/highlight-detect-default/highlight-detect-default.svelte"
        files={canvasFiles}
      >
        <div class="flex flex-col gap-4 min-[760px]:grid min-[760px]:grid-cols-2 min-[760px]:gap-4 min-[760px]:flex-none">
          <HighlightDetectDefault>
            <CodeCard filename="main.ts" lang={AUTO_LANG} code={demoCode} class="w-full" copyable={false} />
          </HighlightDetectDefault>
          <CodeCard filename="plain.ts" lang="ts" code={'// outside the wrapper — the ordinary path\nexport const untouched = true;'} class="w-full" copyable={false} />
        </div>
        {#snippet playground()}
          <p class="text-xs text-muted-foreground">
            static demo — the wrapper takes no knobs: scope IS the API. Wrap a different subtree and
            that subtree's cards change; nothing else does.
          </p>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="usage" data-reveal="">
      <SectionCard eyebrow="usage" title="Usage" summary="Two equivalent wirings — the wrapper (form ①) or one hand-written setContext line at any subtree root (form ②, zero components). The card's reader cannot tell them apart: both store the same { '{ detector }' } adapter under HIGHLIGHT_DETECT_KEY.">
        <CodeBlock code={usage} lang="svelte" meta="usage" />
        <p class="mt-3 text-[13px] leading-6 text-muted-foreground">
          Install pulls the lib item with it:
          <code class="text-accent">npx jixoai-ui add @jixoai/highlight-detect-default</code>.
          The rings, the null-cascade law and the waterfall live in
          <a href="/docs/components/code-card.html#code-card-auto" class="text-accent underline underline-offset-2">code-card's lang="auto" section</a>.
        </p>
      </SectionCard>
    </div>

    <div id="api" data-reveal="">
      <SectionCard eyebrow="api" title="HighlightDetectDefault props">
        <PropsTable
          props={[
            { name: 'children', type: 'Snippet', required: true, description: 'The subtree to wire — rendered verbatim in place ({@render children()}); the wrapper adds no element to the DOM.' },
          ]}
        />
      </SectionCard>
    </div>
  </div>
</div>
