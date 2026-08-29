<!--
  Docs page for the pagination family (composition-first, 2026-08-25).
  Intents: hero summary, one ComponentCanvas over the composed nav
  (Previous/Next + pageRange-driven links with token branching, live
  page slider), the window-algorithm evidence section. Structure
  follows the list-item exemplar; the component family is untouchable
  from here.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import Pagination from '$lib/ui/pagination/pagination.svelte';
  import PaginationContent from '$lib/ui/pagination/pagination-content.svelte';
  import PaginationItem from '$lib/ui/pagination/pagination-item.svelte';
  import PaginationLink from '$lib/ui/pagination/pagination-link.svelte';
  import PaginationPrevious from '$lib/ui/pagination/pagination-previous.svelte';
  import PaginationNext from '$lib/ui/pagination/pagination-next.svelte';
  import PaginationEllipsis from '$lib/ui/pagination/pagination-ellipsis.svelte';
  import { pageRange } from '$lib/ui/pagination/pagination-range';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlayRange, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import paginationSource from '$lib/ui/pagination/pagination.svelte?raw';
  import paginationRangeSource from '$lib/ui/pagination/pagination-range.ts?raw';

  const close = '</' + 'script>';

  // single usage sample: the drawer's usage file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
    pageRange,
  } from '@ui/pagination/index';
${close}

<!-- the window math is a pure helper; the links are yours -->
{#each pageRange({ current: page, total: pages }) as page (page)}
  {#if page === 'ellipsis-start' || page === 'ellipsis-end'}
    <PaginationItem><PaginationEllipsis /></PaginationItem>
  {:else}
    <PaginationItem>
      <PaginationLink {page} isActive={page === current} href={href(page)} />
    </PaginationItem>
  {/if}
{/each}`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/pagination/pagination.svelte', content: paginationSource },
    { name: 'registry/files/ui/pagination/pagination-range.ts', content: paginationRangeSource },
    { name: 'src/lib/ui/pagination-usage.svelte', content: usage, kind: 'usage' },
  ];

  // Playground protocol: page owns the snapshot + reset; the range readout
  // carries the current page; the drawer's usage file tracks it live.
  const total = 30;
  const canvasInitial = { page: 12 };
  let page = $state(canvasInitial.page);
  function resetCanvas(): void {
    page = canvasInitial.page;
  }
  const href = (p: number): string => `/docs/components/pagination.html?page=${p}`;
  const range = $derived(pageRange({ current: page, total }));

  // the algorithm, printed as evidence (tokens rendered as …)
  const fmt = (current: number): string =>
    pageRange({ current, total })
      .map((item) => (typeof item === 'number' ? item : '…'))
      .join(' ');
  const windows = [fmt(1), fmt(5), fmt(12), fmt(30), pageRange({ current: 2, total: 4 }).join(' ')];
</script>

<svelte:head>
  <title>Pagination · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai pagination family: a nav landmark of ordinary links composed part by part — Content/Item/Link/Previous/Next/Ellipsis — with the page-window math exported as the pure pageRange helper returning numbers interleaved with ellipsis tokens."
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
      summary="W3C-first, composition-first: the nav landmark hosts composed parts — PaginationContent (ul), PaginationItem (li), PaginationLink (real hrefs or an onclick button, aria-current when active), Previous/Next at the edges. The page-window math lives in the exported pure helper pageRange with its current/total/siblings options: sticky edges, siblings around the current page, and two ellipsis TOKENS the consumer branches on. At the bounds Previous/Next become honest disabled spans — a link that goes nowhere is a lie to every input mode."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">nav + a + aria-current</span>
        <span class="pill">pageRange helper</span>
        <span class="pill">ellipsis tokens</span>
        <span class="pill">no dead links</span>
      </div>
    </SectionCard>
  </div>

  <div id="pagination-demo" data-region="pagination-demo" data-family="pagination-demo" data-reveal="">
    <ComponentCanvas
      title="pagination"
      description="pageRange drives the window; the href template decides where page N lives — this demo routes back to the page itself. Watch the window slide and the ellipses collapse near the edges."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/pagination/pagination.svelte"
      files={canvasFiles}
      stage="fill"
      onreset={resetCanvas}
    >
      <div class="w-full max-w-xl">
        <p
          data-jx-pagination-status=""
          class="m-0 mb-2 font-nav text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground"
          aria-hidden="true"
        >
          page {page} of {total}
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href={page > 1 ? href(page - 1) : undefined} />
            </PaginationItem>
            {#each range as item (item)}
              {#if item === 'ellipsis-start' || item === 'ellipsis-end'}
                <PaginationItem><PaginationEllipsis /></PaginationItem>
              {:else}
                <PaginationItem>
                  <PaginationLink page={item} isActive={item === page} href={href(item)} />
                </PaginationItem>
              {/if}
            {/each}
            <PaginationItem>
              <PaginationNext href={page < total ? href(page + 1) : undefined} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="current page">
            <PlayRange bind:value={page} min={1} max={30} step={1} />
          </PlayRow>
          <PlayHelp>
            links carry real hrefs — the demo simply routes to itself. pageRange shows one sibling
            each side by default; <code>siblings</code> widens it. Ellipses are aria-hidden
            decoration: screen readers hear the nav label, numbered links and aria-current, not
            the gaps.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="pagination-window" data-reveal="">
    <SectionCard
      family="pagination-window"
      headerRegion="pagination-window"
      eyebrow="composition"
      title="The window, as evidence"
      summary="pageRange with its current/total/siblings options — sticky edges, siblings around the current page, ellipsis tokens only when something was actually collapsed. The helper returns numbers interleaved with 'ellipsis-start' | 'ellipsis-end'; consumers branch on the tokens and render PaginationEllipsis. Same math as the closed component, ported exactly."
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

  <div id="types" data-reveal="">
    <SectionCard eyebrow="types" title="Composable pagination parts" summary="The nav root provides the landmark; small parts keep list structure, links, edges, and gaps semantically explicit.">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {#each [
          ['Pagination', 'nav landmark and density root'],
          ['PaginationContent', 'ul list container'],
          ['PaginationItem', 'li list item'],
          ['PaginationLink', 'numbered page link or button'],
          ['PaginationPrevious / Next', 'edge controls or disabled spans'],
          ['PaginationEllipsis', 'decorative collapsed range'],
        ] as item}
          <div class="border border-border/60 p-3"><p class="font-nav text-sm">{item[0]}</p><p class="mt-1 text-xs text-muted-foreground">{item[1]}</p></div>
        {/each}
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard eyebrow="usage" title="Render a page window" summary="Use pageRange for the pure window calculation, then map its page numbers and ellipsis tokens to composed pagination parts.">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard eyebrow="a11y" title="Honest pagination controls" summary="Every destination stays a real link, the active page is announced, and unavailable edges render as disabled text rather than dead links.">
      <A11yTable
        keys={[{ key: 'Tab', action: 'Move through page and edge controls' }, { key: 'Enter', action: 'Follow a numbered or edge link' }, { key: 'Space', action: 'Activate an onclick-only page button' }]}
        aria={[{ name: 'aria-label', value: "'Pagination' by default", description: 'Names the navigation landmark.' }, { name: 'aria-current', value: "'page' on active link", description: 'Announces the current page.' }, { name: 'aria-disabled', value: 'true at bounds', description: 'Marks unavailable Previous and Next controls.' }, { name: 'aria-hidden', value: 'true on ellipsis', description: 'Keeps collapsed-range decoration out of the reading order.' }]}
      />
    </SectionCard>
  </div>

  <div id="theming" data-reveal="">
    <SectionCard eyebrow="theming" title="Density-aligned page chips" summary="List gaps, link targets, and chip labels all consume the shared density scale; press tokens give interactive pages their elevation pose.">
      <div class="flex flex-col gap-5">
        <DensityDemo>
          <Pagination label="Example pagination"><PaginationContent><PaginationItem><PaginationLink page={1} isActive href="#usage" /></PaginationItem><PaginationItem><PaginationLink page={2} href="#api" /></PaginationItem></PaginationContent></Pagination>
        </DensityDemo>
        <TokenTable tokens={[
          { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density', description: 'PaginationContent item spacing.' },
          { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density', description: 'Minimum page-chip target.' },
          { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density', description: 'Chip and ellipsis inline padding.' },
          { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density', description: 'Page-chip label size.' },
          { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density', description: 'Page-chip label line height.' },
          { name: '--jx-press-shadow-hover', default: 'var(--shadow-xs)', source: 'component', description: 'Non-current page hover elevation.' },
          { name: '--jx-press-shadow-active', default: 'var(--shadow-xs-press)', source: 'component', description: 'Non-current page active pose.' },
        ]} />
      </div>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard eyebrow="api" title="Props" summary="The root and links carry the core public contract; composition supplies list structure and page-window policy.">
      <div class="flex flex-col gap-6">
        <PropsTable title="Pagination" props={[
          { name: 'density', type: 'Density', default: 'inherited', description: 'Overrides the surrounding density scale.' },
          { name: 'label', type: 'string', default: "'Pagination'", description: 'Accessible nav landmark name.' },
          { name: 'children', type: 'Snippet', required: true, description: 'Composed pagination parts.' },
        ]} />
        <PropsTable title="PaginationLink" props={[
          { name: 'page', type: 'number', required: true, description: 'Page number and default visible label.' },
          { name: 'isActive', type: 'boolean', default: 'false', description: 'Applies active paint and aria-current=page.' },
          { name: 'href', type: 'string', default: 'undefined', description: 'Destination; omit only for an onclick-only button.' },
          { name: 'onclick', type: '(event: MouseEvent) => void', default: 'undefined', description: 'Click-only page action.' },
          { name: 'child', type: 'Snippet', default: 'undefined', description: 'Optional replacement anchor element.' },
        ]} />
        <PropsTable title="PaginationPrevious and PaginationNext" props={[
          { name: 'href', type: 'string', default: 'undefined', description: 'Destination; omission renders an honest disabled span.' },
          { name: 'onclick', type: '(event: MouseEvent) => void', default: 'undefined', description: 'Click-only edge action.' },
          { name: 'children', type: 'Snippet', default: 'default label', description: 'Replacement edge label.' },
        ]} />
      </div>
    </SectionCard>
  </div>
  </div>
</div>
