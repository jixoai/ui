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
  event-driven, never polled. Writes are GATED (#12/T0): a burst that
  leaves the stamp records structurally unchanged never rewrites
  $state (highlight toggles and HMR no-ops cause zero re-derivation).

  Honest degradation: the tree = the STAMP tree (r2 ruling) — native
  elements, third-party components and rest-spread-less components
  are absent by design.

  r3 T4 skin (issue #10): the rows are the host's REAL list-item
  family via the #jixoai/ alias — link rows (the family's interactive
  row law: anchors carry the hover; activation stays intercepted, the
  pick/highlight/select semantics are untouched). Nesting is the
  family's nested-group transition (no tree form exists in the family
  yet — Q1 in the grindstone ledger): each frame is a plain
  ItemGroup, each branch nests one more inside its li. The empty
  state is the empty item. `.tree-row` / `.selected` survive as the
  walkthrough scripts' DOM hooks (the canvas-playground data-hook
  precedent), not as chrome.

  Original need: Owner 2026-09-11 (design-studio-r2 T5). Svelte 5
  runes.
-->
<script lang="ts">
  import Empty from '#jixoai/empty';
  import { Item, ItemAfter, ItemContent, ItemEnd, ItemGroup, ItemTitle } from '#jixoai/list-item';
  import { recordsSignature } from './equivalence.ts';
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
  // #12 T0 layer 3 (same-type audit) — the records source gate: the
  // last accepted signature. Non-reactive on purpose; an observer
  // burst that leaves the stamp tree unchanged writes NOTHING, so
  // tree/groups identities stay stable. Reset per iframe lifecycle
  // (canvas switches force one honest re-write).
  let recordsGate: string | null = null;
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

  /** the gated $state write: only a structurally changed walk lands */
  function commitRecords(next: StampRecord[]): void {
    const signature = recordsSignature(next);
    if (signature !== recordsGate) {
      recordsGate = signature;
      records = next;
    }
  }

  function refresh(): void {
    const doc = safeDocument(iframe);
    if (doc === null) {
      commitRecords([]);
      return;
    }
    try {
      commitRecords(collectCanvasRecords(doc, Array.from(doc.querySelectorAll('iframe'))));
    } catch {
      commitRecords([]); // mid-teardown document — the next event re-walks
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

  // GATE-0 rewrite (2026-09-12): the MutationObserver chain across
  // ten same-origin nested iframes died silently after the first
  // burst (canvas-level rows only, frame-interior components never
  // entered the tree; the load-listener algebra was fragile in every
  // direction probed). The equivalence gate already makes a poll
  // CHEAP — a walk matching the gate writes nothing, downstream
  // identities see zero churn — so a boring 1s interval plus the
  // canvas load event replaces the whole observer labyrinth.
  // Boring and bulletproof beats elegant and dead.
  $effect(() => {
    if (iframe === null) return;
    // capture the element ONCE: the cleanup below runs when bind:this
    // has already nulled the reactive prop ({#key} swap) — reading
    // `iframe` there throws 'removeEventListener of null' and can
    // abort the surrounding flush (GATE-0 diagnosis, 2026-09-12)
    const element = iframe;
    recordsGate = null; // fresh iframe lifecycle — force the first write
    refresh();
    const interval = setInterval(() => refresh(), 1000);
    const onLoad = (): void => refresh();
    element.addEventListener('load', onLoad);
    return () => {
      clearInterval(interval);
      element.removeEventListener('load', onLoad);
    };
  });
</script>

{#snippet nodeView(node: SelectionTreeNode)}
  <!-- link rows (the family's interactive-row law) with intercepted
       activation: the click picks DOWN (frame highlight) and UP
       (selection) — the exact same pick() call as the button era -->
  <Item
    class={`tree-row${isSelected(node) ? ' selected' : ''}`}
    href={`#${node.frameId ?? 'canvas'}-${node.usageIndex}`}
    selected={isSelected(node)}
    title={node.frameId ?? 'canvas'}
    onclick={(event) => {
      event.preventDefault();
      pick(node);
    }}
  >
    <ItemContent wrap="truncate">
      <ItemTitle>{node.component}</ItemTitle>
    </ItemContent>
    <ItemEnd wrap="never">
      <ItemAfter>#{node.usageIndex}</ItemAfter>
      {#if node.instanceCount > 1}
        <ItemAfter tone="default" title="{node.instanceCount} instances share this usage">{node.instanceCount}×</ItemAfter>
      {/if}
    </ItemEnd>
  </Item>
  {#if node.children.length > 0}
    <!-- the Q1 transition form: no tree primitive in the family yet,
         so a branch is one more plain group inside its own list row;
         the indentation guide (margin + hairline) is layout, not
         chrome -->
    <li data-slot="item-row" class="tree-branch">
      <ItemGroup mode="plain" density="xs" dividers="none" class="tree-branch-group">
        {#each node.children as child (`${child.frameId ?? ''}#${child.usageIndex}`)}
          {@render nodeView(child)}
        {/each}
      </ItemGroup>
    </li>
  {/if}
{/snippet}

<section class="tree">
  <header class="tree-head">components</header>
  {#if groups.length === 0}
    <Empty
      density="xs"
      class="tree-empty"
      title="no stamped components"
      description="the tree is the jixoai usage tree"
    >
      {#snippet illustration()}
        <span class="text-muted-foreground">ls canvas/</span>
        <span class="text-primary">0 stamped</span>
      {/snippet}
    </Empty>
  {:else}
    <div class="tree-flow">
      {#each groups as group (group.frameId ?? 'canvas')}
        <ItemGroup
          mode="plain"
          density="xs"
          dividers="none"
          label={group.frameId ?? 'canvas'}
          class="tree-frame"
        >
          {#each group.roots as node (`${node.frameId ?? ''}#${node.usageIndex}`)}
            {@render nodeView(node)}
          {/each}
        </ItemGroup>
      {/each}
    </div>
  {/if}
</section>

<style>
  .tree {
    /* r3 T2 (ID10): the left column's FLEXIBLE lower zone — the 45%
       max-height hardcode is gone; the nav's flex column hands this
       section the leftover height (flex basis 0) and .tree-flow
       scrolls inside (min-height:0 chain). The section divide above
       is the shell's Separator (r3 T4) — no border-top here anymore */
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
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
  }
  .tree-flow {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 0;
  }
  /* the row rhythm INSIDE a frame/branch group: the family's
     dividers-none gap (one --jx-stack) is the beat; tighten the
     branch lanes so deep nesting stays scannable (spacing, not
     chrome) */
  .tree-branch {
    margin-left: 0.75rem;
    border-left: 1px solid #262320;
    padding-left: 0.375rem;
  }
</style>
