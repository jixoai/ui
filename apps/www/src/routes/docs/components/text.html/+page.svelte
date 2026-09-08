<!--
  Docs page for text (markdown-coverage-components §1.5, Lane D). The
  family the Owner designed: base Text + the eight Raw sugars, ONE
  vocabulary (prop value = sugar name = HTML element), mark as a
  literal slot (the kbd precedent). The mark matrix, the modifier
  playground (r4 acceptance: the six text-modifier props, live) and
  the sugar-vs-base equivalence demo are the three canvases.
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
  import InlineCode from '$lib/ui/inline-code/inline-code.svelte';
  import { registrySourceUrl } from '$lib/registry-source';
  import {
    playOutputs,
    playState,
    PlayFields,
    PlayHelp,
    PlayRow,
    PlaySelect,
    PlaySegmented,
    PlayToggle,
  } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copies this
  // site runs — the base plus one sugar (they are all the same ~5-line
  // wrapper; the base re-exports the full set from its module script).
  import textSource from '$lib/ui/text/text.svelte?raw';
  import pSource from '$lib/ui/text/p.svelte?raw';
  import inlineCodeSource from '$lib/ui/inline-code/inline-code.svelte?raw';
  import textStyleSource from '$lib/text-style.svelte.ts?raw';

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

  // ---- modifier playground (r4 acceptance round, 2026-09-08) ---------------
  // The Owner's ruling: the six text-modifier props shipped as STATIC
  // tiles only — "no adjustable DEMO in the docs". This canvas is the
  // live one: ONE page-owned playState, every kit control bound into
  // play.current, reset() restoring the documented starting point, and
  // the snippet lane authored ONCE over the same derived props object
  // the stage spreads (the taught string IS the shown string).
  type WeightChoice = 'normal' | 'medium' | 'semibold' | 'bold' | '450' | '550';
  type TrackingChoice = 'tighter' | 'tight' | 'normal' | 'wide' | 'wider';
  type FamilyChoice = 'inherit' | 'mono' | 'sans' | 'serif';
  type FontSizeChoice = '11px' | '12px' | '13px' | '14px' | '16px';

  // family speaks CHOICE words; the kernel wants CSS values. inherit
  // is the absent-ambient sentinel — undefined ⇒ the prop is omitted
  // and the snippet lane never shows family="inherit"
  const FAMILY_VALUES: Record<Exclude<FamilyChoice, 'inherit'>, string> = {
    mono: 'var(--font-mono)',
    sans: 'var(--font-sans)',
    serif: 'Georgia,serif',
  };

  const play = playState({
    lineHeight: 1.5 as number,
    weight: 'medium' as WeightChoice,
    italic: false as boolean,
    tracking: 'normal' as TrackingChoice,
    family: 'inherit' as FamilyChoice,
    fontSize: '14px' as FontSizeChoice,
  });

  const lineHeightOptions: { value: number; label: string }[] = [
    { value: 1, label: '1' },
    { value: 1.25, label: '1.25' },
    { value: 1.5, label: '1.5' },
    { value: 1.75, label: '1.75' },
    { value: 2, label: '2' },
  ];
  const weightOptions: { value: WeightChoice; label: string }[] = [
    { value: 'normal', label: 'normal · 400' },
    { value: 'medium', label: 'medium · 500' },
    { value: 'semibold', label: 'semibold · 600' },
    { value: 'bold', label: 'bold · 700' },
    { value: '450', label: '450 · font-[450]' },
    { value: '550', label: '550 · font-[550]' },
  ];
  const trackingOptions: { value: TrackingChoice; label: string }[] = [
    { value: 'tighter', label: 'tighter' },
    { value: 'tight', label: 'tight' },
    { value: 'normal', label: 'normal' },
    { value: 'wide', label: 'wide' },
    { value: 'wider', label: 'wider' },
  ];
  const familyOptions: { value: FamilyChoice; label: string }[] = [
    { value: 'inherit', label: 'inherit — ambient' },
    { value: 'mono', label: 'mono — var(--font-mono)' },
    { value: 'sans', label: 'sans — var(--font-sans)' },
    { value: 'serif', label: 'serif — Georgia,serif' },
  ];
  const fontSizeOptions: { value: FontSizeChoice; label: string }[] = [
    { value: '11px', label: '11px' },
    { value: '12px', label: '12px' },
    { value: '13px', label: '13px' },
    { value: '14px', label: '14px' },
    { value: '16px', label: '16px' },
  ];

  // the LIVE modifier props — ONE derivation feeding BOTH the stage
  // spread and the snippet expression below (single source, zero drift)
  const mods = $derived({
    lineHeight: play.current.lineHeight,
    weight: play.current.weight,
    italic: play.current.italic,
    tracking: play.current.tracking,
    family: play.current.family === 'inherit' ? undefined : FAMILY_VALUES[play.current.family],
    fontSize: play.current.fontSize,
  });

  // free text must become a legal string literal (q() = JSON.stringify)
  const q = (value: string): string => JSON.stringify(value);
  // the snippet lane over mods: omit what the kernel would not emit
  // (italic off, family inherit) — the taught props are the shown props
  const modifierPropsExpr = $derived.by(() => {
    const parts: string[] = [];
    if (mods.lineHeight !== undefined) parts.push(`lineHeight={${mods.lineHeight}}`);
    if (mods.weight !== undefined) parts.push(`weight=${q(mods.weight)}`);
    if (mods.italic === true) parts.push('italic');
    if (mods.tracking !== undefined) parts.push(`tracking=${q(mods.tracking)}`);
    if (mods.family !== undefined) parts.push(`family=${q(mods.family)}`);
    if (mods.fontSize !== undefined) parts.push(`fontSize=${q(mods.fontSize)}`);
    return parts.length > 0 ? ` ${parts.join(' ')}` : '';
  });

  const modifierUsageHead = `<script lang="ts">
  import Text, { Strong } from '@ui/text';
  import InlineCode from '@ui/inline-code.svelte';
${close}

<!-- the six text modifiers, one kernel: absent = ambient, explicit
     beats ambient, and the consumer class still merges last -->`;
  const modifierUsageLive = $derived(`${modifierUsageHead}
<Text${modifierPropsExpr}>
  The quick brown fox jumps over the lazy dog — every modifier lands
  after the form's own utilities, never before the consumer class.
</Text>

<Strong${modifierPropsExpr}>strong composes too — an explicit weight replaces its own 600</Strong>

<InlineCode lang="text"${modifierPropsExpr}>var(--font-mono)</InlineCode>`);

  // the drawer: the shared kernel + both consumers + the live usage
  // (content stays '' — the drawer's displayed text ALWAYS walks
  // resolveFileContent, so the live $derived is the single source)
  const modifierFiles: TreeFile[] = [
    { name: 'registry/files/lib/text-style.svelte.ts', content: textStyleSource },
    { name: 'registry/files/ui/text/text.svelte', content: textSource },
    { name: 'registry/files/ui/inline-code/inline-code.svelte', content: inlineCodeSource },
    { name: 'src/lib/ui/text-modifier-usage.svelte', content: '', kind: 'usage' },
  ];
  const resolveModifierUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? modifierUsageLive : file.content;

  /* Tailwind scanner candidates: the modifier utilities are composed
     at RUNTIME by the kernel (template interpolations the source
     scanner can never see) — this block feeds the exact set the
     playground can emit so the compiled sheet carries it (the app.css
     jx-html block precedent). The named weight/tracking/italic set
     already extracts from the kernel's own literal maps. */
  /* leading-[1] leading-[1.25] leading-[1.5] leading-[1.75] leading-[2]
     font-[450] font-[550] [font-family:var(--font-mono)]
     [font-family:var(--font-sans)] [font-family:Georgia,serif]
     [font-size:11px] [font-size:12px] [font-size:13px] [font-size:14px]
     [font-size:16px] */
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

    <div id="modifiers" data-region="text-modifiers" data-family="text-modifiers" data-reveal="">
      <ComponentCanvas
        title="text · modifiers"
        description="The six text modifiers, live — the kernel Text and inline-code share (lineHeight, weight, italic, tracking, family, fontSize). Every control re-renders the base paragraph, the strong form and the chip together, and the drawer's usage file always shows the exact props on screen — italic off and family inherit are omitted, because absent = ambient."
        sourceUrl={registrySourceUrl('text')}
        files={modifierFiles}
        stage="fill"
        onreset={() => play.reset()}
        output={playOutputs(play.current)}
        resolveFileContent={resolveModifierUsage}
      >
        <div class="flex w-full max-w-xl flex-col gap-5">
          <div class="flex flex-col gap-2">
            <span class="text-muted-foreground font-nav text-[10px] uppercase tracking-[0.24em]">the base paragraph</span>
            <Text {...mods}>The quick brown fox jumps over the lazy dog — every modifier lands after the form's own utilities, never before the consumer class.</Text>
          </div>
          <div class="flex flex-col gap-2 border-t border-border pt-4">
            <span class="text-muted-foreground font-nav text-[10px] uppercase tracking-[0.24em]">a mark form — modifiers compose</span>
            <p class="m-0"><Strong {...mods}>strong composes too — an explicit weight replaces its own 600</Strong></p>
          </div>
          <div class="flex flex-col gap-2 border-t border-border pt-4">
            <span class="text-muted-foreground font-nav text-[10px] uppercase tracking-[0.24em]">the other kernel consumer</span>
            <p class="m-0 text-[13.5px]">
              <InlineCode lang="text" {...mods}>var(--font-mono)</InlineCode>
              <span class="text-muted-foreground"> — the chip folds fontSize × lineHeight into its padding calc</span>
            </p>
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="lineHeight" hint="number ⇒ the unitless ratio">
              <PlaySegmented bind:value={play.current.lineHeight} options={lineHeightOptions} />
            </PlayRow>
            <PlayRow label="weight" hint="the named set, or arbitrary">
              <PlaySelect bind:value={play.current.weight} options={weightOptions} />
            </PlayRow>
            <PlayRow label="italic" hint="false never emits not-italic">
              <PlayToggle bind:value={play.current.italic} />
            </PlayRow>
            <PlayRow label="tracking">
              <PlaySelect bind:value={play.current.tracking} options={trackingOptions} />
            </PlayRow>
            <PlayRow label="family" hint="inherit = the ambient flow">
              <PlaySelect bind:value={play.current.family} options={familyOptions} />
            </PlayRow>
            <PlayRow label="fontSize" hint="never a text-* utility">
              <PlaySelect bind:value={play.current.fontSize} options={fontSizeOptions} />
            </PlayRow>
            <PlayHelp>
              the absent-ambient law: <code>italic</code> off and <code>family</code> inherit emit
              NOTHING — the ambient channels flow untouched. An explicit prop beats the ambient (a
              member <code>lineHeight</code> outranks the prose scope's leading) and beats the
              form's own utilities (<code>weight</code> replaces strong's 600 — watch the strong
              row); the consumer class still merges last. Reset returns to the documented starting
              point: 1.5 / medium / 14px.
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
