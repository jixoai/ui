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

  // encodeURIComponent escapes the WHOLE SVG (spaces, quotes, CJK) —
  // dynamic text needs XML entity escaping on top (& < >)
  const wmSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="86">' +
    '<text x="50%" y="50%" fill="black" font-size="13" font-family="monospace" ' +
    'text-anchor="middle" transform="rotate(-22 60 43)">jixoai</text></svg>';
  const watermarkRecipe =
    '<div class="watermarked">\n' +
    '  …content…\n' +
    '  <div class="wm-layer" aria-hidden="true"></div>\n' +
    '</div>\n' +
    '<style>\n' +
    '  .watermarked { position: relative; }\n' +
    '  .wm-layer {\n' +
    '    position: absolute; inset: 0;\n' +
    '    pointer-events: none;\n' +
    '    color: var(--foreground); opacity: 0.12;\n' +
    '    background-repeat: repeat; background-size: 120px;\n' +
    '    background-image: url("data:image/svg+xml," + encodeURIComponent(wmSvg));\n' +
    '  }\n' +
    '</style>';
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

  <div data-reveal="" use:reveal>
    <SectionCard
      headerRegion="recipe-watermark"
      eyebrow="antd 映射 · recipe"
      title="watermark — the pointer-events:none overlay"
      summary="The anti-exfiltration overlay as a CSS recipe: a repeated rotated-text SVG data-URI tile (encodeURIComponent — zero libraries, no canvas) on an absolutely-positioned layer with pointer-events:none. The watermark deters and marks provenance — it is not DRM (a DOM layer is removable by a determined user)."
    >
      <CodeBlock
        code={watermarkRecipe}
        lang="svelte"
        meta="watermark"
      />
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard
      headerRegion="recipe-image-preview"
      eyebrow="antd 映射 · recipe"
      title="image preview — dialog, not a lightbox framework"
      summary="The ruling: zoom/preview is a dialog composition, not a component feature. The recipe: a thumbnail button opens a dialog holding the same src at full width; no galleries, thumbnail navigation, or gesture zoom in v1."
    >
      <CodeBlock
        code={`<button type="button" onclick={() => (open = true)} aria-label="enlarge image">
  <Image src={src} {alt} width={320} height={180} />
</button>
<Dialog bind:open title={alt}>
  <img {src} {alt} style="width: 100%; height: auto" />
</Dialog>`}
        lang="svelte"
        meta="image-preview"
      />
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard
      headerRegion="recipe-flexgrid"
      eyebrow="antd 映射 · recipe"
      title="flex / grid — Tailwind is the API"
      summary="antd's Row/Col/Flex map to native CSS through Tailwind — no component, no props taxonomy. gutter→gap, span/offset→grid fractions, justify/align→the utilities of the same names; responsive via sm:/lg: instead of xs/md props."
    >
      <CodeBlock
        code={`<!-- antd: <Row gutter={16}><Col span={8}>…</Col></Row> -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">…</div>

<!-- antd: <Flex justify="space-between" align="center">…</Flex> -->
<div class="flex items-center justify-between">…</div>`}
        lang="svelte"
        meta="flex / grid"
      />
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard
      headerRegion="recipe-list"
      eyebrow="antd 映射 · recipe"
      title="list — ul/ol + the state atoms"
      summary="antd's List is a layout opinion plus state management. The recipe composes the states we already own: the list element is yours (ul/ol by semantics), empty is Empty, loading is Spin, rows are rows — pagination/selection/virtualization are separate concerns that never belong inside a list skin."
    >
      <CodeBlock
        code={`{#if rows.length === 0}
  <Empty title="no items" />
{:else}
  <ol role="list">
    {#each rows as row (row.id)}
      <li class="flex items-center justify-between gap-4">
        <div>{row.title}</div>
        <PressButton variant="outline">open</PressButton>
      </li>
    {/each}
  </ol>
{/if}
<!-- loading wraps either branch: <Spin label="loading">…</Spin> -->`}
        lang="svelte"
        meta="list"
      />
    </SectionCard>
  </div>
</div>
