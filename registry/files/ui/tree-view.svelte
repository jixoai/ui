<!--
  jixoai tree view (registry/files/ui/tree-view.svelte).
  The file tree of the component documentation workbench: native ARIA tree
  semantics (nested <ul role="tree"> / <ul role="group"> / <li role="treeitem">),
  the tree keyboard contract (↑↓ move focus, → expand, ← collapse, Enter
  activates), roving tabindex, and the collapse grammar of the Combo ToC
  (grid-template-rows 0fr→1fr + inert on the collapsed extent — collapsed
  content is untabbable and invisible to the keyboard walker by construction).

  Visual law: font-nav 12px on line-height 2 (compact rows), a ▾ caret with
  a 150ms rotate on directories, a status-dot in the tokenizer palette on
  leaves (the rounded-full dot class), selected = --terminal-hover fill +
  2px primary left edge. No card shell and no hairlines — the view embeds
  into sidebar surfaces (component-canvas code drawer) that own the chrome.

  Paths are built recursively as `parent.name + '/' + node.name`; a leaf
  carrying `file` is selectable (aria-selected + onselect(path, file)).
-->
<script lang="ts" module>
  export interface TreeFile {
    /** File path as authored (e.g. "src/lib/ui/button.svelte") or bare name. */
    name: string;
    content: string;
    /** Tokenizer hint; inferred from the name extension when omitted. */
    lang?: string;
  }

  export interface TreeNode {
    name: string;
    children?: TreeNode[];
    /** Leaf payload: presence makes the node a selectable file item. */
    file?: TreeFile;
  }

  /** Extension → canonical highlight language (aliases resolve in lib/highlight). */
  export function inferTreeLang(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'ts';
      case 'js':
      case 'mjs':
      case 'cjs':
      case 'jsx':
        return 'js';
      case 'svelte':
      case 'html':
        return 'svelte';
      case 'css':
      case 'scss':
        return 'css';
      case 'json':
        return 'json';
      case 'sh':
      case 'bash':
      case 'zsh':
        return 'bash';
      default:
        return ext || 'ts';
    }
  }
</script>

<script lang="ts">
  interface Props {
    tree: TreeNode[];
    /** Currently selected file path ("src/lib/ui/button.svelte"). */
    selected?: string;
    onselect?: (path: string, file: TreeFile) => void;
  }

  let { tree, selected, onselect }: Props = $props();

  // collapsed directories, keyed by full path (names may repeat across dirs)
  let collapsed = $state(new Set<string>());

  function toggle(path: string): void {
    const next = new Set(collapsed);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    collapsed = next;
  }

  // path → node (+ parent path), rebuilt whenever the tree prop changes
  interface FlatEntry {
    path: string;
    node: TreeNode;
    parentPath: string | null;
  }
  const byPath = $derived.by(() => {
    const map = new Map<string, FlatEntry>();
    const walk = (nodes: TreeNode[], parent: string | null): void => {
      for (const node of nodes) {
        const path = parent === null ? node.name : `${parent}/${node.name}`;
        map.set(path, { path, node, parentPath: parent });
        if (node.children) walk(node.children, path);
      }
    };
    walk(tree, null);
    return map;
  });

  // roving tabindex stop: the selected item when it exists, else the first
  const initialStop = $derived.by(() => {
    if (selected != null && byPath.has(selected)) return selected;
    return tree.length > 0 ? byPath.keys().next().value ?? null : null;
  });
  let focusPath = $state<string | null>(null);

  let root: HTMLUListElement | undefined = $state();

  // keyboard walker: only items outside collapsed (inert) extents count
  function visibleItems(): HTMLElement[] {
    if (!root) return [];
    return [...root.querySelectorAll<HTMLElement>('li[role="treeitem"]')].filter(
      (el) => !el.closest('[data-collapsed]'),
    );
  }

  function activate(target: HTMLElement, entry: FlatEntry): void {
    target.focus();
    focusPath = entry.path;
    if (entry.node.children) {
      toggle(entry.path);
    } else if (entry.node.file) {
      onselect?.(entry.path, entry.node.file);
    }
  }

  function onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const path = target?.dataset.path;
    if (!path) return;
    const entry = byPath.get(path);
    if (!entry) return;

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
          if (collapsed.has(path)) toggle(path);
          else focusAt(index + 1);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (entry.node.children && !collapsed.has(path)) toggle(path);
        else focusPathItem(entry.parentPath);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        activate(target as HTMLElement, entry);
        break;
    }
  }
</script>

<ul role="tree" aria-label="files" class="jx-tree-view" bind:this={root} onkeydown={onKeydown}>
  {#snippet rows(nodes: TreeNode[], parentPath: string | null, depth: number)}
    {#each nodes as node (parentPath === null ? node.name : `${parentPath}/${node.name}`)}
      {@const path = parentPath === null ? node.name : `${parentPath}/${node.name}`}
      {@const isDir = node.children !== undefined}
      {@const isCollapsed = collapsed.has(path)}
      {@const isSel = node.file !== undefined && path === selected}
      <li
        role="treeitem"
        data-path={path}
        aria-level={depth}
        aria-expanded={isDir ? !isCollapsed : undefined}
        aria-selected={node.file !== undefined ? isSel : undefined}
        data-collapsed={isDir && isCollapsed ? '' : undefined}
        tabindex={path === (focusPath ?? initialStop) ? 0 : -1}
        onfocusin={() => (focusPath = path)}
      >
        <!-- the treeitem is the interactive unit (ARIA tree pattern): keys
             are handled by the tree-level walker, clicks by this row -->
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <div
          class="jx-tree-view-row"
          class:selected={isSel}
          onclick={(event) => activate((event.currentTarget as HTMLElement).closest('li')!, { path, node, parentPath })}
        >
          {#if isDir}
            <span class="jx-tree-view-caret" aria-hidden="true">▾</span>
          {:else}
            <span
              class="jx-tree-view-dot"
              data-lang={node.file?.lang ?? inferTreeLang(node.name)}
              aria-hidden="true"
            ></span>
          {/if}
          <span class="jx-tree-view-name">{node.name}</span>
        </div>
        {#if isDir}
          <div class="jx-tree-view-group" data-collapsed={isCollapsed ? '' : undefined} inert={isCollapsed || undefined}>
            <ul role="group">
              {@render rows(node.children ?? [], path, depth + 1)}
            </ul>
          </div>
        {/if}
      </li>
    {/each}
  {/snippet}
  {@render rows(tree, null, 1)}
</ul>

<style>
  /* scoped token palette (self-sufficiency law, mirrors code-card): the
     --brand-hue sheet alone is enough — dot colors track the tokenizer. */
  .jx-tree-view {
    --tok-comment: color-mix(in oklab, var(--foreground) 44%, transparent);
    --tok-string: var(--accent);
    --tok-keyword: var(--primary);
    --tok-number: color-mix(in oklab, var(--secondary) 78%, var(--foreground));
    --tok-function: color-mix(in oklab, var(--primary) 62%, var(--foreground));
    --tok-tag: var(--muted-foreground);

    color: var(--muted-foreground);
    font-family: var(--font-nav);
    font-size: 12px;
    line-height: 2;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  :global(.dark) .jx-tree-view {
    --tok-comment: color-mix(in oklab, var(--foreground) 55%, transparent);
    --tok-number: var(--secondary);
    --tok-function: color-mix(in oklab, var(--primary) 58%, oklch(1 0 0));
  }

  .jx-tree-view ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .jx-tree-view ul[role='group'] {
    padding-left: 0.9rem;
  }

  /* row: caret/dot column is fixed so leaves align under the caret */
  .jx-tree-view-row {
    align-items: center;
    border-left: 2px solid transparent;
    cursor: pointer;
    display: flex;
    gap: 0.45rem;
    min-width: 0;
    padding-inline: 0.35rem 0.5rem;
    transition: background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out;
  }
  .jx-tree-view-row:hover {
    background: color-mix(in oklab, var(--foreground) 5%, transparent);
    color: var(--foreground);
  }
  .jx-tree-view-row.selected {
    background: var(--terminal-hover);
    border-left-color: var(--primary);
    color: var(--foreground);
  }
  .jx-tree-view-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* caret: ▾ when expanded, rotated -90° to point right when collapsed */
  .jx-tree-view-caret {
    align-items: center;
    color: var(--muted-foreground);
    display: inline-flex;
    flex: none;
    font-size: 10px;
    height: 1em;
    justify-content: center;
    transition: transform 150ms ease;
    width: 0.75rem;
  }
  .jx-tree-view li[data-collapsed] > .jx-tree-view-row .jx-tree-view-caret {
    transform: rotate(-90deg);
  }

  /* leaf status dot in the tokenizer palette (the rounded-full dot class) */
  .jx-tree-view-dot {
    background: var(--tok-comment);
    border-radius: 9999px;
    flex: none;
    height: 6px;
    margin-inline: calc((0.75rem - 6px) / 2);
    width: 6px;
  }
  .jx-tree-view-dot[data-lang='ts'] {
    background: var(--tok-keyword);
  }
  .jx-tree-view-dot[data-lang='js'] {
    background: var(--tok-function);
  }
  .jx-tree-view-dot[data-lang='svelte'] {
    background: var(--tok-string);
  }
  .jx-tree-view-dot[data-lang='css'] {
    background: var(--tok-number);
  }
  .jx-tree-view-dot[data-lang='json'] {
    background: var(--tok-tag);
  }
  .jx-tree-view-dot[data-lang='bash'] {
    background: var(--tok-tag);
  }

  /* collapse: grid-rows 0fr→1fr (the ToC viewport law); inert on the same
     extent keeps collapsed content out of the tab order */
  .jx-tree-view-group {
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows 150ms ease;
  }
  .jx-tree-view-group[data-collapsed] {
    grid-template-rows: 0fr;
  }
  .jx-tree-view-group > ul {
    min-height: 0;
    overflow: hidden;
  }

  /* focus law: the treeitem owns focus (roving tabindex); the row paints */
  .jx-tree-view li:focus-visible {
    outline: none;
  }
  .jx-tree-view li:focus-visible > .jx-tree-view-row {
    outline: 2px solid var(--ring);
    outline-offset: -2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-tree-view-caret,
    .jx-tree-view-group,
    .jx-tree-view-row {
      transition: none;
    }
  }
</style>
