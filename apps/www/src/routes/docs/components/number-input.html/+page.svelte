<!--
  number-input — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the workbench canvas + the
  [- NUM +] stepper catalogue (incl. the RTL geometry demo). The
  form.html route remains as the family hub.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import NumberInput from '$lib/ui/number-input/number-input.svelte';
  import Range from '$lib/ui/range/range.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { CATALOG } from '$lib/catalog';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

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
        <div class="jx-play-fields">
          <div class="jx-play-field">
            <Range label="drive the value" bind:value={canvasWorkers} min={1} max={16} />
          </div>
          <p class="jx-play-help">
            the slider and the stepper share one binding — drag one, watch the other; Tab into the
            input and ↑/↓ step natively.
          </p>
        </div>
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
