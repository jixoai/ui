<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Descriptions from '$lib/ui/descriptions.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import descriptionsSource from '$lib/ui/descriptions.svelte?raw';

  const items = [
    { term: 'build', value: '4f2a' },
    { term: 'checks', value: '12' },
    { term: 'owner', value: '@gaubee' },
    { term: 'license', value: 'MIT' },
  ];

  const close = '</' + 'script>';

  const usage = `<Descriptions columns={2} bordered items={[
  { term: 'build', value: '4f2a' },
  { term: 'owner', value: '@gaubee' },
]} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/descriptions.svelte', content: descriptionsSource },
    { name: 'src/lib/ui/descriptions-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
  const tocSections = [{ id: 'descriptions-base', label: 'usage' }];
</script>

<svelte:head>
  <title>Descriptions · jixoai-ui</title>
  <meta name="description" content="The enterprise detail view, W3C-first: a dl IS a description list — dt/dd pairs in a grid of term/value cells. The bordered look is CSS on the same dl, never a table in disguise. Columns respond via container queries; missing values render the em dash." />
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
      <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="descriptions — a dl, never a table" summary="The enterprise detail view, W3C-first: a dl IS a description list — dt/dd pairs in a grid of term/value cells. The bordered look is CSS on the same dl, never a table in disguise.">
      <div class="flex flex-wrap gap-3">
        <span class="pill">dl · never a table</span>
        <span class="pill">columns via container query</span>
        <span class="pill">bordered hairline frame</span>
        <span class="pill">missing value → em dash</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="descriptions"
      description="descriptions — a dl, never a table"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/descriptions.svelte"
      files={canvasFiles}
      stage="stretch"
    >
      <div class="w-full max-w-2xl">
        <Descriptions columns={2} bordered {items} />
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          columns=2 pairs per row (responsive down to 1 via container query); bordered adds the hairline frame on the SAME dl. Missing values render the em dash, never blank cells.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="descriptions-base" data-reveal="" use:reveal>
    <SectionCard family="descriptions-base" headerRegion="descriptions-base" eyebrow="law" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
