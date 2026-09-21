<!--
  combobox — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the workbench canvas + the
  searchable-select catalogue (allowCustom, strict, error) + the RTL
  geometry demo. The form.html route remains as the family hub.
-->
<script lang="ts">
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import Combobox, { type ComboboxOption } from '$lib/ui/combobox/combobox.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { meta as comboboxMeta } from '$lib/meta/combobox.meta';
  import { COMBOBOX_DOCS } from '$lib/ui/props-table/docs/combobox.docs';
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

  // ---- the universal props demo (explicit-props W3-A) --------------------
  const universalUsage = `<Combobox {options} label="px number" size={14} density="small" />
<Combobox {options} label="named steps" size="large" radius="medium" />`;

  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/combobox-universal.svelte', content: universalUsage },
  ];

  const comboboxFiles: TreeFile[] = [
    { name: 'registry/files/ui/combobox.svelte', content: comboboxSource },
    { name: 'src/lib/ui/combobox-usage.svelte', content: comboboxUsage },
  ];

  // ---- demo state ---------------------------------------------------------------
  let backendRoute = $state<string | undefined>('node-pty');
  let backendCustom = $state<string | undefined>(undefined);
  let backendStrict = $state<string | undefined>(undefined);
  let backendRtl = $state<string | undefined>('bun-terminal');

  // multiple + clear (expand-form-family F1, 2026-08-30)
  let pickedStacks = $state<string[]>(['node-pty']);
  let clearedRoute = $state<string | undefined>('bun-terminal');

  const multipleUsage = `<!-- multiple: bind an ARRAY in selection order; the committed
     array submits as repeated same-name FormData entries through the
     form-field bridge's MULTIVALUE seam — getAll(name) returns the
     picks byte-for-byte in order (BREAKING: value becomes string[]) -->
<Combobox label="stacks" multiple bind:value={stacks} options={backends} />

<!-- showClear: × in the trigger lane when something is committed;
     clearing submits honestly empty (no entry, never "undefined") -->
<Combobox label="backend" showClear bind:value={backend} options={backends} />

const stacks = $state<string[]>([]);`;

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

  // ---- sweep usage mirrors (canvas-everywhere-demos, 2026-09-08) ----------
  // Hand-authored mirrors of the wrapped demo regions below; the
  // same-source resolveRawCode migration of these strings is the
  // recorded follow-up.
  const close = '</' + 'script>';

  const comboboxCatalogDemo = `<script lang="ts">
  import Combobox from '@ui/combobox.svelte';
  import type { ComboboxOption } from '@ui/combobox.svelte';

  const backendOptions: ComboboxOption[] = [
    { value: 'node-pty', label: 'node-pty', description: 'conpty / forkpty — the battle-tested addon' },
    { value: 'bun-terminal', label: 'Bun.Terminal', description: 'linux/macos since 1.3.13, windows 1.3.14' },
    { value: '@sigma/pty-ffi', label: '@sigma/pty-ffi', description: 'deno FFI over rust portable-pty' },
    { value: 'termless', label: 'termless', description: 'VT emulator — not a pty host', disabled: true },
  ];

  let backendRoute = $state<string | undefined>('node-pty');
  let backendStrict = $state<string | undefined>(undefined);
  let backendCustom = $state<string | undefined>(undefined);
${close}

<Combobox label="backend — type to filter" bind:value={backendRoute} options={backendOptions} />

<!-- strict: allowCustom={false} reverts stray text on blur -->
<Combobox
  label="strict — no custom values"
  allowCustom={false}
  bind:value={backendStrict}
  options={backendOptions.slice(0, 3)}
  placeholder="Search..."
/>

<!-- no match → the “Use “xxx”” row -->
<Combobox
  label="custom — try “wasi”"
  bind:value={backendCustom}
  options={backendOptions.slice(0, 3)}
  placeholder="Search or type..."
/>

<!-- error wiring: aria-invalid + dashed shell -->
<Combobox label="backend" error="backend is required" options={backendOptions} />`;

  const comboboxMultipleDemo = `<script lang="ts">
  import Combobox from '@ui/combobox.svelte';
  import type { ComboboxOption } from '@ui/combobox.svelte';

  const backendOptions: ComboboxOption[] = [
    { value: 'node-pty', label: 'node-pty' },
    { value: 'bun-terminal', label: 'Bun.Terminal' },
    { value: '@sigma/pty-ffi', label: '@sigma/pty-ffi' },
  ];

  let pickedStacks = $state<string[]>(['node-pty']);
  let clearedRoute = $state<string | undefined>('bun-terminal');
${close}

<!-- multiple: bind an ARRAY in selection order; getAll(name) returns
     the picks byte-for-byte in order -->
<Combobox
  label="stacks (multiple)"
  multiple
  name="stacks"
  bind:value={pickedStacks}
  options={backendOptions}
  placeholder="pick several…"
/>

<!-- showClear: × in the trigger lane; clearing submits honestly empty -->
<Combobox
  label="backend (showClear)"
  showClear
  name="backend-clear"
  bind:value={clearedRoute}
  options={backendOptions}
/>`;

  const comboboxRtlDemo = `<script lang="ts">
  import Combobox from '@ui/combobox.svelte';
  import type { ComboboxOption } from '@ui/combobox.svelte';

  const backendOptions: ComboboxOption[] = [
    { value: 'node-pty', label: 'node-pty' },
    { value: 'bun-terminal', label: 'Bun.Terminal' },
  ];

  let backendRtl = $state<string | undefined>('bun-terminal');
${close}

<!-- logical properties only: dir="rtl" mirrors the chevron and the
     selected-row edge with zero branches -->
<div dir="rtl">
  <Combobox label="backend (rtl)" bind:value={backendRtl} options={backendOptions} />
</div>`;
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
</script>

<svelte:head>
  <title>Combobox · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai combobox component: the searchable select — the trigger IS the input. Typing filters the panel live, ↑/↓ + Enter commits, Escape reverts, Tab keeps; allowCustom offers the “Use “xxx”” row while strict fields revert stray text on blur. popover=auto panel, roving aria-activedescendant, family label/error contract."
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
      title="combobox — the searchable select"
      summary={heroSummary}
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">the trigger IS the input</span>
        <span class="pill">live label filter</span>
        <span class="pill">↑/↓ + Enter / Escape / Tab</span>
        <span class="pill">allowCustom “Use “xxx””</span>
        <span class="pill">multiple chips · showClear</span>
        <span class="pill">rtl: logical properties only</span>
      </div>
    </SectionCard>
  </div>

  <!-- the demo-standard skeleton (2026-08-30): Install then Usage sit
       ABOVE the demos — Intro → Install → Usage → Examples → API →
       See Also is the page law; the sections between stay page-local. -->
  <div data-reveal="">
    <DocsInstall name="combobox" />
  </div>

  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="The filter text is input state, never committed state — value only changes through an explicit commit."><CodeBlock code={comboboxUsage} lang="svelte" meta="Combobox usage" /></SectionCard></div>

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
      <div class={cx(rt.col12, rt.itemsStart, rt.wFull, rt.cbxMaxWxs)}>
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
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          Focus one: the text selects itself and the panel opens on the full list with the
          committed row highlighted (the 2px <code class={cx(rt.inkAccent)}>--primary</code> edge);
          typing filters live and auto-highlights the first match. Try
          <code class={cx(rt.inkAccent)}>wasi</code> in the first field — no match, so the
          “Use “wasi”” row appears in primary; press Enter to commit it as a custom value.
          The strict field (<code class={cx(rt.inkAccent)}>allowCustom={'{false}'}</code>) keeps
          its committed label instead.
        </p>
        <ComponentCanvas
          title="combobox · catalogue"
          files={[{ name: 'combobox-catalog-demo.svelte', content: comboboxCatalogDemo, kind: 'usage' }]}
          stage="fill"
        >
          <CardGrid min="230px">
          <div class={cx('demo-cell', rt.col12)} data-no-subgrid>
            <Combobox label="backend — type to filter" bind:value={backendRoute} options={backendOptions} />
            <span class={cx(rt.inkMuted, rt.text125)}>
              allowCustom (default) · bound value: <code class={cx(rt.inkAccent)}>{backendRoute ?? '—'}</code>
            </span>
          </div>
          <div class={cx('demo-cell', rt.col12)} data-no-subgrid>
            <Combobox
              label="strict — no custom values"
              bind:value={backendStrict}
              options={backendOptions.slice(0, 3)}
              placeholder="Search..."
            />
            <span class={cx(rt.inkMuted, rt.text125)}>
              allowCustom={'{false}'} · blur reverts stray text · value:
              <code class={cx(rt.inkAccent)}>{backendStrict ?? '—'}</code>
            </span>
          </div>
          <div class={cx('demo-cell', rt.col12)} data-no-subgrid>
            <Combobox
              label="custom — try “wasi”"
              bind:value={backendCustom}
              options={backendOptions.slice(0, 3)}
              placeholder="Search or type..."
            />
            <span class={cx(rt.inkMuted, rt.text125)}>
              no match → “Use “xxx”” row · value:
              <code class={cx(rt.inkAccent)}>{backendCustom ?? '—'}</code>
            </span>
          </div>
          <div class={cx('demo-cell', rt.col12)} data-no-subgrid>
            <Combobox label="backend" error="backend is required" options={backendOptions} />
            <span class={cx(rt.inkMuted, rt.text125)}>
              error wiring: aria-invalid + dashed shell
            </span>
          </div>
        </CardGrid>
        </ComponentCanvas>
        <p class={cx(rt.para)}>
          The component keeps the popover orchestration law of the family:
          <code class={cx(rt.inkAccent)}>popover="auto"</code> panels anchored with CSS Anchor
          Positioning (<code class={cx(rt.inkAccent)}>anchor-size(width)</code>, flip fallbacks,
          viewport-center when the engine lacks it), focus that never enters the panel — the
          roving highlight rides <code class={cx(rt.inkAccent)}>aria-activedescendant</code> +
          <code class={cx(rt.inkAccent)}>aria-owns</code> off the input itself — and geometry from
          logical properties only, so <code class={cx(rt.inkAccent)}>dir="rtl"</code> mirrors the
          chevron and the selected-row edge with zero branches.
        </p>
        <CodeBlock code={comboboxUsage} lang="svelte" meta="Combobox usage" />
      </div>
    </SectionCard>
  </div>

  <!-- multiple + clear (expand-form-family F1, 2026-08-30) -->
  <div id="multiple" data-reveal="">
    <SectionCard
      family="multiple"
      headerRegion="multiple"
      eyebrow="multiple"
      title="multiple — chips, check states, and a lossless form bridge"
      summary="multiple flips the bindable to string[] in SELECTION ORDER: options toggle membership (pick to add, re-pick to remove), the trigger wears chips with per-chip remove ×, panel rows carry aria-multiselectable plus a check glyph, and picking keeps the panel open. Submission rides the form-field bridge's MULTIVALUE seam — the committed array crosses as a values PROPERTY and lands in FormData as repeated same-name entries, so getAll(name) returns every pick byte-for-byte in order; form.reset() restores the mount array and disabled fields submit nothing. showClear adds an × in the trigger lane that empties the selection — the field then submits honestly empty."
    >
      <div class={cx(rt.col20)}>
        <ComponentCanvas
          title="combobox · multiple + clear"
          files={[{ name: 'combobox-multiple-demo.svelte', content: comboboxMultipleDemo, kind: 'usage' }]}
          stage="fill"
        >
          <div class={cx(rt.grid760a, rt.wFull)}>
            <div class={cx('demo-cell', rt.col12)} data-no-subgrid>
              <Combobox label="stacks (multiple)" multiple name="stacks" bind:value={pickedStacks} options={backendOptions} placeholder="pick several…" />
              <span class={cx(rt.inkMuted, rt.text125)}>
                selection order: <code class={cx(rt.inkAccent)}>[{pickedStacks.join(', ')}]</code> — chips remove ×,
                panel check state, re-pick toggles off
              </span>
            </div>
            <div class={cx('demo-cell', rt.col12)} data-no-subgrid>
              <Combobox label="backend (showClear)" showClear name="backend-clear" bind:value={clearedRoute} options={backendOptions} />
              <span class={cx(rt.inkMuted, rt.text125)}>
                the × clears the commit — the form then contributes
                <code class={cx(rt.inkAccent)}>nothing</code>, never "undefined" · value:
                <code class={cx(rt.inkAccent)}>{clearedRoute ?? '—'}</code>
              </span>
            </div>
          </div>
        </ComponentCanvas>
        <p class={cx(rt.para)}>
          The transport is the DECIDED one (design.md): no hidden inputs, no joined-string
          channel — newline-bearing, quote-bearing and arbitrary Unicode values survive
          byte-for-byte because each value is a separate FormData entry. The breaking change is
          deliberate and documented: in multiple mode <code class={cx(rt.inkAccent)}>bind:value</code>
          is <code class={cx(rt.inkAccent)}>string[]</code> — there is no compatibility shim. Blur no
          longer commits raw text in multiple mode; chips join through explicit Enter / row click
          only.
        </p>
        <CodeBlock code={multipleUsage} lang="svelte" meta="multiple · showClear" />
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
      <div class={cx(rt.col20)}>
        <ComponentCanvas
          title="combobox · rtl"
          files={[{ name: 'combobox-rtl-demo.svelte', content: comboboxRtlDemo, kind: 'usage' }]}
          stage="center"
        >
          <div dir="rtl" class={cx(rt.col16, rt.panel)}>
            <Combobox label="backend (rtl)" bind:value={backendRtl} options={backendOptions} />
            <span class={cx(rt.inkMuted, rt.text12)}>
              dir="rtl" — chevron inline-start, panel edge inline-start
            </span>
          </div>
        </ComponentCanvas>
        <p class={cx(rt.para)}>
          The chevron sits in the flex flow, the selected-row edge is
          <code class={cx(rt.inkAccent)}>border-inline-start</code>, and the panel anchors with CSS
          Anchor Positioning whose offsets are logical too. The writing mode does the rest.
        </p>
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Combobox variants" summary="The commit rules are the variants: free custom values by default, strict reverting on blur, plus the error shell.">
    <div class={cx(rt.gridSm2)}>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>allowCustom (default)</p>
        <p class={cx(rt.body13)}>No match → the “Use “xxx”” row in primary; Enter/Tab commits the typed text as the value.</p>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>strict — allowCustom={'{false}'}</p>
        <p class={cx(rt.body13)}>Stray text reverts on blur; only a listed option (or empty) can be committed.</p>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>disabled option rows</p>
        <p class={cx(rt.body13)}>Options may disable themselves — skipped by keyboard navigation and click.</p>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>error wiring</p>
        <p class={cx(rt.body13)}><code class={cx(rt.inkAccent)}>error</code> → aria-invalid + aria-describedby + the dashed shell.</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Focus never enters the panel — the roving highlight rides aria-activedescendant off the input itself."><A11yTable keys={[{ key: '↑ / ↓', action: 'Move the roving highlight through the filtered rows' }, { key: 'Enter', action: 'Commit the highlighted row (or the raw text with allowCustom)' }, { key: 'Escape', action: 'Revert to the committed display and close the panel' }, { key: 'Tab', action: 'Keep the typed text: resolve to an option, custom value, or revert' }]} aria={[{ name: 'role', value: 'combobox', description: 'On the trigger input, with aria-haspopup="listbox".' }, { name: 'aria-activedescendant', value: '{id}-opt-n', description: 'The keyboard/aria cursor; focus stays in the input the whole time.' }, { name: 'aria-controls / aria-owns', value: '{id}-listbox', description: 'The top-layer promoted listbox is a DOM sibling of the input.' }, { name: 'aria-expanded', value: 'true/false', description: 'On the input; mirrors panel state.' }, { name: 'aria-multiselectable', value: "'true'", description: 'On the listbox in multiple mode; picked rows carry aria-selected plus the check glyph.' }, { name: 'aria-label', value: '"remove X" / "clear selection"', description: 'On the chip remove × buttons and the showClear ×.' }, { name: 'aria-invalid / aria-describedby', value: 'true / {id}-error', description: 'Error wiring — dashed shell plus the validation message.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The shell consumes the .jx-field scaffold; the panel is the popover=auto terminal bezel with the 2px primary selected edge."><div class={cx(rt.col20)}><DensityDemo><Combobox label="density" options={backendOptions} /></DensityDemo><TokenTable tokens={[{ name: '--jx-cbx-{id}', default: 'anchor-name', source: 'component', description: 'Per-instance CSS anchor the panel positions against.' }, { name: '--jx-p', default: '0 → 1 timeline', source: 'component', description: 'The surface-motion kernel driving the panel open/close.' }, { name: '--jx-scrollbar-thin', default: 'thin lane', source: 'component', description: 'Stable-gutter scrollbar compensation in the panel.' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }]} /></div></SectionCard></div>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. The family CONSUMES size and color: the native element never receives them (the §1 native collision rule)."
    >
      <ComponentCanvas title="combobox · universal props" stage="fill" files={universalFiles}>
        <div class={cx(rt.gridSm2)}>
        <div class={cx(rt.panel)}><Combobox options={backendOptions} label="size 14 · density small" size={14} density="small" name="univ-cbx-px" /></div>
        <div class={cx(rt.panel)}><Combobox options={backendOptions} label="size large · radius medium" size="large" density="large" radius="medium" name="univ-cbx-named" /></div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props extend the native input attributes (except value); the name prop rides the faceless form-field bridge."><PropsTable meta={comboboxMeta} docs={COMBOBOX_DOCS} /></SectionCard></div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div data-reveal="">
    <DocsSeeAlso name="combobox" />
  </div>
</div>
