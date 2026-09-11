<!--
  Docs page for prototype-flex (layout-family-alpha, 2026-09-11).
  Intents:
  1. Alpha-track hero: the standardized flex primitive — what alpha
     means here (stamp precondition, zero-dependency host).
  2. One live canvas: the prop vocabulary edited through real props.
  3. Usage + API (the honest 1:1 CSS mapping table) + see-also.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PrototypeFlex from '$lib/ui/prototype-flex/prototype-flex.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import flexSource from '$lib/ui/prototype-flex/prototype-flex.svelte?raw';

  const usage = `<PrototypeFlex gap={12} align="center">
  <span>first</span>
  <span>second</span>
  <span>third</span>
</PrototypeFlex>

<!-- every prop is a native CSS token, passed through 1:1 -->
<PrototypeFlex direction="column" justify="space-between" wrap="wrap" gap="0.75rem" />`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/prototype-flex/prototype-flex.svelte', content: flexSource },
    { name: 'src/lib/ui/prototype-flex-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Prototype flex · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai prototype-flex: the alpha-track layout family's standardized flex primitive — direction/wrap/align/justify/gap map to CSS 1:1, inline style only, zero dependencies, single root with full attribute passthrough."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout · alpha"
        title="prototype-flex — the standardized flex row"
        summary="The layout family, alpha track: the design studio's property panel edits these exact props. Every value is a native CSS token passed through 1:1 (no vocabulary mapping layer), styling is inline-style only — zero Tailwind, zero theme tokens, zero dependencies — so the item renders in any host. Single root + rest spread: the stamp mechanism's family precondition, proven here first."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">alpha track</span>
          <span class="pill">inline style only</span>
          <span class="pill">single root + rest spread</span>
          <span class="pill">zero dependencies</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="prototype-flex" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="One element, five optional props — omitted props inject no declaration; the CSS initial value serves."
      >
        <CodeBlock code={usage} lang="svelte" meta="PrototypeFlex usage" />
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="prototype-flex"
        description="The full vocabulary in one row: direction, wrap, align, justify, gap — every declared prop lands as an exact inline style."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/prototype-flex/prototype-flex.svelte"
        {files}
      >
        <PrototypeFlex gap={12} align="center" justify="space-between" data-testid="flex-demo">
          {#each ['alpha', 'beta', 'gamma'] as word}
            <span class="border-border bg-card border px-3 py-1.5 font-mono text-[13px]">{word}</span>
          {/each}
        </PrototypeFlex>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              five props, all optional, all native CSS tokens — an omitted prop
              injects no declaration; the browser's initial value serves. The
              studio property panel edits these exact props.
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
      summary="Props map to CSS 1:1 — the one type coercion: gap number → px. Everything else rides through as native div attributes."
    >
      <PropsTable
        props={[
          { name: 'direction', type: "'row' | 'row-reverse' | 'column' | 'column-reverse'", default: '—', description: 'flex-direction, verbatim. Omitted → no declaration (the CSS initial: row).' },
          { name: 'wrap', type: "'nowrap' | 'wrap' | 'wrap-reverse'", default: '—', description: 'flex-wrap, verbatim.' },
          { name: 'align', type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'", default: '—', description: 'align-items, verbatim (logical-axis Box Alignment spellings).' },
          { name: 'justify', type: "'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'", default: '—', description: 'justify-content, verbatim.' },
          { name: 'gap', type: 'number | string', default: '—', description: 'gap: number → px, string verbatim.' },
          { name: 'class', type: 'string', default: '—', description: 'Passed through verbatim — the component owns no class of its own.' },
          { name: '...rest', type: 'HTMLAttributes<HTMLDivElement>', default: 'spread', description: 'Every other attribute lands on the single root (stamped data-jx-prototype-flex after the spread — replace, never merge).' },
        ]}
      />
    </SectionCard>
  </div>
  <div data-reveal="">
    <DocsSeeAlso name="prototype-flex" />
  </div>
</div>
