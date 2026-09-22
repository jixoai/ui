<!--
  empty — docs page (docs-eight-axes-mdn task 11, quill 2026-09-22;
  tier 2 over the W3-era page: the demo canvas, composition demo and
  a11y table survive, the skeleton re-orders to the archetype and gains
  Overview + the per-axis table + the generated props table + one real
  query() case). Order: hero → install → overview → usage → the
  composition demo → props → the eight axes → accessibility → see-also.
  Baseline skill: openspec/changes/docs-eight-axes-mdn/skills/
  mdn-doc-style.md §2. The family is a LEAF: no component composes it
  (grep receipt) — the composition happens consumer-side through the
  illustration/actions snippets.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import Empty from '$lib/ui/empty/empty.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import { meta as emptyMeta } from '$lib/meta/empty.meta';
  import { EMPTY_DOCS } from '$lib/ui/props-table/docs/empty.docs';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import emptySource from '$lib/ui/empty/empty.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<Empty title="no checks yet" description="add the first check">
  {#snippet actions()}<PressButton>add check</PressButton>{/snippet}
</Empty>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/empty.svelte', content: emptySource },
    { name: 'src/lib/ui/empty-usage.svelte', content: usage },
  ];

  // the composition demo's usage mirror — hand-authored to match the
  // stage markup (the same-source migration is the recorded follow-up).
  const emptyCompositionDemo = `<script lang="ts">
  import Empty from '@ui/empty.svelte';
  import PressButton from '@ui/press-button.svelte';
${close}

<div class="grid gap-4 md:grid-cols-2">
  <Empty title="no artifacts" />
  <Empty title="no checks" description="Add the first check.">
    {#snippet actions()}<PressButton>add check</PressButton>{/snippet}
  </Empty>
</div>`;

  // ---- the eight axes demos: code shown = code running -------------------
  const axesUsage = `<!-- density: the named rung re-bases the figure's rhythm —
     the --jx-stack/--jx-inset/--jx-text/--jx-line channels the
     figure, art and caption read -->
<Empty title="compact (sm rung)" density="small" />
<Empty title="touch (lg rung)" density="lg" />

<!-- theme: the FROZEN pole — no raw-token voice exists in the
     family's paint, so a resolved dark stamps .dark and nothing
     flips; the state keeps the page profile -->
<Empty title="dark island — byte-identical" theme="dark" />`;
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/empty-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the ONE query() case: responsive density on the figure's rhythm —
  // the base (large) applies below the 40rem viewport; at ≥40rem the
  // sm case wins and the figure compacts. The explicit generics pin
  // the cases AND the base to the lane (the campaign's typing law).
  const responsiveDensity = query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large');

  const queryUsage = `<script lang="ts">
  import Empty from '@ui/empty.svelte';
  import { query } from '@lib/universal-props-query.svelte';
  import type { DensityLane } from '@lib/defaults.svelte';
${close}

<Empty
  title="responsive figure"
  density={query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large')}
/>`;

  const queryFiles: TreeFile[] = [{ name: 'empty-query-demo.svelte', content: queryUsage, kind: 'usage' }];

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

  // ---- the per-axis table (§2.5). Grep receipts: zero effective-carrier
  // readers AND zero raw-token reads in empty.stylex.ts (the frozen pole).
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-size-effective; no family css reads it (grep receipt: zero readers in ui/empty/). The title and description read the fixed --jx-text/--jx-line channels and the art box is structural. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-shape-effective and --jx-radius-factor-effective; no family css reads them (grep receipt: zero readers). The figure and art frames are 1px hairline boxes with no corner law. Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective; no family css reads it (grep receipt: zero readers) — the family composes no radius, concentric or otherwise. Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "CONSUMED — the axis that repaints this state. The named rung stamps data-density on the figure and the scope block re-bases every channel the atoms read: --jx-stack (the figure/caption/art gaps), --jx-inset ×2 (the figure's air), --jx-text/--jx-line (title and description type), --jx-gap (the actions row) — the whole no-data composition breathes together. The NUMBER lane is inert: the coefficient stamps on the figure, but the channels compose at :root and the rung scopes — substitution runs at the declaring element (the declaring-element law). Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective; no family css reads it (grep receipt: zero readers). The '0 items' ink rides --jx-primary — the theme's primary, never the hue carrier; hue that paints comes from the theme or the jx-hue-* injection. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE FROZEN POLE, measured: a resolved dark stamps .dark on the figure and NOTHING flips — the declaring-selector grep finds zero raw-token reads in the family's paint (every voice is the stylex :root emission: --jx-border/--jx-muted/--jx-card/--jx-foreground/--jx-muted-foreground/--jx-primary/--jx-shadow-2xs, plus theme-free kernel channels). The no-data state keeps the page profile inside any island; consumers who want a dark empty state compose it inside their own dark scope. light and system stamp nothing — tree inheritance.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-elevation-effective; no family css reads it. The art box's one shadow is --jx-shadow-2xs — a fixed recipe token, not the §7 consumption pair. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; no family css reads it. The component is zero-JS with zero transitions — nothing animates, so the axis has nothing to step. Number unit: coefficient.",
    },
  ];

  // the density consumption channels (the figure's rhythm)
  const densityTokens = [
    { name: '--jx-stack', default: 'rung scale × coefficient', source: 'density' as const, description: 'The figure, caption and art gaps; the actions row\'s top margin.' },
    { name: '--jx-inset', default: 'rung scale × coefficient', source: 'density' as const, description: 'The figure\'s air — padding rides calc(var(--jx-inset) × 2); the art\'s own padding is ×1.' },
    { name: '--jx-text / --jx-line', default: '10 / 11 / 12 / 13 / 15px · 14 / 16 / 18 / 20 / 24px (2xs → lg)', source: 'density' as const, description: 'The title and description type voice.' },
    { name: '--jx-gap', default: 'rung scale × coefficient', source: 'density' as const, description: 'The actions row\'s wrap gap.' },
    { name: '--jx-shadow-2xs', default: 'fixed recipe', source: 'structural' as const, description: 'The art box\'s one shadow — a static token, not the elevation axis pair.' },
  ];

</script>

<svelte:head>
  <title>Empty · jixoai-ui</title>
  <meta name="description" content="The eight-state machine's no-data member (error/loading/404 are alert/result surfaces — ruled separate). Terminal illustration slot, title, description, actions" />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: the page sections ship as PAGE DATA (+page.ts); the
       scaffold chrome owns the rail -->

  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · General" title="empty — the no-data state, nothing more" summary="The eight-state machine's no-data member (error/loading/404 are alert/result surfaces — ruled separate). Terminal illustration slot, title, description, actions. Zero JS.">
      <div class={cx(rt.wrap12)}>
        <span class="pill">zero JS</span>
        <span class="pill">illustration slot</span>
        <span class="pill">actions snippet owns the fix</span>
      </div>
    </SectionCard>
  </div>

  <div id="install" data-reveal="">
    <DocsInstall name="empty" />
  </div>

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      eyebrow="overview"
      title="Overview"
      summary="A figure with three optional parts and one required line: the no-data state of the eight-state machine, deliberately nothing more."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.measurePara)}>
          Empty renders one composition: a dashed muted figure holding the terminal-box
          illustration (the default is an empty directory listing — <code>ls checks/</code>, zero
          items), and a figcaption carrying the <code>title</code>, an optional
          <code>description</code>, and an optional <code>actions</code> snippet. Zero JS, zero
          state, zero transitions — the no-data state of the eight-state machine, and NOTHING
          more: the antd ruling keeps error/loading/404 in the alert and result surfaces.
        </p>
        <p class={cx(rt.measurePara)}>
          Composition is consumer-side by law: the illustration is a slot (bring any glyph — it
          stays decorative, <code>aria-hidden</code>), and the actions snippet hosts the recovery
          controls (usually a press-button). No component composes Empty today (grep receipt) —
          pages own their no-data regions directly.
        </p>
        <p class={cx(rt.measurePara)}>
          The eight axes resolve on the figure — density is the one axis that repaints (the named
          rung re-bases the rhythm channels), theme is the frozen pole (the paint reads no raw
          tokens, so an island changes nothing), and six stamp-and-supply. Per-axis below; the
          shared grammar lives on the
          <a class="pill" href="/docs/universal-props.html">universal props</a> page.
        </p>
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal=""><SectionCard eyebrow="usage" title="Usage" summary="One required title; description and actions fill the caption; the illustration slot replaces the terminal default."><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>

    <div data-reveal="">
    <ComponentCanvas
      title="empty"
      stage="center"
      description="empty — the no-data state, nothing more"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/empty.svelte"
      files={canvasFiles}
    >
      <div class={cx(rt.wFull, rt.maxWMd)}>
        <Empty title="no checks yet" description="Add the first check to start the audit pipeline.">
          {#snippet actions()}
            <PressButton>add check</PressButton>
          {/snippet}
        </Empty>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the illustration slot replaces the terminal default — bring any glyph; it stays
            decorative (aria-hidden). empty never guesses how to FIX the emptiness: the actions
            snippet owns that.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="demo" data-reveal=""><SectionCard eyebrow="examples" title="Composition" summary="One required title and optional description, illustration and actions slots."><ComponentCanvas title="empty · composition" stage="fill" files={[{ name: 'empty-composition-demo.svelte', content: emptyCompositionDemo, kind: 'usage' }]}><div class={cx(rt.emGrid)}><Empty title="no artifacts" /><Empty title="no checks" description="Add the first check.">{#snippet actions()}<PressButton>add check</PressButton>{/snippet}</Empty></div></ComponentCanvas></SectionCard></div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Props" summary="The table renders from the GENERATED meta + curation; the eight axis rows split into the shared section beneath."><PropsTable meta={emptyMeta} docs={EMPTY_DOCS} /></SectionCard></div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on empty"
      summary="empty is the frozen pole of the axis surface (census batch D): all eight lanes resolve no-own on the figure, density repaints the composition through its named rung, and the other seven stamp-and-supply without touching the paint. theme is the measured absence — the declaring-selector grep finds zero raw-token reads, so a resolved dark stamps .dark and nothing flips. The carriers stamp the figure (the promoted root is self-carried), greppable in the raw SSR."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier or consumption it
          drives on THIS family, Default is the lane default — the named steps, number unit, and
          consumption are in each description.
        </p>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the adoption is the census batch D row (the long tail —
          openspec/changes/explicit-props/research/migration-census.md); empty is a leaf (grep
          receipt: no component mounts it), so the supply feeds only consumer compositions. The §1
          collision rule: the figure is a <code>&lt;figure&gt;</code> with no native attribute
          names at stake — every axis name is the family's own destructured lane.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on empty" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="empty · the consumed lane and the frozen pole" files={axesFiles} stage="fill">
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density="small" — data-density="sm"; the air and type compact</span>
                <Empty title="compact (sm rung)" density="small" />
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density="lg" — data-density="lg"; the touch-size figure</span>
                <Empty title="touch (lg rung)" density="lg" />
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>light — the ambient profile</span>
                <Empty title="light figure" />
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>theme="dark" — .dark stamps; nothing flips (the frozen pole)</span>
                <Empty title="dark island — byte-identical" theme="dark" />
              </div>
            </div>
            <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
              The two bottom figures render byte-identical paint in either profile — the theme
              row's documented absence, not a bug: every painted voice is the stylex :root
              emission, and a scoped .dark never re-substitutes it.
            </p>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="empty · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <Empty
                title="responsive figure"
                density={responsiveDensity}
              />
              <p class={cx(rt.para)}>
                Media keys are min-width: below 40rem the base applies — the large rung, the
                roomy figure; at 40rem and wider the sm case wins and the composition compacts.
                Resize across 40rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <TokenTable tokens={densityTokens} />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'figure', value: 'empty root', description: 'Groups the no-data message.' }, { name: 'figcaption', value: 'title + description', description: 'Keeps the message discoverable.' }, { name: 'aria-hidden', value: 'illustration', description: 'Prevents decorative art from interrupting the message.' }]} /></SectionCard></div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="empty" />
  </div>
</div>
