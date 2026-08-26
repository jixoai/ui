<!--
  select — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the workbench canvas + the
  select-split story (NativeSelect vs Select) + label/error wiring and
  the RTL geometry demo. The form.html route remains as the family hub.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Select, { type SelectOption } from '$lib/ui/select/select.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
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
</script>

<svelte:head>
  <title>Select · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai select component: the popover-listbox select — per-option descriptions, ↑/↓/Home/End/Enter roving highlight with focus restitution, popover=auto light dismiss and top layer. The native-first split against NativeSelect, label/error wiring, and RTL geometry from logical properties only."
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
      title="select — the popover listbox"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">popover=auto panel</span>
        <span class="pill">per-option descriptions</span>
        <span class="pill">↑/↓ roving highlight</span>
        <span class="pill">FormData-ready</span>
        <span class="pill">rtl: logical properties only</span>
      </div>
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
      <div class="flex w-full max-w-xs flex-col items-start gap-3">
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
      <div class="flex flex-col gap-5">
        <div class="grid gap-5 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-3">
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
            <span class="text-muted-foreground text-[12.5px]">
              platform popup · FormData-ready · bound value:
              <code class="text-accent">{runtimeNative}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <Select
              label="runtime — popover listbox"
              bind:value={runtime}
              options={runtimeOptions}
              placeholder="pick a runtime…"
            />
            <span class="text-muted-foreground text-[12.5px]">
              popover panel · descriptions · bound value: <code class="text-accent">{runtime}</code>
            </span>
          </div>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Open the right one: the panel is <code class="text-accent">popover="auto"</code> wired
          with <code class="text-accent">popovertarget</code>, so light dismiss, Escape, and
          top-layer rendering are the browser's; the JS only drives
          <code class="text-accent">role="listbox"</code> /
          <code class="text-accent">role="option"</code> /
          <code class="text-accent">aria-activedescendant</code>, the ↑/↓/Home/End/Enter
          highlight, and focus restitution to the trigger on every close path. The selected row
          reads <code class="text-accent">--terminal-hover</code> fill with a 2px
          <code class="text-accent">--primary</code> edge on
          <code class="text-accent">border-inline-start</code> — under
          <code class="text-accent">dir="rtl"</code> the edge flips sides by itself.
        </p>
        <div class="border-border mt-1 border-t pt-5">
          <h3 class="text-[15px] font-bold tracking-tight">label + error wiring, both selects</h3>
          <p class="text-muted-foreground mt-2 text-pretty text-[13px] leading-6">
            The split changes nothing semantically: <code class="text-accent">label[for]</code>
            binds to the control (the <code class="text-accent">&lt;button&gt;</code> trigger in Select's case), and the
            <code class="text-accent">error</code> prop wires
            <code class="text-accent">aria-invalid</code> +
            <code class="text-accent">aria-describedby</code> + the dashed shell — the same
            monochrome invalid signal as the rest of the family.
          </p>
          <div class="mt-4 grid gap-5 min-[760px]:grid-cols-2">
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
      <div class="grid gap-5 min-[760px]:grid-cols-2">
        <div dir="rtl" class="flex flex-col gap-4 border-border border p-4">
          <Select
            label="runtime (rtl)"
            bind:value={runtimeRtl}
            options={runtimeOptions.slice(0, 3)}
            placeholder="pick…"
          />
          <span class="text-muted-foreground text-[12px]">
            dir="rtl" on the wrapper — trigger chevron and panel edge line flipped without a
            physical property in sight
          </span>
        </div>
        <div class="flex flex-col justify-center gap-2 text-muted-foreground text-[13px] leading-6">
          <p class="text-pretty">
            The chevron sits in the flex flow, the selected-row edge is
            <code class="text-accent">border-inline-start</code>, and the panel anchors with CSS
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
<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal="">
    <SectionCard
      family="types"
      headerRegion="types"
      eyebrow="types"
      title="Select variants"
      summary="The popover listbox with plain rows, rows carrying descriptions, a disabled row, and the error state."
    >
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
      </div>
    </SectionCard>
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
      <div class="flex flex-col gap-6">
        <DensityDemo>
          <Select label="density sample" options={runtimeOptions} placeholder="pick a runtime…" />
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: '--jx-hit', default: '44 / 44 / 44 / 48px', source: 'density' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' },
            { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density' },
            { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' },
            { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density' },
          ]}
        />
      </div>
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
      <PropsTable
        props={[
          { name: 'options', type: 'SelectOption[]', default: '—', description: 'The full option list; order = panel order.', required: true },
          { name: 'value', type: 'string', default: '—', description: 'Committed value; undefined shows the placeholder.', bindable: true },
          { name: 'placeholder', type: 'string', default: "'Select...'", description: 'Trigger text when nothing is selected.' },
          { name: 'label', type: 'string', default: '—', description: 'Field label rendered as label[for] above the trigger.' },
          { name: 'name', type: 'string', default: '—', description: 'Form field name — the bridge submits the committed value under it.' },
          { name: 'error', type: 'string', default: '—', description: 'Error text: sets aria-invalid, wires aria-describedby, dashes the shell.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the trigger and the form-bridge field.' },
          { name: 'multiple', type: 'boolean', default: 'false', description: 'Reserved extension direction — not implemented in v1 (warns).' },
          { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface fill of the panel.' },
          { name: 'density', type: "'xs' | 'sm' | 'default' | 'lg'", default: 'inherited', description: 'Overrides the inherited density scope.' },
        ]}
      />
    </SectionCard>
  </div>
</div>
