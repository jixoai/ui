<!--
  stack page (docs-eight-axes-mdn task 33, MDN archetype; tier 2
  优化重构 — the live workbench, gap ladder, axis-vocabulary and
  flow-mode demos carried; the archetype gains overview/law + the
  measured eight-axes layer + a ToC; the universal marker moves to the
  api table. Family untouched — the Layout family's flow primitive:
  structural props name intent, the paint axes are W3-D3 all no-own,
  and the carriers join the consumer style attr.
-->
<script lang="ts">
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Stack from '$lib/ui/stack';
  import type { StackGap } from '$lib/ui/stack';
  import { CATALOG } from '$lib/catalog';
  import { registrySourceUrl } from '$lib/registry-source';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
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

  // the gap ladder demo
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

  // the postures demo (justify between + align baseline)
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

  // the page's local join (the separator serialize law + the cx
  // predicate: the type guard zeroes the standing svelte-check
  // diagnostic — plain strings pass through whole; stylex objects
  // contribute their string members ($$css dropped)).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((style): style is string | { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the law table: the flow primitive ----------------------------------
  const lawTable = [
    { posture: 'structural, not style', input: 'direction · gap · align · justify · wrap · inline', renders: 'the props name LAYOUT INTENT, never paint — classified never-ambient and outside the context gate\u0027s vocabulary: an axis would have nothing meaningful to inherit (a row is a row because its consumer says so)', announces: 'the structural face stays outside the eight-axis contract' },
    { posture: 'omission transparency', input: 'a prop you did not name', renders: 'NOTHING — every atom is opt-in: row is flex\u0027s default (no direction atom exists), an omitted align stamps no align-items, an omitted gap stamps no gap (measured: the bare stack computes align-items: normal, gap: normal)', announces: 'the DOM carries only what you named' },
    { posture: 'the token-bound gap', input: 'gap="4" … "80"', renders: 'sixteen rungs, each a var(--jx-space-N) atom — spacing is never a free pixel, it composes with the sheet ladder the rest of the system reads (measured: gap="48" computes the --jx-space-48 rung)', announces: 'spacing is system spacing' },
    { posture: 'rest before stamp', input: 'your id · data-* · handlers', renders: 'the spread lands BEFORE the component\u0027s own attributes — consumer attributes REPLACE, never merge (the layout-family law); data-jx-stack, the density rung and the carriers follow', announces: 'your attributes win; the stamps cannot be contested' },
    { posture: 'the paint half', input: 'the eight axes (W3-D3)', renders: 'all no-own, first-time: an explicit lane stamps the §10 carriers onto the style attribute — JOINED with your own declarations (the merge law, the prototype-flex posture); a Stack paints nothing itself (source receipt: the atom table holds display/flex/gap declarations only)', announces: 'supply for the children, paint for nobody' },
    { posture: 'layout only', input: 'everything else', renders: 'no color, no padding, no typography — children keep their semantics wholesale and the reading order IS the DOM order (no order/reverse props by design). A stack is a plain div carrying layout, nothing to maintain', announces: 'transparent layout' },
  ];

  // ---- the measured eight-axes layer ---------------------------------------
  const axisRows = [
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "STAMP-ONLY, RUNG — the resolved lane stamps the §4 legacy rung on the stack root (measured: density=\"small\" → data-density=\"sm\"), the SCOPE your children flow through; the stack itself reads no channel. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "STAMP-ONLY, VOICE — the §11 pair (--jx-size-effective + font-size) lands on the root (measured 18px computed on the size demo) and the children inherit it through plain cascade — one number moves the whole stack's TYPE; the gap rungs stay rem-of-document-root and do NOT follow it (mutation-proven: stamp 18px keeps the 8px gap; document root 16→32px moves it 8→16px). Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — the alias + §14 radius factor land on the root; the stack paints no corner (source receipt: the atom table holds display/flex/gap declarations only). Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — --jx-radius-effective lands on the root for what you compose inside (a bordered child can consume it); the stack draws no border of its own. Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — --jx-color-effective lands on the root; the stack's ink is its children's ink (paint belongs to the children, the hero's own law). Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "BRIDGE — class:dark lands on the root (measured) and re-voices the token scope your children read; the layout itself is invisible to it. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — the §7 pair stamps on the root; the stack owns no shadow (layout sits IN the plane). Compose it with a surface child that reads the supply. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — the carrier lands on the root; the flow has no choreography of its own (no transitions in the atom table — grep receipt), so the lane is pure scope for motion-reading children. Number unit: coefficient.",
    },
  ];

  const axisTokens = [
    { name: '--jx-space-2 … 80', default: '16 rungs', source: 'color' as const, description: 'The sheet ladder — every gap atom resolves exactly one rung; spacing is never a free pixel value.' },
    { name: 'data-jx-stack', default: 'the only hook', source: 'component' as const, description: 'The component\u0027s single stamp — everything else on the root is yours or the axes\u0029.' },
    { name: 'the merge law', default: 'carriers + your style', source: 'structural' as const, description: 'The §10 carriers join the consumer style attribute in one channel — the prototype-flex layout-primitive posture.' },
    { name: 'rest-replace', default: 'spread before stamp', source: 'structural' as const, description: 'Consumer attributes replace, never merge — the layout-family law.' },
    { name: 'omission', default: 'no atom stamped', source: 'structural' as const, description: 'The DOM carries only the props you named — row rides flex\u0027s own default.' },
  ];

  // ---- the universal props demos (explicit-props W3-D3) --------------------
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
      {#snippet headerAside()}
        <div data-doc-install="" aria-label="install stack">
          <TerminalCard
            barTitle="install — stack"
            command="npx jixoai-ui add stack"
            outputs={['https://ui.jixoai.com/r/stack.json']}
          />
        </div>
      {/snippet}

        <div class={cx(rt.wrap12)}>
          <span class="pill">16 gap rungs · --jx-space-N</span>
          <span class="pill">closed CSS axis vocabulary</span>
          <span class="pill">structural props · never-ambient</span>
          <span class="pill">omission transparency</span>
        </div>
      </SectionCard>
    </div>


    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="The Layout family's flow primitive: one-dimensional arrangement (row/column) over the site's typed space ladder. A Stack is not a new layout engine — it is the sheet's own ladder with a component face, and it paints nothing else."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            Name layout intent, get flex: <code>direction</code> and
            <code>gap</code> are the working pair, <code>align</code> /
            <code>justify</code> / <code>wrap</code> / <code>inline</code>
            refine. Every prop is STRUCTURAL — layout intent, not paint
            vocabulary — and every one is optional: an omitted prop stamps no
            atom at all (row rides flex's own default), so the DOM carries
            only what you named. The gap is never a free pixel: each rung is
            a token-bound atom over the sheet's <code>--jx-space-N</code>
            ladder, sixteen steps from 2 to 80, so spacing composes with the
            rest of the system instead of drifting per-surface.
          </p>
          <p class={cx(rt.measurePara)}>
            Two contracts hold the component's shape. The structural face is
            never-ambient — an axis would have nothing meaningful to inherit
            (a row is a row because its consumer says so) — so
            direction/gap/align/justify/wrap/inline stay outside the defaults
            contract exactly as founded. The paint face is the eight-axis
            surface, all no-own: an explicit lane stamps the §10 carriers
            onto the style attribute JOINED with your own declarations (the
            merge law), and the scope flows to your children — one
            <code>size={18}</code> moves the whole stack's voice. The
            component itself paints nothing: no color, no padding, no
            typography; children keep their semantics wholesale and the
            reading order is the DOM order (no order/reverse props by
            design).
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- workbench: live gap/axis swaps -->
    <div id="stack-workbench" data-reveal="">
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

    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="The flow primitive"
        summary="Structural props name intent and stay never-ambient; omission is transparency; the gap is always a ladder rung; your attributes replace, never merge — and the stack paints nothing."
      >
        <div class={cx(rt.col20)}>
          <PropsTable
            props={lawTable.map((row) => ({
              name: row.posture,
              type: row.input,
              default: row.renders,
              description: `announces: ${row.announces}`,
            }))}
            title=""
          />
        </div>
      </SectionCard>
    </div>
  </div>

  <div class={cx(rt.shellFlush)}>
    <div id="postures" data-reveal="">
      <SectionCard
        family="postures"
        headerRegion="postures"
        eyebrow="postures"
        title="Postures — the closed CSS vocabulary"
        summary="align is the cross axis (start · center · end · baseline · stretch — flex's stretch default rides omission), justify is the main axis (start · center · end · between · stretch). No invented words, no numeric weights — and wrap/inline flip the flow itself."
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
        <div class={cx(rt.mt16)}>
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
        </div>
      </SectionCard>
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

    <div id="accessibility" data-reveal="">
      <SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="A stack is a plain div carrying layout only — no role, no announcements, nothing to maintain. Reading order is DOM order; the component never reorders visually (no order/reverse props by design).">
        <p class={cx(rt.bodyMuted)}>
          No ARIA surface: the stack is transparent layout. Children keep
          their own semantics wholesale — a button inside a stack is still a
          button, a list is still a list — and because there is no
          order/reverse prop, the visual order can never diverge from the
          reading order the accessibility tree reports.
        </p>
      </SectionCard>
    </div>

    <div id="api" data-reveal="">
      <SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Seven structural props plus the HTML rest — all optional, all never-ambient (no Defaults contract: an axis has nothing meaningful to inherit; a row is a row because its consumer says so)."><PropsTable universal props={[
        { name: 'direction', type: "'row' | 'column'", default: "'row'", description: 'The flow axis. Row is flex\u2019s default — no atom is stamped.' },
        { name: 'gap', type: "'2' | '4' | '6' | '8' | '10' | '12' | '14' | '16' | '18' | '20' | '24' | '28' | '32' | '40' | '48' | '80'", default: '— (none)', description: 'The typed space ladder rung (token-bound; the sheet\u2019s --jx-space-N). Omitted = no gap at all.' },
        { name: 'align', type: "'start' | 'center' | 'end' | 'baseline' | 'stretch'", default: '— (stretch)', description: 'Cross-axis alignment (align-items). Omission leaves flex\u2019s own stretch default — omission transparency.' },
        { name: 'justify', type: "'start' | 'center' | 'end' | 'between' | 'stretch'", default: '—', description: 'Main-axis distribution (justify-content).' },
        { name: 'wrap', type: 'boolean', default: 'false', description: 'Allow wrapping onto multiple lines (flex-wrap: wrap).' },
        { name: 'inline', type: 'boolean', default: 'false', description: 'Inline flow (display: inline-flex) instead of block flow.' },
        { name: 'children', type: 'Snippet', default: '—', description: 'The flow\u2019s contents.' },
        { name: '…rest', type: 'HTMLAttributes<HTMLDivElement>', default: 'spread', description: 'Every other attribute lands on the div — consumer attributes replace, never merge.' },
      ]} /></SectionCard>
    </div>

    <div id="axes" data-reveal="">
      <SectionCard
        family="axes"
        headerRegion="axes"
        eyebrow="axes"
        title="The eight axes on stack"
        summary="The paint half, W3-D3 first-time, all no-own: an explicit lane stamps the §10 carriers onto the style attribute — JOINED with your own declarations — and the scope flows to your children. The structural props stay outside this contract exactly as founded."
      >
        <div class={cx(rt.col20)}>
          <PropsTable props={axisRows} title="" />
          <div class={cx(rt.mt20)}>
            <TokenTable tokens={axisTokens} />
          </div>
          <div class={cx(rt.mt20)}>
            <ComponentCanvas title="Stack · universal props" stage="fill" files={universalFiles}>
              <div class={cx(rt.panel)} data-probe="stack-size"><Stack gap="8" size={18} density="small"><p>one number moves the stack</p><p>children inherit the root font-size</p></Stack></div>
              <div class={cx(rt.panel)} data-probe="stack-named"><Stack gap="8" size="medium" radius="large"><p>named steps resolve through the alias ladder</p></Stack></div>
              <div class={cx(rt.panel)} data-probe="stack-stamps"><Stack gap="8" theme="dark" radius={12} style="border-radius: 3px" data-probe-inner="merge"><p>the merge law: carriers and your style in one attribute</p></Stack></div>
              <div class={cx(rt.panel)} data-probe="stack-bare"><Stack><p>the bare posture: nothing named, nothing stamped</p></Stack></div>
            </ComponentCanvas>
          </div>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsSeeAlso name="stack" />
    </div>
  </div>
</div>
