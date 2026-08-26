<!--
  date-picker — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the workbench canvas + the calendar
  catalogue (single/range, bounds, locale display, error wiring). The
  form.html route remains as the family hub.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DatePicker, { type DatePickerRange } from '$lib/ui/date-picker/date-picker.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'date-picker')?.summary;
  if (!heroSummary) throw new Error('catalog entry "date-picker" is missing — registry.json meta drift');

  // Same-source law: the canvas drawer shows the exact registry copy this
  // site runs — one ?raw import (audit P1-A2).
  import datePickerSource from '$lib/ui/date-picker/date-picker.svelte?raw';

  // ToC outline: the demo sections, in page order. The engine pairs these
  // ids with the SectionCard data-family extents + header data-region
  // leaves rendered in this page.

  const dateUsage = `const deploy = $state('2026-08-24');
const sprint = $state({ start: '2026-08-10', end: '2026-08-16' });

<!-- single: commits ISO "YYYY-MM-DD" — format only changes the display -->
<DatePicker label="deploy date" bind:value={deploy} />
<DatePicker label="review" format="locale" bind:value={deploy} />

<!-- inclusive bounds; outside days render disabled -->
<DatePicker label="windowed" min="2026-08-01" max="2026-08-31" bind:value={deploy} />

<!-- range: first click anchors, second closes (backwards swaps) -->
<DatePicker label="sprint" mode="range" bind:range={sprint} />`;

  const datePickerFiles: TreeFile[] = [
    { name: 'registry/files/ui/date-picker.svelte', content: datePickerSource },
    { name: 'src/lib/ui/date-picker-usage.svelte', content: dateUsage },
  ];

  // ---- demo state ---------------------------------------------------------------
  let deployDate = $state('2026-08-24');
  let localeDate = $state<string | undefined>(undefined);
  let windowedDate = $state<string | undefined>(undefined);
  let auditDate = $state<string | undefined>(undefined);
  let sprintRange = $state<DatePickerRange>({ start: '2026-08-10', end: '2026-08-16' });

  // ---- canvas playground ----------------------------------------------------------
  // Playground protocol: the page owns the snapshot + reset; the echo
  // footer replaces hand-written captions; the usage file tracks live state.
  const canvasInitial = {
    date: '2026-08-24',
    dateFormat: 'iso' as 'iso' | 'locale',
  };
  let canvasDate = $state(canvasInitial.date);
  let canvasDateFormat = $state(canvasInitial.dateFormat);

  function resetDateCanvas(): void {
    canvasDate = canvasInitial.date;
    canvasDateFormat = canvasInitial.dateFormat;
  }

  const dateUsageLive = $derived(`<DatePicker
  label="deploy date"
  format="${canvasDateFormat}"
  bind:value
/>`);

  // stable named resolver: lazy read evaluated inside the canvas's
  // $derived — never a value snapshot
  const resolveDateUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? dateUsageLive : file.content;
</script>

<svelte:head>
  <title>Date picker · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai date-picker component: a zero-dependency calendar popover over hand-rolled Date math — single ISO 'YYYY-MM-DD' or a start/end range with anchor/swap semantics, Monday-first grid, inclusive min/max bounds, locale display (value stays ISO), and the family label/error contract."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail (2026-08-20): aside precedes main content in the DOM —
       desktop sticky right column, mobile the glass single-row bar pinned
       under the scaffold header (height 0, see toc.css); the content
       column reserves the rail clearance with its mobile top padding -->

  <div class="flex min-w-0 flex-col gap-8">
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Data Entry"
      title="date-picker — the zero-dep calendar popover"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">zero date libraries</span>
        <span class="pill">single + range modes</span>
        <span class="pill">ISO value · locale display</span>
        <span class="pill">one focus stop grid</span>
        <span class="pill">label[for] + aria wiring</span>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas (audit P1-A2) -->
  <div data-reveal="">
    <ComponentCanvas
      title="date-picker"
      description="A zero-dependency calendar popover over hand-rolled Date math — popover='auto' gives light dismiss and the top layer; single mode commits ISO 'YYYY-MM-DD'."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/date-picker.svelte"
      files={datePickerFiles}
      stage="center"
      onreset={resetDateCanvas}
      output={[{ label: 'value', value: canvasDate }]}
      resolveFileContent={resolveDateUsage}
    >
      <div class="flex w-full max-w-xs flex-col items-start gap-3">
        <DatePicker label="deploy date" bind:value={canvasDate} format={canvasDateFormat} />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="format">
            <PlaySegmented
              bind:value={canvasDateFormat}
              options={[
                { value: 'iso', label: 'iso' },
                { value: 'locale', label: 'locale' },
              ]}
            />
          </PlayRow>
          <PlayHelp>
            format is display-only — the committed value stays ISO forever. The grid is one focus
            stop: ↑↓←→ walk months, Enter commits, Escape is native.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- calendar catalogue -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="date-picker"
      title="The calendar"
      summary="No native &lt;input type='date'>, no date library: the panel is a Popover API surface — popover='auto' wired with popovertarget, so light dismiss, Escape, one-at-a-time, and top-layer rendering are the browser's — over hand-rolled calendar math (leap years, month lengths, Monday-first grid offsets, strict ISO parse/format/compare). single commits 'YYYY-MM-DD'; range binds a start/end pair with anchor / close / swap-when-backwards semantics and a third click re-anchoring. The grid is one focus stop: ↑↓←→ walk the cursor across month boundaries (the view follows), Enter commits, Escape is native. format changes the display only — the value stays ISO forever."
    >
      <div class="flex flex-col gap-6">
        <CardGrid min="230px">
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <DatePicker label="deploy date" bind:value={deployDate} />
            <span class="text-muted-foreground text-[12.5px]">
              bound value: <code class="text-accent">{deployDate}</code>
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <DatePicker label="review (locale display)" format="locale" bind:value={localeDate} />
            <span class="text-muted-foreground text-[12.5px]">
              display locale · value: <code class="text-accent">{localeDate ?? 'undefined'}</code>
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <DatePicker
              label="windowed (min/max)"
              min="2026-08-04"
              max="2026-09-16"
              bind:value={windowedDate}
            />
            <span class="text-muted-foreground text-[12.5px]">
              outside days: opacity 0.3 · not-allowed
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <DatePicker label="sprint (range)" mode="range" bind:range={sprintRange} />
            <span class="text-muted-foreground text-[12.5px]">
              start: <code class="text-accent">{sprintRange.start ?? '—'}</code> ·
              end: <code class="text-accent">{sprintRange.end ?? '—'}</code>
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <DatePicker label="audit date" error="audit date is required" bind:value={auditDate} />
            <span class="text-muted-foreground text-[12.5px]">
              error wiring: aria-invalid + dashed trigger
            </span>
          </div>
        </CardGrid>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Open one and keep typing: the panel is a terminal bezel like the Select dropdown, the
          month label is font-nav uppercase with clamped ←/→ navigation, today reads a
          <code class="text-accent">--primary</code> border, selected days fill primary, and
          range interiors wash at
          <code class="text-accent">color-mix(--primary 14%, transparent)</code>. The trigger is
          the Select trigger's paint — ↑/↓ on it opens the panel, focus restitutes on every
          close path.
        </p>
        <CodeBlock code={dateUsage} lang="svelte" meta="DatePicker usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Single commits one ISO day; range binds a start/end pair with anchor/swap semantics.">
    <div class="grid gap-4 min-[760px]:grid-cols-2">
      <div class="flex flex-col gap-3 border border-border p-4"><DatePicker label="single (ISO value)" id="types-single" /></div>
      <div class="flex flex-col gap-3 border border-border p-4"><DatePicker label="range (start/end)" id="types-range" mode="range" /></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Bind value (single) or range (range); format is display-only, bounds are inclusive ISO days."><CodeBlock code={dateUsage} lang="svelte" meta="DatePicker usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The grid is one focus stop: arrows walk the cursor across month boundaries, Enter commits, Escape and light dismiss are the platform's."><A11yTable keys={[{ key: '↑ ↓ ← →', action: 'On the trigger: open the panel; in the grid: walk the cursor across month boundaries (the view follows)' }, { key: 'Enter / Space', action: 'Commit the focused day; open the panel from the trigger' }, { key: 'Escape', action: 'Native popover dismiss — focus restitutes to the trigger on every close path' }]} aria={[{ name: 'aria-invalid', value: 'true', description: 'Set on the trigger when error is present' }, { name: 'aria-describedby', value: '{id}-error', description: 'References the validation message' }, { name: 'role: grid', value: 'one focus stop', description: 'The calendar grid is a single tab stop with a roving day cursor' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The trigger inherits the family's density rhythm; the panel anchors via a generated --jx-date-* anchor name and opens through the shared --jx-p motion number."><div class="flex flex-col gap-6"><DensityDemo><DatePicker label="deploy date" id="density-date" /></DensityDemo><TokenTable tokens={[{ name: '--jx-date-{id}', default: 'anchor-name', source: 'component' }, { name: '--jx-p', default: '0 → 1', source: 'component', description: 'WAAPI-animated @property progress every panel formula derives from' }, { name: 'variant', default: "'solid' | 'acrylic' | 'auto'", source: 'component', description: 'Floating-surface fill; auto defers to reduced-transparency' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the DatePicker Props interface; value and range are bindable commit seams."><PropsTable props={[{ name: 'value', type: 'string', default: '—', description: 'ISO "YYYY-MM-DD"; single mode committed value.', bindable: true }, { name: 'range', type: 'DatePickerRange', default: '—', description: '{ start?, end? }; range mode committed value.', bindable: true }, { name: 'mode', type: "'single' | 'range'", default: "'single'", description: 'Commit mode for the calendar.' }, { name: 'label', type: 'string', default: '—', description: 'Field label; renders label[for] above the trigger.' }, { name: 'error', type: 'string', default: '—', description: 'Error text → aria-invalid + describedby + dashed trigger.' }, { name: 'placeholder', type: 'string', default: "'Select date...'", description: 'Trigger text when nothing is committed.' }, { name: 'min', type: 'string', default: '—', description: 'ISO date; earlier days render disabled.' }, { name: 'max', type: 'string', default: '—', description: 'ISO date; later days render disabled.' }, { name: 'format', type: "'iso' | 'locale'", default: "'iso'", description: 'Display format — the committed value stays ISO regardless.' }, { name: 'id', type: 'string', default: 'auto', description: 'Wired into label[for] / error[id]; auto-generated when omitted.' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface variant for the panel fill.' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough.' }]} /></SectionCard></div>
</div>
