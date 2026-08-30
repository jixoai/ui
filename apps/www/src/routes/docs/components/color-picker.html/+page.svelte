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
<ColorPicker label="accent" bind:value={accentColor} format="oklch" />

<!-- trigger surface: swatch + mono value + chevron (either can be hidden) -->
<ColorPicker label="swatch only" bind:value={c} showValue={false} />

<!-- paste any notation into the panel input — invalid pastes revert;
     Eye Dropper appears when window.EyeDropper exists -->
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
    content="The jixoai color-picker component: the oklch-hub popover picker — SV pad + hue bar, hex/hsl/oklch format switching with OKLCH as the conversion hub, direct value input that reverts invalid pastes, Eye Dropper support, and the family label/error contract."
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
      title="color-picker — the oklch-hub popover"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">SV pad + hue bar</span>
        <span class="pill">hex / hsl / oklch</span>
        <span class="pill">Eye Dropper API</span>
        <span class="pill">invalid pastes revert</span>
        <span class="pill">zero deps · Svelte 5 runes</span>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas (site-polish F10): the standard opening — live demo + PLAYGROUND -->
  <div data-reveal="">
    <ComponentCanvas
      title="color-picker"
      description="the oklch-hub popover picker: SV pad + hue bar, hex/hsl/oklch round-trips, direct value input that reverts invalid pastes, and Eye Dropper when the platform has it."
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
      title="The full custom widget"
      summary="The one form member that is a full custom widget, because the native input[type=color] offers none of this: a terminal-bezel popover (native popover=auto + popovertarget — light dismiss, Escape and top layer are the browser's) holding a 200×150 saturation/value pad (pure-hue ground with white→transparent horizontal and black→transparent vertical overlays), a 12px full-spectrum hue bar, a hex/hsl/oklch format switch, a direct value input that parses any notation and reverts invalid pastes, and an Eye Dropper button when window.EyeDropper exists. OKLCH is the conversion hub — the token system's space — so every notation round-trips through one canonical model with zero dependencies (lib/color-utils)."
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
          Open one and drag: the SV pad maps color space (saturation right, value up) pinned to
          ltr — the trigger, not the map, is what rtl mirrors — and both pad and bar drive through
          Pointer Events with capture. Switching format re-emits the SAME color in the new
          notation; pasting <code class="text-accent">#0f2</code> into an oklch picker parses,
          converts through OKLCH, and commits canonical oklch text. The panel anchors under the
          trigger with CSS Anchor Positioning (flip-block fallback; engines without it get the
          authored viewport-center), and focus restitutes to the trigger on every close path.
        </p>
        <div class="border-border mt-1 border-t pt-5">
          <h3 class="text-[15px] font-bold tracking-tight">error wiring</h3>
          <div class="mt-4 grid gap-5 min-[760px]:grid-cols-2">
            <ColorPicker label="theme hue" error="theme hue is required" bind:value={errorColor} />
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              Same law as every family member: label[for] binds to the trigger (a button is
              labelable), <code class="text-accent">error</code> dashes the trigger border and
              wires <code class="text-accent">aria-invalid</code> +
              <code class="text-accent">aria-describedby</code> to the “! message” line.
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
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Color picker variants" summary="The trigger can show the swatch, the formatted value, or both; the value model supports three notations."><div class="grid gap-4 sm:grid-cols-3"><div class="border border-border p-4"><ColorPicker label="hex" value="#007924" format="hex" /></div><div class="border border-border p-4"><ColorPicker label="hsl" value="hsl(145 100% 24%)" format="hsl" /></div><div class="border border-border p-4"><ColorPicker label="oklch" value="oklch(0.6489 0.237 145)" format="oklch" showValue={false} /></div></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Bind a string value and choose the notation emitted by the picker."><CodeBlock code={colorUsage} lang="svelte" meta="ColorPicker usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The trigger is a labelled button; the native popover supplies Escape and light-dismiss behavior."><A11yTable keys={[{ key: 'Enter / Space', action: 'Open the color picker popover' }, { key: 'Escape', action: 'Close the popover and restore trigger focus' }, { key: 'Tab', action: 'Move through the picker fields' }]} aria={[{ name: 'aria-expanded', value: 'true | false', description: 'Reflects popover visibility' }, { name: 'aria-controls', value: '{id}-panel', description: 'Connects trigger to its panel' }, { name: 'aria-invalid', value: 'true', description: 'Set when error is present' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Trigger lane geometry follows density; the picker panel keeps its color-space dimensions stable."><div class="flex flex-col gap-5"><DensityDemo><ColorPicker label="density sample" value="#007924" /></DensityDemo><TokenTable tokens={[{ name: '--jx-color-lane', default: 'max(var(--jx-hit), calc(var(--jx-icon) + ...))', source: 'component' }, { name: '--jx-icon', default: '16 / 18 / 20 / 24px', source: 'density' }, { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density' }, { name: '--jx-color-picker-hue', default: 'runtime hue angle', source: 'component' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props control notation, trigger content, surface treatment, and validation."><PropsTable props={[{ name: 'value', type: 'string', default: "'#000000'", description: 'Bindable color string emitted in format.', bindable: true }, { name: 'format', type: "'hex' | 'hsl' | 'oklch'", default: "'hex'", description: 'Input and output notation.' }, { name: 'showSwatch', type: 'boolean', default: 'true', description: 'Shows the 16px color swatch.' }, { name: 'showValue', type: 'boolean', default: 'true', description: 'Shows formatted value text.' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Popover surface treatment.' }, { name: 'error', type: 'string', default: '—', description: 'Adds invalid state and message.' }, { name: 'density', type: 'Density', default: 'inherited', description: 'Overrides the inherited density scope.' }]} /></SectionCard></div>
</div>
