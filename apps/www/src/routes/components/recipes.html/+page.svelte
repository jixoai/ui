<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import { reveal } from '$lib/reveal';

  const aspect = `<!-- the platform owns it: aspect-ratio is a CSS property -->
<img src="/shot.png" alt="build output" style="aspect-ratio: 16 / 9; width: 100%; object-fit: cover" />

<!-- or the frame pattern for lazy media -->
<div style="aspect-ratio: 16 / 9; width: 100%">
  <iframe … title="demo" style="width: 100%; height: 100%"></iframe>
</div>`;

  const dataTable = `<!-- data-table is a COMPOSITION, not a component: table.svelte gives
     the semantics; your state layer gives sorting/selection -->
<script lang="ts">
  // e.g. with TanStack Table (or any state layer): compute the rows,
  // render <Table> with real th[aria-sort] buttons
${'</' + 'script'}
<Table>
  {#snippet head()}
    <th aria-sort={sort.dir === 'asc' ? 'ascending' : 'descending'}>
      <button type="button" onclick={() => sort.toggle('name')}>name ↕</button>
    </th>
  {/snippet}
  {#snippet body()}
    {#each rows as row (row.id)} <tr><td>{row.name}</td></tr> {/each}
  {/snippet}
</Table>`;

  const chart = `<!-- v1 recipe: semantic table + CSS bars — zero JS, screen-reader-first -->
<table>
  <caption>bundle size by page (KB)</caption>
  <tbody>
    {#each pages as p (p.name)}
      <tr><th scope="row">{p.name}</th>
          <td><div style="width: {p.kb / max * 100}%" class="bar"></div> {p.kb}</td></tr>
    {/each}
  </tbody>
</table>
<style>.bar { height: 10px; background: var(--primary); }</style>

<!-- richer charting (lines/axes/legends) is a future SVG-primitive
     registry:lib, not a wrapper around a chart library -->`;

  const sidebar = `<!-- sidebar = sheet + your nav, not a 40-file framework -->
<Sheet bind:open title="Contents" side="left" size="18rem">
  {#each sections as s (s.id)}
    <a class="side-link" href="#{s.id}" aria-current={s.id === active ? 'page' : undefined}
      onclick={() => (open = false)}>{s.label}</a>
  {/each}
</Sheet>`;
</script>

<svelte:head>
  <title>Recipes · jixoai-ui</title>
  <meta
    name="description"
    content="The deliberate non-components: aspect-ratio, data-table, chart, and sidebar as documented composition recipes — the batch-4 design ruling on where wrapping stops."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="设计裁决 · recipes"
      title="where wrapping stops"
      summary="Four shadcn items are deliberately NOT components here — each ruling from the batch-4 design review: the platform already owns it (aspect-ratio), composition IS the product (data-table, sidebar), or the honest surface is a semantic table (chart until an SVG-primitive lib earns its place). The recipes below are the contract."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">aspect-ratio = CSS</span>
        <span class="pill">data-table = composition</span>
        <span class="pill">chart = semantic first</span>
        <span class="pill">sidebar = sheet + nav</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard headerRegion="recipe-aspect" eyebrow="recipe" title="aspect-ratio — the platform owns it">
      <CodeBlock code={aspect} lang="svelte" meta="aspect-ratio" />
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard
      headerRegion="recipe-data-table"
      eyebrow="recipe"
      title="data-table — semantics from table.svelte, state from you"
      summary="A wrapper that decides your column model, pagination and selection state would be a framework in disguise. The recipe: your state layer (TanStack or plain Svelte) computes rows; table.svelte renders real thead/tbody with aria-sort headers."
    >
      <CodeBlock code={dataTable} lang="svelte" meta="data-table" />
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard
      headerRegion="recipe-chart"
      eyebrow="recipe"
      title="chart — semantic first, SVG primitives later"
      summary="Bars are a table row's width away — zero JS, screen-reader-first. Line/axis/legend charting deserves a real SVG-primitive registry:lib designed for it; wrapping a chart library would fight the terminal token system."
    >
      <CodeBlock code={chart} lang="svelte" meta="chart" />
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard
      headerRegion="recipe-sidebar"
      eyebrow="recipe"
      title="sidebar — sheet + your nav"
      summary="The 40-file sidebar framework is an app shell decision, not a component. The recipe: a left sheet, your links, aria-current from your router's truth."
    >
      <CodeBlock code={sidebar} lang="svelte" meta="sidebar" />
    </SectionCard>
  </div>
</div>
