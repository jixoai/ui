<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Progress from '$lib/ui/progress.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import progressSource from '$lib/ui/progress.svelte?raw';

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
  const tocSections = [{ id: 'progress-base', label: 'what the platform gives' }];
</script>

<svelte:head>
  <title>Progress · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai progress: the native <progress> element — role, value semantics and the indeterminate state are the browser's — with the jixoai paint and an optional label + polite % readout."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail: desktop sticky right column, mobile glass row (toc.css) -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
  <div data-reveal="" use:reveal>
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

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="progress"
      description="A determinate bar driven live from the playground, and an indeterminate one below — same element, no value attribute."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/progress.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[{ label: 'value', value: `${Math.round(value * 100)}%` }]}
    >
      <div class="flex w-full max-w-md flex-col gap-6">
        <Progress {value} label="deploy" />
        <Progress label="connecting" />
      </div>
      {#snippet playground()}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          bind:value
          aria-label="progress value"
          class="accent-[var(--primary)] w-full"
        />
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          omit <code class="text-accent">value</code> for the indeterminate bar — the honest state
          when you know something is happening but not how much. The % readout is
          <code class="text-accent">role=status</code>: polite, announced when the reader is idle.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="progress-base" data-reveal="" use:reveal>
    <SectionCard
      family="progress-base"
      headerRegion="progress-base"
      eyebrow="NativeHTML 基座"
      title="What the platform gives"
      summary="The element exposes aria-valuenow/min/max natively (indeterminate simply omits valuenow), renders fallback content for ancient engines, and needs no ARIA wiring from us. The paint resets both engines' ::-progress pseudo-elements so WebKit and Gecko draw the same bar."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
