<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Timeline from '$lib/ui/timeline.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import timelineSource from '$lib/ui/timeline.svelte?raw';

  const items = [
    { title: 'pushed', time: '07:02', datetime: '2026-08-22T07:02:00Z' },
    { title: 'checks passed', time: '07:03' },
    { title: 'deploying', pending: true },
  ];

  const close = '</' + 'script>';

  const usage = `<Timeline items={[
  { title: 'pushed', time: '07:02', datetime: '2026-08-22T07:02:00Z' },
  { title: 'deploying', pending: true },
]} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/timeline.svelte', content: timelineSource },
    { name: 'src/lib/ui/timeline-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
  const tocSections = [{ id: 'timeline-base', label: 'usage' }];
</script>

<svelte:head>
  <title>Timeline · jixoai-ui</title>
  <meta name="description" content="An ol of timestamped entries with a CSS spine and dot markers — order is the chronology, the spine is decoration. pending renders the hollow dot. Zero JS." />
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
      <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="timeline — the activity spine" summary="An ol of timestamped entries with a CSS spine and dot markers — order is the chronology, the spine is decoration. pending renders the hollow dot. Zero JS.">
        <div class="flex flex-wrap gap-3">
          <span class="pill">ol · order is chronology</span>
          <span class="pill">CSS spine · dot markers</span>
          <span class="pill">pending hollow dot</span>
          <span class="pill">zero JS</span>
        </div>
      </SectionCard>
    </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="timeline"
      description="timeline — the activity spine"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/timeline.svelte"
      files={canvasFiles}
    >
      <div class="w-full max-w-md">
        <Timeline {items}>
          {#snippet body(item, index)}
            {#if index === 0}
              <p class="text-[12.5px] text-muted-foreground">12 checks · 0 failed · 8.2s</p>
            {/if}
          {/snippet}
        </Timeline>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          time renders as a machine-readable time element when datetime is given; the body snippet composes per-entry detail lines.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="timeline-base" data-reveal="" use:reveal>
    <SectionCard family="timeline-base" headerRegion="timeline-base" eyebrow="law" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
