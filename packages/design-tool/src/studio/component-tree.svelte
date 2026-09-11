<!--
  @jixoai/ui-design (studio) — the ComponentTreeView (r2 T5).

  Orthogonal intent (1): the frame stamp tree of the active canvas —
  the DOM-enumerated jixoai usage hierarchy (nesting = stamped
  ancestors; one node per USAGE, {#each} iterations collapse into an
  instanceCount label). Shares the studio's ONE selection state with
  the picker: clicking a node selects downward (highlight inside the
  frame via the same-origin __jixoaiDesignHighlight seam) and upward
  (the shell's selection prop → chat chip).

  Data freshness (the T0d spike verdict: HMR is PARTIAL — no load
  events on edits): a MutationObserver chain over the canvas document
  and every kit frame's body, debounced; plus iframe load (canvas
  switch / frame full-reload) and selection changes. The walk is
  event-driven, never polled.

  Honest degradation: the tree = the STAMP tree (r2 ruling) — native
  elements, third-party components and rest-spread-less components
  are absent by design.

  Original need: Owner 2026-09-11 (design-studio-r2 T5). No host
  imports; self-contained scoped CSS. Svelte 5 runes.
-->
<script lang="ts">
  import {
    FRAME_NAME_PREFIX,
    buildSelectionTree,
    collectCanvasRecords,
    type DesignFrameSeams,
    type DesignSelection,
    type SelectionTreeNode,
    type StampRecord,
  } from './selection.ts';

  let {
    iframe = null,
    selection = null,
    onSelect = (): void => {},
  }: {
    /** the live canvas iframe element (bind:this from the shell) */
    iframe?: HTMLIFrameElement | null;
    /** the studio's shared selection (row highlighting) */
    selection?: DesignSelection | null;
    /** selection flows up to the shell (chip + chat context) */
    onSelect?: (selection: DesignSelection) => void;
  } = $props();

  let records: StampRecord[] = $state([]);
  const tree = $derived(buildSelectionTree(records));

  /** frame-grouped roots: canvas-doc usages first, then each frame */
  const groups = $derived.by(() => {
    const order: string[] = [];
    const byFrame = new Map<string, SelectionTreeNode[]>();
    for (const node of tree) {
      const key = node.frameId ?? '';
      if (!byFrame.has(key)) {
        byFrame.set(key, []);
        order.push(key);
      }
      byFrame.get(key)!.push(node);
    }
    return order.map((key) => ({ frameId: key === '' ? null : key, roots: byFrame.get(key)! }));
  });

  function safeDocument(element: HTMLIFrameElement | null): Document | null {
    try {
      return element?.contentDocument ?? null;
    } catch {
      return null; // cross-origin — not a design frame
    }
  }

  function refresh(): void {
    const doc = safeDocument(iframe);
    if (doc === null) {
      records = [];
      return;
    }
    try {
      records = collectCanvasRecords(doc, Array.from(doc.querySelectorAll('iframe')));
    } catch {
      records = []; // mid-teardown document — the next event re-walks
    }
  }

  /** tree click: highlight DOWN into the right document, select UP */
  function pick(node: SelectionTreeNode): void {
    const doc = safeDocument(iframe);
    if (doc !== null) {
      const target =
        node.frameId === null
          ? iframe?.contentWindow
          : Array.from(doc.querySelectorAll('iframe')).find((f) => f.name === `${FRAME_NAME_PREFIX}${node.frameId}`)
              ?.contentWindow ?? null;
      const seams = target as (Window & DesignFrameSeams) | null;
      seams?.__jixoaiDesignHighlight?.({ usageIndex: node.usageIndex, iterationIndex: null });
    }
    onSelect({
      frameId: node.frameId,
      usageIndex: node.usageIndex,
      iterationIndex: null,
      component: node.component,
      instanceCount: node.instanceCount,
    });
  }

  function isSelected(node: SelectionTreeNode): boolean {
    return (
      selection !== null &&
      selection.frameId === node.frameId &&
      selection.usageIndex === node.usageIndex
    );
  }

  // the observer chain: canvas body + every kit frame body. Debounced
  // refresh (mutation bursts from HMR or agent writes coalesce).
  $effect(() => {
    if (iframe === null) return;
    refresh();
    const observers: MutationObserver[] = [];
    const loadListeners: Array<[EventTarget, () => void]> = [];
    let timer: ReturnType<typeof setTimeout> | null = null;
    const schedule = (): void => {
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        refresh();
        attachFrameObservers();
      }, 150);
    };

    function observeBody(doc: Document | null): MutationObserver | null {
      const body = doc?.body ?? doc?.documentElement ?? null;
      if (body === null || typeof MutationObserver === 'undefined') return null;
      const observer = new MutationObserver(schedule);
      observer.observe(body, { childList: true, subtree: true });
      observers.push(observer);
      return observer;
    }

    function attachFrameObservers(): void {
      const doc = safeDocument(iframe);
      if (doc === null) return;
      for (const frame of Array.from(doc.querySelectorAll('iframe'))) {
        const onLoad = (): void => {
          observeBody(safeDocument(frame));
          schedule();
        };
        frame.addEventListener('load', onLoad);
        loadListeners.push([frame, onLoad]);
        observeBody(safeDocument(frame)); // already-loaded frames
      }
    }

    observeBody(safeDocument(iframe));
    attachFrameObservers();
    iframe.addEventListener('load', schedule);
    return () => {
      if (timer !== null) clearTimeout(timer);
      iframe.removeEventListener('load', schedule);
      for (const observer of observers) observer.disconnect();
      for (const [target, onLoad] of loadListeners) target.removeEventListener('load', onLoad);
    };
  });
</script>

{#snippet nodeView(node: SelectionTreeNode)}
  <div class="tree-node">
    <button class="tree-row" class:selected={isSelected(node)} onclick={() => pick(node)} title={node.frameId ?? 'canvas'}>
      <span class="tree-component">{node.component}</span>
      <span class="tree-index">#{node.usageIndex}</span>
      {#if node.instanceCount > 1}
        <span class="tree-shared" title="{node.instanceCount} instances share this usage">{node.instanceCount}×</span>
      {/if}
    </button>
    {#if node.children.length > 0}
      <div class="tree-children">
        {#each node.children as child (`${child.frameId ?? ''}#${child.usageIndex}`)}
          {@render nodeView(child)}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<section class="tree">
  <header class="tree-head">components</header>
  {#if groups.length === 0}
    <p class="tree-empty">no stamped components in this canvas — the tree is the jixoai usage tree</p>
  {:else}
    <div class="tree-flow">
      {#each groups as group (group.frameId ?? 'canvas')}
        <div class="tree-frame">
          {#if group.frameId !== null}
            <span class="tree-frame-label">{group.frameId}</span>
          {:else}
            <span class="tree-frame-label">canvas</span>
          {/if}
          {#each group.roots as node (`${node.frameId ?? ''}#${node.usageIndex}`)}
            {@render nodeView(node)}
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .tree {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 0 1 auto;
    max-height: 45%;
    border-top: 1px solid #262320;
    padding-top: 0.75rem;
  }
  .tree-head {
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.6875rem;
    color: #b9b2a6;
    padding: 0 0.25rem 0.5rem;
  }
  .tree-empty {
    margin: 0 0.25rem;
    color: #8d8578;
    line-height: 1.5;
    font-size: 0.6875rem;
  }
  .tree-flow {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .tree-frame {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  .tree-frame-label {
    font-size: 0.625rem;
    color: #6f6759;
    letter-spacing: 0.05em;
    padding: 0.125rem 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tree-node {
    display: flex;
    flex-direction: column;
  }
  .tree-row {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: baseline;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    color: #b9b2a6;
  }
  .tree-row:hover {
    background: #1b1917;
    color: #e8e4dd;
  }
  .tree-row.selected {
    background: #262320;
    color: #f5f1e8;
  }
  .tree-component {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tree-index {
    color: #6f6759;
    font-size: 0.625rem;
  }
  .tree-shared {
    color: #c9a86a;
    font-size: 0.625rem;
    border: 1px solid #3a352f;
    border-radius: 3px;
    padding: 0 0.25rem;
  }
  .tree-children {
    margin-left: 0.75rem;
    border-left: 1px solid #262320;
    padding-left: 0.375rem;
    display: flex;
    flex-direction: column;
  }
</style>
