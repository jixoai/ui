<!--
  jixoai tree view, generic core (registry/files/ui/tree-view.svelte).

  Original request (2026-08-22): the old file-tree view was over-styled and
  closed. Rebuild it as a GENERIC ARIA tree with an extension surface:
  1. prefix/suffix slots (Snippet<[ctx]>) + onPrefixSlotRender /
     onSuffixSlotRender resolvers that pick a snippet per node context;
  2. disabled nodes (focusable per APG, never activatable);
  3. built-in style variants only — toggle ('chevron' | 'plus'), lines
     (guide rails), indent (px per level). Everything else is fixed law.

  Intent list (orthogonal, max 5):
  - data model: nested TreeNode<T> (name/children/disabled/meta), paths
    built recursively; `meta` is the payload handed back in every ctx.
  - extension surface: prefix/suffix/label snippets + resolver callbacks;
    onactivate runs BEFORE default behavior and can set
    ctx.preventDefault() to own the action (the multiselect seam).
  - selection: single, consumer-controlled via the `selected` id prop;
    folders toggle on activate, leaves select (file-tree lineage).
  - keyboard contract (APG tree): roving tabindex, arrows / Home / End /
    Enter / Space on the tree root; collapsed extents are inert.
  - paint law: font-nav 12px on line-height 2, hover 5% fill, selected =
    terminal-hover fill + 2px primary left edge, disabled 50% opacity,
    suffix revealed on row hover/focus-within (the actions-row law).

  画蛇添足 removed vs the old file-tree view: language-tinted status dots,
  inferTreeLang coupling, file payload semantics. The code workbench file
  protocol now lives in component-canvas.svelte. Built-in file/folder
  icons returned by user request (2026-08-22) as a zero-config opt-in
  (fileIcons) under the monochrome law — consumer prefix snippets still
  win per node.

  tw4 (2026-08-24): static paint (rows, columns, collapse groups,
  disabled/selected states) rides token utilities in the markup as
  DETERMINISTIC per-state strings; tree-view.css keeps only the
  D1-exempt residue — the guide-rail pseudo build, the hover/focus-
  within descendant repaints, the collapsed caret flip, focus-visible
  and the reduced-motion kill.
-->
<script lang="ts" module>
  import type { Snippet } from 'svelte';
  /**
   * Generic tree node. `children` presence makes the node a folder
   * (expandable); `meta` is the consumer payload returned in every ctx.
   */
  export interface TreeNode<T = unknown> {
    name: string;
    children?: TreeNode<T>[];
    /** focusable but not activatable (APG disabled treeitem) */
    disabled?: boolean;
    /** consumer payload — flows untouched into TreeItemCtx.node.meta */
    meta?: T;
  }

  /** Per-node context handed to slots, resolvers and callbacks. */
  export interface TreeItemCtx<T = unknown> {
    node: TreeNode<T>;
    /** full path id ("src/lib/ui"); selection/expanded state key */
    id: string;
    /** 1-based depth */
    depth: number;
    isFolder: boolean;
    expanded: boolean;
    selected: boolean;
    disabled: boolean;
    /** true after preventDefault() cancelled the default behavior */
    readonly defaultPrevented: boolean;
    /** inside onactivate: cancel the default folder-toggle / leaf-select */
    preventDefault(): void;
  }

  /** resolver: pick a snippet per node, or nothing to skip the column */
  export type TreeSlotRender<T = unknown> = (
    ctx: TreeItemCtx<T>,
  ) => Snippet<[TreeItemCtx<T>]> | undefined | null | false;

  /** flat index entry: path ↔ node (+ parent path) */
  export interface TreeIndexEntry<T = unknown> {
    path: string;
    node: TreeNode<T>;
    parentPath: string | null;
  }

  /**
   * path index over a node list ("src/lib/ui" law): extensions
   * (multiselect cascade, …) share the core's id semantics instead of
   * re-deriving them.
   */
  export function buildTreeIndex<T>(nodes: TreeNode<T>[]): Map<string, TreeIndexEntry<T>> {
    const map = new Map<string, TreeIndexEntry<T>>();
    const walk = (list: TreeNode<T>[], parent: string | null): void => {
      for (const node of list) {
        const path = parent === null ? node.name : `${parent}/${node.name}`;
        map.set(path, { path, node, parentPath: parent });
        if (node.children) walk(node.children, path);
      }
    };
    walk(nodes, null);
    return map;
  }

  /**
   * paths of every node disabled by its own flag OR by a disabled
   * ancestor — the one frozen-subtree law shared by the core (activation
   * guard, keyboard walker) and extensions (cascade skipping).
   */
  export function collectFrozenPaths<T>(nodes: TreeNode<T>[]): Set<string> {
    const frozen = new Set<string>();
    const walk = (list: TreeNode<T>[], parent: string | null, frozenParent: boolean): void => {
      for (const node of list) {
        const path = parent === null ? node.name : `${parent}/${node.name}`;
        const isFrozen = frozenParent || node.disabled === true;
        if (isFrozen) frozen.add(path);
        if (node.children) walk(node.children, path, isFrozen);
      }
    };
    walk(nodes, null, false);
    return frozen;
  }
</script>

<script lang="ts" generics="T = unknown">
  import { icons } from '$lib/icons';
  import { cn } from '$lib/utils';
  import './tree-view.css';

  interface Props {
    nodes: TreeNode<T>[];
    /** folder ids expanded on mount; uncontrolled afterwards */
    defaultExpanded?: string[];
    /** single-selection path id (consumer-owned; leaves select) */
    selected?: string;
    /** prefix column — rendered for every node with the item ctx */
    prefix?: Snippet<[TreeItemCtx<T>]>;
    /** suffix column — hidden until row hover/focus-within (actions law) */
    suffix?: Snippet<[TreeItemCtx<T>]>;
    /** dynamic prefix: pick a snippet per node; wins over `prefix` */
    onPrefixSlotRender?: TreeSlotRender<T>;
    /** dynamic suffix: pick a snippet per node; wins over `suffix` */
    onSuffixSlotRender?: TreeSlotRender<T>;
    /** label override (default: node.name) */
    label?: Snippet<[TreeItemCtx<T>]>;
    /** click / Enter / Space — runs first; ctx.preventDefault() cancels default */
    onactivate?: (ctx: TreeItemCtx<T>) => void;
    /** folder expand/collapse; ctx.expanded is the NEW state */
    ontoggle?: (ctx: TreeItemCtx<T>) => void;
    /** leaf selection; ctx.selected is the pre-callback snapshot — the
     *  controlled `selected` prop remains the source of truth */
    onselect?: (ctx: TreeItemCtx<T>) => void;
    /** toggler glyph variant (built-in) */
    toggle?: 'chevron' | 'plus';
    /**
     * Built-in file-tree icons in the prefix column: folders paint
     * folder/folder-open (following expansion), leaves paint a file glyph.
     * A consumer prefix snippet or onPrefixSlotRender result always wins
     * per node — this is the zero-config default, not a takeover.
     */
    fileIcons?: boolean;
    /** vertical guide rails per indent level (built-in) */
    lines?: boolean;
    /** px per level (built-in) */
    indent?: number;
    ariaLabel?: string;
    class?: string;
  }

  let {
    nodes,
    defaultExpanded = [],
    selected,
    prefix,
    suffix,
    onPrefixSlotRender,
    onSuffixSlotRender,
    label,
    onactivate,
    ontoggle,
    onselect,
    toggle = 'chevron',
    fileIcons = false,
    lines = false,
    indent = 16,
    ariaLabel = 'tree',
    class: className = '',
  }: Props = $props();

  // expanded folder ids; collapsed groups carry data-collapsed + inert so
  // the keyboard walker never sees hidden rows. defaultExpanded is
  // deliberately captured once — expansion is uncontrolled after mount.
  // svelte-ignore state_referenced_locally
  let expandedIds = $state(new Set(defaultExpanded));

  // path → entry, rebuilt whenever the nodes prop changes
  const byPath = $derived(buildTreeIndex(nodes));

  // disabled propagates: a disabled folder freezes its whole subtree
  // (its children may be visible but are never activatable)
  const frozenPaths = $derived(collectFrozenPaths(nodes));

  function togglePath(path: string, node: TreeNode<T>): void {
    const next = new Set(expandedIds);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    expandedIds = next;
    ontoggle?.(makeCtx({ path, node }, next.has(path)));
  }

  function makeCtx(
    entry: { path: string; node: TreeNode<T>; parentPath?: string | null },
    expandedOverride?: boolean,
  ): TreeItemCtx<T> {
    const isFolder = entry.node.children !== undefined;
    // preventDefault() flips a closure flag behind the readonly prop —
    // the documented extension contract (consumers never assign directly)
    let prevented = false;
    return {
      node: entry.node,
      id: entry.path,
      depth: entry.path.split('/').length,
      isFolder,
      expanded: expandedOverride ?? (isFolder && expandedIds.has(entry.path)),
      selected: entry.path === selected,
      disabled: frozenPaths.has(entry.path),
      get defaultPrevented(): boolean {
        return prevented;
      },
      preventDefault(): void {
        prevented = true;
      },
    };
  }

  // activation: onactivate seam first (extensions own the action by
  // calling ctx.preventDefault()), then folder→toggle / leaf→select.
  // Disabled rows are not activatable AT ALL — not even the seam fires.
  function activate(entry: TreeIndexEntry<T>, el: HTMLElement): void {
    el.focus();
    focusPath = entry.path;
    if (frozenPaths.has(entry.path)) return;
    const ctx = makeCtx(entry);
    onactivate?.(ctx);
    if (ctx.defaultPrevented) return;
    if (ctx.isFolder) {
      togglePath(entry.path, entry.node);
    } else {
      onselect?.(ctx);
    }
  }

  // ---- roving tabindex ------------------------------------------------
  const initialStop = $derived.by(() => {
    if (selected != null && byPath.has(selected)) return selected;
    return nodes.length > 0 ? (byPath.keys().next().value ?? null) : null;
  });
  let focusPath = $state<string | null>(null);

  let root: HTMLUListElement | undefined = $state();

  function visibleItems(): HTMLElement[] {
    if (!root) return [];
    return [...root.querySelectorAll<HTMLElement>('li[role="treeitem"]')].filter(
      (el) => !el.closest('[data-collapsed]'),
    );
  }

  function onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const path = target?.dataset.path;
    if (!path) return;
    const entry = byPath.get(path);
    if (!entry) return;
    // focus inside a suffix/prefix control never reaches here (no
    // data-path on the control) — interactive descendants own their keys

    const items = visibleItems();
    const index = items.findIndex((el) => el.dataset.path === path);
    const focusAt = (i: number): void => {
      const el = items[i];
      if (el) {
        el.focus();
        focusPath = el.dataset.path ?? null;
      }
    };
    const focusPathItem = (p: string | null): void => {
      const el = items.find((item) => item.dataset.path === p);
      if (el) {
        el.focus();
        focusPath = p;
      }
    };

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusAt(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusAt(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (entry.node.children) {
          // frozen folders never expand — but walking INTO an already
          // open one is still navigation, not activation
          if (!expandedIds.has(path) && !frozenPaths.has(path)) togglePath(path, entry.node);
          else focusAt(index + 1);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        // frozen folders never collapse; the focus return to the parent
        // stays available (navigation, not activation)
        if (entry.node.children && expandedIds.has(path) && !frozenPaths.has(path)) togglePath(path, entry.node);
        else focusPathItem(entry.parentPath);
        break;
      case 'Home':
        event.preventDefault();
        focusAt(0);
        break;
      case 'End':
        event.preventDefault();
        focusAt(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        activate(entry, target as HTMLElement);
        break;
    }
  }
</script>

<ul
  role="tree"
  aria-label={ariaLabel}
  class={cn('jx-tree text-muted-foreground font-nav text-xs leading-[2] list-none m-0 p-0', lines && 'jx-tree-lines', className)}
  style:--jx-indent="{indent}px"
  bind:this={root}
  onkeydown={onKeydown}
>
  {#snippet rows(list: TreeNode<T>[], parentPath: string | null)}
    {#each list as node (parentPath === null ? node.name : `${parentPath}/${node.name}`)}
      {@const path = parentPath === null ? node.name : `${parentPath}/${node.name}`}
      {@const isDir = node.children !== undefined}
      {@const isCollapsed = isDir && !expandedIds.has(path)}
      {@const isSel = !isDir && path === selected}
      {@const isDisabled = frozenPaths.has(path)}
      {@const ctx = makeCtx({ path, node, parentPath })}
      {@const prefixSnippet = onPrefixSlotRender ? onPrefixSlotRender(ctx) : prefix}
      {@const suffixSnippet = onSuffixSlotRender ? onSuffixSlotRender(ctx) : suffix}
      <li
        role="treeitem"
        data-path={path}
        aria-level={ctx.depth}
        aria-expanded={isDir ? !isCollapsed : undefined}
        aria-selected={isDir ? undefined : isSel}
        aria-disabled={isDisabled || undefined}
        data-disabled={isDisabled ? '' : undefined}
        data-collapsed={isCollapsed ? '' : undefined}
        tabindex={path === (focusPath ?? initialStop) ? 0 : -1}
        onfocusin={() => (focusPath = path)}
      >
        <!-- the treeitem owns focus (roving tabindex); the row paints and
             handles clicks — interactive descendants never activate the row -->
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <div
          class={cn(
            'jx-tree-row flex items-center gap-[0.45rem] min-w-0 border-l-2 ps-[0.35rem] pe-2 transition-[background-color,border-color,color] duration-150 ease-out',
            isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            isSel
              ? 'selected bg-terminal-hover border-l-primary text-foreground'
              : 'border-l-transparent hover:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] hover:text-foreground',
          )}
          onclick={(event) => {
            const target = event.target as HTMLElement;
            if (target.closest('button, a, input, select, textarea, [contenteditable], [data-tree-no-activate]')) return;
            activate({ path, node, parentPath }, (event.currentTarget as HTMLElement).closest('li')!);
          }}
        >
          <span class="jx-tree-caret inline-flex items-center justify-center h-[1em] w-[0.75rem] flex-none text-muted-foreground transition-transform duration-150 ease-[ease] [&_svg]:h-2.5 [&_svg]:w-2.5" aria-hidden="true">
            {#if isDir}
              {#if toggle === 'plus'}
                {@html isCollapsed ? icons.plus : icons.minus}
              {:else}
                {@html icons.chevronDown}
              {/if}
            {/if}
          </span>
          {#if prefixSnippet}
            <span data-jx-tree-prefix class="inline-flex items-center flex-none min-w-0 [&_svg]:h-3.5 [&_svg]:w-3.5">{@render prefixSnippet(ctx)}</span>
          {:else if fileIcons}
            <span data-jx-tree-prefix class="jx-tree-typeicon inline-flex items-center flex-none min-w-0 text-muted-foreground [&_svg]:h-[13px] [&_svg]:w-[13px]" aria-hidden="true">
              {#if isDir}
                {@html ctx.expanded ? icons.folderOpen : icons.folder}
              {:else}
                {@html icons.file}
              {/if}
            </span>
          {/if}
          <span data-jx-tree-label class="flex-1 truncate">
            {#if label}{@render label(ctx)}{:else}{node.name}{/if}
          </span>
          {#if suffixSnippet}
            <span class="jx-tree-suffix inline-flex items-center flex-none gap-[0.15rem] ml-auto opacity-0 pointer-events-none transition-opacity duration-150 ease-out">{@render suffixSnippet(ctx)}</span>
          {/if}
        </div>
        {#if isDir}
          <div
            class={cn(
              'jx-tree-group grid transition-[grid-template-rows] duration-150 ease-[ease]',
              isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
            )}
            data-collapsed={isCollapsed ? '' : undefined}
            inert={isCollapsed || undefined}
          >
            <ul role="group" class={cn('list-none m-0 p-0 ps-(--jx-indent) min-h-0 overflow-hidden', lines && 'relative')}>
              {@render rows(node.children ?? [], path)}
            </ul>
          </div>
        {/if}
      </li>
    {/each}
  {/snippet}
  {@render rows(nodes, null)}
</ul>
