<!--
  grid — canonical page (the Layout family, 2026-09-18). The
  two-dimensional primitive: blowout-proof equal tracks plus the
  0fr→1fr disclosure lane. Demo-standard skeleton: Intro → Install →
  Usage → Examples → a11y/theming → API → See Also.
-->
<script lang="ts">
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Grid from '$lib/ui/grid';
  import { CATALOG } from '$lib/catalog';
  import { registrySourceUrl } from '$lib/registry-source';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp, PlayRow, PlaySelect } from '$lib/playground';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'grid')?.summary;
  if (!heroSummary) throw new Error('catalog entry "grid" is missing — registry.json meta drift');

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import gridSource from '$lib/ui/grid/grid.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Grid from '@ui/grid';
${close}

<!-- three equal, blowout-proof columns -->
<Grid cols={3} gap="12">
  <Card>…</Card>
  <Card>…</Card>
  <Card>…</Card>
</Grid>

<!-- the disclosure lane: an expander row that animates honestly -->
<Grid rows={open ? 'open' : 'collapse'} gap="8">
  <button onclick={() => (open = !open)}>toggle</button>
  <div>…</div>
</Grid>`;

  // ---- the workbench: track count swapped live ----
  const colsOptions = [1, 2, 3, 4, 6, 12].map((value) => ({
    value: String(value),
    label: String(value),
  }));
  let cols = $state<string>('3');
  const canvasInitial = { cols: '3' };
  function resetCanvas(): void {
    cols = canvasInitial.cols;
  }
  const cellCount = $derived(Number(cols));
  const usageLive = $derived(`<script lang="ts">
  import Grid from '@ui/grid';
${close}

<Grid cols={${cols}} gap="8">
  {#each cells as cell}<Cell>{cell}</Cell>{/each}
</Grid>`);
  const files: TreeFile[] = [
    { name: 'registry/files/ui/grid/grid.svelte', content: gridSource },
    { name: 'src/lib/ui/grid-usage.svelte', content: '' },
  ];
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // ---- the disclosure demo (the 0fr→1fr lane) ----
  let drawerOpen = $state(false);

  const gridDisclosureDemo = `<script lang="ts">
  import Grid from '@ui/grid';
  let open = $state(false);
${close}

<button class="pill" onclick={() => (open = !open)}>
  {open ? 'collapse the lane' : 'open the lane'}
</button>
<Grid rows={open ? 'open' : 'collapse'} class="w-full">
  <div class="border border-border p-3 text-[12px] min-h-0 overflow-hidden">…the lane's content…</div>
</Grid>`;
  const disclosureFiles: TreeFile[] = [
    { name: 'grid-disclosure-demo.svelte', content: gridDisclosureDemo, kind: 'usage' },
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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
  // ---- the universal props demo (explicit-props W3-D1) --------------------
  const universalUsage = `<Grid size="medium">…</Grid>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/grid-universal.svelte', content: universalUsage },
  ];

</script>

<svelte:head>
  <title>Grid · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai grid component: the Layout family's two-dimensional primitive — equal tracks as repeat(N, minmax(0, 1fr)) so a wide child can never blow out its siblings, gaps over the typed --jx-space-N ladder, and the disclosure lane: a 0fr→1fr row that animates height honestly without measuring."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="grid — blowout-proof tracks, honest disclosure"
        summary={heroSummary}
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">repeat(N, minmax(0, 1fr))</span>
          <span class="pill">0fr → 1fr disclosure lane</span>
          <span class="pill">token-bound gap rungs</span>
          <span class="pill">structural props · never-ambient</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="grid" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="cols sets equal track count (1–12); rows carries the single named row state — collapse (0fr) or open (1fr); gap rides the same typed ladder as stack."
      >
        <CodeBlock code={usage} lang="svelte" meta="Grid usage" />
      </SectionCard>
    </div>

    <!-- workbench -->
    <div id="grid-workbench" data-region="grid-workbench" data-reveal="">
      <ComponentCanvas
        title="grid"
        description="Equal tracks under the minmax(0, 1fr) law — the playground swaps the count; a long word in one cell can never widen its track at its siblings' expense."
        sourceUrl={registrySourceUrl('grid')}
        {files}
        stage="fill"
        onreset={resetCanvas}
        output={[{ label: 'cols', value: cols }]}
        resolveFileContent={resolveUsage}
      >
        <Grid cols={cellCount as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12} gap="8" class={cx(rt.wFull)}>
          {#each Array(cellCount) as _, i}
            <div class={cx(rt.panel, rt.p8, rt.textCenter, rt.text12)}>
              <span class={cx(rt.inkAccent, rt.bold)}>cell {i + 1}</span>
              {#if i === 0}<div class={cx(rt.text10, rt.inkMuted)}>a-long-unbreakable-identifier</div>{/if}
            </div>
          {/each}
        </Grid>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="cols">
              <PlaySelect bind:value={cols} options={colsOptions} />
            </PlayRow>
            <PlayHelp>
              Watch the first cell: its long identifier overflows or truncates
              inside its OWN track — the minmax(0, 1fr) floor means a wide child
              surrenders, never the siblings. Classic 1fr (without the floor)
              would steal width column by column.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <!-- the disclosure lane -->
    <div id="disclosure" data-reveal="">
      <SectionCard
        family="disclosure"
        headerRegion="disclosure"
        eyebrow="disclosure"
        title="The disclosure lane — 0fr → 1fr"
        summary="Grid can animate a row's height between zero and full without measuring anything: the row track runs 0fr (collapse) → 1fr (open) and the content keeps min-height: 0 / overflow: hidden. The site's own canvas code drawers, terminal drawers and hero disclosures ride this lane (with the rAF motion interpolant where the browser's own transition falls to the Chrome clock-freeze)."
      >
        <ComponentCanvas title="grid · disclosure lane" stage="fill" files={disclosureFiles}>
          <div class={cx(rt.col16, rt.wFull, rt.maxWMd)}>
            <button
              class="pill"
              onclick={() => (drawerOpen = !drawerOpen)}
            >
              {drawerOpen ? 'collapse the lane' : 'open the lane'}
            </button>
            <Grid rows={drawerOpen ? 'open' : 'collapse'} class={cx(rt.wFull)}>
              <div class={cx(rt.panel, rt.p12, rt.text12, rt.minH0, rt.overflowHidden)}>
                The lane's content — riding the grid's own 0fr→1fr track. No
                max-height hacks, no measured pixels: the track IS the
                animation (instantly by default — the family ships no duration;
                transition the track yourself for a smooth morph), and the
                content simply lives in it (min-height: 0 / overflow: hidden on
                the lane — without them the content's own minimum floors the
                0fr track and the collapse never closes; WITH them the residue
                is only the lane's own box — padding + border).
              </div>
            </Grid>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="accessibility" data-reveal="">
    <SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Like stack, a plain div carrying layout only — no role, no announcements. The disclosure lane is a LAYOUT affordance: pair it with your own button + aria-expanded/aria-controls wiring (the consumer owns the semantics; the grid owns the geometry).">
      <PropsTable universal props={[{ name: '(none)', type: '—', default: '—', description: 'No ARIA surface: the grid is transparent layout. Disclosure semantics belong to the toggling control, not the lane.' }]} />
    </SectionCard>
  </div>
  <div id="theming" data-reveal="">
    <SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Tokens" summary="The same single token family as stack: the --jx-space-N ladder feeds every gap rung. No paint of its own.">
      <PropsTable props={[{ name: '--jx-space-2 … 80', type: '16 rungs', default: 'the sheet ladder', description: 'Every gap atom resolves one rung — the identical ladder stack rides.' }]} />
    </SectionCard>
  </div>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. FIRST-TIME contract, all no-own: cols/rows/gap stay STRUCTURAL props — the axes are the paint/kinetic surface a layout container forwards."
    >
      <ComponentCanvas title="Grid · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.panel)}><p class={cx(rt.text13)}>The layout primitive forwards the tree's axes to its tenants.</p></div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Four structural props plus the HTML rest — all optional, all never-ambient (the same ruling as stack: a track count has nothing meaningful to inherit).">
      <PropsTable props={[
        { name: 'cols', type: '1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12', default: '— (single column)', description: 'Equal track count — the blowout-proof repeat(N, minmax(0, 1fr)) law.' },
        { name: 'rows', type: "'collapse' | 'open'", default: '—', description: 'The disclosure lane: collapse = the 0fr track (hidden), open = the 1fr track (full). Omitted = no named row state.' },
        { name: 'gap', type: "'2' | '4' | '6' | '8' | '10' | '12' | '14' | '16' | '18' | '20' | '24' | '28' | '32' | '40' | '48' | '80'", default: '— (none)', description: 'The typed space ladder rung (token-bound; the sheet\u2019s --jx-space-N).' },
        { name: 'children', type: 'Snippet', default: '—', description: 'The grid\u2019s contents.' },
        { name: '…rest', type: 'HTMLAttributes<HTMLDivElement>', default: 'spread', description: 'Every other attribute lands on the div — consumer attributes replace, never merge.' },
      ]} />
    </SectionCard>
  </div>
  <div data-reveal="">
    <DocsSeeAlso name="grid" />
  </div>
</div>
