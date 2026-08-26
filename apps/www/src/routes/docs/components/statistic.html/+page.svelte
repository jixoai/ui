<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import Statistic from '$lib/ui/statistic/statistic.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import statisticSource from '$lib/ui/statistic/statistic.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<Statistic title="deploys / week" value="42" trend="up" />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/statistic.svelte', content: statisticSource },
    { name: 'src/lib/ui/statistic-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Statistic · jixoai-ui</title>
  <meta name="description" content="Micro-label over a big tabular-nums value with prefix/suffix snippets and text-glyph trends. The component never guesses what good means for your metric — you compose it." />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="statistic — the metric readout" summary="Micro-label over a big tabular-nums value with prefix/suffix snippets and text-glyph trends. The component never guesses what good means for your metric — you compose it.">
        <div class="flex flex-wrap gap-3">
          <span class="pill">tabular-nums value</span>
          <span class="pill">prefix/suffix snippets</span>
          <span class="pill">text-glyph trends</span>
        </div>
      </SectionCard>
    </div>

  <div data-reveal="">
    <ComponentCanvas
      title="statistic"
      description="statistic — the metric readout"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/statistic.svelte"
      files={canvasFiles}
      stage="fill"
    >
      <div class="grid gap-6 min-[560px]:grid-cols-3">
        <Statistic title="deploys / week" value="42" trend="up" />
        <Statistic title="failed builds" value="3" trend="down" />
        <Statistic title="registry items" value="69" />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            up paints the up-triangle through the brand voice, down the down-triangle destructive —
            if down is GOOD for your metric (cost, latency), compose your own glyphs through the
            snippets.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="statistic-base" data-reveal="">
    <SectionCard family="statistic-base" headerRegion="statistic-base" eyebrow="law" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Metric states" summary="The readout supports neutral metrics, directional trends and composed affixes."><div class="grid gap-4 sm:grid-cols-3"><Statistic title="neutral" value="69" /><Statistic title="up" value="42" trend="up" /><Statistic title="down" value="3" trend="down" /></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard eyebrow="usage" title="Usage"><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'title', value: 'visible label', description: 'Names the metric for every reader.' }, { name: 'value', value: 'text content', description: 'Keeps formatted values readable and copyable.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Statistic title="deploys" value="42" trend="up" /></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-stack', default: 'density scale', source: 'density' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Statistic props"><PropsTable props={[{ name: 'title', type: 'string', description: 'Metric label.', required: true }, { name: 'value', type: 'string | number', description: 'Displayed metric value.', required: true }, { name: 'trend', type: "'up' | 'down'", description: 'Optional directional glyph.' }, { name: 'prefix', type: 'Snippet', description: 'Content before the value.' }, { name: 'suffix', type: 'Snippet', description: 'Content after the value.' }, { name: 'density', type: 'Density', description: 'Overrides inherited density.' }]} /></SectionCard></div>
  </div>
</div>
