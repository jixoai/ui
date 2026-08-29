<!--
  range — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the fully custom slider catalogue
  (keyboard contract, ticks, RTL, error wiring). The form.html route
  remains as the family hub.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import Range from '$lib/ui/range/range.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'range')?.summary;
  if (!heroSummary) throw new Error('catalog entry "range" is missing — registry.json meta drift');

  // ToC outline: the demo sections, in page order. The engine pairs these
  // ids with the SectionCard data-family extents + header data-region
  // leaves rendered in this page.

  const rangeUsage = `<!-- fully custom: div + pointer events, no input[type=range] -->
<Range label="volume" bind:value={volume} min={0} max={100} />

<!-- decimal steps snap at the step's precision; ticks = one mark per step -->
<Range label="gain" bind:value={gain} min={0} max={10} step={0.5} ticks />

<!-- keyboard: ←→/↑↓ step · Home/End jump · geometry is logical, so
     dir="rtl" mirrors fill, thumb, ticks and arrows with zero branches -->
<div dir="rtl"><Range label="volume (rtl)" bind:value={v} /></div>`;

  // ---- demo state -------------------------------------------------------------
  let volume = $state(40);
  let gain = $state(6);
  let tolerance = $state(0.35);
  let volumeRtl = $state(70);
</script>

<svelte:head>
  <title>Range · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai range component: the fully custom slider — div + Pointer Events over the shared slider law, primary fill, ringed disc thumb, optional ticks, the full aria slider keyboard contract (←→/↑↓ step, Home/End jump), RTL through logical properties only, and the family error law."
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
      title="range — the fully custom slider"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">no input[type=range]</span>
        <span class="pill">pointer events + capture</span>
        <span class="pill">aria slider keyboard contract</span>
        <span class="pill">ticks per step</span>
        <span class="pill">rtl: logical properties only</span>
      </div>
    </SectionCard>
  </div>

  <!-- slider catalogue -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="range"
      title="Fully custom — one of the two the platform cannot paint"
      summary="No input[type=range] anywhere: a div with Pointer Events — pointerdown jumps and captures, move drags, touch-action none keeps the gesture on touch — over a 4px track (muted, radius 0) with a primary fill from the inline-start edge and a 16×16 SQUARE thumb: white fill, 1px border, primary while pressed, shadow-xs on hover. Keyboard carries the full aria slider contract (role=slider, ←→/↑↓ step, Home/End jump, tabindex 0); ticks draws one 4px mark per step as a repeating gradient; and every offset is logical, so dir=rtl mirrors fill, thumb, ticks and arrow keys with zero direction branches."
    >
      <div class="flex flex-col gap-5">
        <div class="grid gap-5 min-[760px]:grid-cols-3">
          <div class="flex flex-col gap-3">
            <Range label="volume" bind:value={volume} min={0} max={100} />
            <span class="text-muted-foreground text-[12.5px]">
              pointerdown jumps · drag captures · value:
              <code class="text-accent">{volume}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <Range label="gain (ticks)" bind:value={gain} min={0} max={10} step={0.5} ticks />
            <span class="text-muted-foreground text-[12.5px]">
              step 0.5 · one mark per step · value: <code class="text-accent">{gain}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <Range label="tolerance" bind:value={tolerance} min={0} max={1} step={0.05} />
            <span class="text-muted-foreground text-[12.5px]">
              decimals snap at the step's precision · value:
              <code class="text-accent">{tolerance.toFixed(2)}</code>
            </span>
          </div>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Tab into a slider and drive it: ←→/↑↓ step by
          <code class="text-accent">step</code>, Home/End jump to the bounds, and the thumb takes
          the family's inset focus law. Double-click anywhere on the track to land there —
          the same jump a single pointerdown already performs. Geometry is entirely logical
          (<code class="text-accent">inset-inline-start</code> fill and thumb,
          <code class="text-accent">:dir(rtl)</code> tick ruler), so the mirrored layout below
          costs the component nothing.
        </p>
        <div class="border-border mt-1 border-t pt-5">
          <h3 class="text-[15px] font-bold tracking-tight">RTL + error wiring</h3>
          <div class="mt-4 grid gap-5 min-[760px]:grid-cols-2">
            <div dir="rtl" class="flex flex-col gap-4 border-border border p-4">
              <Range label="volume (rtl)" bind:value={volumeRtl} min={0} max={100} />
              <Range label="gain (rtl, ticks)" bind:value={gain} min={0} max={10} step={0.5} ticks />
              <span class="text-muted-foreground text-[12px]">
                fill grows from the right, ticks mirror, arrow keys flip — logical properties only
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <Range label="volume" error="volume is required" min={0} max={100} />
              <p class="text-muted-foreground text-pretty text-[13px] leading-6">
                The <code class="text-accent">error</code> prop is the family law on a custom
                control too: <code class="text-accent">aria-invalid</code> +
                <code class="text-accent">aria-describedby</code> ride the role=slider element, the
                readout takes the destructive mark, and the thumb border dashes — the monochrome
                invalid signal, no second hue.
              </p>
            </div>
          </div>
        </div>
        <CodeBlock code={rangeUsage} lang="svelte" meta="Range usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Range variants" summary="Use a plain slider for continuous input, or add steps and ticks when values are discrete."><div class="grid gap-4 sm:grid-cols-3"><div class="border border-border p-4"><Range label="continuous" value={40} /></div><div class="border border-border p-4"><Range label="stepped" value={4} min={0} max={10} step={1} /></div><div class="border border-border p-4"><Range label="with ticks" value={50} ticks /></div></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Bind the numeric value; min, max, step, ticks, and RTL all remain explicit props."><CodeBlock code={rangeUsage} lang="svelte" meta="Range usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The custom track implements the complete aria-slider keyboard contract on its focusable root."><A11yTable keys={[{ key: 'Arrow keys', action: 'Change by step' }, { key: 'Home / End', action: 'Jump to min / max' }, { key: 'Page Up / Down', action: 'Change by a larger step when supported' }]} aria={[{ name: 'role', value: 'slider', description: 'Exposes the custom control as a slider' }, { name: 'aria-valuemin/max/now', value: 'numbers', description: 'Reports bounds and current value' }, { name: 'aria-labelledby', value: '{id}-label', description: 'Connects the visible label' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The slider hit area, groove, thumb, and readout consume shared density and slider tokens."><div class="flex flex-col gap-5"><DensityDemo><Range label="density sample" value={50} /></DensityDemo><TokenTable tokens={[{ name: '--jx-slider-track', default: 'max(var(--jx-unit), calc(var(--jx-line) / 2))', source: 'component' }, { name: '--jx-tick-step', default: 'runtime step percentage', source: 'component' }, { name: '--jx-hit', default: '44 / 44 / 44 / 48px', source: 'density' }, { name: '--jx-icon', default: '16 / 18 / 20 / 24px', source: 'density' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props define the numeric model, naming, visual options, and form lifecycle."><PropsTable props={[{ name: 'value', type: 'number', default: '0', description: 'Bindable committed value snapped to the step.', bindable: true }, { name: 'min', type: 'number', default: '0', description: 'Lower bound.' }, { name: 'max', type: 'number', default: '100', description: 'Upper bound.' }, { name: 'step', type: 'number', default: '1', description: 'Increment used by pointer and keyboard input.' }, { name: 'ticks', type: 'boolean', default: 'false', description: 'Draws one mark per step.' }, { name: 'showValue', type: 'boolean', default: 'true', description: 'Shows the current value readout.' }, { name: 'error', type: 'string', default: '—', description: 'Adds invalid state and message.' }, { name: 'disabled', type: 'boolean', default: 'false', description: 'Blocks pointer and keyboard interaction.' }]} /></SectionCard></div>
</div>
