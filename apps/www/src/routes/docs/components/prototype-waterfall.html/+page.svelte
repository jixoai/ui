<!--
  Docs page for prototype-waterfall (layout-family-alpha, 2026-09-11).
  Intents:
  1. Alpha-track hero: the standardized waterfall primitive — CSS
     multi-column, with its tradeoffs declared, not hidden.
  2. One live canvas: columns/gap/strategy through real props.
  3. Usage + API (the 1:1 CSS mapping table) + see-also.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PrototypeWaterfall from '$lib/ui/prototype-waterfall/prototype-waterfall.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import waterfallSource from '$lib/ui/prototype-waterfall/prototype-waterfall.svelte?raw';

  const usage = `<PrototypeWaterfall columns={3} gap={16} strategy="balanced">
  <article>…</article>
  <article>…</article>
  <article>…</article>
</PrototypeWaterfall>

<!-- columns rides the CSS shorthand verbatim: a length string gives
     auto-width columns; break-inside stays the consumer's call -->
<PrototypeWaterfall columns="14rem" gap="1rem">
  {#each items as item}
    <article style="break-inside: avoid">…</article>
  {/each}
</PrototypeWaterfall>`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/prototype-waterfall/prototype-waterfall.svelte', content: waterfallSource },
    { name: 'src/lib/ui/prototype-waterfall-usage.svelte', content: usage },
  ];

  const heights = [64, 96, 48, 80, 56, 104];
</script>

<svelte:head>
  <title>Prototype waterfall · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai prototype-waterfall: the alpha-track layout family's standardized waterfall primitive — CSS multi-column with the columns shorthand passed verbatim, strategy balanced (column-fill: balance), tradeoffs declared: newspaper column order, break-inside stays the consumer's call."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout · alpha"
        title="prototype-waterfall — the standardized masonry column"
        summary="The layout family, alpha track: the design studio's property panel edits these exact props. The engine is CSS multi-column — strategy 'balanced' (v0's only member) is column-fill: balance, the browser-equalized column heights. The tradeoffs are declared, not hidden: children flow in newspaper column order (not shortest-column-first), and break-inside stays the consumer's call. Inline style only — zero Tailwind, zero tokens, zero dependencies — any host. Single root + rest spread: the stamp mechanism's family precondition."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">alpha track</span>
          <span class="pill">CSS multi-column</span>
          <span class="pill">strategy: balanced</span>
          <span class="pill">single root + rest spread</span>
          <span class="pill">zero dependencies</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="prototype-waterfall" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Columns as a number (count) or a length string (auto-width); omitted props inject no declaration."
      >
        <CodeBlock code={usage} lang="svelte" meta="PrototypeWaterfall usage" />
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="prototype-waterfall"
        description="columns 3, gap 16px, strategy balanced — six blocks of varying heights equalize across the columns (the demo blocks set their own break-inside: the consumer's call, by law)."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/prototype-waterfall/prototype-waterfall.svelte"
        {files}
      >
        <PrototypeWaterfall columns={3} gap={16} strategy="balanced" data-testid="waterfall-demo">
          {#each heights as h, i}
            <div
              class="border-border bg-card mb-4 flex items-center justify-center border font-mono text-[13px]"
              style="block-size: {h}px; break-inside: avoid"
            >
              {i + 1}
            </div>
          {/each}
        </PrototypeWaterfall>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              CSS multi-column under the hood: children flow in newspaper column
              order and the demo blocks set their own break-inside — the
              consumer's call, by law.
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
      summary="columns rides the CSS columns shorthand verbatim — number is the count form, a length string is the auto-width form. Everything else rides through as native div attributes."
    >
      <PropsTable
        props={[
          { name: 'columns', type: 'number | string', default: '—', description: 'The CSS columns shorthand, verbatim: number = the count form (columns: 3); a length string = the auto-width form (columns: 14rem).' },
          { name: 'gap', type: 'number | string', default: '—', description: 'column-gap: number → px, string verbatim.' },
          { name: 'strategy', type: "'balanced'", default: '—', description: "v0's only member: column-fill: balance (browser-equalized column heights). A future 'ordered' (JS-measured shortest-column placement) extends the union non-breakingly." },
          { name: 'class', type: 'string', default: '—', description: 'Passed through verbatim — the component owns no class of its own.' },
          { name: '...rest', type: 'HTMLAttributes<HTMLDivElement>', default: 'spread', description: 'Every other attribute lands on the single root (stamped data-jx-prototype-waterfall after the spread — replace, never merge).' },
        ]}
      />
    </SectionCard>
  </div>
  <div data-reveal="">
    <DocsSeeAlso name="prototype-waterfall" />
  </div>
</div>
