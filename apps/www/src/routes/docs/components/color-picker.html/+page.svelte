<!--
  color-picker — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the oklch-hub picker catalogue
  (trigger surfaces, format round-trips, error wiring). The form.html
  route remains as the family hub.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import ColorPicker from '$lib/ui/color-picker/color-picker.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlaySegmented, PlayToggle, PlayHelp } from '$lib/playground';

  // Same-source law: the canvas drawer shows the exact registry copy this site runs.
  import colorPickerSource from '$lib/ui/color-picker/color-picker.svelte?raw';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'color-picker')?.summary;
  if (!heroSummary) throw new Error('catalog entry "color-picker" is missing — registry.json meta drift');

  // ToC outline: the demo sections, in page order. The engine pairs these
  // ids with the SectionCard data-family extents + header data-region
  // leaves rendered in this page.

  const colorUsage = `<!-- value notation follows format; oklch is the conversion hub -->
<ColorPicker label="brand" bind:value={brandColor} />
<ColorPicker label="accent" bind:value={accentColor} format="oklch" name="accent" />

<!-- the lane: a REAL input[type=text] field (label[for], name=, native
     focus/selection) + a REAL input[type=color] swatch that opens the
     ENGINE picker on click — every input mode gets a picker -->
<ColorPicker label="swatch only" bind:value={c} showValue={false} />

<!-- paste any notation into the field — invalid drafts revert; the
     chevron opens the pro editor (Eye Dropper when present) -->
<ColorPicker label="theme hue" bind:value={c} format="hsl" />`;

  // ---- demo state ---------------------------------------------------------------
  let brandColor = $state('#007924');
  let accentColor = $state('oklch(0.6489 0.237 145)');
  let swatchOnly = $state('#b7d7a8');
  let errorColor = $state('#8a5a2f');

  // ---- canvas playground (site-polish F10: the standard opening) -----------
  type CanvasFormat = 'hex' | 'hsl' | 'oklch';
  const canvasInitial = { value: '#007924', format: 'hex' as CanvasFormat, showSwatch: true, showValue: true };
  let canvasColor = $state(canvasInitial.value);
  let canvasFormat = $state(canvasInitial.format);
  let canvasShowSwatch = $state(canvasInitial.showSwatch);
  let canvasShowValue = $state(canvasInitial.showValue);

  function resetColorPickerCanvas(): void {
    canvasColor = canvasInitial.value;
    canvasFormat = canvasInitial.format;
    canvasShowSwatch = canvasInitial.showSwatch;
    canvasShowValue = canvasInitial.showValue;
  }

  const canvasUsage = $derived(
    [
      '<ColorPicker',
      '  label="brand"',
      '  bind:value',
      canvasFormat !== 'hex' ? `  format="${canvasFormat}"` : [],
      !canvasShowSwatch ? '  showSwatch={false}' : [],
      !canvasShowValue ? '  showValue={false}' : [],
      '/>',
    ]
      .flat()
      .join('\n'),
  );

  // stable named resolver: the usage file tracks live playground state
  const resolveColorPickerUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? canvasUsage : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/color-picker/color-picker.svelte', content: colorPickerSource },
    { name: 'src/lib/ui/color-picker-usage.svelte', content: colorUsage },
  ];
</script>

<svelte:head>
  <title>Color picker · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai color-picker component: a native input[type=text] value field (label, name, FormData) with a native input[type=color] swatch that opens the engine picker, plus a professional popover editor — SV pad + hue bar, hex/hsl/oklch format switching through OKLCH, direct value entry that reverts invalid drafts, and Eye Dropper support."
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
      title="color-picker — native field, pro editor"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">native input[type=text] field</span>
        <span class="pill">native input[type=color] swatch</span>
        <span class="pill">SV pad + hue bar</span>
        <span class="pill">hex / hsl / oklch</span>
        <span class="pill">Eye Dropper API</span>
        <span class="pill">invalid drafts revert</span>
        <span class="pill">zero deps · Svelte 5 runes</span>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas (site-polish F10): the standard opening — live demo + PLAYGROUND -->
  <div data-reveal="">
    <ComponentCanvas
      title="color-picker"
      description="the value field is a REAL input[type=text] (label[for], name=, native focus and selection) and the swatch is a REAL input[type=color] that opens the ENGINE picker on click; the chevron opens the pro editor — SV pad + hue bar, hex/hsl/oklch round-trips, direct value entry that reverts invalid drafts, and Eye Dropper when the platform has it."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/color-picker/color-picker.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetColorPickerCanvas}
      output={[{ label: 'value', value: canvasColor }]}
      resolveFileContent={resolveColorPickerUsage}
    >
      <div class="flex w-full max-w-xs flex-col items-start gap-3">
        <ColorPicker
          label="brand"
          bind:value={canvasColor}
          format={canvasFormat}
          showSwatch={canvasShowSwatch}
          showValue={canvasShowValue}
        />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="format">
            <PlaySegmented
              bind:value={canvasFormat}
              options={[
                { value: 'hex', label: 'hex' },
                { value: 'hsl', label: 'hsl' },
                { value: 'oklch', label: 'oklch' },
              ]}
            />
          </PlayRow>
          <PlayRow label="showSwatch">
            <PlayToggle bind:value={canvasShowSwatch} />
          </PlayRow>
          <PlayRow label="showValue">
            <PlayToggle bind:value={canvasShowValue} />
          </PlayRow>
          <PlayHelp>
            the committed value's notation follows format — oklch is the conversion hub, so
            every round-trip stays exact.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- picker catalogue -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="color-picker"
      title="Native base, custom picker surfaces"
      summary="The lane rides native controls (2026-09-01 native rebase): the value field is a REAL input[type=text] — label[for] binds it, name= submits through its own FormData lane, focus, selection and disabled are the platform's — and the swatch is a REAL input[type=color] styled to the swatch chrome, so clicking it opens the ENGINE picker in WebKit/Firefox: every input mode gets a picker. The chevron button opens the rich editor in a terminal-bezel popover (native popover=auto + popovertarget — light dismiss, Escape and top layer are the browser's): a 200×150 saturation/value pad and a 12px full-spectrum hue bar — 2D picker surfaces no native element provides, the same legitimacy class as date-picker's calendar grid — plus a hex/hsl/oklch format switch, a direct value input that parses any notation and reverts invalid drafts, and an Eye Dropper button when window.EyeDropper exists. OKLCH is the conversion hub — the token system's space — so every notation round-trips through one canonical model with zero dependencies (lib/color-utils), and every surface (field typing, swatch pick, editor drag, bind write) flows through the ONE value string."
    >
      <div class="flex flex-col gap-5">
        <div class="grid gap-5 min-[760px]:grid-cols-3">
          <div class="flex flex-col gap-3">
            <ColorPicker label="brand (hex)" bind:value={brandColor} />
            <span class="text-muted-foreground text-[12.5px]">
              bound value: <code class="text-accent">{brandColor}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <ColorPicker label="accent (oklch)" bind:value={accentColor} format="oklch" />
            <span class="text-muted-foreground text-[12.5px]">
              notation follows format · value: <code class="text-accent">{accentColor}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <ColorPicker label="swatch only" bind:value={swatchOnly} showValue={false} />
            <span class="text-muted-foreground text-[12.5px]">
              showSwatch / showValue shape the trigger
            </span>
          </div>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Type in the field: parsed text commits canonically in the active notation and invalid
          drafts revert on change — native focus and selection throughout. Click the swatch: the
          engine's own color picker opens (a real input[type=color]; the pick re-emits through
          the same one-truth value, so a hex pick never rewrites an oklch picker's notation). The
          chevron opens the editor — drag the SV pad (saturation right, value up, pinned to ltr —
          the lane, not the map, is what rtl mirrors) or the hue bar, both through Pointer Events
          with capture. Switching format re-emits the SAME color in the new notation; pasting
          <code class="text-accent">#0f2</code> into an oklch picker parses, converts through
          OKLCH, and commits canonical oklch text. The panel anchors under the lane with CSS
          Anchor Positioning (flip-block fallback; engines without it get the authored
          viewport-center), and focus restitutes to the field on every close path.
        </p>
        <div class="border-border mt-1 border-t pt-5">
          <h3 class="text-[15px] font-bold tracking-tight">error wiring</h3>
          <div class="mt-4 grid gap-5 min-[760px]:grid-cols-2">
            <ColorPicker label="theme hue" error="theme hue is required" bind:value={errorColor} />
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              Same law as every family member: label[for] binds the native field,
              <code class="text-accent">error</code> dashes the lane border and wires
              <code class="text-accent">aria-invalid</code> +
              <code class="text-accent">aria-describedby</code> on the input to the “! message”
              line.
            </p>
          </div>
        </div>
        <CodeBlock code={colorUsage} lang="svelte" meta="ColorPicker usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Color picker variants" summary="The lane can show the native swatch (input[type=color]), the native value field (input[type=text]), or both; the value model supports three notations."><div class="grid gap-4 sm:grid-cols-3"><div class="border border-border p-4"><ColorPicker label="hex" value="#007924" format="hex" /></div><div class="border border-border p-4"><ColorPicker label="hsl" value="hsl(145 100% 24%)" format="hsl" /></div><div class="border border-border p-4"><ColorPicker label="oklch" value="oklch(0.6489 0.237 145)" format="oklch" showValue={false} /></div></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Bind a string value and choose the notation emitted by the picker."><CodeBlock code={colorUsage} lang="svelte" meta="ColorPicker usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The value surface is a native input[type=text] (label, focus, selection); the swatch is a native input[type=color]; the popover supplies Escape and light-dismiss behavior."><A11yTable keys={[{ key: 'Type + Enter', action: 'Edit the value in the native field; parsed text commits, invalid drafts revert' }, { key: 'Click swatch', action: 'Open the engine color picker (native input[type=color])' }, { key: 'Enter / Space on chevron', action: 'Open the editor popover (native popover=auto)' }, { key: 'Escape', action: 'Close the popover and restore field focus' }, { key: 'Tab', action: 'Move through the lane controls and picker fields' }, { key: 'Keyboard-only picking (honest limits)', action: 'The SV pad and hue rail are pointer-only decorative aids (aria-hidden); keyboard picking rides the value field (any notation), the format select and the Swatches grid — and the engine picker only while the native swatch is mounted (showSwatch=false removes that path entirely).' }]} aria={[{ name: 'aria-invalid', value: 'true', description: 'Set on the field when error is present' }, { name: 'aria-describedby', value: '{id}-error', description: 'Points the field — and the native swatch — at the “! message” line when invalid' }, { name: 'aria-expanded', value: 'true | false', description: 'On the chevron; reflects popover visibility' }, { name: 'aria-haspopup', value: 'true', description: 'On the chevron; the generic promise — the panel opens as role=group, not a dialog' }, { name: 'aria-controls', value: '{id}-panel', description: 'Connects the chevron to its panel' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Trigger lane geometry follows density; the picker panel keeps its color-space dimensions stable."><div class="flex flex-col gap-5"><DensityDemo><ColorPicker label="density sample" value="#007924" /></DensityDemo><TokenTable tokens={[{ name: '--jx-color-lane', default: 'max(var(--jx-hit), calc(var(--jx-icon) + ...))', source: 'component' }, { name: '--jx-icon', default: '16 / 18 / 20 / 24px', source: 'density' }, { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density' }, { name: '--jx-color-picker-hue', default: 'runtime hue angle', source: 'component' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props control notation, lane content, surface treatment, validation, and the native form contract."><PropsTable props={[{ name: 'value', type: 'string', default: "'#000000'", description: 'Bindable color string emitted in format; every surface (field, swatch, editor, bind) flows through it.', bindable: true }, { name: 'format', type: "'hex' | 'hsl' | 'oklch'", default: "'hex'", description: 'Input and output notation.' }, { name: 'name', type: 'string', default: '—', description: 'Form field name — the native input[type=text] submits its string under it.' }, { name: 'disabled', type: 'boolean', default: 'false', description: 'The platform disabled semantics on the field, swatch and chevron.' }, { name: 'showSwatch', type: 'boolean', default: 'true', description: 'Mounts the native input[type=color] swatch riding the COLOR LAW face (the conic well chip, laws/color.ts — the 4th mounting surface, generated not hand-drawn) — the engine picker path.' }, { name: 'showValue', type: 'boolean', default: 'true', description: 'Shows the value text; false keeps the native field as the sr-only value carrier (label, name and ARIA intact).' }, { name: 'lane', type: 'Snippet', default: '—', description: 'A custom lane beside the swatch (the Owner rebase, 2026-09-02): the component is the jx-pure input-color law face plus a SLOT — the default lane is the input-text; with lane, your content owns the visible spot (it sees { text, open, disabled }) while the native field goes sr-only, label[for]/name/ARIA intact.' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'Popover surface treatment. Defaults: literal slot — own ’auto’, ambient when an axis opens.' }, { name: 'error', type: 'string', default: '—', description: 'Adds invalid state and message.' }, { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' }]} /></SectionCard></div>
</div>
