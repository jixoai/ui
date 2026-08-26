<!--
  number-input — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the workbench canvas + the
  [- NUM +] stepper catalogue (incl. the RTL geometry demo). The
  form.html route remains as the family hub.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import NumberInput from '$lib/ui/number-input/number-input.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlayRange, PlayHelp } from '$lib/playground';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'number-input')?.summary;
  if (!heroSummary) throw new Error('catalog entry "number-input" is missing — registry.json meta drift');

  // Same-source law: the canvas drawer shows the exact registry copy this
  // site runs — one ?raw import (audit P1-A2).
  import numberInputSource from '$lib/ui/number-input/number-input.svelte?raw';

  // ToC outline: the demo sections, in page order. The engine pairs these
  // ids with the SectionCard data-family extents + header data-region
  // leaves rendered in this page.

  const numberUsage = `<!-- click steps once; hold accelerates (300ms → 100ms/step);
     typing commits on change and clamps into [min, max] -->
<NumberInput label="workers" bind:value={workers} min={1} max={16} />

<!-- decimal steps snap to the step's precision -->
<NumberInput label="timeout (s)" bind:value={timeout} min={0.5} max={5} step={0.5} />`;

  const numberInputFiles: TreeFile[] = [
    { name: 'registry/files/ui/number-input.svelte', content: numberInputSource },
    { name: 'src/lib/ui/number-input-usage.svelte', content: numberUsage },
  ];

  // ---- demo state -------------------------------------------------------------
  let workers = $state(4);
  let timeout = $state(1.5);
  let workersRtl = $state(2);

  // ---- canvas playground --------------------------------------------------------
  // Playground protocol: the page owns the snapshot + reset; the echo
  // footer replaces hand-written captions; the usage file tracks live state.
  const canvasInitial = { workers: 4 };
  let canvasWorkers = $state(canvasInitial.workers);

  function resetNumberCanvas(): void {
    canvasWorkers = canvasInitial.workers;
  }

  const numberUsageLive = $derived(`<NumberInput
  label="workers"
  min={1}
  max={16}
  bind:value
/>`);

  // stable named resolver: lazy read evaluated inside the canvas's
  // $derived — never a value snapshot
  const resolveNumberUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? numberUsageLive : file.content;
</script>

<svelte:head>
  <title>Number input · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai number-input component: the [- NUM +] stepper — click steps once and clamps into [min, max], hold accelerates 300ms → 100ms/step, typing commits on change. A segmented control, not a text-field fork; RTL-aware through logical properties only."
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
      title="number-input — the [- NUM +] stepper"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">click / hold / type</span>
        <span class="pill">min / max / step clamp</span>
        <span class="pill">hold acceleration</span>
        <span class="pill">rtl: logical properties only</span>
        <span class="pill">zero deps · Svelte 5 runes</span>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas (audit P1-A2) -->
  <div data-reveal="">
    <ComponentCanvas
      title="number-input"
      description="The [- NUM +] stepper: click steps once and clamps into [min, max], hold accelerates 300ms → 100ms/step, typing commits on change."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/number-input.svelte"
      files={numberInputFiles}
      stage="center"
      onreset={resetNumberCanvas}
      output={[
        { label: 'value', value: canvasWorkers },
        { label: 'range', value: '1…16' },
      ]}
      resolveFileContent={resolveNumberUsage}
    >
      <div class="flex w-full max-w-xs flex-col items-start gap-3">
        <NumberInput label="workers" bind:value={canvasWorkers} min={1} max={16} />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="drive the value">
            <PlayRange bind:value={canvasWorkers} min={1} max={16} />
          </PlayRow>
          <PlayHelp>
            the slider and the stepper share one binding — drag one, watch the other; Tab into the
            input and ↑/↓ step natively.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- stepper catalogue -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="number-input"
      title="A segmented control, not a text-field fork"
      summary="Two full-height 28px-wide stepper buttons (text glyphs in font-nav bold — no icon dependency) around a borderless, centered native number input whose spinners are hidden but whose ↑/↓ stepping survives. The row renders at the family's 40px law like every text-like control. Click steps once and clamps into [min, max]; hold accelerates — one step, 300ms, then a step every 100ms until you release. Typing is first-class: the value commits on change and clamps."
    >
      <div class="flex flex-col gap-5">
        <div class="grid gap-5 min-[760px]:grid-cols-3">
          <div class="flex flex-col gap-3">
            <NumberInput label="workers" bind:value={workers} min={1} max={16} />
            <span class="text-muted-foreground text-[12.5px]">
              min 1 · max 16 · value: <code class="text-accent">{workers}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <NumberInput label="timeout (s)" bind:value={timeout} min={0.5} max={5} step={0.5} placeholder="0.5" />
            <span class="text-muted-foreground text-[12.5px]">
              step 0.5 · decimal-safe · value: <code class="text-accent">{timeout}</code>
            </span>
          </div>
          <div class="flex flex-col gap-3">
            <NumberInput label="disabled" value={3} min={1} max={8} disabled />
            <span class="text-muted-foreground text-[12.5px]">
              buttons disable in lockstep · input readonly — frozen but readable
            </span>
          </div>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          The row is plain flex with logical properties only, so
          <code class="text-accent">dir="rtl"</code> flips it by itself — minus lands on the
          inline-end, plus on the inline-start, the same swap the select panel's primary edge
          performs. Tab into the input: ↑/↓ step with min/max/step read straight off the
          element — the native behavior, kept.
        </p>
        <div class="border-border mt-1 border-t pt-5">
          <h3 class="text-[15px] font-bold tracking-tight">RTL — geometry from logical properties</h3>
          <div class="mt-4 grid gap-5 min-[760px]:grid-cols-2">
            <div dir="rtl" class="flex flex-col gap-4 border-border border p-4">
              <NumberInput label="workers (rtl)" bind:value={workersRtl} min={1} max={16} />
              <span class="text-muted-foreground text-[12px]">
                dir="rtl" on the wrapper — the [- +] order flips without a physical property in
                sight
              </span>
            </div>
            <div class="flex flex-col justify-center gap-2 text-muted-foreground text-[13px] leading-6">
              <p class="text-pretty">
                Nothing in the component branches on direction: the stepper is a flex row in DOM
                order (minus, input, plus). The writing mode does the rest.
              </p>
            </div>
          </div>
        </div>
        <CodeBlock code={numberUsage} lang="svelte" meta="NumberInput usage" />
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
      title="NumberInput variants"
      summary="The integer stepper, the decimal-step stepper, the error state, and the disabled field."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="border border-border p-4"><NumberInput label="workers" value={4} min={1} max={16} /></div>
        <div class="border border-border p-4"><NumberInput label="timeout (s)" value={1.5} min={0.5} max={5} step={0.5} /></div>
        <div class="border border-border p-4"><NumberInput label="error" value={7} min={1} max={4} error="max 4 workers per pod" /></div>
        <div class="border border-border p-4"><NumberInput label="disabled" value={3} min={1} max={8} disabled /></div>
      </div>
    </SectionCard>
  </div>
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Bind the numeric value; min/max/step drive both the buttons and the native input's own stepping."
    >
      <CodeBlock code={numberUsage} lang="svelte" meta="NumberInput usage" />
    </SectionCard>
  </div>
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="The inner control is a real type=number input; the stepper buttons carry labels, and disabled keeps the value readable for assistive tech."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves focus to the centered number input' },
          { key: '↑ / ↓', action: 'Steps by the step increment, clamped into [min, max] — native input behavior' },
          { key: 'Enter / blur', action: 'Commits typed text; empty reverts to undefined, values clamp into range' },
          { key: 'hold − / +', action: 'Steps once, accelerates after 300ms to one step every 100ms' },
        ]}
        aria={[
          { name: 'aria-label', value: '"decrease" / "increase"', description: 'On the two stepper buttons (type="button")' },
          { name: 'aria-invalid', value: "'true'", description: 'On the input when the error prop is provided' },
          { name: 'aria-describedby', value: '{id}-error', description: 'Points at the "! message" validation line' },
          { name: 'readonly (disabled)', value: 'attribute', description: 'Disabled turns the input readonly, not disabled — the value stays focusable and readable' },
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
      summary="The shell row and the stepper buttons share the density hit token; resize the scope and the whole stepper follows."
    >
      <div class="flex flex-col gap-6">
        <DensityDemo>
          <NumberInput label="density sample" value={4} min={1} max={16} />
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: '--jx-hit', default: '44 / 44 / 44 / 48px', source: 'density' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' },
            { name: '--jx-stack', default: '4 / 4 / 8 / 8px', source: 'density' },
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
      summary="Props extend the native HTML input attributes; the entries below are the component-owned additions. Everything else (name, placeholder, autocomplete…) rides through restProps."
    >
      <PropsTable
        props={[
          { name: 'value', type: 'number', default: '—', description: 'Committed quantity; undefined renders empty.', bindable: true },
          { name: 'min', type: 'number', default: '—', description: 'Lower bound; stepping and the change-commit clamp into it.' },
          { name: 'max', type: 'number', default: '—', description: 'Upper bound; stepping and the change-commit clamp into it.' },
          { name: 'step', type: 'number', default: '1', description: 'Step increment; also the native input\u2019s step attribute.' },
          { name: 'label', type: 'string', default: '—', description: 'Field label rendered as label[for] above the control.' },
          { name: 'error', type: 'string', default: '—', description: 'Error text: sets aria-invalid, wires aria-describedby, dashes the shell.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the buttons in lockstep; the input turns readonly (still readable).' },
          { name: 'density', type: "'xs' | 'sm' | 'default' | 'lg'", default: 'inherited', description: 'Overrides the inherited density scope.' },
        ]}
      />
    </SectionCard>
  </div>
</div>
