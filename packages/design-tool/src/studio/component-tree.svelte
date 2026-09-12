<!--
  @jixoai/ui-design (studio) — the unified canvas tree (r2 T5 → r3 #20).

  Orthogonal intent (1): ONE tree per canvas — the manifest's frames as
  `page: <id>` folders (the navigator's old anchor rows, W1), rendered
  by the registry's own tree-view item (issue #20: "use our own
  components") — one dogfood level deeper than the r3 T4 list-item
  skin. The r2-era `components: canvas` group is RETIRED (#33, Owner
  2026-09-12): pages+components are joined INSIDE the page folders;
  the canvas doc's own kit wrappers (prototype-kit #1…#12) are
  structural scaffolding, not content — they stay canvas-pickable but
  leave the tree.

  Dynamic loading (#20): a frame's stamp records are collected ONLY
  when its page node is expanded (collectFrameRecords by the kit iframe
  name); the canvas-doc layer is eager (top level). The 1s gated poll
  re-walks ONLY expanded folders — HMR freshness where it is visible,
  zero walk cost where it is not. Expansion survives reloads through
  sessionStorage (the selection-persistence pattern, same file).

  Activation law (tree-view's documented seams): page folders ANCHOR
  the preview (hash scroll, W1 assertion ②) and toggle; usage rows
  pick — highlight DOWN into the frame document, selection UP to the
  chip/panel (W3); a usage row that has children picks AND toggles
  (onactivate runs before the default folder-toggle; leaves ride the
  default onselect). {#each} iterations stay one row with an N× label.
  tree-view's expansion is uncontrolled after mount — the shell keys
  this component per canvas so defaultExpanded re-reads per canvas.

  Honest degradation (unchanged from r2): the tree is the STAMP tree —
  native elements, third-party components and rest-spread-less
  components are absent by design.

  Walk instrumentation: window.__jixoaiDesignWalks counts walks per
  source (canvas + per frame id) — the lazy-load smoke's evidence
  channel, installed like the studio's other window seams.

  Original need: Owner 2026-09-11 (design-studio-r2 T5); r3 issue #20
  (2026-09-12 — the unified treeView + dynamic loading ruling).
  Svelte 5 runes.
-->
<script lang="ts">
  import Icon from '#jixoai/icon';
  import Empty from '#jixoai/empty';
  import Spin from '#jixoai/spin';
  import TreeView, { type TreeItemCtx, type TreeNode } from '#jixoai/tree-view';
  import { recordsSignature } from './equivalence.ts';
  import {
    FRAME_NAME_PREFIX,
    buildSelectionTree,
    collectFrameRecords,
    type DesignFrameSeams,
    type DesignSelection,
    type DesignStudioSeams,
    type SelectionTreeNode,
    type StampRecord,
  } from './selection.ts';

  /** page-folder name prefix (tree paths) */
  const PAGE_PREFIX = 'page: ';

  /** per-node payload handed back by every tree-view ctx */
  type TreeMeta =
    | { readonly kind: 'page'; readonly frameId: string; readonly ref?: string }
    | { readonly kind: 'canvas-group' }
    | { readonly kind: 'usage'; readonly node: SelectionTreeNode };

  let {
    iframe = null,
    canvas = null,
    frames = [],
    selection = null,
    onSelect = (): void => {},
    onAnchorFrame = (): void => {},
  }: {
    /** the live canvas iframe element (bind:this from the shell) */
    iframe?: HTMLIFrameElement | null;
    /** the canvas name — the shell keys this component on it */
    canvas?: string | null;
    /** the manifest's frame list (the page folders, manifest order) */
    frames?: readonly { readonly id: string; readonly ref?: string }[];
    /** the studio's shared selection (row highlighting) */
    selection?: DesignSelection | null;
    /** selection flows up to the shell (chip + chat context) */
    onSelect?: (selection: DesignSelection) => void;
    /** page-folder anchor: the shell points the preview src at #<frameId> */
    onAnchorFrame?: (frameId: string) => void;
  } = $props();

  /* ── the records state: canvas layer eager, frame layers lazy ──────── */

  // #12/T0 layer 3 (same-type audit) — per-SOURCE signature gates.
  // Non-reactive on purpose; a poll that leaves a source's stamp tree
  // unchanged writes NOTHING (zero re-derivation downstream). Gates
  // reset per iframe lifecycle (a canvas switch forces one honest
  // re-write).
  const frameGates: Record<string, string | null> = {};
  /** frameId → its stamp records (presence = the frame was walked) */
  const frameRecords = $state<Record<string, StampRecord[]>>({});

  /* ── expansion: tree-view is uncontrolled; mirror + persist ────────── */

  const EXPANDED_STORE_KEY = 'jx-design:tree-expanded';

  function restoreExpanded(canvasName: string | null): string[] {
    if (canvasName === null) return [];
    try {
      const raw = sessionStorage.getItem(EXPANDED_STORE_KEY);
      const map = raw === null ? {} : (JSON.parse(raw) as Record<string, unknown>);
      return Array.isArray(map[canvasName]) ? ([...map[canvasName]] as string[]) : [];
    } catch {
      return [];
    }
  }

  function persistExpanded(canvasName: string | null, ids: ReadonlySet<string>): void {
    if (canvasName === null) return;
    try {
      const raw = sessionStorage.getItem(EXPANDED_STORE_KEY);
      const map = raw === null ? {} : (JSON.parse(raw) as Record<string, string[]>);
      map[canvasName] = [...ids];
      sessionStorage.setItem(EXPANDED_STORE_KEY, JSON.stringify(map));
    } catch {
      /* private mode etc. — persistence is best-effort (the selection store's law) */
    }
  }

  /** tree-view's uncontrolled expansion, mirrored for lazy walks + the store */
  let expandedMirror = new Set<string>(restoreExpanded(canvas));
  /** captured ONCE — tree-view reads defaultExpanded at mount only (per-canvas key) */
  const defaultExpanded = [...expandedMirror];

  /* ── the walks (lazy per frame; canvas layer eager) ────────────────── */

  function safeDocument(element: HTMLIFrameElement | null): Document | null {
    try {
      return element?.contentDocument ?? null;
    } catch {
      return null; // cross-origin — not a design frame
    }
  }

  /** the #20 evidence channel: non-reactive counters, never rendered */
  function bumpWalk(frameId: string): void {
    if (typeof window === 'undefined') return;
    const seams = window as unknown as DesignStudioSeams;
    seams.__jixoaiDesignWalks ??= { canvas: 0, frames: {} };
    seams.__jixoaiDesignWalks.frames[frameId] =
      (seams.__jixoaiDesignWalks.frames[frameId] ?? 0) + 1;
  }

  function walkFrame(frameId: string): void {
    bumpWalk(frameId);
    const doc = safeDocument(iframe);
    let next: StampRecord[] = [];
    if (doc !== null) {
      try {
        next = collectFrameRecords(Array.from(doc.querySelectorAll('iframe')), frameId);
      } catch {
        next = []; // mid-teardown — re-walked on the next poll/expand
      }
    }
    const signature = recordsSignature(next);
    if (signature !== frameGates[frameId]) {
      frameGates[frameId] = signature;
      frameRecords[frameId] = next;
    }
  }

  /** the gated poll: ONLY expanded page folders (#33 — the canvas
   *  layer retired with its group) */
  function refresh(): void {
    for (const id of expandedMirror) {
      if (!id.startsWith(PAGE_PREFIX)) continue;
      walkFrame(id.slice(PAGE_PREFIX.length));
    }
  }

  /* ── the tree shape ─────────────────────────────────────────────────── */

  function usageNodes(roots: readonly SelectionTreeNode[]): TreeNode<TreeMeta>[] {
    return roots.map((node) => ({
      name: `${node.component} #${node.usageIndex}`,
      // childless usages are LEAVES (selectable); nested usages fold
      children: node.children.length > 0 ? usageNodes(node.children) : undefined,
      meta: { kind: 'usage', node },
    }));
  }

  const nodes = $derived.by(() => {
    return frames.map((frame) => ({
      name: `${PAGE_PREFIX}${frame.id}`,
      // [] (never undefined): a page node is ALWAYS a folder —
      // expandable from the start, children arrive on the lazy walk
      children: usageNodes(buildSelectionTree(frameRecords[frame.id] ?? [])),
      meta: { kind: 'page', frameId: frame.id, ref: frame.ref },
    }));
  });

  /** #35: an expanded page folder with no stamps yet reads LOADING —
   *  honest while the owning frame iframe mounts/loads; resolves to
   *  false the moment records arrive or the frame proves empty */
  function frameLoading(frameId: string): boolean {
    const records = frameRecords[frameId];
    if (records !== undefined && records.length > 0) return false;
    const doc = safeDocument(iframe);
    if (doc === null) return true; // canvas itself loading
    const frameEl = Array.from(doc.querySelectorAll('iframe')).find(
      (f) => f.name === `${FRAME_NAME_PREFIX}${frameId}`,
    );
    if (frameEl === undefined) return true; // not mounted yet
    // mounted: loading until the REAL frame document completed — a
    // fresh iframe starts at about:blank whose readyState is already
    // 'complete' (the false-negative hole), so the /__design__/frame
    // pathname gates it; complete-but-unstamped after that = genuinely
    // empty, the chevron's call
    try {
      const doc = frameEl.contentDocument;
      return (
        doc === null ||
        !doc.location.pathname.startsWith('/__design__/') ||
        doc.readyState !== 'complete'
      );
    } catch {
      return true; // cross-origin mid-teardown — treat as loading
    }
  }

  /** selection → the leaf/folder path it addresses (row highlight) */
  const selectedPath = $derived.by(() =>
    selection === null ? undefined : findUsagePath(nodes, selection),
  );

  /** the hover twin (#31): the canvas picker reports hovers up; the
   *  matching row lights (transient — never persisted, never selected) */
  let hoverSelection: DesignSelection | null = $state(null);
  const hoverPath = $derived.by(() =>
    hoverSelection === null ? undefined : findUsagePath(nodes, hoverSelection),
  );

  $effect(() => {
    const onHover = (event: Event): void => {
      hoverSelection = (event as CustomEvent<DesignSelection | null>).detail;
    };
    window.addEventListener('jx-design:hover', onHover);
    return () => window.removeEventListener('jx-design:hover', onHover);
  });

  /** row hover (#31, the DOWN direction): light the element in its frame */
  function hoverUsage(node: SelectionTreeNode): void {
    const doc = safeDocument(iframe);
    if (doc === null) return;
    const target =
      node.frameId === null
        ? iframe?.contentWindow
        : (Array.from(doc.querySelectorAll('iframe')).find(
            (f) => f.name === `${FRAME_NAME_PREFIX}${node.frameId}`,
          )?.contentWindow ?? null);
    const seams = target as (Window & DesignFrameSeams) | null;
    seams?.__jixoaiDesignHover?.({ usageIndex: node.usageIndex, iterationIndex: null });
  }
  function unhoverUsage(): void {
    hoverClearAll();
  }
  function hoverClearAll(): void {
    const doc = safeDocument(iframe);
    if (doc === null) return;
    // every frame's hover seam clears; canvas-doc usages are tree-
    // invisible since #33, so the frame set is complete
    for (const frame of doc.querySelectorAll('iframe')) {
      const seams = frame.contentWindow as (Window & DesignFrameSeams) | null;
      seams?.__jixoaiDesignHover?.(null);
    }
  }

  function findUsagePath(
    list: readonly TreeNode<TreeMeta>[],
    target: DesignSelection,
    parent = '',
  ): string | undefined {
    for (const node of list) {
      const path = parent === '' ? node.name : `${parent}/${node.name}`;
      if (
        node.meta?.kind === 'usage' &&
        node.meta.node.frameId === target.frameId &&
        node.meta.node.usageIndex === target.usageIndex
      ) {
        return path;
      }
      if (node.children !== undefined) {
        const hit = findUsagePath(node.children, target, path);
        if (hit !== undefined) return hit;
      }
    }
    return undefined;
  }

  /* ── activation: the W1/W3 semantics over tree-view's seams ────────── */

  /** tree click: highlight DOWN into the right document, select UP */
  function pick(node: SelectionTreeNode): void {
    const doc = safeDocument(iframe);
    if (doc !== null) {
      const target =
        node.frameId === null
          ? iframe?.contentWindow
          : (Array.from(doc.querySelectorAll('iframe')).find(
              (f) => f.name === `${FRAME_NAME_PREFIX}${node.frameId}`,
            )?.contentWindow ?? null);
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

  function onActivate(ctx: TreeItemCtx<TreeMeta>): void {
    const meta = ctx.node.meta;
    if (meta?.kind === 'page') {
      // W1 assertion ②: anchoring rides the page row (the hash scroll);
      // NO preventDefault — the folder still toggles (expand = reveal)
      onAnchorFrame(meta.frameId);
    } else if (meta?.kind === 'usage' && ctx.isFolder) {
      // W3 on branch rows: pick AND toggle (the seam runs first, the
      // default folder-toggle follows; leaf rows pick via onselect)
      pick(meta.node);
    }
    // canvas-group folders toggle plainly; leaves reach onselect below
  }

  function onToggle(ctx: TreeItemCtx<TreeMeta>): void {
    if (ctx.expanded) expandedMirror.add(ctx.id);
    else expandedMirror.delete(ctx.id);
    persistExpanded(canvas, expandedMirror);
    const meta = ctx.node.meta;
    // the lazy walk: EVERY expansion collects (a reload may have aged
    // the records; the signature gate keeps it free when it has not)
    if (ctx.expanded && meta?.kind === 'page') walkFrame(meta.frameId);
  }

  function onSelectLeaf(ctx: TreeItemCtx<TreeMeta>): void {
    if (ctx.node.meta?.kind === 'usage') pick(ctx.node.meta.node);
  }

  /* ── the freshness bus (GATE-0 law): 1s gated poll + load events ───── */

  $effect(() => {
    if (iframe === null) return;
    // capture the element ONCE: the cleanup below runs when bind:this
    // has already nulled the reactive prop ({#key} swap) — reading
    // `iframe` there throws 'removeEventListener of null' and can
    // abort the surrounding flush (GATE-0 diagnosis, 2026-09-12)
    const element = iframe;
    for (const key of Object.keys(frameGates)) delete frameGates[key];
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

<!-- #35: the caret override (registry component/tree-view-caret) — the
     loading page folder's chevron becomes a Spin; every other node keeps
     the native chevron look inside the jx-tree-caret span (rotation CSS
     still applies) -->
{#snippet studioCaret(ctx: TreeItemCtx<TreeMeta>)}
  {#if ctx.node.meta?.kind === 'page' && ctx.expanded && frameLoading(ctx.node.meta.frameId)}
    <Spin spinner="dots" size={10} interval="auto" linger="auto" label="loading frame" />
  {:else}
    <Icon name="chevronDown" size={10} />
  {/if}
{/snippet}

{#snippet usageLabel(ctx: TreeItemCtx<TreeMeta>)}
  {#if ctx.node.meta?.kind === 'usage'}
    {@const node = ctx.node.meta.node}
    <span
      class="tree-usage{ctx.id === selectedPath ? ' selected' : ''}{ctx.id === hoverPath ? ' hovered' : ''}"
      onmouseenter={() => hoverUsage(node)}
      onmouseleave={() => unhoverUsage()}
    >
      {node.component}{' '}
      <span class="tree-usage-index">#{node.usageIndex}</span>
      {#if node.instanceCount > 1}
        {' '}<span class="tree-count" title="{node.instanceCount} instances share this usage">{node.instanceCount}×</span>
      {/if}
    </span>
  {:else}
    {ctx.node.name}
  {/if}
{/snippet}

<section class="tree">
  <header class="tree-head">{canvas ?? 'canvas'}</header>
  {#if frames.length === 0}
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
      <TreeView
        {nodes}
        {defaultExpanded}
        selected={selectedPath}
        ariaLabel={`canvas tree: ${canvas ?? ''}`}
        indent={14}
        caret={studioCaret}
        onactivate={onActivate}
        ontoggle={onToggle}
        onselect={onSelectLeaf}
      >
        {#snippet label(ctx: TreeItemCtx<TreeMeta>)}
          {@render usageLabel(ctx)}
        {/snippet}
      </TreeView>
    </div>
  {/if}
</section>

<style>
  .tree {
    /* the left column's FLEXIBLE lower zone (r3 T2/ID10): the nav's
       flex column hands this section the leftover height and
       .tree-flow scrolls inside (min-height:0 chain) */
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tree-empty {
    margin: 0 0.25rem;
  }
  .tree-flow {
    overflow-y: auto;
    overflow-x: hidden; /* #36: long row names never leak page width */
    min-height: 0;
    flex: 1 1 0;
  }
  /* usage-row label ink: the index and the N× sharing note read as
     annotations (spacing + tone only — tree-view owns row chrome) */
  .tree-usage {
    display: inline-flex;
    align-items: baseline;
    gap: 0.25rem;
    min-width: 0;
  }
  .tree-usage.selected {
    color: #f5f1e8;
  }
  /* #31: hover reads as the canvas hover outline's twin — the same
     lower-opacity accent, never the selected weight */
  .tree-usage.hovered {
    color: #d3e4ff;
  }
  .tree-usage-index {
    color: #a39a8b;
  }
  .tree-count {
    color: #a39a8b;
    font-size: 0.625rem;
  }
</style>
