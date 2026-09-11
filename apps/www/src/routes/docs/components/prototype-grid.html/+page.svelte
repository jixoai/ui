<!--
  Docs page for prototype-grid (layout-family-alpha, 2026-09-11).
  Intents:
  1. Alpha-track hero: the standardized grid primitive — the
     blowout-proof numeric track form ruled by design-studio-r2
     (the cross-branch prototype-canvas precedent).
  2. One live canvas: cols/rows/areas/gap through real props.
  3. Usage + API (the 1:1 CSS mapping table) + see-also.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PrototypeGrid from '$lib/ui/prototype-grid/prototype-grid.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import gridSource from '$lib/ui/prototype-grid/prototype-grid.svelte?raw';

  const usage = `<PrototypeGrid cols={3} gap={12}>
  <span>a</span>
  <span>b</span>
  <span>c</span>
</PrototypeGrid>

<!-- number tracks take the blowout-proof form: repeat(N, minmax(0, 1fr));
     strings pass verbatim (auto-fit lives only inside repeat()); areas is
     a verbatim template string -->
<PrototypeGrid cols="repeat(auto-fit, 14rem)" areas='"head head" "side main"' gap="1rem" />`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/prototype-grid/prototype-grid.svelte', content: gridSource },
    { name: 'src/lib/ui/prototype-grid-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Prototype grid · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai prototype-grid: the alpha-track layout family's standardized grid primitive — numeric tracks become repeat(N, minmax(0,1fr)), strings and areas pass verbatim, inline style only, zero dependencies, single root with full attribute passthrough."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout · alpha"
        title="prototype-grid — the standardized grid"
        summary="The layout family, alpha track: the design studio's property panel edits these exact props. Numeric cols/rows become the blowout-proof repeat(N, minmax(0, 1fr)) track form (the css-architecture grid-law vocabulary); strings and areas pass through verbatim. Inline style only — zero Tailwind, zero tokens, zero dependencies — any host. Single root + rest spread: the stamp mechanism's family precondition."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">alpha track</span>
          <span class="pill">repeat(N, minmax(0, 1fr))</span>
          <span class="pill">single root + rest spread</span>
          <span class="pill">zero dependencies</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="prototype-grid" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Omitted props inject no declaration — implicit rows stay content-sized, exactly as CSS grid's own initial state."
      >
        <CodeBlock code={usage} lang="svelte" meta="PrototypeGrid usage" />
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="prototype-grid"
        description="cols 3 × rows 2 with a gap: the numeric track coercion lands as repeat(3, minmax(0, 1fr)) / repeat(2, minmax(0, 1fr))."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/prototype-grid/prototype-grid.svelte"
        {files}
      >
        <PrototypeGrid cols={3} rows={2} gap={12} data-testid="grid-demo">
          {#each ['one', 'two', 'three', 'four', 'five', 'six'] as word}
            <span class="border-border bg-card border px-3 py-1.5 text-center font-mono text-[13px]">{word}</span>
          {/each}
        </PrototypeGrid>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              numeric tracks land as repeat(N, minmax(0, 1fr)) — the blowout-proof
              form; strings and areas pass verbatim. Omitted props inject nothing.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="The one vocabulary coercion: number → repeat(N, minmax(0, 1fr)) — strings stay verbatim. Everything else rides through as native div attributes."
    >
      <PropsTable
        props={[
          { name: 'cols', type: 'number | string', default: '—', description: 'grid-template-columns: number → repeat(N, minmax(0, 1fr)) (the no-max-content-blowout form); string verbatim (named/hybrid tracks).' },
          { name: 'rows', type: 'number | string', default: '—', description: 'grid-template-rows, same two forms as cols. Omitted → implicit content-sized rows.' },
          { name: 'gap', type: 'number | string', default: '—', description: 'gap: number → px, string verbatim.' },
          { name: 'areas', type: 'string', default: '—', description: 'grid-template-areas, verbatim — a single template string (\'"head head" "side main"\').' },
          { name: 'class', type: 'string', default: '—', description: 'Passed through verbatim — the component owns no class of its own.' },
          { name: '...rest', type: 'HTMLAttributes<HTMLDivElement>', default: 'spread', description: 'Every other attribute lands on the single root (stamped data-jx-prototype-grid after the spread — replace, never merge).' },
        ]}
      />
    </SectionCard>
  </div>
  <div data-reveal="">
    <DocsSeeAlso name="prototype-grid" />
  </div>
</div>
