<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Statistic from '$lib/ui/statistic.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import statisticSource from '$lib/ui/statistic.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<Statistic title="deploys / week" value="42" trend="up" />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/statistic.svelte', content: statisticSource },
  ];
</script>

<svelte:head>
  <title>Statistic · jixoai-ui</title>
  <meta name="description" content="Micro-label over a big tabular-nums value with prefix/suffix snippets and text-glyph trends. The component never guesses what good means for your metric — you c" />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="statistic — the metric readout" summary="Micro-label over a big tabular-nums value with prefix/suffix snippets and text-glyph trends. The component never guesses what good means for your metric — you compose it.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase</span></div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="statistic"
      description="statistic — the metric readout"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/statistic.svelte"
      files={canvasFiles}
    >
      <div class="grid gap-6 min-[560px]:grid-cols-3">
        <Statistic title="deploys / week" value="42" trend="up" />
        <Statistic title="failed builds" value="3" trend="down" />
        <Statistic title="registry items" value="69" />
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          up paints the up-triangle through the brand voice, down the down-triangle destructive — if down is GOOD for your metric (cost, latency), compose your own glyphs through the snippets.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard headerRegion="statistic-base" eyebrow="antd 裁决" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
</div>
