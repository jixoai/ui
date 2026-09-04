<!--
  range — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the fully custom slider catalogue
  (keyboard contract, ticks, RTL, error wiring). The form.html route
  remains as the family hub.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import Range, { RangeTick } from '$lib/ui/range';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlayToggle, PlayNumber, PlayHelp } from '$lib/playground';

  // Same-source law: the canvas drawer shows the exact registry copy this site runs.
  import rangeSource from '$lib/ui/range/range.svelte?raw';
  import rangeCssSource from '$lib/ui/range/range.css?raw';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'range')?.summary;
  if (!heroSummary) throw new Error('catalog entry "range" is missing — registry.json meta drift');

  // ToC outline: the demo sections, in page order. The engine pairs these
  // ids with the SectionCard data-family extents + header data-region
  // leaves rendered in this page.

  const rangeUsage = `<!-- the base is the REAL input[type=range]; the component adds
     the label row, readout, ticks and the error law -->
<Range label="volume" bind:value={volume} min={0} max={100} />

<!-- the ruler composes declaratively: RangeTick scales render marks at
     scale × step periods, lengths grade ascending (ruler metaphor) —
     click a mark to snap, the wheel fine-tunes one detent at a time -->
<Range label="gain" bind:value={gain} min={0} max={10} step={0.5}>
  {#snippet ticks()}
    <RangeTick scale={1} />
    <RangeTick scale={5} />
    <RangeTick scale={10} />
  {/snippet}
</Range>

<!-- the wheel surface is declarative too (touch-action axis grammar):
     'y' = plain wheel only, 'x' = shift+wheel, wheel={false} disables,
     {'{ y: 0.2 }'} = five detents per input-step -->
<Range label="fine" bind:value={fine} wheel={'{ y: 0.2 }'} />

<!-- orientation="vertical" rides the platform's vertical face —
     min at the physical bottom (writing-mode + orient), the ruler
     maps bottom-up on the block axis -->
<Range label="fader" bind:value={fader} orientation="vertical" ticks />

<!-- keyboard is the platform's: ←→/↑↓ step · Home/End jump ·
     PageUp/PageDown stride · RTL mirrors (the platform owns the
     thumb; the law carries one :dir(rtl) fill-mirror rule) -->
<div dir="rtl"><Range label="volume (rtl)" bind:value={v} /></div>`;

  // ---- demo state -------------------------------------------------------------
  let volume = $state(40);
  let gain = $state(6);
  let tolerance = $state(0.35);
  let volumeRtl = $state(70);
  let rulerValue = $state(30);

  // ---- canvas playground (site-polish F10: the standard opening) -----------
  const canvasInitial = { value: 40, min: 0, max: 100, step: 1, ticks: false };
  let canvasValue = $state(canvasInitial.value);
  let canvasMin = $state(canvasInitial.min);
  let canvasMax = $state(canvasInitial.max);
  let canvasStep = $state(canvasInitial.step);
  let canvasTicks = $state(canvasInitial.ticks);

  function resetRangeCanvas(): void {
    canvasValue = canvasInitial.value;
    canvasMin = canvasInitial.min;
    canvasMax = canvasInitial.max;
    canvasStep = canvasInitial.step;
    canvasTicks = canvasInitial.ticks;
  }

  const canvasUsage = $derived(
    [
      '<Range',
      '  label="volume"',
      '  bind:value',
      `  min={${canvasMin}}`,
      `  max={${canvasMax}}`,
      `  step={${canvasStep}}`,
      canvasTicks ? '  ticks' : [],
      '/>',
    ]
      .flat()
      .join('\n'),
  );

  // stable named resolver: the usage file tracks live playground state
  const resolveRangeUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? canvasUsage : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/range/range.svelte', content: rangeSource },
    { name: 'registry/files/ui/range/range.css', content: rangeCssSource },
    { name: 'src/lib/ui/range-usage.svelte', content: rangeUsage },
  ];
</script>

<svelte:head>
  <title>Range · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai range component: a REAL input[type=range] as the base — the platform owns pointer, keyboard, RTL, label[for] and form submission; the registry surface adds the label row, step-precision readout, tick ruler, and the family error law, painted with the jx-pure range recipe (one visual law, two mounting surfaces)."
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
      title="range — the native slider, semantic surface"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">real input[type=range]</span>
        <span class="pill">platform keyboard + pointer</span>
        <span class="pill">label[for] binding</span>
        <span class="pill">ticks: click-to-snap + wheel</span>
        <span class="pill">jx-pure paint, same law</span>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas (site-polish F10): the standard opening — live demo + PLAYGROUND -->
  <div data-reveal="">
    <ComponentCanvas
      title="range"
      description="A real input[type=range] underneath — drag, tap-to-jump, ←→/↑↓/Home/End/PageUp/Down and RTL are the engine's own, engine-tested; the component carries the paint, the label row, the readout and the error law. With ticks on, the ruler rides the thumb's travel box: click a mark to snap to it, wheel the slider to fine-tune one step per notch."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/range/range.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetRangeCanvas}
      output={[{ label: 'value', value: canvasValue }]}
      resolveFileContent={resolveRangeUsage}
    >
      <div class="flex w-full max-w-xs flex-col gap-3">
        <Range
          label="volume"
          bind:value={canvasValue}
          min={canvasMin}
          max={canvasMax}
          step={canvasStep}
          ticks={canvasTicks}
        />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="min">
            <PlayNumber bind:value={canvasMin} />
          </PlayRow>
          <PlayRow label="max">
            <PlayNumber bind:value={canvasMax} />
          </PlayRow>
          <PlayRow label="step">
            <PlayNumber bind:value={canvasStep} />
          </PlayRow>
          <PlayRow label="ticks">
            <PlayToggle bind:value={canvasTicks} />
          </PlayRow>
          <PlayHelp>
            the input owns the interaction: drag, tap-to-jump, ←→/↑↓ step, Home/End jump,
            PageUp/PageDown stride. Decimal steps snap at the step's precision. The tick
            ruler insets to the thumb's travel: click a mark to snap. The wheel counts
            detents — every detent = one input-step × the axis multiplier — and never
            scrolls the page. The surface is declarative (touch-action grammar):
            wheel="y" / wheel="x" pick an axis, {'{ y: 0.2 }'} makes five detents per
            input-step, wheel={'{false}'} disables.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- slider catalogue -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="range"
      title="Native base — the platform contract, for free"
      summary="A real input[type=range] is the control: pointer behavior, the full keyboard contract (←→/↑↓ step, Home/End jump, PageUp/PageDown stride), RTL mirroring, the label[for] binding and form submission are the ENGINE's own — nothing hand-held, nothing simulated. The registry surface adds what the bare element cannot: the label row with live readout, the tick ruler (one 4px mark per snap point as a repeating gradient, inset to the thumb's travel box — half a thumb per side — with the explicit end tick at 100%; click a mark to snap to it, wheel the slider for one-step fine-tuning), the family error law, and the jx-pure range paint (groove track, ringed disc thumb, primary fill) GENERATED onto the component's own hook from the same css-law — one visual law, machine-projected mounting surfaces."
    >
      <div class="flex flex-col gap-5">
        <div class="grid gap-5 min-[760px]:grid-cols-3">
          <div class="flex flex-col gap-3">
            <Range label="volume" bind:value={volume} min={0} max={100} />
            <span class="text-muted-foreground text-[12.5px]">
              drag · tap-to-jump · value: <code class="text-accent">{volume}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <Range label="gain (ticks)" bind:value={gain} min={0} max={10} step={0.5} ticks />
            <span class="text-muted-foreground text-[12.5px]">
              step 0.5 · click a mark to snap · value: <code class="text-accent">{gain}</code>
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
          <code class="text-accent">step</code>, Home/End jump to the bounds, PageUp/PageDown
          stride — all the platform's own range behavior, plus its native form semantics
          (<code class="text-accent">name=</code> submits the numeric string through the
          input's own FormData lane). The mirrored layout below costs the component nothing:
          the engine draws RTL itself.
        </p>
        <div class="border-border mt-1 border-t pt-5">
          <h3 class="text-[15px] font-bold tracking-tight">RTL + error wiring</h3>
          <div class="mt-4 grid gap-5 min-[760px]:grid-cols-2">
            <div dir="rtl" class="flex flex-col gap-4 border-border border p-4">
              <Range label="volume (rtl)" bind:value={volumeRtl} min={0} max={100} />
              <Range label="gain (rtl, ticks)" bind:value={gain} min={0} max={10} step={0.5} ticks />
              <span class="text-muted-foreground text-[12px]">
                fill grows from the right (the law's :dir(rtl) fill mirror), ticks mirror, arrow
                keys flip — the platform's own RTL
              </span>
            </div>
            <div class="flex flex-col gap-4">
              <Range label="volume" error="volume is required" min={0} max={100} />
              <p class="text-muted-foreground text-pretty text-[13px] leading-6">
                The <code class="text-accent">error</code> prop is the family law on the native
                control too: <code class="text-accent">aria-invalid</code> +
                <code class="text-accent">aria-describedby</code> ride the input, the readout
                takes the destructive mark, and the thumb border dashes — the monochrome
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
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Range variants" summary="Use a plain slider for continuous input, add steps and ticks when values are discrete, or flip the axis — vertical rides the platform's own vertical face with min at the physical bottom."><div class="grid gap-4 sm:grid-cols-3"><div class="border border-border p-4"><Range label="continuous" value={40} /></div><div class="border border-border p-4"><Range label="stepped" value={4} min={0} max={10} step={1} /></div><div class="border border-border p-4"><Range label="with ticks" value={50} ticks /></div><div class="border border-border p-4"><Range label="ruler (1/5/10)" bind:value={rulerValue} min={0} max={100} step={1}>{#snippet ticks()}<RangeTick scale={1} /><RangeTick scale={5} /><RangeTick scale={10} />{/snippet}</Range><span class="text-muted-foreground text-[12px]">click a mark to snap · wheel = one detent</span></div><div class="border border-border flex items-center justify-center p-4"><Range label="vertical fader" orientation="vertical" value={30} ticks min={0} max={10} step={1} /></div></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Bind the numeric value; min, max, step, ticks, and RTL all remain explicit props."><CodeBlock code={rangeUsage} lang="svelte" meta="Range usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The native input IS the slider: the platform's implicit semantics and keyboard contract, named by a real label[for]."><A11yTable keys={[{ key: 'Arrow keys', action: 'Change by step' }, { key: 'Home / End', action: 'Jump to min / max' }, { key: 'Page Up / Down', action: 'Change by a larger step when supported' }, { key: 'Wheel (hover)', action: 'Fine-tune by detent — every detent = one input-step × the axis multiplier; declarative in the touch-action grammar: wheel is true/\u2018xy\u2019 (default) | \u2018y\u2019 | \u2018x\u2019 | false/\u2018none\u2019 | { x, y }. Owned gestures are swallowed and never scroll the page; ctrlKey pinch-zoom is never captured; disabled sliders ignore it.' }, { key: 'Click a tick', action: 'Snap to that mark (pointer-only convenience; the ruler stays aria-hidden — the step semantics live on the input, whose arrows refine from the snapped value).' }, { key: 'Form reset', action: 'The platform restores the input; the component re-syncs the bound value, the readout and aria-valuetext (a reset fires no input events by itself).' }]} aria={[{ name: 'input[type=range]', value: 'implicit slider', description: 'The platform semantics: value/min/max/step are native truth; no roles to maintain.' }, { name: 'label[for]', value: 'the field id', description: 'A REAL label binds to the labelable input (a div never could).' }, { name: 'aria-valuetext', value: 'step-precision readout', description: 'The formatted value for assistive tech (decimal steps); follows form resets too.' }, { name: '.jx-slider-ticks', value: 'aria-hidden', description: 'The tick ruler rides the thumb\u2019s travel box (half a thumb inset per side); a visual aid that also snaps on click — the step semantics stay on the input itself.' }] } /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The slider's geometry chain derives from its own size container (container-type: size): the thumb is the input's full height, the track and the ring are fractions of it — every internal proportion scales as one unit when the height lane changes."><div class="flex flex-col gap-5"><DensityDemo><Range label="density sample" value={50} /></DensityDemo><TokenTable tokens={[{ name: '--jx-range-thumb', default: '100cqh', source: 'component' }, { name: '--jx-range-track', default: 'calc(100cqh / 2.5)', source: 'component' }, { name: '--jx-range-ring', default: 'calc(100cqh / 8)', source: 'component' }, { name: '--jx-slider-fill-color', default: 'var(--primary)', source: 'component' }, { name: '--jx-tick-step', default: 'runtime step percentage (step / (max − min) × 100)', source: 'component' }, { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' }, { name: '--jx-icon', default: '16 / 18 / 20 / 24px', source: 'density' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props define the numeric model, naming, visual options, and the error law; form lifecycle is native."><PropsTable props={[{ name: 'value', type: 'number', default: '0', description: 'Bindable committed value; external writes snap into [min, max] on the step.', bindable: true }, { name: 'min', type: 'number', default: '0', description: 'Lower bound (native).' }, { name: 'max', type: 'number', default: '100', description: 'Upper bound (native).' }, { name: 'step', type: 'number', default: '1', description: 'Increment for pointer and keyboard (native); step <= 0 or non-finite falls back to the platform default (1).' }, { name: 'name', type: 'string', description: 'Form field name — the input submits its numeric string itself.' }, { name: 'ticks', type: 'boolean | snippet', default: 'false', description: 'The tick ruler: true draws one default RangeTick per step (inset to the thumb\u2019s travel); a ticks snippet composes RangeTick scales — marks at scale × step periods, lengths grading ascending by value. Clicking a mark snaps the value.' }, { name: 'wheel', type: 'boolean | \u2018x\u2019 | \u2018y\u2019 | \u2018xy\u2019 | \u2018none\u2019 | { x?, y? }', default: 'true', description: 'The wheel fine-tune surface, declarative in the touch-action axis grammar: each axis is false (off), true (one input-step per detent) or a multiplier (0.2 → five detents per input-step). Owned gestures are swallowed and default-prevented; ctrlKey pinch-zoom is never captured.' }, { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Vertical rides the platform\u2019s vertical face (writing-mode + orient): min at the physical bottom, the ruler maps bottom-up on the block axis, height defaults to --jx-range-length (10rem).' }, { name: 'showValue', type: 'boolean', default: 'true', description: 'Shows the current value readout.' }, { name: 'error', type: 'string', default: '—', description: 'Adds invalid state and message.' }, { name: 'disabled', type: 'boolean', default: 'false', description: 'The platform disabled semantics (pointer, keyboard, form).' }, { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' }]} /></SectionCard></div>
</div>
