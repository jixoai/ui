<!--
  Docs page for the chart family (OpenSpec 2026-08-30-add-chart-family).

  docs-demo-standard skeleton: Intro → Install → live demo (canvas) →
  Usage (the ONE h2) → Examples (ability-named canvases) →
  Accessibility (the table fallback demoed) → API → Theming → See
  also. Every canvas carries a playground pane (the structure lint),
  and the demo copy never uses real headings (the
  data-doc-demo-content scope).
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Statistic from '$lib/ui/statistic/statistic.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlayToggle, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import Chart from '$lib/ui/chart/chart.svelte';
  import ChartBar from '$lib/ui/chart/chart-bar.svelte';
  import ChartSparkline from '$lib/ui/chart/chart-sparkline.svelte';
  import ChartLine from '$lib/ui/chart/chart-line.svelte';
  import ChartDonut from '$lib/ui/chart/chart-donut.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import chartSource from '$lib/ui/chart/chart.svelte?raw';
  import chartBarSource from '$lib/ui/chart/chart-bar.svelte?raw';
  import chartSparklineSource from '$lib/ui/chart/chart-sparkline.svelte?raw';
  import chartLineSource from '$lib/ui/chart/chart-line.svelte?raw';
  import chartDonutSource from '$lib/ui/chart/chart-donut.svelte?raw';

  // A literal closing-script tag inside the code string would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const WEEK = [3, 5, 2, 8, 7];
  const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const TREND = [4, 6, 5, 8, 7, 9, 8, 12];
  const SEV = [4, 3, 2, 1];

  // ---- live demo state (playground protocol: snapshots + reset) --------
  const canvasInitial = { table: false, cells: 'braille', area: false, markers: true };
  let showTable = $state(canvasInitial.table);
  let cellMode = $state<'block' | 'braille'>(canvasInitial.cells);
  let lineArea = $state(canvasInitial.area);
  let lineMarkers = $state(canvasInitial.markers);
  function resetCanvas(): void {
    showTable = canvasInitial.table;
    cellMode = canvasInitial.cells as 'block' | 'braille';
    lineArea = canvasInitial.area;
    lineMarkers = canvasInitial.markers;
  }
  const tableAttr = $derived(showTable ? ' table' : '');
  const areaAttr = $derived(lineArea ? ' area' : '');
  const markersAttr = $derived(lineMarkers ? '' : ' markers={false}');
  const usageLive = $derived(
    `<ChartBar data={[${WEEK}]} labels={${JSON.stringify(DAYS)}} label="deploys per day"${tableAttr} />
<ChartSparkline data={[${WEEK}]} label="deploys this week" cells="${cellMode}"${tableAttr} />
<ChartLine data={[${TREND}]} label="deploy trend"${areaAttr}${markersAttr}${tableAttr} />
<ChartDonut data={[${SEV}]} label="incident severities"${tableAttr}>
  <span class="tabular-nums">${SEV.reduce((a, b) => a + b, 0)}</span>
</ChartDonut>`,
  );
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/chart/chart.svelte', content: chartSource },
    { name: 'registry/files/ui/chart/chart-bar.svelte', content: chartBarSource },
    { name: 'registry/files/ui/chart/chart-sparkline.svelte', content: chartSparklineSource },
    { name: 'registry/files/ui/chart/chart-line.svelte', content: chartLineSource },
    { name: 'registry/files/ui/chart/chart-donut.svelte', content: chartDonutSource },
    { name: 'src/lib/ui/chart-usage.svelte', content: usageLive, kind: 'usage' },
  ];

  // ---- example: the table fallback demo state --------------------------
  let fallbackOn = $state(true);

  // ---- the ONE usage sample (drawer + body CodeBlock share it) ----------
  const usage = `<script lang="ts">
  import { Chart, ChartBar, ChartSparkline, ChartLine, ChartDonut } from '@ui/chart/index';
${close}

<!-- each part is standalone; Chart only shares a density tier -->
<Chart density="sm">
  <ChartBar data={[3, 5, 2, 8, 7]} labels={['mon', 'tue', 'wed', 'thu', 'fri']} label="deploys per day" />
  <ChartSparkline data={[3, 5, 2, 8, 7]} label="deploys this week" />
  <ChartLine data={[4, 6, 5, 8, 7, 9, 8, 12]} label="deploy trend" area />
  <ChartDonut data={[4, 3, 2, 1]} label="incident severities">
    <span class="tabular-nums">10</span>
  </ChartDonut>
</Chart>`;
</script>

<svelte:head>
  <title>Chart · jixoai-ui</title>
  <meta
    name="description"
    content="Terminal-native charts with zero runtime dependencies: text-grid block bars, braille sparklines, an SVG polyline over hairline rules, and a dasharray donut ring — deterministic display primitives with frozen degenerate semantics, a REQUIRED accessible name and an opt-in data table fallback."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Display"
        title="chart — terminal-native charts, zero dependencies"
        summary="Four deterministic display primitives, not a chart library: horizontal bars drawn in Unicode block glyphs on the mono text grid, one-line sparklines in block or braille cells, an SVG polyline over hairline rules, and a stroke-dasharray donut ring in the theme's OKLCH chart palette. Every part renders static data — no Recharts, no animation runtime, no tooltips — and every degenerate input (empty, all-negative, constant, NaN, zero-total) has a frozen, unit-tested output. Each chart is role=img with a REQUIRED accessible name and an opt-in visually-hidden data table fallback."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">zero runtime deps</span>
          <span class="pill">block · braille glyphs</span>
          <span class="pill">frozen degenerates</span>
          <span class="pill">role=img + table fallback</span>
          <span class="pill">tokens only (--chart-1..5)</span>
        </div>
      </SectionCard>
    </div>

    <div id="install" data-reveal="">
      <SectionCard
        family="install"
        headerRegion="install"
        eyebrow="install"
        title="Install"
        summary="One registry item — the family context, the four parts and the barrel ship together (the glyph math exports ride the same folder)."
      >
        <CodeBlock code={`npx jixoai-ui add chart`} lang="sh" meta="install" />
      </SectionCard>
    </div>

    <div id="chart-demo" data-region="chart-demo" data-family="chart-demo" data-reveal="">
      <ComponentCanvas
        title="chart"
        description="The four primitives over one week of deploy data — flip the table fallback, the sparkline cell system, the area wash and the markers in the playground; the usage file in the drawer tracks every flag."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/chart/chart.svelte"
        files={canvasFiles}
        stage="fill"
        onreset={resetCanvas}
        output={[
          { label: 'table fallback', value: showTable ? 'on' : 'off' },
          { label: 'sparkline cells', value: cellMode },
          { label: 'area', value: lineArea ? 'on' : 'off' },
        ]}
        resolveFileContent={resolveUsage}
      >
        <div class="flex w-full flex-col gap-8">
          <div class="grid gap-8 lg:grid-cols-2">
            <ChartBar data={WEEK} labels={DAYS} label="deploys per day" table={showTable} />
            <div class="flex flex-col justify-center gap-3">
              <p class="m-0 font-nav text-xs uppercase tracking-[0.14em] text-muted-foreground">
                week at a glance
              </p>
              <ChartSparkline data={WEEK} label="deploys this week" cells={cellMode} table={showTable} />
              <p class="m-0 text-[13px] leading-6 text-muted-foreground">
                one line, no axes — the finite min and max own the glyph range's endpoints
              </p>
            </div>
          </div>
          <div class="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div class="flex flex-col gap-3">
              <p class="m-0 font-nav text-xs uppercase tracking-[0.14em] text-muted-foreground">
                deploy trend · 8 weeks
              </p>
              <ChartLine data={TREND} label="deploy trend" area={lineArea} markers={lineMarkers} table={showTable} />
            </div>
            <div class="flex flex-col items-start gap-3">
              <p class="m-0 font-nav text-xs uppercase tracking-[0.14em] text-muted-foreground">
                incident severities
              </p>
              <ChartDonut data={SEV} label="incident severities" table={showTable}>
                <div class="flex flex-col items-center">
                  <span class="font-nav text-[10px] uppercase tracking-[0.14em] text-muted-foreground">total</span>
                  <span class="text-lg tabular-nums text-foreground">10</span>
                </div>
              </ChartDonut>
            </div>
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="table fallback">
              <PlayToggle bind:value={showTable} />
            </PlayRow>
            <PlayRow label="sparkline cells">
              <PlaySegmented
                bind:value={cellMode}
                options={[
                  { value: 'braille', label: 'braille' },
                  { value: 'block', label: 'block' },
                ]}
              />
            </PlayRow>
            <PlayRow label="area fill">
              <PlayToggle bind:value={lineArea} />
            </PlayRow>
            <PlayRow label="markers">
              <PlayToggle bind:value={lineMarkers} />
            </PlayRow>
            <PlayHelp>
              the toggles are presentation only — the geometry never moves. The table fallback adds a
              REAL sibling table (clip-path hidden, screen-reader present) mirroring every series.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Compose from parts: each chart owns its data payload and its REQUIRED label; the Chart root only shares a density tier across an ensemble."
    >
      <CodeBlock code={usage} lang="svelte" meta="Chart usage" />
    </SectionCard>
  </div>

  <div id="examples" data-reveal="">
    <SectionCard
      family="examples"
      headerRegion="examples"
      eyebrow="examples"
      title="Examples"
      summary="Ability-named demos — one phrase, one capability. Every demo is live; open the code drawer for the exact composition."
    >
      <p class="m-0 text-muted-foreground text-[13px] leading-6">
        The live demo up top plays the presentation flags. These canvases pin the family's
        compositional abilities: the a11y mirror, the inline trend, authored axes, the center
        slot, and the stat-card ensemble.
      </p>
    </SectionCard>
  </div>

  <div id="chart-table-fallback" data-region="chart-table-fallback" data-family="chart-table-fallback" data-reveal="">
    <ComponentCanvas
      title="with a data table fallback"
      description="table adds a REAL data table beside the img — clip-path hidden from the eye, fully present to assistive tech. Flip it to feel what the screen reader gains."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/chart/chart-bar.svelte"
      files={[{ name: 'registry/files/ui/chart/chart-bar.svelte', content: chartBarSource }]}
      stage="fill"
      output={[{ label: 'fallback', value: fallbackOn ? 'on' : 'off' }]}
    >
      <ChartBar
        data={WEEK}
        labels={DAYS}
        label="deploys per day"
        cells={14}
        table={fallbackOn}
        class="max-w-md"
      />
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="table fallback">
            <PlayToggle bind:value={fallbackOn} />
          </PlayRow>
          <PlayHelp>
            the table is a SIBLING of the role=img root — a table inside role=img would go
            presentational with the glyphs. Hidden means clip-path + 1px, never the hidden
            attribute: the mirror stays in the accessibility tree.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="chart-inline-trend" data-region="chart-inline-trend" data-family="chart-inline-trend" data-reveal="">
    <ComponentCanvas
      title="inline in a stat row"
      description="The sparkline is a single inline span: it composes inside a sentence, and inside Statistic's suffix snippet — the metric readout carries its own trend."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/chart/chart-sparkline.svelte"
      files={[{ name: 'registry/files/ui/chart/chart-sparkline.svelte', content: chartSparklineSource }]}
      stage="fill"
    >
      <div class="flex flex-wrap items-center gap-x-10 gap-y-6">
        <Statistic title="deploys / week" value="42" trend="up">
          {#snippet suffix()}
            <ChartSparkline data={WEEK} label="deploys this week, trending up" />
          {/snippet}
        </Statistic>
        <p class="m-0 text-[13px] leading-6 text-foreground">
          latency p95
          <ChartSparkline data={[18, 14, 15, 9, 11, 8]} label="latency p95 trend" class="mx-2 align-middle" />
          down 12%
        </p>
        <p class="m-0 text-[13px] leading-6 text-muted-foreground">
          braille packs two points per cell
          <ChartSparkline data={WEEK} label="deploys this week" cells="block" class="mx-2 align-middle" />
          block rides the eighth-block ramp
        </p>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            no axes, no frame, no invented padding: the finite min and max map to the glyph
            range's extremes, so the endpoints are honest at any width. The mono lock keeps
            the cells on the text grid whatever the surrounding sentence sets.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="chart-area-axes" data-region="chart-area-axes" data-family="chart-area-axes" data-reveal="">
    <ComponentCanvas
      title="with area fill and authored axes"
      description="area adds the 12% tonal wash under the curve; the axes are YOUR snippets — the component renders them inside the svg and never guesses a domain."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/chart/chart-line.svelte"
      files={[{ name: 'registry/files/ui/chart/chart-line.svelte', content: chartLineSource }]}
      stage="fill"
    >
      <div class="flex max-w-2xl flex-col gap-2">
        <ChartLine data={TREND} label="deploy trend over eight weeks" area>
          {#snippet yAxis()}
            <text x="1" y="7" font-size="5" class="fill-muted-foreground">peak 12</text>
          {/snippet}
          {#snippet xAxis()}
            <text x="0" y="39" font-size="5" class="fill-muted-foreground">w1</text>
            <text x="94" y="39" font-size="5" class="fill-muted-foreground" text-anchor="end">w8</text>
          {/snippet}
        </ChartLine>
        <p class="m-0 text-[12px] leading-5 text-muted-foreground">
          the hairline rules are grid GEOMETRY (top / mid / bottom) — ticks and labels are the
          consumer's authored snippets
        </p>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            markers are round linecap dots via a doubled-point polyline — stroke-width stays
            non-scaling under the viewBox scale, so dots never stretch into ellipses. The y
            band keeps a 1-unit marker inset; the DATA range maps it fully.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="chart-donut-total" data-region="chart-donut-total" data-family="chart-donut-total" data-reveal="">
    <ComponentCanvas
      title="with a center total"
      description="The ring is stroke-dasharray segments over a muted track; the center is a snippet slot for YOUR composition — here the running total."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/chart/chart-donut.svelte"
      files={[{ name: 'registry/files/ui/chart/chart-donut.svelte', content: chartDonutSource }]}
      stage="fill"
      output={[{ label: 'segments', value: String(SEV.length) }, { label: 'total', value: String(SEV.reduce((a, b) => a + b, 0)) }]}
    >
      <div class="flex flex-wrap items-center gap-8">
        <ChartDonut data={SEV} label="incident severities" size={112}>
          <div class="flex flex-col items-center">
            <span class="font-nav text-[10px] uppercase tracking-[0.14em] text-muted-foreground">total</span>
            <span class="text-lg tabular-nums text-foreground">10</span>
          </div>
        </ChartDonut>
        <ChartDonut data={[6, 5, 4, 3, 2, 1]} label="a six-segment ring" size={96} thickness={10}>
          <span class="text-sm tabular-nums text-foreground">21</span>
        </ChartDonut>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            segment colors ride the theme's --chart-1..5 semantic palette first, then a
            deterministic neutral oklch ladder derived from var(--brand-hue) — the wall-clock
            brand hue re-tints the ring with the site. Dashes always sum to the
            circumference; a zero total renders the bare track.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="chart-stat-cards" data-region="chart-stat-cards" data-family="chart-stat-cards" data-reveal="">
    <ComponentCanvas
      title="composed in stat cards"
      description="The family's ensemble: one Chart root shares the sm density tier while bars, sparklines and a donut compose a dashboard row of plain card surfaces."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/chart/chart.svelte"
      files={[{ name: 'registry/files/ui/chart/chart.svelte', content: chartSource }]}
      stage="fill"
    >
      <Chart density="sm">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="flex flex-col gap-2 border border-border bg-card p-4">
            <span class="font-nav text-[10px] uppercase tracking-[0.14em] text-muted-foreground">deploys / week</span>
            <span class="text-xl tabular-nums text-foreground">42</span>
            <ChartSparkline data={WEEK} label="deploys per day" />
          </div>
          <div class="flex flex-col gap-2 border border-border bg-card p-4">
            <span class="font-nav text-[10px] uppercase tracking-[0.14em] text-muted-foreground">p95 latency</span>
            <span class="text-xl tabular-nums text-foreground">184ms</span>
            <ChartSparkline data={[18, 14, 15, 9, 11, 8]} label="latency trend" cells="block" />
          </div>
          <div class="flex flex-col gap-2 border border-border bg-card p-4 sm:col-span-2">
            <span class="font-nav text-[10px] uppercase tracking-[0.14em] text-muted-foreground">throughput by lane</span>
            <ChartBar data={[8, 5, 3]} labels={['edge', 'worker', 'batch']} label="throughput by lane" cells={12} variant="tonal" />
          </div>
          <div class="flex items-center gap-4 border border-border bg-card p-4 sm:col-span-2 lg:col-span-2">
            <ChartDonut data={SEV} label="incident severities" size={80} thickness={10}>
              <span class="text-sm tabular-nums text-foreground">10</span>
            </ChartDonut>
            <div class="flex flex-col gap-1">
              <span class="font-nav text-[10px] uppercase tracking-[0.14em] text-muted-foreground">incidents by severity</span>
              <span class="text-[12.5px] leading-5 text-muted-foreground">sev1 4 · sev2 3 · sev3 2 · sev4 1</span>
            </div>
          </div>
          <div class="flex flex-col gap-2 border border-border bg-card p-4 sm:col-span-2">
            <span class="font-nav text-[10px] uppercase tracking-[0.14em] text-muted-foreground">error budget burn</span>
            <ChartLine data={TREND} label="error budget burn trend" markers={false} />
          </div>
        </div>
      </Chart>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the root provides ONE density tier to every part inside (the tabs-root pattern);
            outside a root, each part stands alone. Cards are plain utility surfaces — no
            headings inside the demo scope, the chart names itself.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="Every chart is a named image; the glyphs are decoration with the semantics carried once, by the name — and the opt-in table mirror gives the actual numbers back to the screen reader."
    >
      <div class="flex flex-col gap-6">
        <A11yTable
          aria={[
            { name: 'role', value: 'img', description: 'Every part, always — a chart is one image to the a11y tree, never a soup of glyphs.' },
            { name: 'label', value: 'string (REQUIRED)', description: 'The accessible name. No default exists by contract — a nameless chart fails to compile in your head first, then in the type.' },
            { name: 'table', value: 'opt-in mirror', description: 'A REAL sibling table (caption + headers + rows) clip-path hidden from the eye, present to assistive tech. A sibling, never a child: role=img makes its own subtree presentational.' },
            { name: 'glyphs', value: 'decorative', description: 'Block and braille runs are ink — the name and the table carry the data semantics.' },
            { name: 'motion', value: 'zero', description: 'Charts ship no entrance motion at all: the reduced-motion law holds structurally (final state painted immediately).' },
          ]}
        />
        <div class="flex flex-col gap-3 rounded-none border border-border bg-muted/30 p-5">
          <p class="m-0 font-nav text-xs uppercase tracking-[0.14em] text-muted-foreground">
            the fallback, demoed
          </p>
          <ChartBar
            data={WEEK}
            labels={DAYS}
            label="deploys per day, with the screen-reader mirror on"
            table={true}
            class="max-w-md"
          />
          <p class="m-0 text-[13px] leading-6 text-muted-foreground">
            inspect the DOM: beside the role=img root sits a real table with a caption, scoped
            headers and one row per datum — visually hidden, machine-honest.
          </p>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="One family: a context root that shares a density tier, and four standalone parts. The glyph math (barRun, sparkBraille, linePoints, donutGeometry…) exports from the folder for your own tests."
    >
      <div class="flex flex-col gap-6">
        <PropsTable
          props={[
            { name: 'data', type: 'readonly number[]', default: '—', description: 'The series — one row / point / segment per datum. A value-domain payload: the family renders it, never re-authors it.', required: true },
            { name: 'label', type: 'string', default: '—', description: 'The REQUIRED accessible name (role=img + aria-label). No default by contract.', required: true },
            { name: 'table', type: 'boolean', default: 'false', description: 'Opt-in visually-hidden data table fallback — a REAL sibling table mirroring the series.' },
            { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit tier ?? ambient scope. The ensemble (Chart) resolves once and provides to its glyphs — the r11 eager-capture provider form; glyphs stamp only when an opinion exists.' },
            { name: 'class', type: 'string', default: "''", description: 'Merged into the part root (cn()) — constrain geometry with utilities; they win by the layer law.' },
            { name: '...rest', type: 'HTMLAttributes / SVGAttributes', default: '—', description: 'aria-*, data-*, handlers — land on the part root verbatim.' },
          ]}
        />
        <PropsTable
          props={[
            { name: 'labels (ChartBar)', type: 'readonly (string | number)[]', default: '—', description: 'Parallel label lane, zipped by index; absent entries render an empty lane.' },
            { name: 'variant (ChartBar)', type: "'fill' | 'tonal' | 'outline'", default: "'fill'", description: 'The glyph ink through the four global hue slots — compose with jx-hue-* utilities like every painted surface. Defaults: literal slot — own \'fill\', ambient when a table freeze lands.' },
            { name: 'cells (ChartBar)', type: 'number', default: '20', description: 'The bar-length budget in character cells.' },
            { name: 'values (ChartBar)', type: 'boolean', default: 'true', description: 'The inline-end value lane (raw numbers; formatting is yours). Non-finite renders the em dash.' },
            { name: 'cells (ChartSparkline)', type: "'block' | 'braille'", default: "'braille'", description: 'The cell system: eighth-block glyphs (8 levels/point) or braille packing (2 points/cell, 4 levels).' },
            { name: 'area (ChartLine)', type: 'boolean', default: 'false', description: 'The 12% tonal wash under the curve (needs two finite points).' },
            { name: 'markers (ChartLine)', type: 'boolean', default: 'true', description: 'Round dot markers at every finite point — non-scaling, never ellipses.' },
            { name: 'xAxis / yAxis (ChartLine)', type: 'Snippet', default: '—', description: 'Authored axis slots, rendered inside the svg after the data — axes are never guessed.' },
            { name: 'size / thickness (ChartDonut)', type: 'number', default: '96 / 12', description: 'The ring outer size and stroke thickness in px. size defaults through a literal slot — own 96, ambient when an axis opens (thickness stays a plain prop).' },
            { name: 'children (ChartDonut)', type: 'Snippet', default: '—', description: 'The center slot — the total, a delta, your composition.' },
          ]}
        />
      </div>
    </SectionCard>
  </div>

  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Density and tokens"
      summary="Text-glyph parts size from the shared density ruler; every color is a token — the semantic chart palette, the variant slots, the mono face."
    >
      <div class="flex flex-col gap-5">
        <DensityDemo scopes={['xs', 'default', 'lg']}>
          <div class="flex flex-col gap-4">
            <ChartBar data={WEEK} labels={DAYS} label="deploys per day, density demo" cells={12} />
            <ChartSparkline data={WEEK} label="deploys this week, density demo" />
          </div>
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: '--chart-1 .. --chart-5', default: 'semantic palette', source: 'theme' },
            { name: '--brand-hue', default: 'oklch hue degrees', source: 'theme (neutral ladder)' },
            { name: '--jx-fill / --jx-tonal / --jx-outline', default: 'variant slots', source: 'hue injection' },
            { name: '--font-mono', default: 'JetBrains Mono stack', source: 'theme (the glyph lock)' },
            { name: '--jx-text / --jx-line / --jx-gap', default: 'density scale', source: 'density' },
            { name: '--border / --muted', default: 'theme', source: 'grid hairlines / donut track' },
          ]}
        />
      </div>
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <SectionCard
      family="see-also"
      headerRegion="see-also"
      eyebrow="see also"
      title="See also"
      summary="The family around the numbers."
    >
      <div class="flex flex-wrap gap-3">
        <a class="pill" href="/docs/components/statistic.html">statistic — the metric readout</a>
        <a class="pill" href="/docs/components/table.html">table — the native data grid</a>
        <a class="pill" href="/docs/components/progress.html">progress — the single share</a>
        <a class="pill" href="/docs/components/descriptions.html">descriptions — keyed readouts</a>
        <a class="pill" href="/docs/components/ghostty-term.html">ghostty-term — the live terminal</a>
      </div>
    </SectionCard>
  </div>
</div>
