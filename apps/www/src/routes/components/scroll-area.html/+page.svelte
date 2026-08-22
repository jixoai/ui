<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import ScrollArea from '$lib/ui/scroll-area.svelte';
  import ScrollVirtual from '$lib/ui/scroll-virtual.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { createTocEngine } from '$lib/toc-engine';
  import { deriveTocOutline } from '$lib/toc-outline';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import scrollAreaSource from '$lib/ui/scroll-area.svelte?raw';
  import scrollVirtualSource from '$lib/ui/scroll-virtual.svelte?raw';
  import tocOutlineSource from '$lib/toc-outline.ts?raw';

  const close = '</' + 'script>';

  // THIS PAGE is the outline-mode dogfood: no tocSections literal, no
  // data-region/data-family markup — the rail derives itself from the h2
  // tree under #sa-content on hydration (the reveal philosophy: prerendered
  // output shows the rail empty, then it fills).
  const pageOutline = { root: '#sa-content', levels: [2] };

  // ---- virtual demo state (page-owned, canvas playground protocol) ----
  const COUNTS = [1_000, 10_000, 100_000];
  let rowCount = $state(10_000);
  let windowSize = $state(0);
  let jumpIndex = $state(4_999);
  let virtualInstance = $state<{
    scrollToIndex(index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }): void;
    getVirtualizer(): { getVirtualItems(): unknown[] } | undefined;
  } | null>(null);

  const rowItem = (index: number): string =>
    `row ${String(index + 1).padStart(6, '0')} — the window renders only what you see plus overscan`;

  $effect(() => {
    const items = virtualInstance?.getVirtualizer?.().getVirtualItems();
    if (items) windowSize = items.length;
  });

  // ---- toc-metadata demo: the inner scroller linkage, engine-direct ----
  // The Toc component assumes the page shell (its line law measures the
  // scaffold header); an ARBITRARY inner scroller pairs toc-engine +
  // toc-outline directly — scrollRoot = the ScrollArea viewport, extents =
  // the derived outline, line = the viewport's own top in page coordinates.
  let metaArea = $state<{ getViewport(): HTMLDivElement | null } | null>(null);
  let metaViewport = $state<HTMLDivElement | null>(null);
  let metaPick = $state('');
  let metaWeights = $state<ReadonlyMap<string, number>>(new Map());

  $effect(() => {
    metaViewport = metaArea?.getViewport() ?? null;
  });

  $effect(() => {
    const vp = metaViewport;
    if (!vp) return;
    const line = () => Math.round(vp.getBoundingClientRect().top) + 8;
    const stop = createTocEngine(
      ({ weights, pick }) => {
        metaWeights = weights;
        metaPick = pick ?? '';
      },
      { scrollRoot: vp, lineOffset: line, extents: () => deriveTocOutline(vp, { levels: [3] }) },
    );
    return stop;
  });

  const metaSections = [
    'deriving the outline',
    'extents, not attributes',
    'the line stays honest',
    'zero boilerplate',
  ];

  // ---- usage snippets ----
  const nativeUsage = `<script lang="ts">
  import ScrollArea from '@ui/scroll-area.svelte';
${close}

<!-- native variant (default): the theme scrollbar law, gutter compensated -->
<ScrollArea class="h-72" label="release notes" pad="0.75rem">
  {#each notes as note (note.id)}
    <article>…</article>
  {/each}
</ScrollArea>`;

  const overlayUsage = `<ScrollArea scrollbar="overlay" class="h-72" label="terminal log">
  <!-- overlay thumb: desktop (fine pointer) only; touch keeps native -->
</ScrollArea>`;

  const virtualUsage = `<script lang="ts">
  import ScrollVirtual from '@ui/scroll-virtual.svelte';
${close}

<!-- strong TanStack association, thin coupling: read TanStack Virtual's
     docs for the semantics; virtualOptions speaks VirtualizerOptions -->
<ScrollVirtual count={rows.length} estimateSize={44} overscan={6} bind:this={list}>
  {#snippet children(item)}
    <div class="row" data-index={item.index}>{rows[item.index].name}</div>
  {/snippet}
</ScrollVirtual>

<!-- imperative surface: TanStack passthroughs -->
<button onclick={() => list.scrollToIndex(999, { align: 'center' })}>jump</button>`;

  const tocUsage = `import { deriveTocOutline, tocOutlineToSections } from '@lib/toc-outline';

// zero handwritten ids: sections + extents derive from the heading tree
const entries = deriveTocOutline(scrollArea.getViewport());
const sections = tocOutlineToSections(entries);

// Toc component, page-level (outline mode):
//   <Toc outline={{ root: '#content' }} scrollRoot={area.getViewport()} />
// engine-direct for arbitrary inner scrollers:
//   createTocEngine(onUpdate, { scrollRoot: viewport, extents: () => entries });`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/scroll-area.svelte', content: scrollAreaSource },
    { name: 'registry/files/ui/scroll-virtual.svelte', content: scrollVirtualSource },
    { name: 'src/lib/ui/scroll-area-usage.svelte', content: nativeUsage + '\n\n' + overlayUsage },
  ];

  const metaCanvasFiles: TreeFile[] = [
    { name: 'registry/files/lib/toc-outline.ts', content: tocOutlineSource },
  ];
</script>

<svelte:head>
  <title>Scroll area · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai scroll-area family: a W3C-first nativeHTML scrollable region (native + overlay virtual scrollbar variants), TanStack-backed virtual scrolling, and automatic ToC outline export."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- outline-mode rail: no sections literal below — it derives itself from
       #sa-content's h2 tree on hydration (this page is the dogfood) -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc outline={pageOutline} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div id="sa-content" class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · scroll-area family"
      title="scroll-area — the scrollable region, nativeHTML"
      summary="A dedicated scrollable-region component after shadcnui, with the jixoai law: the component IS a native scroll container — wheel, touch momentum, keyboard and scroll-snap stay platform behavior. Two scrollbar variants (native = the theme scrollbar law; overlay = the custom virtual scrollbar, desktop-fine-pointer only), TanStack-backed virtual scrolling as an opt-in sibling, and the ToC metadata export that lets a table of contents derive itself from your content."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">nativeHTML scrollport</span>
        <span class="pill">overlay virtual scrollbar</span>
        <span class="pill">@tanstack/svelte-virtual</span>
        <span class="pill">auto ToC outline</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard
      family="scroll-native"
      headerRegion="scroll-native"
      eyebrow="variant 1"
      title="native — the scrollbar law, componentized"
    >
      <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
        The default variant encapsulates the theme scrollbar law: thin, theme-linked thumbs over a
        transparent track with the hover chain — plus <code class="text-accent">stable both-edges</code>
        gutters whose reservation <code class="text-accent">pad</code> hands back (the inline
        compensation recipe). On classic-scrollbar systems the visual inset stays exactly
        <code class="text-accent">pad</code> on both edges; on overlay-scrollbar systems nothing is
        reserved at all.
      </p>
      <div class="mt-4">
        <ScrollArea class="h-56" label="law demo" pad="0.75rem">
          <ol class="flex flex-col gap-2">
            {#each Array(40) as _, i (i)}
              <li class="border border-border/40 bg-muted/40 px-3 py-1.5 text-[12.5px]">
                item {i + 1} — scroll me: the scrollbar is thin, themed, and the content inset
                stays symmetric
              </li>
            {/each}
          </ol>
        </ScrollArea>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard
      family="scroll-overlay"
      headerRegion="scroll-overlay"
      eyebrow="variant 2"
      title="overlay — the virtual scrollbar"
    >
      <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
        The custom scrollbar: native bars hidden, a square theme-token thumb floats over full-width
        content — the overlay effect even on classic-scrollbar desktops. Pointer-drag it (capture
        law), watch it fade after ~700ms idle. On touch devices it stays pure native: the OS already
        paints overlay bars during momentum — the mobile/desktop behavioral split is the law.
        <code class="text-accent">prefers-reduced-motion</code> keeps the thumb statically visible.
      </p>
      <div class="mt-4">
        <ScrollArea scrollbar="overlay" class="h-56" label="overlay demo">
          <div class="jx-log">
            {#each Array(60) as _, i (i)}
              <p class="jx-log-line">
                <span class="text-muted-foreground">[{(i * 137) % 1000}</span> ms] overlay thumb
                rendered without a single native scrollbar pixel
              </p>
            {/each}
          </div>
        </ScrollArea>
      </div>
    </SectionCard>
  </div>

  <div id="virtual-scrolling" data-reveal="" use:reveal>
    <ComponentCanvas
      title="scroll-virtual"
      description="TanStack Virtual through a thin DOM-wiring layer: this demo renders up to 100,000 rows — only the visible window plus overscan exists in the DOM. Row heights measure automatically (the component calls measureElement on its own wrappers)."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/scroll-virtual.svelte"
      files={canvasFiles}
      echo={[
        { label: 'count', value: rowCount.toLocaleString() },
        { label: 'dom window', value: `${windowSize} rows` },
      ]}
      onreset={() => {
        rowCount = 10_000;
        jumpIndex = 4_999;
        virtualInstance?.scrollToIndex(0);
      }}
    >
      <ScrollVirtual
        bind:this={virtualInstance}
        count={rowCount}
        estimateSize={40}
        overscan={6}
        label="virtual list demo"
        class="h-72"
        onscroll={() => {
          const items = virtualInstance?.getVirtualizer?.().getVirtualItems();
          if (items) windowSize = items.length;
        }}
      >
        {#snippet children(item)}
          <div class="jx-vrow" class:odd={item.index % 2 === 1}>
            {rowItem(item.index)}
          </div>
        {/snippet}
      </ScrollVirtual>
      {#snippet playground()}
        <div class="jx-play-fields">
          <div class="jx-play-field flex flex-wrap items-center gap-2">
            <span class="text-[11px] uppercase tracking-wider text-muted-foreground">count</span>
            {#each COUNTS as c (c)}
              <button
                type="button"
                class="jx-count-btn"
                class:active={rowCount === c}
                onclick={() => (rowCount = c)}
              >
                {c.toLocaleString()}
              </button>
            {/each}
          </div>
          <div class="jx-play-field flex flex-wrap items-center gap-2">
            <span class="text-[11px] uppercase tracking-wider text-muted-foreground">scrollToIndex</span>
            <input
              class="w-24 border border-border bg-background px-2 py-1 text-[12.5px]"
              type="number"
              min="0"
              max={rowCount - 1}
              bind:value={jumpIndex}
            />
            <button
              type="button"
              class="jx-count-btn"
              onclick={() => virtualInstance?.scrollToIndex(Math.min(Math.max(jumpIndex, 0), rowCount - 1), { align: 'start' })}
            >
              jump
            </button>
          </div>
          <p class="jx-play-help">
            semantics are TanStack's — <code class="text-accent">estimateSize</code>,
            <code class="text-accent">overscan</code>, and everything in
            <code class="text-accent">virtualOptions</code> speak VirtualizerOptions; read the
            TanStack Virtual docs directly. The instance passthroughs
            (<code class="text-accent">scrollToIndex / scrollToOffset / measure / getVirtualizer</code>)
            are the escape hatch.
          </p>
        </div>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="toc-metadata" data-reveal="" use:reveal>
    <ComponentCanvas
      title="toc metadata export"
      description="The scrollable area exports what the ToC needs: the viewport element (scrollRoot), and the outline its content derives — heading-to-heading extents, no data-region markup. The page rail on the right already runs in outline mode; this demo pairs an inner scroller with the engine directly."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/lib/toc-outline.ts"
      files={metaCanvasFiles}
    >
      <div class="grid gap-4 min-[900px]:grid-cols-[1fr_13rem]">
        <ScrollArea bind:this={metaArea} class="h-64" label="toc metadata demo" pad="0.75rem">
          <div class="flex flex-col gap-6 pr-2">
            {#each metaSections as section, i (section)}
              <section>
                <!-- h3 keeps clean document order under the h2 section; explicit
                     ids are respected by the derivation (the readout matches) -->
                <h3 id="toc-metadata-demo-{i}" class="font-nav text-[0.95rem]">{section}</h3>
                <p class="mt-1 text-[12.5px] leading-6 text-muted-foreground">
                  {['deriveTocOutline scans the heading tree, slugs labels, stamps ids back — the ToC links are real fragments.',
                    'extents (heading → next heading) feed toc-engine directly: weights and pick without a single data attribute.',
                    'the line is the viewport\'s own top — inner scrollers have no scaffold header, so the engine gets lineOffset from geometry.',
                    'ScrollArea.getViewport() + toc-outline + toc-engine: the whole linkage, zero handwritten ids.'][i]}
                </p>
                {#each Array(6) as _, j (`${section}-${j}`)}
                  <p class="text-[12px] leading-5 text-muted-foreground/60">depth filler {j + 1} — every section must be able to cross the line</p>
                {/each}
              </section>
            {/each}
          </div>
        </ScrollArea>
        <aside class="jx-meta-rail">
          <p class="font-nav text-[11px] uppercase tracking-[0.14em] text-muted-foreground">engine readout</p>
          <ol>
            {#each metaSections as section, i (section)}
              {@const id = `toc-metadata-demo-${i}`}
              <li class="jx-meta-item" class:active={metaPick === id} style="--w: {(metaWeights.get(id) ?? 0).toFixed(3)}">
                {section}
              </li>
            {/each}
          </ol>
          <p class="mt-2 text-[11px] leading-4 text-muted-foreground/70">
            pick: <code class="text-accent">{metaPick || '—'}</code>
          </p>
        </aside>
      </div>
    </ComponentCanvas>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard
      family="scroll-usage"
      headerRegion="scroll-usage"
      eyebrow="composition"
      title="Usage"
    >
      <div class="flex flex-col gap-4">
        <CodeBlock code={nativeUsage} lang="svelte" meta="native" />
        <CodeBlock code={overlayUsage} lang="svelte" meta="overlay" />
        <CodeBlock code={virtualUsage} lang="svelte" meta="virtual" />
        <CodeBlock code={tocUsage} lang="ts" meta="toc-outline" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<style>
  .jx-log {
    font-size: 12px;
    line-height: 1.7;
    padding: 0.75rem;
  }
  .jx-log-line {
    margin: 0;
    white-space: nowrap;
  }
  .jx-vrow {
    align-items: center;
    border-bottom: 1px solid color-mix(in oklab, var(--border) 30%, transparent);
    display: flex;
    font-size: 12.5px;
    height: 100%;
    padding-inline: 0.75rem;
  }
  .jx-vrow.odd {
    background: color-mix(in oklab, var(--muted) 40%, transparent);
  }
  .jx-count-btn {
    border: 1px solid var(--border);
    font-family: var(--font-nav);
    font-size: 12px;
    padding: 0.2rem 0.6rem;
  }
  .jx-count-btn.active {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--primary-foreground);
  }
  .jx-meta-rail {
    align-self: start;
    border: 1px solid var(--border);
    padding: 0.6rem;
    position: sticky;
    top: 0.5rem;
  }
  .jx-meta-item {
    border-inline-start: 2px solid
      color-mix(in oklab, var(--primary) calc(var(--w, 0) * 100%), transparent);
    color: var(--muted-foreground);
    font-size: 12px;
    list-style: none;
    padding: 0.25rem 0 0.25rem 0.5rem;
  }
  .jx-meta-item.active {
    color: var(--foreground);
  }
</style>
