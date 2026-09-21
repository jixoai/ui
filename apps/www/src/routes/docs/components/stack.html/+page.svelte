<!--
  stack — canonical page (the Layout family, 2026-09-18). The flow
  primitive: one-dimensional arrangement over the typed space ladder.
  Demo-standard skeleton: Intro → Install → Usage → Examples →
  a11y/theming → API → See Also.
-->
<script lang="ts">
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Stack from '$lib/ui/stack';
  import type { StackGap } from '$lib/ui/stack';
  import { CATALOG } from '$lib/catalog';
  import { registrySourceUrl } from '$lib/registry-source';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp, PlayRow, PlaySelect } from '$lib/playground';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'stack')?.summary;
  if (!heroSummary) throw new Error('catalog entry "stack" is missing — registry.json meta drift');

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import stackSource from '$lib/ui/stack/stack.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Stack from '@ui/stack';
${close}

<!-- a column with a typed rung -->
<Stack direction="column" gap="12">
  <header>…</header>
  <main>…</main>
  <footer>…</footer>
</Stack>

<!-- a centered row of actions -->
<Stack gap="8" align="center">
  <button>save</button>
  <button>cancel</button>
</Stack>

<!-- toolbar distribution: pack to the edges -->
<Stack justify="between">
  <span>title</span>
  <span>actions…</span>
</Stack>`;

  // ---- the workbench: gap + axes swapped live from the playground ----
  const gapOptions = ['2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '24', '28', '32', '40', '48', '80'].map(
    (value) => ({ value, label: value }),
  );
  const alignOptions = [
    { value: 'unset', label: 'unset (stretch default)' },
    { value: 'start', label: 'start' },
    { value: 'center', label: 'center' },
    { value: 'end', label: 'end' },
    { value: 'baseline', label: 'baseline' },
    { value: 'stretch', label: 'stretch' },
  ];
  const justifyOptions = [
    { value: 'unset', label: 'unset' },
    { value: 'start', label: 'start' },
    { value: 'center', label: 'center' },
    { value: 'end', label: 'end' },
    { value: 'between', label: 'between' },
  ];
  let gap = $state<'8' | string>('12');
  let align = $state<'unset' | string>('unset');
  let justify = $state<'unset' | string>('unset');
  let direction = $state<'row' | 'column'>('row');
  const canvasInitial = { gap: '12', align: 'unset', justify: 'unset', direction: 'row' as const };
  function resetCanvas(): void {
    gap = canvasInitial.gap;
    align = canvasInitial.align;
    justify = canvasInitial.justify;
    direction = canvasInitial.direction as 'row' | 'column';
  }
  const usageLive = $derived(`<script lang="ts">
  import Stack from '@ui/stack';
${close}

<Stack direction="${direction}" gap="${gap}"${align !== 'unset' ? ` align="${align}"` : ''}${justify !== 'unset' ? ` justify="${justify}"` : ''}>
  <div>one</div>
  <div>two</div>
  <div>three</div>
</Stack>`);
  const files: TreeFile[] = [
    { name: 'registry/files/ui/stack/stack.svelte', content: stackSource },
    { name: 'src/lib/ui/stack-usage.svelte', content: '' },
  ];
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // ---- the gap ladder demo (a hand-authored mirror of the region below)
  const stackGapDemo = `<script lang="ts">
  import Stack from '@ui/stack';
${close}

<div class="flex flex-col gap-3">
  <Stack gap="4" class="border border-border p-2"><span class="bg-muted px-2 py-1 text-[12px]">gap 4</span><span class="bg-muted px-2 py-1 text-[12px]">·</span></Stack>
  <Stack gap="12" class="border border-border p-2"><span class="bg-muted px-2 py-1 text-[12px]">gap 12</span><span class="bg-muted px-2 py-1 text-[12px]">·</span></Stack>
  <Stack gap="24" class="border border-border p-2"><span class="bg-muted px-2 py-1 text-[12px]">gap 24</span><span class="bg-muted px-2 py-1 text-[12px]">·</span></Stack>
</div>`;
  const gapFiles: TreeFile[] = [
    { name: 'stack-gap-demo.svelte', content: stackGapDemo, kind: 'usage' },
  ];

  // the axes demo (justify between + align baseline)
  const stackAxesDemo = `<script lang="ts">
  import Stack from '@ui/stack';
${close}

<div class="flex flex-wrap items-start gap-6">
  <div class="border border-border p-3 flex-1">
    <span class="font-nav text-primary mb-2 block text-[11px] uppercase tracking-[0.24em]">justify between — edge packing</span>
    <Stack justify="between" class="w-full">
      <span class="pill">title</span>
      <span class="pill">actions</span>
    </Stack>
  </div>
  <div class="border border-border p-3 flex-1">
    <span class="font-nav text-primary mb-2 block text-[11px] uppercase tracking-[0.24em]">align baseline — text rows</span>
    <Stack gap="8" align="baseline">
      <span class="text-xl">Aa</span>
      <span class="text-[12px]">baseline peer</span>
      <span class="pill">chip</span>
    </Stack>
  </div>
</div>`;
  const axesFiles: TreeFile[] = [
    { name: 'stack-axes-demo.svelte', content: stackAxesDemo, kind: 'usage' },
  ];

  // the flow modes demo (wrap — the chip cloud)
  const stackWrapDemo = `<script lang="ts">
  import Stack from '@ui/stack';
${close}

<Stack gap="8" wrap>
  {#each Array(14) as _, i}
    <span class="pill">tag {i + 1}</span>
  {/each}
</Stack>`;
  const wrapFiles: TreeFile[] = [
    { name: 'stack-wrap-demo.svelte', content: stackWrapDemo, kind: 'usage' },
  ];

  // the page's local join (the separator serialize law)
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

  // ---- the universal props demo (explicit-props W3-D3) --------------------
  const universalUsage = `<Stack gap="8" size={18} density="small">…</Stack>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/stack-universal.svelte', content: universalUsage },
  ];
</script>

<svelte:head>
  <title>Stack · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai stack component: the Layout family's flow primitive — one-dimensional arrangement over the typed space ladder. Every gap is a --jx-space-N rung (token-bound atoms), the axis vocabulary is the closed CSS set, and the component paints nothing else: no color, no padding, no typography."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="stack — flow over the typed space ladder"
        summary={heroSummary}
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">16 gap rungs · --jx-space-N</span>
          <span class="pill">closed CSS axis vocabulary</span>
          <span class="pill">structural props · never-ambient</span>
          <span class="pill">omission transparency</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="stack" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Name layout intent, get flex — direction and gap are the working pair; align/justify/wrap/inline refine. Omitted props add nothing at all."
      >
        <CodeBlock code={usage} lang="svelte" meta="Stack usage" />
      </SectionCard>
    </div>

    <!-- workbench: live gap/axis swaps -->
    <div id="stack-workbench" data-region="stack-workbench" data-reveal="">
      <ComponentCanvas
        title="stack"
        description="One row/column, three cells. The playground swaps the rung and the axes live — the drawer's usage file tracks every pick."
        sourceUrl={registrySourceUrl('stack')}
        {files}
        stage="fill"
        onreset={resetCanvas}
        output={[
          { label: 'gap', value: gap },
          { label: 'align', value: align },
          { label: 'justify', value: justify },
        ]}
        resolveFileContent={resolveUsage}
      >
        <Stack
          {direction}
          gap={gap as StackGap}
          align={align === 'unset' ? undefined : (align as 'start' | 'center' | 'end' | 'baseline' | 'stretch')}
          justify={justify === 'unset' ? undefined : (justify as 'start' | 'center' | 'end' | 'between' | 'stretch')}
          class={cx(rt.wFull, rt.panel, rt.p16)}
        >
          <span class="pill">one</span>
          <span class="pill">two</span>
          <span class="pill">three</span>
        </Stack>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="direction">
              <PlaySelect bind:value={direction} options={[{ value: 'row', label: 'row' }, { value: 'column', label: 'column' }]} />
            </PlayRow>
            <PlayRow label="gap">
              <PlaySelect bind:value={gap} options={gapOptions} />
            </PlayRow>
            <PlayRow label="align">
              <PlaySelect bind:value={align} options={alignOptions} />
            </PlayRow>
            <PlayRow label="justify">
              <PlaySelect bind:value={justify} options={justifyOptions} />
            </PlayRow>
            <PlayHelp>
              Every prop is structural: the rungs come from the sheet's
              <code class={cx(rt.inkAccent)}>--jx-space-N</code> ladder, the axis words are the closed
              CSS set, and an omitted prop stamps no atom — the DOM carries only what you named.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <!-- the gap ladder -->
    <div id="gap-ladder" data-reveal="">
      <SectionCard
        family="gap-ladder"
        headerRegion="gap-ladder"
        eyebrow="token-bound"
        title="The gap ladder — 16 rungs"
        summary="Gap is not a free number: every rung is a token-bound atom (gap4 → var(--jx-space-4)), so spacing composes with the rest of the system instead of drifting per-surface. The ladder runs 2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 40 · 48 · 80."
      >
        <ComponentCanvas title="stack · gap ladder" stage="fill" files={gapFiles}>
          <div class={cx(rt.flex, rt.col, rt.gap6, rt.wFull, rt.maxWMd)}>
            {#each ['4', '12', '24', '48'] as rung}
              <div class={cx(rt.panel, rt.p8)}>
                <span class={cx(rt.note11, rt.mb4, rt.block)}>gap {rung} — var(--jx-space-{rung})</span>
                <Stack gap={rung as StackGap} align="center">
                  <span class="pill">cell</span>
                  <span class="pill">cell</span>
                  <span class="pill">cell</span>
                </Stack>
              </div>
            {/each}
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <!-- axes -->
    <div id="axes" data-reveal="">
      <SectionCard
        family="axes"
        headerRegion="axes"
        eyebrow="axes"
        title="Axes — the closed CSS vocabulary"
        summary="align is the cross axis (start · center · end · baseline · stretch — flex's stretch default rides omission), justify is the main axis (start · center · end · between · stretch). No invented words, no numeric weights."
      >
        <ComponentCanvas title="stack · axes" stage="fill" files={axesFiles}>
          <div class={cx(rt.wrapStart24, rt.wFull)}>
            <div class={cx(rt.panel, rt.p12, rt.grow)}>
              <span class={cx(rt.eyebrowPrimary, rt.block, rt.mb8)}>justify between — edge packing</span>
              <Stack justify="between" class={cx(rt.wFull)}>
                <span class="pill">title</span>
                <span class="pill">actions</span>
              </Stack>
            </div>
            <div class={cx(rt.panel, rt.p12, rt.grow)}>
              <span class={cx(rt.eyebrowPrimary, rt.block, rt.mb8)}>align baseline — text rows</span>
              <Stack gap="8" align="baseline">
                <span class={cx(rt.textXl)}>Aa</span>
                <span class={cx(rt.text12)}>baseline peer</span>
                <span class="pill">chip</span>
              </Stack>
            </div>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <!-- flow modes -->
    <div id="flow-modes" data-reveal="">
      <SectionCard
        family="flow-modes"
        headerRegion="flow-modes"
        eyebrow="flow modes"
        title="wrap and inline"
        summary="wrap allows multi-line flow (flex-wrap: wrap) for chip clouds and tag rows; inline switches the flow itself to display: inline-flex — the stack sits in a text line instead of owning a block."
      >
        <ComponentCanvas title="stack · wrap" stage="fill" files={wrapFiles}>
          <div class={cx(rt.col16, rt.wFull, rt.maxWMd)}>
            <div class={cx(rt.panel, rt.p12)}>
              <span class={cx(rt.eyebrowPrimary, rt.block, rt.mb8)}>wrap — the chip cloud</span>
              <Stack gap="8" wrap>
                {#each Array(14) as _, i}
                  <span class="pill">tag {i + 1}</span>
                {/each}
              </Stack>
            </div>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="accessibility" data-reveal="">
    <SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="A stack is a plain div carrying layout only — no role, no announcements, nothing to maintain. Reading order is DOM order; the component never reorders visually (no order/reverse props by design).">
      <PropsTable props={[{ name: '(none)', type: '—', default: '—', description: 'No ARIA surface: the stack is transparent layout. Children keep their own semantics wholesale.' }]} />
    </SectionCard>
  </div>
  <div id="theming" data-reveal="">
    <SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Tokens" summary="One token family feeds the whole component: the --jx-space-N ladder. No color, no radius, no typography — paint belongs to the children.">
      <PropsTable props={[{ name: '--jx-space-2 … 80', type: '16 rungs', default: 'the sheet ladder', description: 'Every gap atom resolves one rung — spacing is never a free pixel value.' }]} />
    </SectionCard>
  </div>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. The structural props (direction/gap/align/justify) stay outside the contract exactly as founded; the paint axes join as a FIRST-TIME no-own container surface — the size axis scales the stack root, the children ride the supply chain."
    >
      <ComponentCanvas title="Stack · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.panel)}><Stack gap="8" size={18} density="small"><p>one number moves the stack</p><p>children inherit the root font-size</p></Stack></div>
<div class={cx(rt.panel)}><Stack gap="8" size="medium" radius="large"><p>named steps resolve through the alias ladder</p></Stack></div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Seven structural props plus the HTML rest — all optional, all never-ambient (no Defaults contract: an axis has nothing meaningful to inherit; a row is a row because its consumer says so).">
      <PropsTable props={[
        { name: 'direction', type: "'row' | 'column'", default: "'row'", description: 'The flow axis. Row is flex\u2019s default — no atom is stamped.' },
        { name: 'gap', type: "'2' | '4' | '6' | '8' | '10' | '12' | '14' | '16' | '18' | '20' | '24' | '28' | '32' | '40' | '48' | '80'", default: '— (none)', description: 'The typed space ladder rung (token-bound; the sheet\u2019s --jx-space-N). Omitted = no gap at all.' },
        { name: 'align', type: "'start' | 'center' | 'end' | 'baseline' | 'stretch'", default: '— (stretch)', description: 'Cross-axis alignment (align-items). Omission leaves flex\u2019s own stretch default — omission transparency.' },
        { name: 'justify', type: "'start' | 'center' | 'end' | 'between' | 'stretch'", default: '—', description: 'Main-axis distribution (justify-content).' },
        { name: 'wrap', type: 'boolean', default: 'false', description: 'Allow wrapping onto multiple lines (flex-wrap: wrap).' },
        { name: 'inline', type: 'boolean', default: 'false', description: 'Inline flow (display: inline-flex) instead of block flow.' },
        { name: 'children', type: 'Snippet', default: '—', description: 'The flow\u2019s contents.' },
        { name: '…rest', type: 'HTMLAttributes<HTMLDivElement>', default: 'spread', description: 'Every other attribute lands on the div — consumer attributes replace, never merge.' },
      ]} />
    </SectionCard>
  </div>
  <div data-reveal="">
    <DocsSeeAlso name="stack" />
  </div>
</div>
