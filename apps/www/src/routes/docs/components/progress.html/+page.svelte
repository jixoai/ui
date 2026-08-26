<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import Progress from '$lib/ui/progress/progress.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlayRange, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import progressSource from '$lib/ui/progress/progress.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Progress from '@ui/progress.svelte';
${close}

<Progress value={0.42} label="sync" />      <!-- 42% -->
<Progress value={done} max={total} />       <!-- your scale -->
<Progress />                                <!-- indeterminate: activity, not progress -->`;

  const canvasUsage = `<Progress {value} label="deploy" />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/progress.svelte', content: progressSource },
    { name: 'src/lib/ui/progress-usage.svelte', content: canvasUsage },
  ];

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { value: 0.42 };
  let value = $state(canvasInitial.value);
  function resetCanvas(): void {
    value = canvasInitial.value;
  }

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Progress · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai progress: the native <progress> element — role, value semantics and the indeterminate state are the browser's — with the jixoai paint and an optional label + polite % readout."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="progress — the element, painted"
      summary="W3C-first: progress IS the native <progress> element. Role, value semantics, min/max mapping and the indeterminate state all belong to the browser. The component adds only the jixoai paint — 1px frame, brand fill, a terminal stripe sweep for the indeterminate run — and an optional label with a polite % readout."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">native &lt;progress&gt;</span>
        <span class="pill">indeterminate built-in</span>
        <span class="pill">polite % readout</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="progress"
      stage="center"
      description="A determinate bar driven live from the playground, and an indeterminate one below — same element, no value attribute."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/progress.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      output={[{ label: 'value', value: `${Math.round(value * 100)}%` }]}
    >
      <div class="flex w-full max-w-md flex-col gap-6">
        <Progress {value} label="deploy" />
        <Progress label="connecting" />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="value">
            <PlayRange bind:value min={0} max={1} step={0.01} />
          </PlayRow>
          <PlayHelp>
            omit <code>value</code> for the indeterminate bar — the honest state when you know
            something is happening but not how much. The % readout is <code>role=status</code>:
            polite, announced when the reader is idle.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="progress-base" data-reveal="">
    <SectionCard
      family="progress-base"
      headerRegion="progress-base"
      eyebrow="W3C foundation"
      title="What the platform gives"
      summary="The element exposes aria-valuenow/min/max natively (indeterminate simply omits valuenow), renders fallback content for ancient engines, and needs no ARIA wiring from us. The paint resets both engines' ::-progress pseudo-elements so WebKit and Gecko draw the same bar."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Two states, one element: determinate maps a 0..max scale; omitted value means indeterminate.">
    <div class="flex flex-wrap items-start gap-6">
      <div class="flex min-w-56 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">determinate</span><Progress value={0.42} label="sync" /><span class="text-muted-foreground text-[12.5px]">value present — a real 0..max position with a % readout</span></div>
      <div class="flex min-w-56 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">indeterminate</span><Progress label="connecting" /><span class="text-muted-foreground text-[12.5px]">value omitted — activity, not progress (terminal stripe sweep)</span></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Pass a 0..max value, or omit it for the honest 'something is happening' state."><CodeBlock code={usage} lang="svelte" meta="Progress usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The native element already exposes value semantics; the component adds only a polite % readout."><A11yTable keys={[]} aria={[{ name: 'aria-valuenow / min / max', value: 'native', description: 'Exposed by the <progress> element itself; indeterminate simply omits valuenow' }, { name: 'aria-label', value: 'label ?? "progress"', description: 'Names the bar when no visible label is given' }, { name: 'role: status', value: 'on the % readout', description: 'Polite live region — announced when the reader is idle' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="The paint resets both engines' ::-progress pseudo-elements and draws from theme colors — no jx density tokens of its own."><div class="flex flex-col gap-6"><DensityDemo><Progress value={0.42} label="sync" /></DensityDemo><TokenTable tokens={[{ name: 'brand fill', default: '--primary', source: 'color', description: 'The determinate bar fill' }, { name: '1px frame', default: 'border-border', source: 'color' }, { name: 'stripe sweep', default: 'indeterminate run', source: 'component', description: 'Terminal stripe animation when value is omitted' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the Progress Props interface — the rest of the element's attributes ride through natively."><PropsTable props={[{ name: 'value', type: 'number', default: '—', description: '0..max; omitted ⇒ indeterminate ("activity", not "progress").' }, { name: 'max', type: 'number', default: '1', description: "The element's own spec default." }, { name: 'label', type: 'string', default: '—', description: 'Visible label above the bar (also names the element).' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough to the root.' }]} /></SectionCard></div>
</div>
