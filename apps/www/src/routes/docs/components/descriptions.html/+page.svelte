<!--
  Docs page for the descriptions family (docs-eight-axes-mdn task 17,
  scribe 2026-09-22 — tier 2 over the docs-restructure page: the
  archetype skeleton re-orders and gains Overview + the generated-props
  lane (the family HAS meta — the 2-row hand API table retires) + the
  per-axis table + one real query() case; the theming DensityDemo
  folds into the axes demos; the types and vertical canvases join the
  same-source lane (static stages) while the lab, the responsive rig
  and the extra-slot recipe stay hand mirrors — their stages bind page
  state (the extractor's documented rejection class, the avatar
  play-state lab precedent).

  Order: hero → install → overview → usage → the lab → lane shapes →
  vertical terms → responsive columns → extra header actions → Props →
  the eight axes → accessibility → see-also.

  Mechanism rows are measurement-first (probed against the served
  family, 2026-09-22): the anatomy rides the density ruler's ambient
  channels (--jx-gap/--jx-inset padding, --jx-text/--jx-line value
  voice, --jx-text-secondary/--jx-line-secondary term voice — measured
  10/11/12/14px terms · 11/12/13/15px values · 8/8/12/16px padding
  across xs/sm/default/lg; the number coefficient composes at :root —
  inert). size/shape/radius/color/elevation/motion stamp carriers zero
  family readers read (negative-grep receipt). Theme is the avatar
  frozen-pole twin: the chrome's five stylex aliases declare only at
  the :root,.xbpgcew pole + the theme class (built-CSS grep), the .dark
  bridge lands and nothing repaints — the documented absence, W-next #1.
-->

<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import Descriptions, { DescriptionsItem } from '$lib/ui/descriptions/index';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlayRange, PlaySegmented, PlayToggle, PlayHelp } from '$lib/playground';
  import Badge from '$lib/ui/badge/badge.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import { meta as descriptionsMeta } from '$lib/meta/descriptions.meta';
  import { DESCRIPTIONS_DOCS } from '$lib/ui/props-table/docs/descriptions.docs';

  // Same-source law: the canvas drawer shows the exact registry copy this site runs.
  import descriptionsSource from '$lib/ui/descriptions/descriptions.svelte?raw';
  import descriptionsItemSource from '$lib/ui/descriptions/descriptions-item.svelte?raw';
  import descriptionsCssSource from '$lib/ui/descriptions/descriptions.css?raw';
  import descriptionsIndexSource from '$lib/ui/descriptions/index.ts?raw';

  // The canvas same-source lane: the types and vertical canvases are
  // STATIC stages — their usage files compose from THIS PAGE's own
  // stage markup via resolveRawCode (one source, two surfaces). The
  // lab, the responsive rig and the extra-slot recipe stay hand
  // mirrors: their stages bind page state (columns/bordered, the frame
  // width, the action echo — the extractor's documented rejection
  // class, the avatar play-state lab precedent), and the query()
  // canvas embeds the responsive call for the same reason.
  import { usageFile } from '$lib/canvas-usage';
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/descriptions.html/+page';

  // catalog sync-binding: the hero summary IS the registry description;
  // a miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'descriptions');
  if (!entry) {
    throw new Error('catalog miss: "descriptions" has no registry meta — fix registry.json');
  }

  // A literal closing-script tag inside the code string would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ---- same-source: the types and vertical canvases (static stages) ----
  const importMap = { Descriptions: '@ui/descriptions/index', DescriptionsItem: '@ui/descriptions/index' } as const;
  const typesUsage = usageFile(importMap, resolveRawCode('types'));
  const typesFiles: TreeFile[] = [
    { name: 'src/lib/ui/descriptions-types.svelte', content: typesUsage, kind: 'usage' },
  ];
  const verticalUsage2 = usageFile(
    { Descriptions: '@ui/descriptions/index', DescriptionsItem: '@ui/descriptions/index', Badge: '@ui/badge/badge.svelte' },
    resolveRawCode('vertical'),
  );
  const verticalFiles: TreeFile[] = [
    {
      name: 'registry/files/ui/descriptions/descriptions-item.svelte',
      content: descriptionsItemSource,
    },
    { name: 'src/lib/ui/descriptions-vertical.svelte', content: verticalUsage2, kind: 'usage' },
  ];

  // the axes canvas is static too — its drawer composes from the same
  // extraction (one source, two surfaces)
  const axesUsage = usageFile(
    { Descriptions: '@ui/descriptions/index', DescriptionsItem: '@ui/descriptions/index' },
    resolveRawCode('axes'),
  );
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/descriptions-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // ---- the lab canvas (columns/bordered playground) ----------------------
  const usage = `<Descriptions columns={2} bordered>
  <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
  <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
  <DescriptionsItem term="status"><!-- rich cells are just children -->
    <Badge>passing</Badge>
  </DescriptionsItem>
  <DescriptionsItem term="notes" /><!-- no children ⇒ the em dash -->
</Descriptions>`;

  const canvasInitial = { columns: '2', bordered: true };
  let columnsOption = $state(canvasInitial.columns);
  let bordered = $state(canvasInitial.bordered);
  const columns = $derived(Number(columnsOption));
  function resetCanvas(): void {
    columnsOption = canvasInitial.columns;
    bordered = canvasInitial.bordered;
  }
  const usageLive = $derived(
    usage.replace(
      '<Descriptions columns={2} bordered>',
      `<Descriptions columns={${columns}}${bordered ? ' bordered' : ''}>`,
    ),
  );
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const columnOptions = [1, 2, 3].map((value) => ({ value: String(value), label: String(value) }));

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/descriptions/descriptions.svelte', content: descriptionsSource },
    { name: 'registry/files/ui/descriptions/descriptions-item.svelte', content: descriptionsItemSource },
    { name: 'registry/files/ui/descriptions/descriptions.css', content: descriptionsCssSource },
    { name: 'registry/files/ui/descriptions/index.ts', content: descriptionsIndexSource },
    { name: 'src/lib/ui/descriptions-usage.svelte', content: usage, kind: 'usage' },
  ];

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((style): style is string | { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- recipe: responsive columns (the frame rig) -------------------------
  const responsiveInitial = { frameWidth: 680 };
  let frameWidth = $state(responsiveInitial.frameWidth);
  function resetResponsive(): void {
    frameWidth = responsiveInitial.frameWidth;
  }
  // the canvas stage arms its children flex: 1 1 100% — the basis would
  // pin the rig at the stage width and eat any width declaration, so the
  // rig rides FLEX-BASIS (the slider tracks the basis, the drag folds)
  const frameStyle = $derived(`flex: 0 0 min(${frameWidth}px, 100%); width: min(${frameWidth}px, 100%);`);

  const responsiveUsage = `<!-- the container query is the component's own law
     (descriptions.css: @container (max-width: 640px) ⇒ one pair per row).
     The consumer only owns the container's width: -->
<div style="width: {frameWidth}px">
  <Descriptions columns={3} bordered>
    <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
    <!-- … -->
  </Descriptions>
</div>`;

  // ---- recipe: extra header actions ----------------------------------------
  let extraEcho = $state('—');
  const extraUsage = `<!-- the extra slot composes AROUND the dl: a header row
     (title + actions) over the list. antd's title/extra props would put
     non-dl content INSIDE the dl — the wrapper keeps the semantics clean
     (recorded in the change's followups). -->
<section class="border border-border">
  <header class="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
    <p class="m-0 font-nav text-xs uppercase tracking-[0.12em]">deploy · iad1</p>
    <div class="flex gap-2">
      <PressButton variant="outline" onclick={redeploy}>redeploy</PressButton>
      <PressButton variant="ghost" onclick={rollback}>rollback</PressButton>
    </div>
  </header>
  <Descriptions columns={2} bordered>
    <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
    <!-- … -->
  </Descriptions>
</section>`;

  // ---- the ONE query() case: responsive density on the dl — the base
  // (small) applies below the 64rem viewport; at ≥64rem the lg case wins
  // and the whole grid steps to the touch tier. BOTH generics are the
  // §6 typing law: with an explicit type-argument list TS disables
  // inference for the base parameter, so the single-arg form pins B to
  // undefined and ships a real svelte-check error.
  const queryUsage = `<script lang="ts">
  import Descriptions, { DescriptionsItem } from '@ui/descriptions/index';
  import { query } from '@lib/universal-props-query.svelte';
  import type { DensityLane } from '@lib/defaults.svelte';
${close}

<Descriptions density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')} bordered>
  <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
  <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
</Descriptions>`;
</script>

<svelte:head>
  <title>Descriptions · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai descriptions family: a dl is a description list — one DescriptionsItem per term/value pair, the term prop renders the dt, children render the dd. Rich cells are just children; the bordered look is CSS on the same dl, never a table in disguise; columns respond via container queries. Recipes: vertical terms, responsive columns, extra header actions."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data display"
        title="descriptions — composed dt/dd pairs, never a table"
        summary={entry.summary}
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">dl · never a table</span>
          <span class="pill">term prop → dt · children → dd</span>
          <span class="pill">columns via container query</span>
          <span class="pill">bordered hairline frame</span>
          <span class="pill">vertical · responsive · extra recipes</span>
        </div>
      </SectionCard>
    </div>

    <div id="install" data-reveal="">
      <DocsInstall name="descriptions" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="The enterprise detail view, W3C-first: a dl IS a description list — dt/dd pairs in source order over a grid, one DescriptionsItem per pair. The bordered look is CSS on the same dl; columns and bordered are HOW-props — they change how the grid paints, never what renders."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            One <code>DescriptionsItem</code> per pair: the <code>term</code> prop renders the
            dt, children render the dd — rich cells are just children (badges, links, markup),
            and a childless Item renders the em dash, never a blank cell. <code>columns=N</code>
            splits rows into N pairs per row, clamped 1–4 and responsive down to one pair per row
            on narrow containers — the container query reads the dl's OWN container, never the
            viewport, so any layout column inherits the law.
          </p>
          <p class={cx(rt.measurePara)}>
            The anatomy rides the density ruler's ambient channels — the term's micro-label voice
            and the value's body voice re-tier with the ambient scope while the eight-axis
            carriers the root stamps have zero family readers: the chrome's theme voices are
            stylex aliases frozen at the :root pole (the avatar twin). The per-axis receipts are
            below.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="The composition contract in one sample: import the family from the registry barrel (@ui/descriptions/index — per-part targets exist per file). There is no items[] prop and no value snippet — rich cells are plain children of the Item."
      >
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="descriptions-demo" data-region="descriptions-demo" data-family="descriptions-demo" data-reveal="">
    <ComponentCanvas
      title="descriptions"
      stage="fill"
      description="One Item per pair: the term prop renders the dt, children render the dd — the status badge is just children, the childless notes Item falls back to the em dash."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/descriptions/descriptions.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      output={[
        { label: 'columns', value: columns },
        { label: 'bordered', value: bordered },
      ]}
      resolveFileContent={resolveUsage}
    >
      <div class={cx(rt.wFull, rt.maxW2xl)}>
        <Descriptions {columns} {bordered}>
          <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
          <DescriptionsItem term="checks">12 passed · 0 failed</DescriptionsItem>
          <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
          <DescriptionsItem term="region">iad1 · washington</DescriptionsItem>
          <DescriptionsItem term="status">
            <Badge>passing</Badge>
          </DescriptionsItem>
          <DescriptionsItem term="notes" />
        </Descriptions>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="columns" hint="term/value pairs per row (1–4, clamped)">
            <PlaySegmented bind:value={columnsOption} options={columnOptions} />
          </PlayRow>
          <PlayRow label="bordered" hint="hairline frame on the same dl">
            <PlayToggle bind:value={bordered} />
          </PlayRow>
          <PlayHelp>
            columns and bordered are HOW-props — they change how the grid paints, never what
            renders. Narrow containers clamp to one pair per row via a container query; a
            childless Item renders the em dash, never a blank cell.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="types" data-region="types" data-family="types" data-reveal="">
    <SectionCard
      family="types"
      headerRegion="types"
      eyebrow="lane shapes"
      title="Description layouts"
      summary="Descriptions is a semantic dl: one or more term/value pairs per row, the bordered treatment optional. This canvas composes its drawer from the stage markup itself — the code shown is the code running."
    >
      <ComponentCanvas id="types" title="descriptions · types" files={typesFiles} stage="fill">
        <div class={cx(rt.deGridMd2)}>
          <div class={cx(rt.panel)}><Descriptions><DescriptionsItem term="owner">gaubee</DescriptionsItem></Descriptions></div>
          <div class={cx(rt.panel)}><Descriptions columns={2} bordered><DescriptionsItem term="status">live</DescriptionsItem><DescriptionsItem term="scope">public</DescriptionsItem></Descriptions></div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="examples" data-reveal="">
    <SectionCard
      family="examples"
      headerRegion="examples"
      eyebrow="examples"
      title="Examples"
      summary="Ability-named recipes: vertical terms, responsive columns, extra header actions."
    >
      <p class={cx(rt.m0, rt.bodyMuted)}>
        All three compose public structure — the Item's grid, the dl's container query, and a
        wrapper around the list. Nothing here reaches into the registry.
      </p>
    </SectionCard>
  </div>

  <div id="descriptions-vertical" data-region="descriptions-vertical" data-family="descriptions-vertical" data-reveal="">
    <ComponentCanvas
      id="vertical"
      title="with vertical terms"
      description="antd's layout=vertical, composed: each Item re-runs its own grid as one column — the dt stacks above its dd. Same dl, same semantics, the term reads as a field label instead of a row lead. This drawer composes from the stage markup itself."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/descriptions/descriptions-item.svelte"
      files={verticalFiles}
      stage="fill"
      output={[{ label: 'layout', value: 'vertical · grid-cols-1!' }]}
    >
      <div class={cx(rt.deGrid)}>
        <Descriptions>
          <DescriptionsItem term="owner" class={cx(rt.deCols1Imp)}>@gaubee</DescriptionsItem>
          <DescriptionsItem term="region" class={cx(rt.deCols1Imp)}>iad1 · washington</DescriptionsItem>
          <DescriptionsItem term="status" class={cx(rt.deCols1Imp)}><Badge>passing</Badge></DescriptionsItem>
        </Descriptions>
        <Descriptions bordered>
          <DescriptionsItem term="build" class={cx(rt.deCols1Imp)}>4f2a1c</DescriptionsItem>
          <DescriptionsItem term="runtime" class={cx(rt.deCols1Imp)}>node 24 · bun</DescriptionsItem>
          <DescriptionsItem term="notes" class={cx(rt.deCols1Imp)} />
        </Descriptions>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            The consumer class wins the tailwind-merge against the Item's own grid-cols
            (grid-cols-1!, important-pinned so no layer order can flip it back). Terms keep
            their muted nav voice; the bordered frame paints cell edges exactly as in the
            horizontal law.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="descriptions-responsive" data-region="descriptions-responsive" data-family="descriptions-responsive" data-reveal="">
    <ComponentCanvas
      title="with responsive columns"
      description="Drag the frame across the 640px line: the SAME three-column dl re-lays out into one pair per row — the container query reads the dl's own container, never the viewport, so any layout column inherits the law."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/descriptions/descriptions.css"
      files={[
        { name: 'registry/files/ui/descriptions/descriptions.css', content: descriptionsCssSource },
        { name: 'src/lib/ui/descriptions-responsive-usage.svelte', content: responsiveUsage, kind: 'usage' },
      ]}
      stage="fill"
      onreset={resetResponsive}
      output={[
        { label: 'frame', value: `${frameWidth}px` },
        { label: 'container law', value: frameWidth < 640 ? '1 pair / row' : '3 pairs / row' },
      ]}
    >
      <div class="desc-frame-rig" style={frameStyle}>
        <Descriptions columns={3} bordered>
          <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
          <DescriptionsItem term="checks">12 passed</DescriptionsItem>
          <DescriptionsItem term="region">iad1</DescriptionsItem>
          <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
          <DescriptionsItem term="runtime">node 24</DescriptionsItem>
          <DescriptionsItem term="status"><Badge>passing</Badge></DescriptionsItem>
        </Descriptions>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="frame width" hint="drag across 640px">
            <PlayRange bind:value={frameWidth} min={280} max={760} step={8} />
          </PlayRow>
          <PlayHelp>
            The clamp lives in the component's own residue sheet: @container (max-width: 640px)
            ⇒ grid-template-columns: 1fr, unlayered so it beats the root's grid utility. The
            consumer owns nothing but the container's width — drop the same dl into a sidebar
            and it folds the same way.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="descriptions-extra" data-region="descriptions-extra" data-family="descriptions-extra" data-reveal="">
    <ComponentCanvas
      title="with extra header actions"
      description="antd's extra slot, composed honestly: a header row (title + actions) wraps the dl instead of living inside it — non-dl content never enters the list, the actions read back through the echo."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/descriptions/descriptions.svelte"
      files={[
        { name: 'registry/files/ui/descriptions/descriptions.svelte', content: descriptionsSource },
        { name: 'src/lib/ui/descriptions-extra-usage.svelte', content: extraUsage, kind: 'usage' },
      ]}
      stage="fill"
      output={[{ label: 'last action', value: extraEcho }]}
    >
      <div class={cx(rt.wFull, rt.maxW2xl)}>
        <section class="desc-card">
          <header class="desc-card-head">
            <p class={cx(rt.m0, rt.fontNav, rt.text12, rt.upper, rt.track12, rt.inkMuted)}>deploy · iad1 · production</p>
            <div class={cx(rt.flex, rt.gap8)}>
              <PressButton variant="outline" onclick={() => (extraEcho = 'redeploy queued')}>redeploy</PressButton>
              <PressButton variant="ghost" onclick={() => (extraEcho = 'rollback armed')}>rollback</PressButton>
            </div>
          </header>
          <Descriptions columns={2} bordered>
            <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
            <DescriptionsItem term="runtime">node 24</DescriptionsItem>
            <DescriptionsItem term="checks">12 passed · 0 failed</DescriptionsItem>
            <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
          </Descriptions>
          <p class={cx(rt.m0, rt.px16, rt.dePb12, rt.fontMono, rt.text115, rt.inkMuted)} aria-live="polite">
            last action: {extraEcho}
          </p>
        </section>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            A title/extra PROP would put foreign content inside the dl — the wrapper keeps the
            list semantic (nothing but dt/dd groups) while the header owns the chrome. The live
            readout pattern is the same one the table recipes use.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="props"
      title="Props"
      summary="Props extend the native HTML dl attributes — minus color, whose name the eight-axis surface owns (the §1 native collision rule); the entries below are descriptions-specific additions, and everything else rides the rest object through to the dl."
    >
      <PropsTable meta={descriptionsMeta} docs={DESCRIPTIONS_DOCS} />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on descriptions"
      summary="The anatomy rides the density ruler's ambient channels: the term/value padding is --jx-gap/--jx-inset, the value's body voice is --jx-text/--jx-line, the term's micro-label is --jx-text-secondary/--jx-line-secondary — the named rung re-tiers the whole grid (measured 10/11/12/14 · 11/12/13/15 · 8/8/12/16 across xs/sm/default/lg; the number coefficient composes at :root — inert). size, shape, radius, color, elevation and motion stamp carriers nothing here reads (negative-grep receipt). Theme is the avatar frozen-pole twin: the chrome's five stylex aliases declare only at the :root,.xbpgcew pole + the theme class — the .dark bridge lands and nothing repaints (documented absence, W-next #1). Census: batch A (migration-census.md)."
    >
      <div class={cx(rt.col20)}>
        <PropsTable
          props={[
            {
              name: 'size',
              type: `'small' | 'medium' | 'large' | 'auto' | number`,
              default: 'ambient scope',
              description:
                "SUPPLY-ONLY — the root stamps --jx-size-effective plus an inline font-size, and every voice on the grid is density-channel-anchored (--jx-text / --jx-text-secondary), so the stamp reaches only unstyled flow under the root (the dt/dd never inherit it). The §1 collision applies: the dl never receives a size attribute. Number unit: px.",
            },
            {
              name: 'shape',
              type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
              default: 'ambient scope',
              description:
                "SUPPLY-ONLY — stamps --jx-shape-effective + --jx-radius-factor-effective; zero readers (grep receipt: zero carrier reads in ui/descriptions/). A detail grid has no corners of its own; the bordered frame is square-edged by the card law. Number unit: none.",
            },
            {
              name: 'radius',
              type: `'small' | 'medium' | 'large' | 'auto' | number`,
              default: 'ambient scope',
              description:
                "SUPPLY-ONLY — stamps --jx-radius-effective; zero readers (the same grep receipt). The bordered frame stays square; nothing computes the §3 concentric corner. Number unit: px.",
            },
            {
              name: 'density',
              type: `'small' | 'medium' | 'large' | 'xs' | '2xs' | 'sm' | 'default' | 'lg' | 'auto' | number`,
              default: 'ambient scope',
              description:
                "CONSUMED through the ambient scope (the no-own axis slot — no provider and no explicit prop resolve auto, stamp nothing, and the ambient css scope channel keeps flowing): the grid re-tiers end to end. Padding rides --jx-gap/--jx-inset, the value's body voice --jx-text/--jx-line, the term's micro-label --jx-text-secondary/--jx-line-secondary — measured 10/11/12/14px terms · 11/12/13/15px values · 8/8/12/16px padding across xs/sm/default/lg. The NUMBER lane is inert (the coefficient composes at the :root rung scopes; the wrapper never re-declares — measured: a 3× coefficient leaves 13px/12px unmoved). Number unit: coefficient.",
            },
            {
              name: 'color',
              type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
              default: 'ambient scope',
              description:
                "SUPPLY-ONLY — stamps --jx-color-effective; zero family readers (grep receipt). A detail grid is content, not a painted object: the dt reads the muted alias, the dd the foreground alias, the bordered frame the border/card aliases — all theme voices, none of them the hue axis. Number unit: hue degrees.",
            },
            {
              name: 'theme',
              type: `'light' | 'dark' | 'system' | 'auto'`,
              default: 'ambient scope',
              description:
                "THEME-FROZEN (the avatar twin, the documented absence W-next #1) — the root lands the .dark class bridge, and NOTHING repaints: every chrome voice is a stylex alias (--jx-border, --jx-card, --jx-muted, --jx-muted-foreground, --jx-foreground) whose declaration substitutes at the :root,.xbpgcew pole (built-CSS grep: each alias declares exactly twice — the pole + the theme class; never plain .dark). A documented absence: when the raw layer's dark values want in, the alias re-declaration is the named fix. light and system stamp nothing. No number lane.",
            },
            {
              name: 'elevation',
              type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
              default: 'ambient scope',
              description:
                "SUPPLY-ONLY — stamps --jx-elevation-effective; zero family readers (grep receipt). The bordered frame is a hairline on the card ground, no shadow layer; depth composes by the entity laws around the dl, never inside it. Number unit: dp.",
            },
            {
              name: 'motion',
              type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
              default: 'ambient scope',
              description:
                "SUPPLY-ONLY — stamps --jx-motion-effective; no family css reads it (grep receipt). A detail grid is a static read: nothing transitions, nothing moves — the reduced-motion law costs nothing here. Number unit: coefficient.",
            },
          ]}
          title=""
        />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the adoption is the census batch A row (explicit-props W3-D1 — the
          data-display families join the eight-axis surface;
          openspec/changes/explicit-props/research/migration-census.md). The §1 collision rule:
          the interface Omits 'color', the dl never receives an axis name. `bordered` keeps its
          literal slot (own false — booleans are a closed domain); `columns` is the family's own
          HOW-prop.
        </p>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="descriptions · the ruler and the frozen island" files={axesFiles} stage="fill">
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density default — 13px values, 12px secondary terms, 12px padding</span>
                <Descriptions bordered>
                  <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
                  <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
                </Descriptions>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density="lg" — the touch tier steps the whole grid (15px, 16px padding)</span>
                <Descriptions bordered density="lg">
                  <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
                  <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
                </Descriptions>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>theme="dark" — the bridge lands; the chrome stays frozen (nothing repaints)</span>
                <Descriptions bordered theme="dark">
                  <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
                  <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
                </Descriptions>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>color="error" — stamped, unread: content is not a painted object</span>
                <Descriptions bordered color="error">
                  <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
                  <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
                </Descriptions>
              </div>
            </div>
            <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
              The number lanes stamp and re-base nothing here — the declaring element for every
              channel this family reads is the ambient scope (:root), the wrapper never
              re-declares (the declaring-element law). Measure the voices, not the coefficient:
              10 / 11 / 12 / 14px terms, 11 / 12 / 13 / 15px values, 8 / 8 / 12 / 16px padding.
            </p>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="descriptions · query()" files={[{ name: 'descriptions-query-demo.svelte', content: queryUsage, kind: 'usage' }]}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <Descriptions
                density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}
                bordered
              >
                <DescriptionsItem term="build">4f2a1c</DescriptionsItem>
                <DescriptionsItem term="owner">@gaubee</DescriptionsItem>
              </Descriptions>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 64rem the base applies — the small rung, the
                pointer-lane grid; at 64rem and wider the lg case wins and the grid steps to the
                touch tier (12px/8px padding below, 15px/16px above — measured). Resize across
                64rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <TokenTable tokens={[
            { name: '--jx-desc-cols', default: 'columns prop (clamped 1–4)', source: 'component', description: 'The root\'s own column-count channel — repeat(var(--jx-desc-cols), minmax(0, 1fr)); folds to 1fr under 640px of container width.' },
            { name: '--jx-gap', default: '8 / 8 / 12 / 16px across xs / sm / default / lg', source: 'density', description: 'The cells\' padding-block voice.' },
            { name: '--jx-inset', default: '8 / 8 / 12 / 16px across xs / sm / default / lg', source: 'density', description: 'The cells\' padding-inline voice.' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px across xs / sm / default / lg', source: 'density', description: 'The dd\'s body voice (measured).' },
            { name: '--jx-text-secondary', default: '10 / 11 / 12 / 14px across xs / sm / default / lg', source: 'density', description: 'The dt\'s micro-label voice (measured).' },
            { name: '--jx-line', default: 'the dd\'s leading rung', source: 'density', description: 'Value-voice leading, re-based with the type lane.' },
            { name: '--jx-line-secondary', default: 'the dt\'s leading rung', source: 'density', description: 'Term-voice leading, re-based with the type lane.' },
          ]} />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="The dl preserves description-list semantics — wrappers add chrome, never list content; the term names the property, the value answers it."
    >
      <A11yTable
        aria={[
          { name: 'dl', value: 'Descriptions root', description: 'Preserves description-list semantics — wrappers add chrome, never list content.' },
          { name: 'dt', value: 'term', description: 'Names each property.' },
          { name: 'dd', value: 'value', description: 'Contains the corresponding value.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="descriptions" />
  </div>
</div>

<style>
  /* the responsive rig: only the width matters — the container query
     does the folding */
  .desc-frame-rig {
    max-width: 100%;
    /* the rig IS the dl's query container: without inline-size containment
       the grid's min-content floor pins the track count and the drag
       never folds (marginalia's receipt — state chip vs painted tracks) */
    container-type: inline-size;
  }

  /* the extra-slot card: consumer chrome around the dl */
  .desc-card {
    border: 1px solid var(--border);
  }
  .desc-card-head {
    align-items: center;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.625rem 1rem;
  }
</style>
