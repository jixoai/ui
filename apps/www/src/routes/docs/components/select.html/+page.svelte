<!--
  select — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the workbench canvas + the
  select-split story (NativeSelect vs Select) + label/error wiring and
  the RTL geometry demo. The form.html route remains as the family hub.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Select, { type SelectOption } from '$lib/ui/select/select.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { meta as selectMeta } from '$lib/meta/select.meta';
  import { SELECT_DOCS } from '$lib/ui/props-table/docs/select.docs';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'select')?.summary;
  if (!heroSummary) throw new Error('catalog entry "select" is missing — registry.json meta drift');

  // Same-source law: the canvas drawer shows the exact registry copy this
  // site runs — one ?raw import (audit P1-A2).
  import selectSource from '$lib/ui/select/select.svelte?raw';

  // ToC outline: the demo sections, in page order. The engine pairs these
  // ids with the SectionCard data-family extents + header data-region
  // leaves rendered in this page.

  const selectUsage = `const runtimeOptions: SelectOption[] = [
  { value: 'node', label: 'node', description: 'node-pty backend' },
  { value: 'bun', label: 'bun', description: 'Bun.Terminal, 1.3.13+' },
  { value: 'deno', label: 'deno', description: '@sigma/pty-ffi over FFI' },
  { value: 'wasi', label: 'wasi (not yet)', disabled: true },
];

<Select
  label="runtime"
  placeholder="pick a runtime…"
  bind:value={runtime}
  options={runtimeOptions}
/>`;

  // ---- demo state -----------------------------------------------------------
  let runtime = $state('node');
  let runtimeNative = $state('node');
  let runtimeRtl = $state<string | undefined>(undefined);

  const runtimeOptions: SelectOption[] = [
    { value: 'node', label: 'node', description: 'node-pty backend — ConPTY on windows, forkpty elsewhere' },
    { value: 'bun', label: 'bun', description: 'Bun.Terminal — linux/macos since 1.3.13, windows 1.3.14' },
    { value: 'deno', label: 'deno', description: '@sigma/pty-ffi — FFI over rust portable-pty' },
    { value: 'wasi', label: 'wasi — coming soon', description: 'reserved route, not implemented yet', disabled: true },
  ];

  // ---- canvas playground ------------------------------------------------------
  // Playground protocol: the page owns the snapshot + reset; the echo
  // footer replaces hand-written captions; the usage file tracks live state.
  const canvasInitial = {
    placeholder: 'pick a runtime…',
    runtime: 'node',
  };
  let canvasPlaceholder = $state(canvasInitial.placeholder);
  let canvasRuntime = $state(canvasInitial.runtime);

  function resetSelectCanvas(): void {
    canvasPlaceholder = canvasInitial.placeholder;
    canvasRuntime = canvasInitial.runtime;
  }

  // free text must become a legal string literal (q() = JSON.stringify)
  const q = (value: string): string => JSON.stringify(value);
  const selectUsageLive = $derived(`<Select
  label="runtime"
  placeholder=${q(canvasPlaceholder)}
  options={runtimeOptions}
  bind:value
/>`);

  // stable named resolver: lazy read evaluated inside the canvas's
  // $derived — never a value snapshot
  const resolveSelectUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? selectUsageLive : file.content;

  const selectFiles: TreeFile[] = [
    { name: 'registry/files/ui/select.svelte', content: selectSource },
    { name: 'src/lib/ui/select-usage.svelte', content: selectUsage },
  ];

  // ---- canvas-everywhere sweep (2026-09-08): hand-authored mirrors of
  // the effect-only demo regions below — the same-source resolveRawCode
  // migration of these strings is the recorded follow-up -------------
  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // the rtl geometry demo (rtl section): the trigger chevron and the
  // selected-row edge flip under dir="rtl" without a physical property
  const selectRtlDemo = `<script lang="ts">
  import Select from '@ui/select.svelte';
${close}

<div dir="rtl" class={cx(rt.flex, rt.col, rt.gap16, rt.frame, rt.p16)}>
  <Select
    label="runtime (rtl)"
    bind:value={runtimeRtl}
    options={runtimeOptions.slice(0, 3)}
    placeholder="pick…"
  />
  <span class={cx(rt.inkMuted, rt.text12)}>
    dir="rtl" on the wrapper — trigger chevron and panel edge line flipped without a
    physical property in sight
  </span>
</div>`;

  const selectRtlFiles: TreeFile[] = [
    { name: 'select-rtl-demo.svelte', content: selectRtlDemo, kind: 'usage' },
  ];

  // the variants pair (types section): rows carrying descriptions
  // against the error state
  const selectTypesDemo = `<script lang="ts">
  import Select from '@ui/select.svelte';
${close}

<div class="grid gap-4 sm:grid-cols-2">
  <div class="border border-border p-4">
    <Select
      label="descriptions"
      options={runtimeOptions}
      placeholder="open for second lines…"
    />
  </div>
  <div class="border border-border p-4">
    <Select
      label="error"
      options={[
        { value: '', label: '— choose —' },
        { value: 'free', label: 'free' },
        { value: 'pro', label: 'pro' },
      ]}
      error="plan is required"
    />
  </div>
</div>`;

  const selectTypesFiles: TreeFile[] = [
    { name: 'select-types-demo.svelte', content: selectTypesDemo, kind: 'usage' },
  ];

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

  // ---- the universal props demo (explicit-props W3-D3) --------------------
  const universalUsage = `<Select label="runtime" options={runtimeOptions} size={18} density="small" />`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/select-universal.svelte', content: universalUsage },
  ];
</script>

<svelte:head>
  <title>Select · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai select component: the popover-listbox select — per-option descriptions, ↑/↓/Home/End/Enter roving highlight with focus restitution, popover=auto light dismiss and top layer. The native-first split against NativeSelect, label/error wiring, and RTL geometry from logical properties only."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail (2026-08-20): aside precedes main content in the DOM —
       desktop sticky right column, mobile the glass single-row bar pinned
       under the scaffold header (height 0, see toc.css); the content
       column reserves the rail clearance with its mobile top padding -->

  <div class={cx(rt.shellCol)}>
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Data Entry"
      title="select — the popover listbox"
      summary={heroSummary}
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">popover=auto panel</span>
        <span class="pill">per-option descriptions</span>
        <span class="pill">↑/↓ roving highlight</span>
        <span class="pill">FormData-ready</span>
        <span class="pill">rtl: logical properties only</span>
      </div>
    </SectionCard>
  </div>

  <!-- the demo-standard skeleton (2026-08-30): Install then Usage sit
       ABOVE the demos — Intro → Install → Usage → Examples → API →
       See Also is the page law; the sections between stay page-local. -->
  <div data-reveal="">
    <DocsInstall name="select" />
  </div>

  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Bind the committed value; rows with descriptions and disabled entries are plain data on the options array."
    >
      <CodeBlock code={selectUsage} lang="svelte" meta="Select usage" />
    </SectionCard>
  </div>

  <!-- component canvas (audit P1-A2) -->
  <div data-reveal="">
    <ComponentCanvas
      title="select"
      stage="center"
      description="The popover-listbox select: per-option descriptions, ↑/↓/Home/End/Enter roving highlight with focus restitution — for when the native popup can't say what you need."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/select.svelte"
      files={selectFiles}
      onreset={resetSelectCanvas}
      output={[
        { label: 'value', value: canvasRuntime },
        { label: 'placeholder', value: canvasPlaceholder || '—' },
      ]}
      resolveFileContent={resolveSelectUsage}
    >
      <div class={cx(rt.flex, rt.wFull, rt.seMaxWXs, rt.col, rt.itemsStart, rt.gap12)}>
        <Select
          label="runtime"
          bind:value={canvasRuntime}
          options={runtimeOptions}
          placeholder={canvasPlaceholder}
        />
      </div>
      {#snippet playground()}
        <PlayFields>
          <Input label="placeholder" placeholder="pick a runtime…" bind:value={canvasPlaceholder} />
          <PlayHelp>
            the panel is <code>popover="auto"</code> wired with <code>popovertarget</code> —
            light dismiss, Escape, and top-layer rendering are the browser's.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the select split -->
  <div id="select-split" data-reveal="">
    <SectionCard
      family="select-split"
      headerRegion="select-split"
      eyebrow="select × 2"
      title="One family, two selects — native first"
      summary="NativeSelect is the default you should ship: a real <select> (options as <option> children) whose popup list, keyboard, and type-ahead belong to the platform — it rides into FormData with a name/value pair and gets the OS overlay picker on mobile. Select is the same trigger paint on a <button> opening a popover listbox: per-option descriptions, a painted terminal-bezel panel, roving ↑/↓/Enter highlight with focus restitution — reach for it only when the native popup can't say what you need."
    >
      <div class={cx(rt.flex, rt.col, rt.gap20)}>
        <div class={cx(rt.grid760a)}>
          <div class={cx(rt.col12)}>
            <NativeSelect
              label="runtime — native popup"
              name="cmp_runtime"
              value={runtimeNative}
              onchange={(event) => (runtimeNative = event.currentTarget.value)}
            >
              <option value="node">node</option>
              <option value="bun">bun</option>
              <option value="deno">deno</option>
            </NativeSelect>
            <span class={cx(rt.text125, rt.inkMuted)}>
              platform popup · FormData-ready · bound value:
              <code class={cx(rt.inkAccent)}>{runtimeNative}</code>
            </span>
          </div>
          <div class={cx(rt.col12)}>
            <Select
              label="runtime — popover listbox"
              bind:value={runtime}
              options={runtimeOptions}
              placeholder="pick a runtime…"
            />
            <span class={cx(rt.text125, rt.inkMuted)}>
              popover panel · descriptions · bound value: <code class={cx(rt.inkAccent)}>{runtime}</code>
            </span>
          </div>
        </div>
        <p class={cx(rt.bodyMuted, rt.pretty)}>
          Open the right one: the panel is <code class={cx(rt.inkAccent)}>popover="auto"</code> wired
          with <code class={cx(rt.inkAccent)}>popovertarget</code>, so light dismiss, Escape, and
          top-layer rendering are the browser's; the JS only drives
          <code class={cx(rt.inkAccent)}>role="listbox"</code> /
          <code class={cx(rt.inkAccent)}>role="option"</code> /
          <code class={cx(rt.inkAccent)}>aria-activedescendant</code>, the ↑/↓/Home/End/Enter
          highlight, and focus restitution to the trigger on every close path. The selected row
          reads <code class={cx(rt.inkAccent)}>--terminal-hover</code> fill with a 2px
          <code class={cx(rt.inkAccent)}>--primary</code> edge on
          <code class={cx(rt.inkAccent)}>border-inline-start</code> — under
          <code class={cx(rt.inkAccent)}>dir="rtl"</code> the edge flips sides by itself.
        </p>
        <div class={cx(rt.mt4, rt.tBorder, rt.pt20)}>
          <h3 class={cx(rt.title15)}>label + error wiring, both selects</h3>
          <p class={cx(rt.mt8, rt.bodyMuted, rt.pretty)}>
            The split changes nothing semantically: <code class={cx(rt.inkAccent)}>label[for]</code>
            binds to the control (the <code class={cx(rt.inkAccent)}>&lt;button&gt;</code> trigger in Select's case), and the
            <code class={cx(rt.inkAccent)}>error</code> prop wires
            <code class={cx(rt.inkAccent)}>aria-invalid</code> +
            <code class={cx(rt.inkAccent)}>aria-describedby</code> + the dashed shell — the same
            monochrome invalid signal as the rest of the family.
          </p>
          <div class={cx(rt.mt16, rt.grid760a)}>
            <NativeSelect label="plan" error="plan is required">
              <option value="">— choose —</option>
              <option value="free">free</option>
            </NativeSelect>
            <Select
              label="plan"
              error="plan is required"
              options={[
                { value: '', label: '— choose —' },
                { value: 'free', label: 'free', description: 'community tier' },
                { value: 'pro', label: 'pro', description: 'dedicated backend' },
              ]}
            />
          </div>
        </div>
        <CodeBlock code={selectUsage} lang="svelte" meta="Select usage" />
      </div>
    </SectionCard>
  </div>

  <!-- RTL geometry -->
  <div id="rtl" data-reveal="">
    <SectionCard
      family="rtl"
      headerRegion="rtl"
      eyebrow="geometry"
      title="RTL — geometry from logical properties"
      summary="Nothing in the component branches on direction: the chevron sits in the flex flow and the selected-row edge is border-inline-start. The writing mode does the rest."
    >
      <div class={cx(rt.grid760a)}>
        <ComponentCanvas title="select · rtl" stage="fill" files={selectRtlFiles}>
          <div dir="rtl" class={cx(rt.flex, rt.col, rt.gap16, rt.frame, rt.p16)}>
            <Select
              label="runtime (rtl)"
              bind:value={runtimeRtl}
              options={runtimeOptions.slice(0, 3)}
              placeholder="pick…"
            />
            <span class={cx(rt.inkMuted, rt.text12)}>
              dir="rtl" on the wrapper — trigger chevron and panel edge line flipped without a
              physical property in sight
            </span>
          </div>
        </ComponentCanvas>
        <div class={cx(rt.flex, rt.col, rt.justifyCenter, rt.gap8, rt.bodyMuted)}>
          <p class={cx(rt.pretty)}>
            The chevron sits in the flex flow, the selected-row edge is
            <code class={cx(rt.inkAccent)}>border-inline-start</code>, and the panel anchors with CSS
            Anchor Positioning whose offsets are logical too. The writing mode does the rest.
          </p>
        </div>
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<!-- Material3 standard sections (2026-08-26): types / usage / a11y /
     theming / api appended after the demo sections, same wrapper law as
     checkbox.html. -->
<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="types" data-reveal="">
    <SectionCard
      family="types"
      headerRegion="types"
      eyebrow="types"
      title="Select variants"
      summary="The popover listbox with plain rows, rows carrying descriptions, a disabled row, and the error state."
    >
      <ComponentCanvas title="select · variants" stage="fill" files={selectTypesFiles}>
        <div class={cx(rt.gridSm2)}>
          <div class={cx(rt.panel)}>
            <Select
              label="descriptions"
              options={runtimeOptions}
              placeholder="open for second lines…"
            />
          </div>
          <div class={cx(rt.panel)}>
            <Select
              label="error"
              options={[
                { value: '', label: '— choose —' },
                { value: 'free', label: 'free' },
                { value: 'pro', label: 'pro' },
              ]}
              error="plan is required"
            />
          </div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="A real listbox contract on top of the native popover: roving highlight via aria-activedescendant, focus restitution to the trigger on every close path."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves focus to the trigger button' },
          { key: '↑ / ↓ (closed)', action: 'Opens the panel, like the native select' },
          { key: '↑ / ↓ (open)', action: 'Moves the highlight, skipping disabled rows; no wrap' },
          { key: 'Home / End', action: 'Jumps to the first / last enabled row' },
          { key: 'Enter / Space', action: 'Chooses the highlighted row and closes the panel' },
          { key: 'Esc / outside click', action: 'Light dismiss from popover="auto"; focus returns to the trigger' },
        ]}
        aria={[
          { name: 'aria-haspopup', value: '"listbox"', description: 'On the trigger button, with aria-expanded synced live' },
          { name: 'aria-activedescendant', value: '{id}-opt-{index}', description: 'Roving highlight ID on the focusable list' },
          { name: 'aria-selected', value: "'true' / 'false'", description: 'On each role="option" row' },
          { name: 'aria-invalid', value: "'true'", description: 'On the trigger when the error prop is provided' },
          { name: 'aria-describedby', value: '{id}-error', description: 'Points at the "! message" validation line' },
        ]}
      />
    </SectionCard>
  </div>
  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Density and tokens"
      summary="Trigger and panel rows share the density-scope rhythm; resize the scope and the trigger, rows, and label stack resize together."
    >
      <div class={cx(rt.col24)}>
        <DensityDemo>
          <Select label="density sample" options={runtimeOptions} placeholder="pick a runtime…" />
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' },
            { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density' },
            { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' },
            { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density' },
          ]}
        />
      </div>
    </SectionCard>
  </div>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. The TRIGGER surface (.jx-field) and the PORTALED listbox both carry the resolved lanes (the batch C portal law: the panel stamps its own carriers, self-carried across the top-layer promotion); elevation carries the family own level2 — the anchored panel's menu rung. Open a demo listbox to see the panel's carriers live."
    >
      <ComponentCanvas title="Select · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.panel)}><Select label="runtime" options={runtimeOptions} size={18} density="small" /></div>
<div class={cx(rt.panel)}><Select label="named steps" options={runtimeOptions} size="medium" radius="large" /></div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Props extend native button attributes on the trigger; form submission rides the faceless jx-form-field bridge (the committed value, never the label, reaches FormData)."
    >
      <!-- the props table renders from the GENERATED meta (one source,
           docs-demo-standard 4.2): name/type/default from the registry
           interface, prose from the SELECT_DOCS curation -->
      <PropsTable meta={selectMeta} docs={SELECT_DOCS} />
    </SectionCard>
  </div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div data-reveal="">
    <DocsSeeAlso name="select" />
  </div>
</div>
