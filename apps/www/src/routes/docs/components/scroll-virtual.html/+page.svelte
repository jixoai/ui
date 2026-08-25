<!--
  scroll-virtual page (docs-restructure P0, 2026-08-25): the windowed-list
  sibling split out of the scroll-area family page so every registry:ui
  item owns a canonical page. Content is the virtual-scrolling canvas
  exactly as it lived on the family page — TanStack Virtual through the
  thin DOM-wiring layer.
-->
<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import ScrollVirtual from '$lib/ui/scroll-virtual/scroll-virtual.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { CATALOG } from '$lib/catalog';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import scrollVirtualSource from '$lib/ui/scroll-virtual/scroll-virtual.svelte?raw';

  const summary =
    CATALOG.find((entry) => entry.name === 'scroll-virtual')?.summary ?? '';

  const close = '</' + 'script>';

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

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/scroll-virtual.svelte', content: scrollVirtualSource },
    { name: 'src/lib/ui/scroll-virtual-usage.svelte', content: virtualUsage },
  ];
</script>

<svelte:head>
  <title>Scroll virtual · jixoai-ui</title>
  <meta name="description" content={summary} />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Display"
        title="scroll-virtual — the windowed list"
        summary={summary}
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">@tanstack/svelte-virtual</span>
          <span class="pill">window + overscan only</span>
          <span class="pill">sibling: <a class="text-primary underline-offset-4 hover:underline" href="/docs/components/scroll-area.html">scroll-area</a></span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="scroll-virtual"
        description="TanStack Virtual through a thin DOM-wiring layer: this demo renders up to 100,000 rows — only the visible window plus overscan exists in the DOM. Row heights measure automatically (the component calls measureElement on its own wrappers)."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/scroll-virtual.svelte"
        files={canvasFiles}
        output={[
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
                  data-jx-count-btn
                  data-jx-count-active={rowCount === c ? '' : undefined}
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
                data-jx-count-btn
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
  </div>
</div>

<style>
  /* the virtual row paint, carried over from the family page verbatim */
  :global(.jx-vrow) {
    display: flex;
    align-items: center;
    padding: 0 0.75rem;
    font-size: 12.5px;
    border-bottom: 1px solid color-mix(in oklab, var(--border) 60%, transparent);
    white-space: nowrap;
  }
  :global(.jx-vrow.odd) {
    background: color-mix(in oklab, var(--muted) 35%, transparent);
  }
</style>
