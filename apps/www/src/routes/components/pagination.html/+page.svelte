<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Pagination, { pageWindow } from '$lib/ui/pagination.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import paginationSource from '$lib/ui/pagination.svelte?raw';

  const close = '</' + 'script>';

  // ToC outline: the live demo band + the window-algorithm evidence section.

  const usage = `<script lang="ts">
  import Pagination from '@ui/pagination.svelte';
${close}

<!-- the href template owns the URL shape -->
<Pagination page={page} pageCount={pages} href={(p) => \`/?page=\${p}\`} />`;

  const canvasUsage = `<Pagination {page} pageCount={30} href={(p) => \`/items?page=\${p}\`} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/pagination.svelte', content: paginationSource },
    { name: 'src/lib/ui/pagination-usage.svelte', content: canvasUsage },
  ];

  // Playground protocol: page owns the snapshot + reset; echo projects the
  // current page; the drawer's usage file tracks it live.
  const canvasInitial = { page: 12 };
  let page = $state(canvasInitial.page);
  function resetCanvas(): void {
    page = canvasInitial.page;
  }
  const href = (p: number): string => `/components/pagination.html?page=${p}`;
  const usageLive = $derived(`<Pagination
  page={${page}}
  pageCount={30}
  href={(p) => \`/items?page=\${p}\`}
/>`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // the algorithm, printed as evidence
  const windows = [
    pageWindow(1, 30).join(' '),
    pageWindow(5, 30).join(' '),
    pageWindow(12, 30).join(' '),
    pageWindow(30, 30).join(' '),
    pageWindow(2, 4).join(' '),
  ];
</script>

<svelte:head>
  <title>Pagination · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai pagination: a nav landmark of ordinary links — real hrefs, aria-current=page, sticky-edge page windows with aria-hidden ellipses, and honest disabled spans at the bounds."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="pagination — a nav of real links"
      summary="W3C-first: pagination is a nav landmark of ordinary links. Real hrefs work JS-off and server-side; aria-current marks the active page; the window algorithm keeps first and last always reachable. At the bounds prev/next become honest disabled spans — a link that goes nowhere is a lie to every input mode."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">nav + a + aria-current</span>
        <span class="pill">sticky-edge window</span>
        <span class="pill">no dead links</span>
        <span class="pill">pageWindow export</span>
      </div>
    </SectionCard>
  </div>

  <div id="pagination-demo" data-region="pagination-demo" data-family="pagination-demo" data-reveal="">
    <ComponentCanvas
      title="pagination"
      description="The href template decides where page N lives — this demo routes back to the page itself. Watch the window slide and the ellipses collapse near the edges."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/pagination.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[{ label: 'page', value: page }]}
      resolveFileContent={resolveUsage}
    >
      <div class="w-full max-w-xl">
        <Pagination {page} pageCount={30} {href} />
      </div>
      {#snippet playground()}
        <div class="jx-play-fields">
          <div class="jx-play-field">
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              bind:value={page}
              aria-label="current page"
              class="accent-[var(--primary)] w-full"
            />
          </div>
          <p class="jx-play-help">
            links carry real hrefs — the demo simply routes to itself. The window shows one sibling
            each side by default; <code class="text-accent">siblings</code> widens it. Ellipses are
            aria-hidden decoration: screen readers hear the nav label, numbered links and
            aria-current, not the gaps.
          </p>
        </div>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="pagination-window" data-reveal="">
    <SectionCard
      family="pagination-window"
      headerRegion="pagination-window"
      eyebrow="composition"
      title="The window, as evidence"
      summary="pageWindow(page, pageCount, siblings) — sticky edges, siblings around the current page, ellipses only when something was actually collapsed. Exported from the module for list UIs that want the same shape without the nav."
    >
      <div class="flex flex-col gap-5">
        <dl class="grid grid-cols-[8rem_1fr] gap-x-6 gap-y-1.5 font-mono text-[12.5px]">
          <dt class="text-muted-foreground">page 1 / 30</dt><dd>{windows[0]}</dd>
          <dt class="text-muted-foreground">page 5 / 30</dt><dd>{windows[1]}</dd>
          <dt class="text-muted-foreground">page 12 / 30</dt><dd>{windows[2]}</dd>
          <dt class="text-muted-foreground">page 30 / 30</dt><dd>{windows[3]}</dd>
          <dt class="text-muted-foreground">page 2 / 4</dt><dd>{windows[4]}</dd>
        </dl>
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>
