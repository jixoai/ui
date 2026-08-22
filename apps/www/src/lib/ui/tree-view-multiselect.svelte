<!--
  jixoai tree multiselect — the built-in tree-view extension
  (registry/files/ui/tree-view-multiselect.svelte).

  Original request (2026-08-22): multi-select must ship natively WITH
  keyboard + mouse support, built ON the tree-view extension surface
  (prefix slot + onactivate seam) — "给开发者打一个样": extensions are
  powerful enough to implement selection models without forking the core.

  How it extends (no core changes needed):
  - renders a tri-state checkbox through TreeView's `prefix` slot;
  - onactivate sets ctx.preventDefault() and toggles the subtree instead
    of the default folder-toggle / leaf-select behavior — row click AND
    Enter/Space both flow through this one seam;
  - folders cascade: checking a folder adds every ENABLED descendant,
    unchecking removes them; disabled subtrees are skipped entirely and
    never counted toward the tri-state;
  - arrows / Home / End keep working (core walker); Space toggles the
    focused row; checkbox inputs are tabindex="-1" so the roving
    tabindex contract stays intact.

  Intent list:
  - checked state: $bindable string[] of path ids (folders included when
    fully on); oncheck(ids, ctx) fires after every commit.
  - paint: a 12px compact checkbox (checkbox.svelte is form-row oriented
    at 16px with label/error chrome — duplicated compactly here because
    scoped styles cannot reach into it and tree rows are 24px law).
-->
<script lang="ts" generics="T = unknown">
  import type { Snippet } from 'svelte';
  import TreeView, {
    buildTreeIndex,
    collectFrozenPaths,
    type TreeItemCtx,
    type TreeIndexEntry,
    type TreeNode,
  } from './tree-view.svelte';

  interface Props {
    nodes: TreeNode<T>[];
    /** checked path ids (folders included when fully on) — $bindable */
    checked?: string[];
    /** initial ids when the consumer does not bind `checked` */
    defaultChecked?: string[];
    /** after every commit; ctx is the row that caused it */
    oncheck?: (ids: string[], ctx: TreeItemCtx<T>) => void;
    /** folder ids expanded on mount (passed through to the core) */
    defaultExpanded?: string[];
    /** label override (passed through) */
    label?: Snippet<[TreeItemCtx<T>]>;
    /** toggler glyph variant (passed through) */
    toggle?: 'chevron' | 'plus';
    /** guide rails (passed through) */
    lines?: boolean;
    /** px per level (passed through) */
    indent?: number;
    ariaLabel?: string;
    class?: string;
  }

  let {
    nodes,
    defaultChecked = [],
    checked = $bindable([...defaultChecked]),
    oncheck,
    defaultExpanded = [],
    label,
    toggle = 'plus',
    lines = false,
    indent = 16,
    ariaLabel = 'tree (multiselect)',
    class: className = '',
  }: Props = $props();

  const index = $derived(buildTreeIndex(nodes));
  const checkedSet = $derived(new Set(checked));

  // disabled folders freeze their whole subtree — those paths never count
  // toward a cascade nor a parent's tri-state (the shared core law)
  const frozenPaths = $derived(collectFrozenPaths(nodes));

  /** enabled descendant ids under a node (frozen subtrees skipped) */
  function enabledDescendants(entry: TreeIndexEntry<T>, out: string[]): void {
    for (const child of entry.node.children ?? []) {
      const path = `${entry.path}/${child.name}`;
      if (child.disabled || frozenPaths.has(path)) continue;
      out.push(path);
      const childEntry = index.get(path);
      if (childEntry) enabledDescendants(childEntry, out);
    }
  }

  type CheckState = 'on' | 'off' | 'mixed';

  function stateOf(ctx: TreeItemCtx<T>): CheckState {
    if (!ctx.isFolder) return checkedSet.has(ctx.id) ? 'on' : 'off';
    const descendants: string[] = [];
    const entry = index.get(ctx.id);
    if (entry) enabledDescendants(entry, descendants);
    if (descendants.length === 0) return checkedSet.has(ctx.id) ? 'on' : 'off';
    const hits = descendants.filter((id) => checkedSet.has(id)).length;
    if (hits === descendants.length) return 'on';
    if (hits === 0) return 'off';
    return 'mixed';
  }

  function toggleCheck(ctx: TreeItemCtx<T>): void {
    if (ctx.disabled) return;
    const next = new Set(checkedSet);
    const targets = [ctx.id];
    const entry = index.get(ctx.id);
    if (entry) enabledDescendants(entry, targets);
    const removing = stateOf(ctx) === 'on';
    for (const id of targets) {
      if (removing) next.delete(id);
      else next.add(id);
    }
    checked = [...next];
    oncheck?.(checked, ctx);
  }

  // the extension seam: every activation (row click, Enter, Space)
  // becomes a checkbox toggle — folders included, cascading
  function onactivate(ctx: TreeItemCtx<T>): void {
    ctx.preventDefault();
    toggleCheck(ctx);
  }
</script>

<TreeView
  {nodes}
  {defaultExpanded}
  {label}
  {toggle}
  {lines}
  {indent}
  ariaLabel={ariaLabel}
  class={className}
  {onactivate}
>
  {#snippet prefix(ctx: TreeItemCtx<T>)}
    {@const state = stateOf(ctx)}
    <input
      type="checkbox"
      class="jx-tree-check"
      tabindex={-1}
      checked={state === 'on'}
      aria-checked={state === 'mixed' ? 'mixed' : undefined}
      data-mixed={state === 'mixed' ? '' : undefined}
      disabled={ctx.disabled || undefined}
      aria-label={ctx.node.name}
      onclick={(event) => {
        event.stopPropagation();
        toggleCheck(ctx);
      }}
    />
  {/snippet}
</TreeView>

<style>
  /* compact tri-state box: 12px for the 24px tree rows (the form-row
     checkbox is 16px + label/error chrome — sizes differ by design) */
  .jx-tree-check {
    appearance: none;
    -webkit-appearance: none;
    background: var(--background);
    border: 1px solid var(--border);
    cursor: pointer;
    flex: none;
    height: 12px;
    margin: 0;
    position: relative;
    transition: background-color 150ms ease-out, border-color 150ms ease-out;
    width: 12px;
  }
  .jx-tree-check:hover:not(:checked):not(:disabled):not([data-mixed]) {
    border-color: var(--primary);
  }
  .jx-tree-check:checked,
  .jx-tree-check[data-mixed] {
    background: var(--primary);
    border-color: var(--primary);
  }
  .jx-tree-check:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* glyph: the checkbox.svelte 45° clip-path check, scaled to the 10px
     inset box; mixed renders the horizontal dash instead */
  .jx-tree-check::before {
    background: var(--primary-foreground);
    clip-path: polygon(20% 100%, 20% 80%, 50% 80%, 50% 80%, 70% 80%, 70% 100%);
    content: '';
    display: block;
    inset: 1px;
    opacity: 0;
    position: absolute;
    transform: rotate(45deg);
    transition: clip-path 150ms ease-out, opacity 150ms ease-out, transform 150ms ease-out;
  }
  .jx-tree-check:checked::before {
    clip-path: polygon(20% 100%, 20% 80%, 50% 80%, 50% 0%, 70% 0%, 70% 100%);
    opacity: 1;
  }
  .jx-tree-check[data-mixed]::before {
    clip-path: polygon(10% 40%, 10% 60%, 45% 60%, 55% 60%, 90% 60%, 90% 40%);
    opacity: 1;
    transform: rotate(0deg);
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-tree-check,
    .jx-tree-check::before {
      transition: none;
    }
  }
</style>
