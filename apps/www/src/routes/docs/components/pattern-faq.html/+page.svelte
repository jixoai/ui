<!--
  Docs page for pattern-faq (2026-08-30, terminal-patterns).
  Intents:
  1. Pattern summary from the registry catalog (CATALOG lookup, fail-loud).
  2. One live demo: the man-page frame over accordion items.
  3. Composition notes: authoring AccordionItem children.
  4. Usage CodeBlock shared with the canvas drawer.
-->
<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { CATALOG } from '$lib/catalog';
  import { registrySourceUrl } from '$lib/registry-source';
  import AccordionItem from '$lib/ui/accordion/accordion-item.svelte';
  import PatternFaq from '$lib/ui/pattern-faq/pattern-faq.svelte';

  import patternFaqSource from '$lib/ui/pattern-faq/pattern-faq.svelte?raw';

  const entry = CATALOG.find((candidate) => candidate.name === 'pattern-faq');
  if (!entry) {
    throw new Error('catalog miss: "pattern-faq" has no registry meta — fix registry.json');
  }

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import PatternFaq from '@ui/pattern-faq.svelte';
  import AccordionItem from '@ui/accordion/accordion-item.svelte';
${close}

<PatternFaq command="my-app-faq" section="7">
  <AccordionItem>
    {#snippet summary()}what is a pattern?{/snippet}
    <p>A composed section — atoms arranged into a landing-ready whole.</p>
  </AccordionItem>
  <!-- more items… -->
</PatternFaq>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/pattern-faq/pattern-faq.svelte', content: patternFaqSource },
    { name: 'src/lib/pattern-faq-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Pattern faq · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui pattern-faq component: the man-page FAQ — a command(section) head with dotted NAME leader over the native details/summary accordion family, closing on a SEE ALSO line."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Layout"
      title="pattern-faq — the man page"
      summary={entry.summary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">details/summary accordion</span>
        <span class="pill">exclusive by default</span>
        <span class="pill">NAME · SEE ALSO leaders</span>
      </div>
    </SectionCard>
  </div>

  <div id="demo" data-reveal="">
    <ComponentCanvas
      title="pattern-faq"
      stage="fill"
      description="The man-page framing over the accordion family: native details/summary pairs inside a bordered group — keyboard, semantics and SSR state are the platform's; the exclusive guard (the accordion's own) keeps one question open at a time."
      sourceUrl={registrySourceUrl('pattern-faq')}
      install="pattern-faq"
      files={canvasFiles}
    >
      <PatternFaq command="jixoai-ui-faq" section="7">
        <AccordionItem>
          {#snippet summary()}what is a pattern?{/snippet}
          <p>A composed section: atoms arranged into a landing-ready whole. Install it, own the source — <code>npx jixoai-ui add pattern-faq</code> and the folder is yours.</p>
        </AccordionItem>
        <AccordionItem>
          {#snippet summary()}do patterns add new primitives?{/snippet}
          <p>Never. A pattern declares the atoms it composes and the registry closure installs them — a pattern that needs a new atom prop records a followup instead of patching the atom.</p>
        </AccordionItem>
        <AccordionItem>
          {#snippet summary()}can I fork the paint?{/snippet}
          <p>Yes. Utilities you pass win by the layer law; the pattern css sits in <code>@layer components</code> under <code>:where()</code>, so your overrides always win.</p>
        </AccordionItem>
        <AccordionItem>
          {#snippet summary()}why does the exclusive default matter?{/snippet}
          <p>FAQs read better one-open: the answer you opened stays the only thing moving. Pass <code>exclusive={'{false}'}</code> when your answers reference each other.</p>
        </AccordionItem>
      </PatternFaq>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            click a summary — the native disclosure toggles, the chevron rotates, the exclusive
            guard closes the previous question. Keyboard: summaries walk with Tab, toggle with
            Enter/Space — all platform behavior, nothing hydrated.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="composition" data-reveal="">
    <SectionCard
      family="composition"
      headerRegion="composition"
      eyebrow="composition"
      title="Authoring questions"
      summary="The questions are your content: compose AccordionItem children (or bare details) inside the frame."
    >
      <ul class="flex flex-col gap-2 text-[13px] leading-6">
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span>each question is an <code class="text-accent">AccordionItem</code>: the
            <code>summary</code> snippet is the question line, children are the answer — the same
            parts the accordion docs teach</span></li>
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span><code class="text-accent">command</code> + <code class="text-accent">section</code>
            frame the page as a man entry (<code>jixoai-ui-faq(7)</code> — section 7 is
            miscellany, the honest FAQ home)</span></li>
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span><code class="text-accent">seeAlso</code> is a snippet — compose your links; the
            default line cites <code>jixoai-ui(1), patterns(7)</code></span></li>
        <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
          <span>constraint (the accordion's own): no interactive elements inside a summary —
            per-row actions belong in the body</span></li>
      </ul>
    </SectionCard>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="One frame, authored questions — the accordion family carries the disclosure."
    >
      <CodeBlock code={usage} lang="svelte" meta="pattern-faq usage" />
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="PatternFaq props."
    >
      <PropsTable
        props={[
          { name: 'children', type: 'Snippet', default: '—', description: 'The questions: AccordionItem children (or bare <details>).', required: true },
          { name: 'command', type: 'string', default: "'jixoai-ui-faq'", description: "The man page's command name (head line)." },
          { name: 'section', type: 'string', default: "'7'", description: 'The man section number (7 = miscellany).' },
          { name: 'summary', type: 'string', default: "'frequently asked questions, answered in the open'", description: "The NAME row's one-line description." },
          { name: 'exclusive', type: 'boolean', default: 'true', description: 'One open at a time (the accordion guard, passed through).' },
          { name: 'seeAlso', type: 'Snippet', default: '—', description: 'The SEE ALSO footer content — compose links here.' },
          { name: 'class', type: 'string', default: "''", description: 'Class passthrough to the article root.' },
        ]}
      />
    </SectionCard>
  </div>
</div>
