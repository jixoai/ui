<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Input from '$lib/ui/input.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // ToC outline: the live workbench + every recipe card, in page order.
  // Ids pair with the wrapper ids / SectionCard families below.
  const tocSections = [
    { id: 'watermark-live', label: 'watermark · live' },
    { id: 'recipe-aspect', label: 'aspect-ratio' },
    { id: 'recipe-data-table', label: 'data-table' },
    { id: 'recipe-chart', label: 'chart' },
    { id: 'recipe-sidebar', label: 'sidebar' },
    { id: 'recipe-watermark', label: 'watermark' },
    { id: 'recipe-image-preview', label: 'image preview' },
    { id: 'recipe-flexgrid', label: 'flex / grid' },
    { id: 'recipe-segmented', label: 'segmented' },
    { id: 'recipe-list', label: 'list' },
    { id: 'recipe-autocomplete', label: 'autoComplete' },
    { id: 'recipe-typography', label: 'typography' },
    { id: 'recipe-mentions', label: 'mentions' },
    { id: 'recipe-tour', label: 'tour' },
  ];

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

  // ---- watermark: ONE sample function is the single source — the live
  // workbench below and the recipe card both render its current output.
  // fill="currentColor" (not black) so the tile follows the container
  // color the recipe's own CSS sets — theme-aware in both modes.
  const watermarkSample = (textLiteral: string): string => `<!-- encodeURIComponent escapes the WHOLE SVG (spaces, quotes, CJK) —
     dynamic text needs XML entity escaping on top (& < >) -->
const wmSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="86">' +
  '<text x="50%" y="50%" fill="currentColor" font-size="13" font-family="monospace" ' +
  'text-anchor="middle" transform="rotate(-22 60 43)">${textLiteral}</text></svg>';
const watermarkRecipe =
  '<div class="watermarked"\\n' +
  '  style="--wm-tile: url(\\'data:image/svg+xml,\\' + encodeURIComponent(wmSvg))">\\n' +
  '  …content…\\n' +
  '  <div class="wm-layer" aria-hidden="true"></div>\\n' +
  '</div>\\n' +
  '<style>\\n' +
  '  .watermarked { position: relative; }\\n' +
  '  .wm-layer {\\n' +
  '    position: absolute; inset: 0;\\n' +
  '    pointer-events: none;\\n' +
  '    color: var(--foreground); opacity: 0.12;\\n' +
  '    background-repeat: repeat; background-size: 120px;\\n' +
  '    background-image: var(--wm-tile);\\n' +
  '  }\\n' +
  '</style>';
`;

  // ---- playground protocol (P1): the page owns the state snapshot ----
  const canvasInitial = { text: 'jixoai' };
  let wmText = $state(canvasInitial.text);
  function resetCanvas(): void {
    wmText = canvasInitial.text;
  }
  // free text must become a legal string literal — quotes, apostrophes,
  // newlines and CJK all survive q()
  const q = (value: string): string => JSON.stringify(value);
  // the live sample the drawer + recipe card render, tracking the input
  const watermarkUsage = $derived(watermarkSample(q(wmText)));

  // ---- the LIVE tile the stage paints, built with the same recipe ----
  const escapeXml = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const wmSvg = $derived(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="86">' +
      '<text x="50%" y="50%" fill="currentColor" font-size="13" font-family="monospace" ' +
      `text-anchor="middle" transform="rotate(-22 60 43)">${escapeXml(wmText)}</text></svg>`,
  );
  const wmTile = $derived(`url("data:image/svg+xml,${encodeURIComponent(wmSvg)}")`);

  const files: TreeFile[] = [
    { name: 'src/recipes/watermark-usage.svelte', content: watermarkSample(q(canvasInitial.text)) },
  ];
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? watermarkUsage : file.content;
</script>

<svelte:head>
  <title>Recipes · jixoai-ui</title>
  <meta
    name="description"
    content="The deliberate non-components: aspect-ratio, data-table, chart, and sidebar as documented composition recipes — the batch-4 design ruling on where wrapping stops. The watermark recipe runs live: type into the workbench and watch the tile re-render."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="设计裁决 · recipes"
      title="where wrapping stops"
      summary="Four shadcn items are deliberately NOT components here — each ruling from the batch-4 design review: the platform already owns it (aspect-ratio), composition IS the product (data-table, sidebar), or the honest surface is a semantic table (chart until an SVG-primitive lib earns its place). The recipes below are the contract, and they are runnable — the watermark one runs live in the workbench."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">aspect-ratio = CSS</span>
        <span class="pill">data-table = composition</span>
        <span class="pill">chart = semantic first</span>
        <span class="pill">sidebar = sheet + nav</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench: the watermark recipe, running live — recipes are code,
       so one of them proves it on a real stage -->
  <div id="watermark-live" data-region="watermark-live" data-reveal="" use:reveal>
    <ComponentCanvas
      title="recipe: watermark"
      description="The recipe runs live: the stage is a watermarked surface — try to select or click through it (the layer is pointer-events:none), then type in the Playground and watch the tile re-render. The recipe card below and this drawer share one source."
      files={files}
      onreset={resetCanvas}
      echo={[{ label: 'text', value: wmText || '—' }]}
      resolveFileContent={resolveUsage}
    >
      <div class="jx-wm-stage w-full max-w-[38rem]">
        <div class="flex flex-col items-start gap-4">
          <p class="text-[13px] leading-6">
            the protected surface — select this text, click the button: input passes through the
            overlay untouched.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <span class="border-border size-10 border" style="background: var(--primary)"></span>
            <span class="border-border size-10 border" style="background: var(--secondary)"></span>
            <span class="border-border size-10 border" style="background: var(--accent)"></span>
            <span class="text-muted-foreground text-[10.5px]">brand primaries under the layer</span>
          </div>
          <PressButton variant="outline">an interactive child</PressButton>
        </div>
        <div class="jx-wm-layer" aria-hidden="true" style:background-image={wmTile}></div>
      </div>
      {#snippet playground()}
        <div class="jx-play-fields">
          <div class="jx-play-field">
            <Input label="watermark text" placeholder="jixoai" bind:value={wmText} />
          </div>
          <p class="jx-play-help">
            free text goes through <code class="text-accent">q()</code> in the sample and
            <code class="text-accent">encodeURIComponent</code> in the tile — type quotes, an
            apostrophe, or 中文: nothing breaks, in the sample or on the stage. The watermark deters
            and marks provenance; it is not DRM.
          </p>
        </div>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="recipe-aspect" data-reveal="" use:reveal>
    <SectionCard
      family="recipe-aspect"
      headerRegion="recipe-aspect"
      eyebrow="recipe"
      title="aspect-ratio — the platform owns it"
    >
      <CodeBlock code={aspect} lang="svelte" meta="aspect-ratio" />
    </SectionCard>
  </div>

  <div id="recipe-data-table" data-reveal="" use:reveal>
    <SectionCard
      family="recipe-data-table"
      headerRegion="recipe-data-table"
      eyebrow="recipe"
      title="data-table — semantics from table.svelte, state from you"
      summary="A wrapper that decides your column model, pagination and selection state would be a framework in disguise. The recipe: your state layer (TanStack or plain Svelte) computes rows; table.svelte renders real thead/tbody with aria-sort headers."
    >
      <CodeBlock code={dataTable} lang="svelte" meta="data-table" />
    </SectionCard>
  </div>

  <div id="recipe-chart" data-reveal="" use:reveal>
    <SectionCard
      family="recipe-chart"
      headerRegion="recipe-chart"
      eyebrow="recipe"
      title="chart — semantic first, SVG primitives later"
      summary="Bars are a table row's width away — zero JS, screen-reader-first. Line/axis/legend charting deserves a real SVG-primitive registry:lib designed for it; wrapping a chart library would fight the terminal token system."
    >
      <CodeBlock code={chart} lang="svelte" meta="chart" />
    </SectionCard>
  </div>

  <div id="recipe-sidebar" data-reveal="" use:reveal>
    <SectionCard
      family="recipe-sidebar"
      headerRegion="recipe-sidebar"
      eyebrow="recipe"
      title="sidebar — sheet + your nav"
      summary="The 40-file sidebar framework is an app shell decision, not a component. The recipe: a left sheet, your links, aria-current from your router's truth."
    >
      <CodeBlock code={sidebar} lang="svelte" meta="sidebar" />
    </SectionCard>
  </div>

  <div id="recipe-watermark" data-reveal="" use:reveal>
    <SectionCard
      family="recipe-watermark"
      headerRegion="recipe-watermark"
      eyebrow="antd 映射 · recipe"
      title="watermark — the pointer-events:none overlay"
      summary="The anti-exfiltration overlay as a CSS recipe: a repeated rotated-text SVG data-URI tile (encodeURIComponent — zero libraries, no canvas) on an absolutely-positioned layer with pointer-events:none. The watermark deters and marks provenance — it is not DRM (a DOM layer is removable by a determined user). This sample is LIVE: it tracks the workbench input above."
    >
      <CodeBlock code={watermarkUsage} lang="svelte" meta="watermark" />
    </SectionCard>
  </div>

  <div id="recipe-image-preview" data-reveal="" use:reveal>
    <SectionCard
      family="recipe-image-preview"
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

  <div id="recipe-flexgrid" data-reveal="" use:reveal>
    <SectionCard
      family="recipe-flexgrid"
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

  <div id="recipe-segmented" data-reveal="" use:reveal>
    <SectionCard
      family="recipe-segmented"
      headerRegion="recipe-segmented"
      eyebrow="antd 映射 · cross-link"
      title="segmented → toggle-group type=single"
      summary="antd's Segmented maps to toggle-group's single mode — the full semantic mapping lives on the toggle-group page (semantic mapping, not 1:1 paint: no sliding indicator imitation). This entry keeps every antd concept mapping reachable from one place."
    >
      <PressButton href="/components/toggle-group.html#tgroup-segmented">the mapping →</PressButton>
    </SectionCard>
  </div>

  <div id="recipe-list" data-reveal="" use:reveal>
    <SectionCard
      family="recipe-list"
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

  <!-- antd mappings: autoComplete / typography / mentions / tour -->
  <div id="recipe-autocomplete" data-reveal="" use:reveal>
    <SectionCard
      family="recipe-autocomplete"
      headerRegion="recipe-autocomplete"
      eyebrow="antd 映射 · recipe"
      title="autoComplete → combobox"
      summary="antd's AutoComplete maps to the combobox with four honest notes: free input corresponds to the allowCustom posture; strict options correspond to the committed mode; combobox's search filtering is NOT mentions/token editing (see the mentions boundary below); and the native autocomplete attribute is a browser concept — never conflate it with antd's component of the same name."
    >
      <CodeBlock
        code={`<!-- antd: <AutoComplete options={opts} /> -->
<Combobox {options} placeholder="type to filter…" />`}
        lang="svelte"
        meta="autoComplete"
      />
    </SectionCard>
  </div>

  <div id="recipe-typography" data-reveal="" use:reveal>
    <SectionCard
      family="recipe-typography"
      headerRegion="recipe-typography"
      eyebrow="antd 映射 · recipe"
      title="typography — HTML elements + tokens, not a component family"
      summary="Title maps to real h1–h6; Text/Paragraph map to real span/p with the token classes; Ellipsis is CSS (text-overflow / line-clamp) with the rule that visual truncation NEVER removes the accessible full text; Highlight is the native <mark>. No Typography component family — semantics belong to the elements."
    >
      <CodeBlock
        code={`<!-- Title level={3} → a real heading -->
<h3 class="font-nav text-[1.22rem] tracking-tight">…</h3>

<!-- Text ellipsis — full text stays accessible -->
<p class="truncate" title="…the full text…">…</p>
<p class="line-clamp-2">…full text, visually clamped…</p>

<!-- Highlight -->
Search hits render as <mark>match</mark> — native emphasis semantics.`}
        lang="svelte"
        meta="typography"
      />
    </SectionCard>
  </div>

  <div id="recipe-mentions" data-reveal="" use:reveal>
    <SectionCard
      family="recipe-mentions"
      headerRegion="recipe-mentions"
      eyebrow="antd 边界"
      title="mentions — not covered, by ruling"
      summary="Mentions (caret tracking, trigger characters, token insertion/deletion, IME coordination) is a different state machine from a whole-field combobox. The combobox is an adjacent foundation, NOT a mentions replacement — recorded as an honest boundary, no fake 1:1 recipe."
    >
      <p class="text-[12.5px] text-muted-foreground">
        boundary: no component, no mapping — until a real use case funds the deep design.
      </p>
    </SectionCard>
  </div>

  <div id="recipe-tour" data-reveal="" use:reveal>
    <SectionCard
      family="recipe-tour"
      headerRegion="recipe-tour"
      eyebrow="设计契约 · deferred"
      title="tour — deferred with its design contract on record"
      summary="Deferred to its own deep-design batch (the ruling). The contract when it lands: anchor-name injection as a reversible per-instance LEASE on the target (set on open/step, restored on close/unmount — the same class of wiring as popovertarget, not style-writing); the highlight is CSS-anchor + a target-sized transparent hole + one huge box-shadow (no geometry JS, no four-block mask); popover=manual + role=dialog + aria-modal=false — non-modal, page scrollable, default scrim pointer-events:none; per-step target re-resolution with deterministic skip when unavailable; Escape/Skip ends and restores the invoker focus."
    >
      <p class="text-[12.5px] text-muted-foreground">
        this card IS the contract — tour lands only against it, in its own batch.
      </p>
    </SectionCard>
  </div>
  </div>
</div>

<style>
  /* the live watermark stage: same geometry the recipe's CSS declares —
     relative container, absolute overlay, pointer-events none. The tile
     svg fills with currentColor so the layer inherits the foreground. */
  .jx-wm-stage {
    border: 1px solid var(--border);
    color: var(--foreground);
    padding: 1.25rem;
    position: relative;
  }
  .jx-wm-layer {
    background-repeat: repeat;
    background-size: 120px;
    inset: 0;
    opacity: 0.14;
    pointer-events: none;
    position: absolute;
  }
</style>
