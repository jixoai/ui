<!--
  Docs page for text (markdown-coverage-components §1.5, Lane D). The
  family the Owner designed: base Text + the eight Raw sugars, ONE
  vocabulary (prop value = sugar name = HTML element), mark as a
  literal slot (the kbd precedent). The mark matrix and the
  sugar-vs-base equivalence demo are the two canvases.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Text, { P, Strong, Em, Del, Mark, Ins, Sub, Sup } from '$lib/ui/text';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copies this
  // site runs — the base plus one sugar (they are all the same ~5-line
  // wrapper; the base re-exports the full set from its module script).
  import textSource from '$lib/ui/text/text.svelte?raw';
  import pSource from '$lib/ui/text/p.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Text, { P, Strong, Em, Del, Mark, Ins, Sub, Sup } from '@ui/text';
${close}

<!-- the base: <p> by default (the Chakra <Text>-is-a-paragraph precedent) -->
<Text>A paragraph, face-composing.</Text>

<!-- mark switches the element and the paint -->
<Text mark="strong">semantically strong, 600 weight</Text>

<!-- the Raw sugars — the same vocabulary, one component per word -->
<Strong>strong</Strong> <Em>em</Em> <Del>del</Del> <Mark>mark</Mark>
<Ins>ins</Ins> H<Sub>2</Sub>O x<Sup>2</Sup>`;

  const equivalenceUsage = `<!-- these two are IDENTICAL at render: same element, same
     data-jx-text hook, same class-merge order (consumer LAST) -->
<Text mark="em">italic</Text>
<Em>italic</Em>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/text/text.svelte', content: textSource },
    { name: 'registry/files/ui/text/p.svelte', content: pSource },
    { name: 'src/lib/ui/text-usage.svelte', content: usage, kind: 'usage' },
  ];

  // the mark matrix rows: one entry per form, the word is the whole law
  const forms = [
    { word: 'p', note: 'no utilities — face-composing', snippet: false },
    { word: 'strong', note: 'font-semibold (the 600 settle)', snippet: false },
    { word: 'em', note: 'italic', snippet: false },
    { word: 'del', note: 'line-through', snippet: false },
    { word: 'mark', note: 'highlight ground + the 0.05em/0.25em box', snippet: false },
    { word: 'ins', note: 'underline', snippet: false },
    { word: 'sub', note: 'none — the UA baseline shift is the law', snippet: false },
    { word: 'sup', note: 'none — the UA baseline shift is the law', snippet: false },
  ] as const;
</script>

<svelte:head>
  <title>Text · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai text family: base Text renders a paragraph by default and mark switches the element and paint — one vocabulary where the prop value, the sugar name and the HTML element are the same word. P Strong Em Del Mark Ins Sub Sup ship as Raw sugars over the base; mark is a literal slot (own 'p', never zone-ambient). Face-composing by design: no member escapes the prose face, and the ambient font-size flows by inheritance."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="text — one word, three ways to say it"
        summary="The family the Owner designed: base <Text> renders <p> by default (the Chakra <Text>-is-a-paragraph precedent) and mark switches the element and paint. ONE vocabulary — the prop value, the sugar name, and the HTML element are the same word: strong renders <strong> whether you wrote <Text mark=&quot;strong&quot;> or <Strong>. mark is a LITERAL slot (defineLiteralSlot, own 'p' — the kbd variant precedent): element vocabulary, never prominence, never zone-ambient. Two members deliberately override face channels (recorded settles, not accidents): strong's font-semibold (600 — the GitHub/Tailwind Typography emphasis weight, settling the UA's 700) and mark's highlight ground with the 0.05em/0.25em padding box mirroring the face's mark so standalone and in-face agree. FACE-COMPOSING: no member escapes the prose face — an inline escape would virally descope the code chips and nested marks a link legitimately contains — and no member stamps a font-size; the ambient scale flows by inheritance."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">8 forms · one vocabulary</span>
          <span class="pill">mark = literal slot (own 'p')</span>
          <span class="pill">Raw sugars ≡ base</span>
          <span class="pill">face-composing, never escapes</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="text" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Pick your ergonomic: the base with mark for data-driven rendering (the markdown map's choice — the mark comes from the AST), the Raw sugars for hand-authored composition. Zero behavioral difference between them."
      >
        <CodeBlock code={usage} lang="svelte" meta="Text usage" />
      </SectionCard>
    </div>

    <div id="matrix" data-region="text-matrix" data-family="text-matrix" data-reveal="">
      <ComponentCanvas
        title="text"
        description="The mark matrix — all eight forms in one pass, each rendered by its Raw sugar (identical to the base with that mark). Every member is the semantic element itself; the paint column is what the family adds on channels the prose face does not declare for these elements."
        sourceUrl={registrySourceUrl('text')}
        files={canvasFiles}
        stage="fill"
      >
        <div class="flex w-full max-w-xl flex-col gap-2.5 text-[14px] leading-7">
          {#each forms as f (f.word)}
            <div class="flex flex-wrap items-baseline gap-3">
              <code class="w-16 flex-none font-mono text-[11px] text-muted-foreground">{f.word}</code>
              <p class="m-0">
                {#if f.word === 'p'}<P>a plain paragraph — face-composing</P>
                {:else if f.word === 'strong'}<Strong>strong emphasis at the 600 settle</Strong>
                {:else if f.word === 'em'}<Em>italic stress</Em>
                {:else if f.word === 'del'}<Del>struck-through revision</Del>
                {:else if f.word === 'mark'}<Mark>the highlighted passage</Mark>
                {:else if f.word === 'ins'}<Ins>the inserted revision</Ins>
                {:else if f.word === 'sub'}H<Sub>2</Sub>O — subscript
                {:else}x<Sup>2</Sup> — superscript{/if}
                <span class="ml-2 text-[12px] text-muted-foreground">{f.note}</span>
              </p>
            </div>
          {/each}
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              ONE vocabulary: the prop value, the sugar name, and the HTML element are the same
              word. <code>sub</code>/<code>sup</code> own no utilities at all — the UA baseline
              shift IS the law. <code>mark</code>'s ground drops to the Highlight system pair
              under forced colors; <code>strong</code>'s 600 is a recorded settle over the face's
              700 (the GitHub/Tailwind Typography weight).
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="equivalence" data-region="text-equivalence" data-family="text-equivalence" data-reveal="">
      <SectionCard
        family="equivalence"
        headerRegion="equivalence"
        eyebrow="law"
        title="Sugar ≡ base, by construction"
        summary="Each Raw sugar is a ~5-line wrapper that renders the base with its mark fixed, forwarding class/children/attrs — the learning-cost ruling: one vocabulary, two ergonomic forms, zero behavioral difference. Same element, same data-jx-text hook, same class-merge order (consumer LAST). The sugars re-export from the base's module script and ride the barrel."
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={equivalenceUsage} lang="svelte" meta="the equivalence law" />
          <div class="flex max-w-xl flex-col gap-2 text-[14px] leading-7">
            <p class="m-0"><Text mark="em">italic via the base</Text></p>
            <p class="m-0"><Em>italic via the sugar</Em></p>
            <p class="m-0 text-[12.5px] text-muted-foreground">
              One component prop swap apart — render both and diff: identical markup, identical
              <code class="font-mono text-[0.85em]">data-jx-text="em"</code>, identical merge
              order.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="Every member is the semantic element itself — strong means strong, del means deleted, sub means subscript. The meaning ships with the markup; nothing is a styled span."
    >
      <A11yTable
        keys={[{ key: '—', action: 'Not focusable — reading content, not a control' }]}
        aria={[
          { name: 'p / strong / em / del / mark / ins / sub / sup', value: 'native elements', description: 'Semantic inline semantics from the platform — screen readers announce emphasis, deletion, insertion and baseline shifts from the elements themselves.' },
          { name: 'data-jx-text', value: 'form', description: 'Hook attribute carrying the rendered form (the mark, or p) for styling.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="One style prop and a verbatim spread; the Raw sugars take the same surface minus mark (fixed per sugar)."
    >
      <PropsTable props={[
        { name: 'mark', type: "'p' | 'strong' | 'em' | 'del' | 'mark' | 'ins' | 'sub' | 'sup'", default: "'p' · Own default, not ambient", description: 'The element vocabulary — ONE word is the prop value, the sugar name, and the HTML element. A literal slot, own \'p\', never zone-ambient (an element choice is not prominence; the kbd precedent). Omitted resolves explicit ?? own, no context read.' },
        { name: 'children', type: 'Snippet', default: '—', description: 'The inline content.' },
        { name: 'class', type: 'string', default: "''", description: 'Forwarded to the rendered element; consumer classes land last.' },
        { name: '...rest', type: 'HTMLAttributes<HTMLElement>', default: 'spread', description: 'Every other attribute passes through to the chosen element untouched.' },
        { name: 'Raw exports', type: 'P · Strong · Em · Del · Mark · Ins · Sub · Sup', default: '—', description: 'The eight sugar components — each renders the base with its mark fixed (class/children/attrs forwarded); identical markup to <Text mark="{word}">.' },
      ]} />
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsSeeAlso name="text" />
  </div>
</div>
