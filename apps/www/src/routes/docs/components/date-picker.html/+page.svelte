<!--
  date-picker — docs page (docs-eight-axes-mdn task 9, quill 2026-09-22;
  tier 2 over the docs-restructure P0 page: the catalogue demos, the
  playground and the generated props table survive verbatim, the
  skeleton re-orders to the archetype and gains Overview + the per-axis
  table + one real query() case; types/theming/universal-props fold).
  Order: hero → install → overview → usage (live example) → the
  catalogue → props (GENERATED meta + docs curation) → the eight axes
  (per-axis table + the theme-split receipts + one real query() case) →
  accessibility → see-also. Baseline skill:
  openspec/changes/docs-eight-axes-mdn/skills/mdn-doc-style.md §2.
  Original ask: bring the batch-A native-collision family's page to the
  archetype — measured from source (the family is untouchable from
  here). The composed-consumer law: Calendar + TimeStepper mount inside
  the field wrapper and inherit its scope; the popover FAMILY is not in
  the chain — the panel is the native Popover API + the shared
  jx-surface vocabulary.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DatePicker, { type DatePickerRange } from '$lib/ui/date-picker/date-picker.svelte';
  import { addDays, todayIso } from '$lib/ui/date-picker/calendar-math';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { meta as datePickerMeta } from '$lib/meta/date-picker.meta';
  import { DATE_PICKER_DOCS } from '$lib/ui/props-table/docs/date-picker.docs';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'date-picker')?.summary;
  if (!heroSummary) throw new Error('catalog entry "date-picker" is missing — registry.json meta drift');

  // Same-source law: the canvas drawer shows the exact registry copy this
  // site runs — one ?raw import (audit P1-A2).
  import datePickerSource from '$lib/ui/date-picker/date-picker.svelte?raw';

  const dateUsage = `const deploy = $state('2026-08-24');
const sprint = $state({ start: '2026-08-10', end: '2026-08-16' });
const at = $state('2026-08-30T14:05'); // canonical datetime

<!-- single: commits ISO "YYYY-MM-DD" — format only changes the display -->
<DatePicker label="deploy date" bind:value={deploy} />
<DatePicker label="review" format="locale" bind:value={deploy} />

<!-- inclusive bounds; outside days render disabled -->
<DatePicker label="windowed" min="2026-08-01" max="2026-08-31" bind:value={deploy} />

<!-- range: first click anchors, second closes (backwards swaps) -->
<DatePicker label="sprint" mode="range" bind:range={sprint} />

<!-- presets: the lane is the component's, the entries are yours —
     plain dates in single mode, {start,end} pairs in range mode -->
<DatePicker
  label="quick picks"
  mode="range"
  presets={[
    { label: 'today', value: todayIso() },
    { label: 'last 7', value: { start: addDays(todayIso(), -6), end: todayIso() } },
  ]}
  bind:range={sprint}
/>

<!-- showTime (v1 single-mode only; range + time is a type error):
     the canonical value becomes "YYYY-MM-DDTHH:mm" local wall-clock —
     the grid mutates the date part, the stepper the time part -->
<DatePicker label="at" showTime format="locale" bind:value={at} />

<!-- isDisabled: your days wear the outside-day law (visible,
     not-allowed, uncommittable); the arrow walk skips them -->
<DatePicker label="weekdays only" isDisabled={(iso) => [0, 6].includes(new Date(iso + 'T00:00:00Z').getUTCDay())} bind:value={deploy} />`;

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
  // picker reach (enhance-picker-feedback, 2026-08-30)
  let quickRange = $state<DatePickerRange | undefined>(undefined);
  let datetimeValue = $state('2026-08-30T14:05');
  let weekdayOnlyDate = $state<string | undefined>(undefined);

  // the quick-pick lane demo entries — the lane is the component's, the
  // entries are the consumer's (value domain: plain dates or {start,end})
  const sprintPresets = [
    { label: 'today', value: todayIso() },
    { label: 'last 7', value: { start: addDays(todayIso(), -6), end: todayIso() } },
    { label: 'last 30', value: { start: addDays(todayIso(), -29), end: todayIso() } },
  ];

  // the consumer day predicate: weekends wear the outside-day law
  // (visible, not-allowed, uncommittable) and the arrow walk skips them
  const weekendGuard = (iso: string): boolean => {
    const dow = new Date(`${iso}T00:00:00Z`).getUTCDay();
    return dow === 0 || dow === 6;
  };

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

  // ---- the sweep demo's drawer mirror (canvas-everywhere-demos,
  // 2026-09-08; the resolveRawCode migration is the recorded follow-up) ----
  const close = '</' + 'script>';

  const datePickerCatalogDemo = `<script lang="ts">
  import DatePicker from '@ui/date-picker.svelte';
  import type { DatePickerRange } from '@ui/date-picker.svelte';
  import { addDays, todayIso } from '@ui/date-picker/calendar-math';

  let deployDate = $state('2026-08-24');
  let localeDate = $state<string | undefined>(undefined);
  let windowedDate = $state<string | undefined>(undefined);
  let auditDate = $state<string | undefined>(undefined);
  let sprintRange = $state<DatePickerRange>({ start: '2026-08-10', end: '2026-08-16' });
  let quickRange = $state<DatePickerRange | undefined>(undefined);
  let datetimeValue = $state('2026-08-30T14:05');
  let weekdayOnlyDate = $state<string | undefined>(undefined);

  const sprintPresets = [
    { label: 'today', value: todayIso() },
    { label: 'last 7', value: { start: addDays(todayIso(), -6), end: todayIso() } },
    { label: 'last 30', value: { start: addDays(todayIso(), -29), end: todayIso() } },
  ];

  const weekendGuard = (iso: string): boolean => {
    const dow = new Date(iso + 'T00:00:00Z').getUTCDay();
    return dow === 0 || dow === 6;
  };
${close}

<DatePicker label="deploy date" bind:value={deployDate} />
<DatePicker label="review (locale display)" format="locale" bind:value={localeDate} />
<DatePicker label="windowed (min/max)" min="2026-08-04" max="2026-09-16" bind:value={windowedDate} />
<DatePicker label="sprint (range)" mode="range" bind:range={sprintRange} />
<DatePicker label="audit date" error="audit date is required" bind:value={auditDate} />
<DatePicker label="quick picks (presets)" mode="range" presets={sprintPresets} bind:range={quickRange} />
<DatePicker label="date + time (showTime)" showTime format="locale" bind:value={datetimeValue} />
<DatePicker label="weekdays only (isDisabled)" isDisabled={weekendGuard} bind:value={weekdayOnlyDate} />`;

  // ---- the eight axes demos: code shown = code running -------------------
  const axesUsage = `<!-- density: the named rung is the axis that repaints this
     family — data-density lands on the field wrapper and the
     trigger's input-law channels (--jx-hit/--jx-inset/--jx-gap)
     re-base inside the scope -->
<DatePicker label="compact (sm rung)" density="small" />
<DatePicker label="touch (lg rung)" density="lg" />

<!-- theme: PARTIAL re-theme, measured — the trigger box (raw
     --background/--border/--foreground) and the day ink flip under
     the wrapper's .dark; the selected-day fill and today border ride
     the frozen --jx-primary pair and keep the light profile -->
<DatePicker label="dark island" theme="dark" value="2026-08-24" />`;

  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/date-picker-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the ONE query() case: responsive density on the trigger box — the
  // base (large: the touch-size trigger) applies below the 40rem
  // viewport; at ≥40rem the sm case wins and the trigger compacts.
  // The explicit generics pin the cases AND the base to the lane (the
  // campaign's query() typing law).
  const responsiveDensity = query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large');

  const queryUsage = `<script lang="ts">
  import DatePicker from '@ui/date-picker.svelte';
  import { query } from '@lib/universal-props-query.svelte';
  import type { DensityLane } from '@lib/defaults.svelte';
${close}

<DatePicker
  label="responsive trigger"
  density={query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large')}
/>`;

  const queryFiles: TreeFile[] = [{ name: 'date-picker-query-demo.svelte', content: queryUsage, kind: 'usage' }];

  // ---- the per-axis table (§2.5). Grep receipt behind the supply rows:
  // zero effective-carrier readers in ui/date-picker/ (all six carriers).
  // Mechanism names are the family's real reads (date-picker.css/stylex,
  // the jx-html-input law, the jx-surface-body law).
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-size-effective; no family css reads it (grep receipt: zero --jx-size-effective readers in ui/date-picker/). The trigger rides the input law's fixed channels (--jx-hit/--jx-inset/--jx-leading) and the grid cells are 2rem structural tracks — nothing scales with this stamp. The §1 collision still applies: the axis owns the name, the trigger button never receives a native size attribute. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-shape-effective and --jx-radius-factor-effective; no family css reads them (grep receipt: zero readers in ui/date-picker/). The panel bezel's corner is border-radius: inherit (the jx-surface-body law) and the day cells are structural squares. Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective; no family css reads it (grep receipt: zero readers in ui/date-picker/). The panel bezel's corner is the CSS inherit chain (border-radius: inherit on .jx-surface-body), not a carrier computation — the concentric consumers are elsewhere (press-button, card). Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "CONSUMED — through the NAMED lane. The rung stamps data-density on the field wrapper and the scope block re-declares the channels the trigger's input law reads (--jx-hit, --jx-inset, --jx-gap, --jx-leading) INSIDE the scope — the trigger box, its rhythm and everything composed under the wrapper re-base together (the Calendar and TimeStepper fragments are the composed consumers). The NUMBER lane is inert here: it stamps --jx-density-coefficient on the wrapper, but the channels compose their coefficient at :root and the rung scopes — substitution runs at the declaring element, so nothing re-declares (the declaring-element law). auto stamps neither half. Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective; no family css reads it (grep receipt: zero --jx-color-effective readers in ui/date-picker/). The hue that paints rides the theme's primary directly — the selected-day fill, the today border and the range wash read --primary/var(--jx-primary), never the hue carrier. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "PARTIAL re-theme on this family, measured — the drift ledger's declaring-selector grep decides voice by voice. FLIPS under the wrapper's .dark (raw tokens, re-declared per scope): the trigger box (--background/--border/--foreground via the jx-html-input law), its focus ring (--ring), the day/weekday ink (raw --terminal-foreground), the range interior wash (raw --primary in the color-mix), and the bezel fill (--popover). STAYS FROZEN (the stylex --jx-* aliases, substituted at :root): the selected-day fill and today border (--jx-primary pair + --jx-primary-foreground glyph), the placeholder/chevron ink (--jx-muted-foreground), the nav/stepper button ink (--jx-terminal-foreground), the lane seams (--jx-border). The demos below show both halves. light and system stamp nothing — tree inheritance.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-elevation-effective; no family css reads it. The panel's surface law reads a consumption PAIR — var(--jx-elevation-surface, var(--popover)) and var(--jx-elevation-shadow, none) — but date-picker never stamps that pair (its stampers are toast, terminal-card and press-button), so the lane lands inert on this family's own bezel. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; no family css reads it. The panel's real motion is the shared surface-motion kernel: WAAPI animates one --jx-p progress number and the css formulas derive every visible property from it — timings are kernel literals (--motion-150/--motion-100) with the prefers-reduced-motion kill. Number unit: coefficient.",
    },
  ];

  // the theme-split receipts: which voices flip and which stay frozen
  // (the declaring-selector grep, voice by voice — jixoai.css's
  // :root,.jx-light/.dark slot blocks vs the stylex :root emission).
  const themeSplitTokens = [
    { name: '--background / --border / --foreground', default: 'FLIPS under .dark', source: 'structural' as const, description: 'The trigger box (the jx-html-input law reads them raw) — the wrapper\'s .dark re-declares the raw layer in scope.' },
    { name: '--ring', default: 'FLIPS under .dark', source: 'structural' as const, description: 'The trigger and time-cell focus rings — raw read.' },
    { name: '--terminal-foreground (raw)', default: 'FLIPS under .dark', source: 'structural' as const, description: 'The day-cell and weekday ink (color-mix over the raw token) — while the nav/stepper BUTTONS read the frozen --jx-terminal-foreground alias and stay.' },
    { name: '--primary (raw)', default: 'FLIPS under .dark', source: 'structural' as const, description: 'The range interior wash (color-mix 14%) — while the selected fill and today border read the frozen --jx-primary alias and keep the light profile.' },
    { name: '--popover', default: 'FLIPS under .dark', source: 'structural' as const, description: 'The bezel fill (the jx-surface-body fallback chain) — the panel re-themes.' },
    { name: '--jx-primary / --jx-primary-foreground', default: 'FROZEN at :root', source: 'structural' as const, description: 'The selected-day fill, its glyph, and the today border — the stylex aliases never re-substitute under a plain .dark.' },
    { name: '--jx-muted-foreground', default: 'FROZEN at :root', source: 'structural' as const, description: 'The placeholder and chevron ink.' },
    { name: '--jx-terminal-foreground', default: 'FROZEN at :root', source: 'structural' as const, description: 'The month-nav and stepper button ink (the frozen twin of the flipping raw day ink).' },
    { name: '--jx-border', default: 'FROZEN at :root', source: 'structural' as const, description: 'The presets-lane and time-row seams.' },
  ];

  // the density consumption channels (the trigger box's input-law rhythm)
  const densityTokens = [
    { name: '--jx-hit', default: '24 / 28 / 32 / 40 / 48px (2xs → lg)', source: 'density' as const, description: 'The trigger\'s min-height lane — the rung re-bases it in scope, the whole box steps.' },
    { name: '--jx-inset', default: 'rung scale × coefficient', source: 'density' as const, description: 'The trigger\'s inline padding.' },
    { name: '--jx-gap', default: 'rung scale × coefficient', source: 'density' as const, description: 'The trigger\'s internal gap (value lane ↔ chevron).' },
    { name: '--jx-leading', default: 'rung scale × coefficient', source: 'density' as const, description: 'The trigger text line height.' },
    { name: '--jx-icon-calendar', default: 'the icon vocabulary slot', source: 'structural' as const, description: 'The chevron glyph paints currentColor through the published mask var — a face/plugin override re-skins it.' },
  ];

</script>

<svelte:head>
  <title>Date picker · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai date-picker component: a zero-dependency calendar popover over hand-rolled Date math — single ISO 'YYYY-MM-DD' or a start/end range with anchor/swap semantics, Monday-first grid, inclusive min/max bounds, locale display (value stays ISO), and the family label/error contract."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: the page sections ship as PAGE DATA (+page.ts); the
       scaffold chrome owns the rail -->

  <div class={cx(rt.shellCol)}>
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Data Entry"
      title="date-picker — the zero-dep calendar popover"
      summary={heroSummary}
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">zero date libraries</span>
        <span class="pill">single + range modes</span>
        <span class="pill">ISO value · locale display</span>
        <span class="pill">one focus stop grid</span>
        <span class="pill">label[for] + aria wiring</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsInstall name="date-picker" />
  </div>

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      eyebrow="overview"
      title="Overview"
      summary="A select-style trigger over a native Popover API panel — zero date libraries, zero native input[type=date]: selection state, popover orchestration and calendar math are three orthogonal pieces."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.measurePara)}>
          The picker is deliberately not a native <code>&lt;input type="date"&gt;</code>: a
          select-style trigger (the jx-html-input law's box) opens a Popover API panel —
          <code>popover="auto"</code> wired with <code>popovertarget</code>, so light dismiss,
          Escape, one-at-a-time and top-layer rendering are the browser's. The popover FAMILY is
          not in the chain; the panel speaks the shared jx-surface vocabulary and slides through
          the shared surface-motion kernel (one WAAPI-animated <code>--jx-p</code> number).
        </p>
        <p class={cx(rt.measurePara)}>
          Three orthogonal pieces compose: the selection state lives here (single commits an ISO
          <code>YYYY-MM-DD</code> string; range binds a <code>{'{ start, end }'}</code> pair with
          anchor / close / swap-when-backwards semantics; <code>showTime</code> widens the canonical
          value to a local wall-clock datetime that the grid and the TimeStepper edit one half each);
          the calendar fragment (nav + grid + keyboard cursor) is the embeddable
          <code>Calendar</code>, remounted per open so the view resets to the committed anchor; the
          ISO math lives in <code>calendar-math.ts</code>. Those two fragments are the composed
          consumers: they mount inside the field wrapper and inherit its density scope.
        </p>
        <p class={cx(rt.measurePara)}>
          The quick-pick lane splits the same way — the LANE is the component's, the ENTRIES are
          yours — and a preset activation rides the exact grid-pick pipeline (commit + close). The
          committed value is canonical ISO forever; <code>format</code> and <code>locale</code> own
          the display only. All eight universal axes resolve on the field wrapper — density is the
          one axis that repaints (through its named rung), theme re-themes it partially, and six
          stamp-and-supply (per-axis below). The shared grammar lives on the
          <a class="pill" href="/docs/universal-props.html">universal props</a> page.
        </p>
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Bind value (single) or range (range); format is display-only, bounds are inclusive ISO days."><CodeBlock code={dateUsage} lang="svelte" meta="DatePicker usage" /></SectionCard></div>

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
      <div class={cx(rt.flex, rt.wFull, rt.dpMaxWXs, rt.col, rt.itemsStart, rt.gap12)}>
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
      <div class={cx(rt.col24)}>
        <ComponentCanvas
          title="date-picker · catalogue"
          files={[{ name: 'date-picker-catalog-demo.svelte', content: datePickerCatalogDemo, kind: 'usage' }]}
          stage="fill"
        >
          <CardGrid min="230px">
          <div class="demo-cell {cx(rt.col12)}" data-no-subgrid>
            <DatePicker label="deploy date" bind:value={deployDate} />
            <span class={cx(rt.text125, rt.inkMuted)}>
              bound value: <code class={cx(rt.inkAccent)}>{deployDate}</code>
            </span>
          </div>
          <div class="demo-cell {cx(rt.col12)}" data-no-subgrid>
            <DatePicker label="review (locale display)" format="locale" bind:value={localeDate} />
            <span class={cx(rt.text125, rt.inkMuted)}>
              display locale · value: <code class={cx(rt.inkAccent)}>{localeDate ?? '—'}</code>
            </span>
          </div>
          <div class="demo-cell {cx(rt.col12)}" data-no-subgrid>
            <DatePicker
              label="windowed (min/max)"
              min="2026-08-04"
              max="2026-09-16"
              bind:value={windowedDate}
            />
            <span class={cx(rt.text125, rt.inkMuted)}>
              outside days: opacity 0.3 · not-allowed
            </span>
          </div>
          <div class="demo-cell {cx(rt.col12)}" data-no-subgrid>
            <DatePicker label="sprint (range)" mode="range" bind:range={sprintRange} />
            <span class={cx(rt.text125, rt.inkMuted)}>
              start: <code class={cx(rt.inkAccent)}>{sprintRange.start ?? '—'}</code> ·
              end: <code class={cx(rt.inkAccent)}>{sprintRange.end ?? '—'}</code>
            </span>
          </div>
          <div class="demo-cell {cx(rt.col12)}" data-no-subgrid>
            <DatePicker label="audit date" error="audit date is required" bind:value={auditDate} />
            <span class={cx(rt.text125, rt.inkMuted)}>
              error wiring: aria-invalid + dashed trigger
            </span>
          </div>
          <!-- picker reach (enhance-picker-feedback, 2026-08-30) -->
          <div class="demo-cell {cx(rt.col12)}" data-no-subgrid>
            <DatePicker
              label="quick picks (presets)"
              mode="range"
              presets={sprintPresets}
              bind:range={quickRange}
            />
            <span class={cx(rt.text125, rt.inkMuted)}>
              preset commit = grid pick: <code class={cx(rt.inkAccent)}
                >{quickRange?.start ?? '—'} → {quickRange?.end ?? '—'}</code
              >
            </span>
          </div>
          <div class="demo-cell {cx(rt.col12)}" data-no-subgrid>
            <DatePicker
              label="date + time (showTime)"
              showTime
              format="locale"
              bind:value={datetimeValue}
            />
            <span class={cx(rt.text125, rt.inkMuted)}>
              canonical value: <code class={cx(rt.inkAccent)}>{datetimeValue}</code> · grid keeps the
              time, stepper keeps the day
            </span>
          </div>
          <div class="demo-cell {cx(rt.col12)}" data-no-subgrid>
            <DatePicker
              label="weekdays only (isDisabled)"
              isDisabled={weekendGuard}
              bind:value={weekdayOnlyDate}
            />
            <span class={cx(rt.text125, rt.inkMuted)}>
              weekend cells: not-allowed paint, arrow walk skips them
            </span>
          </div>
        </CardGrid>
        </ComponentCanvas>
        <p class={cx(rt.bodyMuted, rt.pretty)}>
          Open one and keep typing: the panel is a terminal bezel like the Select dropdown, the
          month label is font-nav uppercase with clamped ←/→ navigation, today reads a
          <code class={cx(rt.inkAccent)}>--primary</code> border, selected days fill primary, and
          range interiors wash at
          <code class={cx(rt.inkAccent)}>color-mix(--primary 14%, transparent)</code>. The trigger is
          the Select trigger's paint — ↑/↓ on it opens the panel, focus restitutes on every
          close path.
        </p>
        <CodeBlock code={dateUsage} lang="svelte" meta="DatePicker usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="Props" summary="Props from the DatePicker Props interface; value and range are bindable commit seams. The table renders from the GENERATED meta + curation (the union-alias ceiling: most type cells are honest corrections); variant keeps its own 'auto' — the literal-slot marker, not an axis seat."><PropsTable meta={datePickerMeta} docs={DATE_PICKER_DOCS} /></SectionCard></div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on date-picker"
      summary="date-picker resolves all eight axes through its family Defaults and stamps the carriers on the field wrapper (batch A of the explicit-props migration — migration-census.md). One axis repaints: density, through its NAMED rung (the wrapper's data-density scope re-bases the trigger's input-law channels). theme re-themes PARTIALLY — the declaring-selector grep splits the painted voices into raw (flip) and stylex-frozen (stay) halves, both named below. Six stamp-and-supply without touching the paint, recorded with negative-grep receipts instead of invented consumers. The composed consumers — the Calendar and TimeStepper fragments — mount inside the wrapper and inherit every scope."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier it stamps on the
          wrapper here, Default is the lane default — the named steps, number unit, and
          consumption on this family are in each description.
        </p>
        <PropsTable props={axisRows} title="" />

        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on date-picker" />
        </div>

        <div class={cx(rt.mt20)}>
          <ComponentCanvas
            title="date-picker · the consumed lanes"
            files={axesFiles}
            stage="fill"
          >
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density="small" — data-density="sm" on the wrapper; the trigger compacts</span>
                <DatePicker label="compact (sm rung)" density="small" id="axes-d-sm" />
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density="lg" — data-density="lg"; the touch-size trigger</span>
                <DatePicker label="touch (lg rung)" density="lg" id="axes-d-lg" />
              </div>
            </div>
            <div class={cx(rt.gridSm2, rt.wFull, rt.mt20)}>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>light — the ambient profile</span>
                <DatePicker label="light trigger" value="2026-08-24" id="axes-theme-light" />
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>theme="dark" — the box, ring, day ink and bezel flip; the selected fill and today border stay frozen</span>
                <DatePicker label="dark island" theme="dark" value="2026-08-24" id="axes-theme-dark" />
              </div>
            </div>
            <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
              Open either theme panel: the bezel, the trigger box and the day ink follow the
              island's dark profile, while a committed day still fills with the frozen
              <code>--jx-primary</code> — the split the table names voice by voice.
            </p>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="date-picker · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <DatePicker
                label="responsive trigger"
                id="axes-query"
                density={responsiveDensity}
              />
              <p class={cx(rt.para)}>
                Media keys are min-width: below 40rem the base applies — the large rung, the
                touch-size trigger; at 40rem and wider the sm case wins and the trigger compacts to
                the pointer lane. Resize the window across 40rem and watch the box step.
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <TokenTable tokens={densityTokens} />
        </div>
        <div class={cx(rt.mt20)}>
          <TokenTable tokens={themeSplitTokens} />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The grid is one focus stop: arrows walk the cursor across month boundaries and skip disabled days, Enter commits, Escape and light dismiss are the platform's."><A11yTable keys={[{ key: '↑ ↓ ← →', action: 'On the trigger: open the panel; in the grid: walk the cursor across month boundaries (the view follows) — disabled days (min/max, isDisabled) are skipped' }, { key: 'Enter / Space', action: 'Commit the focused day; open the panel from the trigger; preset lane buttons commit like a grid pick' }, { key: 'Escape', action: 'Native popover dismiss — focus restitutes to the trigger on every close path' }]} aria={[{ name: 'aria-invalid', value: 'true', description: 'Set on the trigger when error is present' }, { name: 'aria-describedby', value: '{id}-error', description: 'References the validation message' }, { name: 'role: grid', value: 'one focus stop', description: 'The calendar grid is a single tab stop with a roving day cursor' }, { name: 'aria-disabled', value: 'true', description: 'Painted on disabled day cells (min/max bounds and isDisabled days)' }]} /></SectionCard></div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div data-reveal="">
    <DocsSeeAlso name="date-picker" />
  </div>
</div>
