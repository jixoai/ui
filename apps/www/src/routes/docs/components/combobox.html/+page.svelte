<!--
  combobox — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the workbench canvas + the
  searchable-select catalogue (allowCustom, strict, error) + the RTL
  geometry demo. The form.html route remains as the family hub.
-->
<script lang="ts">
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import Combobox, { type ComboboxOption } from '$lib/ui/combobox/combobox.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlayToggle, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'combobox')?.summary;
  if (!heroSummary) throw new Error('catalog entry "combobox" is missing — registry.json meta drift');

  // Same-source law: the canvas drawer shows the exact registry copy this
  // site runs — one ?raw import (audit P1-A2).
  import comboboxSource from '$lib/ui/combobox/combobox.svelte?raw';

  // ToC outline: the demo sections, in page order. The engine pairs these
  // ids with the SectionCard data-family extents + header data-region
  // leaves rendered in this page.

  const comboboxUsage = `const backends: ComboboxOption[] = [
  { value: 'node-pty', label: 'node-pty', description: 'conpty / forkpty addon' },
  { value: 'bun-terminal', label: 'Bun.Terminal', description: 'linux/macos 1.3.13+, windows 1.3.14' },
  { value: '@sigma/pty-ffi', label: '@sigma/pty-ffi', description: 'deno FFI over rust portable-pty' },
];

<!-- type to filter (label, case-insensitive); ↑/↓ + Enter commits; Escape
     reverts; Tab keeps. No match + allowCustom → the “Use “xxx”” row -->
<Combobox label="backend" bind:value={backend} options={backends} />

<!-- strict: allowCustom={false} reverts stray text on blur -->
<Combobox label="runtime" allowCustom={false} options={backends} />`;

  const comboboxFiles: TreeFile[] = [
    { name: 'registry/files/ui/combobox.svelte', content: comboboxSource },
    { name: 'src/lib/ui/combobox-usage.svelte', content: comboboxUsage },
  ];

  // ---- demo state ---------------------------------------------------------------
  let backendRoute = $state<string | undefined>('node-pty');
  let backendCustom = $state<string | undefined>(undefined);
  let backendStrict = $state<string | undefined>(undefined);
  let backendRtl = $state<string | undefined>('bun-terminal');

  const backendOptions: ComboboxOption[] = [
    { value: 'node-pty', label: 'node-pty', description: 'conpty / forkpty — the battle-tested addon' },
    { value: 'bun-terminal', label: 'Bun.Terminal', description: 'linux/macos since 1.3.13, windows 1.3.14' },
    { value: '@sigma/pty-ffi', label: '@sigma/pty-ffi', description: 'deno FFI over rust portable-pty' },
    { value: 'termless', label: 'termless', description: 'VT emulator — not a pty host', disabled: true },
  ];

  // ---- canvas playground ----------------------------------------------------------
  // Playground protocol: the page owns the snapshot + reset; the echo
  // footer replaces hand-written captions; the usage file tracks live state.
  const canvasInitial = {
    allowCustom: true,
    backend: 'node-pty' as string | undefined,
  };
  let canvasAllowCustom = $state(canvasInitial.allowCustom);
  let canvasBackend = $state(canvasInitial.backend);

  function resetComboboxCanvas(): void {
    canvasAllowCustom = canvasInitial.allowCustom;
    canvasBackend = canvasInitial.backend;
  }

  const comboboxUsageLive = $derived(`<Combobox
  label="backend"${canvasAllowCustom ? '\n  allowCustom' : ''}
  options={backendOptions}
  bind:value
/>`);

  // stable named resolver: lazy read evaluated inside the canvas's
  // $derived — never a value snapshot
  const resolveComboboxUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? comboboxUsageLive : file.content;
</script>

<svelte:head>
  <title>Combobox · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai combobox component: the searchable select — the trigger IS the input. Typing filters the panel live, ↑/↓ + Enter commits, Escape reverts, Tab keeps; allowCustom offers the “Use “xxx”” row while strict fields revert stray text on blur. popover=auto panel, roving aria-activedescendant, family label/error contract."
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
      title="combobox — the searchable select"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">the trigger IS the input</span>
        <span class="pill">live label filter</span>
        <span class="pill">↑/↓ + Enter / Escape / Tab</span>
        <span class="pill">allowCustom “Use “xxx””</span>
        <span class="pill">rtl: logical properties only</span>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas (audit P1-A2) -->
  <div data-reveal="">
    <ComponentCanvas
      title="combobox"
      description="The searchable select: the trigger IS the input — typing filters the panel live, ↑/↓ + Enter commits, Escape reverts, and allowCustom offers the “Use “xxx”” row."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/combobox.svelte"
      files={comboboxFiles}
      stage="center"
      onreset={resetComboboxCanvas}
      output={[{ label: 'value', value: canvasBackend ?? '—' }]}
      resolveFileContent={resolveComboboxUsage}
    >
      <div class="flex w-full max-w-xs flex-col items-start gap-3">
        <Combobox
          label="backend"
          bind:value={canvasBackend}
          options={backendOptions}
          allowCustom={canvasAllowCustom}
          placeholder="Search..."
        />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="allowCustom">
            <PlayToggle bind:value={canvasAllowCustom} />
          </PlayRow>
          <PlayHelp>
            type <code>wasi</code> — allowCustom on shows the “Use “wasi”” row in
            primary; off reverts stray text on blur.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- searchable-select catalogue -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="combobox"
      title="The high-form select — the popup becomes a conversation"
      summary="The trigger IS an input, typing filters the panel live (label contains, case-insensitive), ↑/↓ ride a roving aria-activedescendant highlight, Enter commits it, Escape reverts, Tab keeps — and when nothing matches, the allowCustom row offers “Use “xxx”” in the primary hue while strict fields revert stray text on blur. The panel is the same popover=auto terminal bezel as Select — light dismiss, Escape, and top layer are the browser's; focus never leaves the text field."
    >
      <div class="flex flex-col gap-5">
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Focus one: the text selects itself and the panel opens on the full list with the
          committed row highlighted (the 2px <code class="text-accent">--primary</code> edge);
          typing filters live and auto-highlights the first match. Try
          <code class="text-accent">wasi</code> in the first field — no match, so the
          “Use “wasi”” row appears in primary; press Enter to commit it as a custom value.
          The strict field (<code class="text-accent">allowCustom={'{false}'}</code>) keeps
          its committed label instead.
        </p>
        <CardGrid min="230px">
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <Combobox label="backend — type to filter" bind:value={backendRoute} options={backendOptions} />
            <span class="text-muted-foreground text-[12.5px]">
              allowCustom (default) · bound value: <code class="text-accent">{backendRoute ?? '—'}</code>
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <Combobox
              label="strict — no custom values"
              bind:value={backendStrict}
              options={backendOptions.slice(0, 3)}
              placeholder="Search..."
            />
            <span class="text-muted-foreground text-[12.5px]">
              allowCustom={'{false}'} · blur reverts stray text · value:
              <code class="text-accent">{backendStrict ?? '—'}</code>
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <Combobox
              label="custom — try “wasi”"
              bind:value={backendCustom}
              options={backendOptions.slice(0, 3)}
              placeholder="Search or type..."
            />
            <span class="text-muted-foreground text-[12.5px]">
              no match → “Use “xxx”” row · value:
              <code class="text-accent">{backendCustom ?? '—'}</code>
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <Combobox label="backend" error="backend is required" options={backendOptions} />
            <span class="text-muted-foreground text-[12.5px]">
              error wiring: aria-invalid + dashed shell
            </span>
          </div>
        </CardGrid>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          The component keeps the popover orchestration law of the family:
          <code class="text-accent">popover="auto"</code> panels anchored with CSS Anchor
          Positioning (<code class="text-accent">anchor-size(width)</code>, flip fallbacks,
          viewport-center when the engine lacks it), focus that never enters the panel — the
          roving highlight rides <code class="text-accent">aria-activedescendant</code> +
          <code class="text-accent">aria-owns</code> off the input itself — and geometry from
          logical properties only, so <code class="text-accent">dir="rtl"</code> mirrors the
          chevron and the selected-row edge with zero branches.
        </p>
        <CodeBlock code={comboboxUsage} lang="svelte" meta="Combobox usage" />
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
          <Combobox label="backend (rtl)" bind:value={backendRtl} options={backendOptions} />
          <span class="text-muted-foreground text-[12px]">
            dir="rtl" — chevron inline-start, panel edge inline-start
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

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Combobox variants" summary="The commit rules are the variants: free custom values by default, strict reverting on blur, plus the error shell.">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">allowCustom (default)</p>
        <p class="text-[13px] leading-6">No match → the “Use “xxx”” row in primary; Enter/Tab commits the typed text as the value.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">strict — allowCustom={'{false}'}</p>
        <p class="text-[13px] leading-6">Stray text reverts on blur; only a listed option (or empty) can be committed.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">disabled option rows</p>
        <p class="text-[13px] leading-6">Options may disable themselves — skipped by keyboard navigation and click.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">error wiring</p>
        <p class="text-[13px] leading-6"><code class="text-accent">error</code> → aria-invalid + aria-describedby + the dashed shell.</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="The filter text is input state, never committed state — value only changes through an explicit commit."><CodeBlock code={comboboxUsage} lang="svelte" meta="Combobox usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Focus never enters the panel — the roving highlight rides aria-activedescendant off the input itself."><A11yTable keys={[{ key: '↑ / ↓', action: 'Move the roving highlight through the filtered rows' }, { key: 'Enter', action: 'Commit the highlighted row (or the raw text with allowCustom)' }, { key: 'Escape', action: 'Revert to the committed display and close the panel' }, { key: 'Tab', action: 'Keep the typed text: resolve to an option, custom value, or revert' }]} aria={[{ name: 'role', value: 'combobox', description: 'On the trigger input, with aria-haspopup="listbox".' }, { name: 'aria-activedescendant', value: '{id}-opt-n', description: 'The keyboard/aria cursor; focus stays in the input the whole time.' }, { name: 'aria-controls / aria-owns', value: '{id}-listbox', description: 'The top-layer promoted listbox is a DOM sibling of the input.' }, { name: 'aria-expanded', value: 'true/false', description: 'On the input; mirrors panel state.' }, { name: 'aria-invalid / aria-describedby', value: 'true / {id}-error', description: 'Error wiring — dashed shell plus the validation message.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The shell consumes the .jx-field scaffold; the panel is the popover=auto terminal bezel with the 2px primary selected edge."><div class="flex flex-col gap-5"><DensityDemo><Combobox label="density" options={backendOptions} /></DensityDemo><TokenTable tokens={[{ name: '--jx-cbx-{id}', default: 'anchor-name', source: 'component', description: 'Per-instance CSS anchor the panel positions against.' }, { name: '--jx-p', default: '0 → 1 timeline', source: 'component', description: 'The surface-motion kernel driving the panel open/close.' }, { name: '--jx-scrollbar-thin', default: 'thin lane', source: 'component', description: 'Stable-gutter scrollbar compensation in the panel.' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props extend the native input attributes (except value); the name prop rides the faceless form-field bridge."><PropsTable props={[{ name: 'options', type: 'ComboboxOption[]', default: '—', description: 'The full option list (order = panel order): { value, label, description?, disabled? }.', required: true }, { name: 'value', type: 'string', default: '—', description: 'Committed value (bind:value) — a listed option’s value or a custom string.', bindable: true }, { name: 'placeholder', type: 'string', default: "'Search or type...'", description: 'Input placeholder while nothing is committed.' }, { name: 'label', type: 'string', default: '—', description: 'Renders label[for] above the control.' }, { name: 'name', type: 'string', default: '—', description: 'Form field name — intercepted off the input; the bridge submits the VALUE, never the display text.' }, { name: 'error', type: 'string', default: '—', description: 'Adds aria-invalid + aria-describedby + the dashed border.' }, { name: 'id', type: 'string', default: 'auto', description: 'Wired into label[for] / error[id]; auto-generated when omitted.' }, { name: 'allowCustom', type: 'boolean', default: 'true', description: 'Accept typed text that matches no option as the committed value.' }, { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the input and the chevron together.' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface paint of the panel.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the shell.' }]} /></SectionCard></div>
</div>
