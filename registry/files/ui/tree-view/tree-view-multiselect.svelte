<!--
  jixoai tree multiselect — the built-in tree-view extension
  (registry/files/ui/tree-view/tree-view-multiselect.svelte).

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
    styles cannot reach into it and tree rows are 24px law).

  tw4 (2026-08-24): the box's static paint rides token utilities; the
  tri-state machinery (hover lean, :checked/[data-mixed] repaint, the
  clip-path glyph build, reduced-motion) stays in tree-view.css —
  D1-exempt residue shared by the folder's two components.
-->
<script lang="ts" generics="T = unknown">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { treeStyles } from './tree-view.stylex';
  import {
    type ColorLane,
    type DensityLane,
    type ElevationLane,
    type MotionLane,
    type QueryResult,
    type RadiusLane,
    type ShapeLane,
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import { TreeViewDefaults } from './tree-view-defaults.svelte';
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
    /** the EIGHT universal axes (§0/§11, W3-D3): forwarded VERBATIM to
     *  the composed TreeView (the composition law — the composed tree
     *  root resolves, stamps, supplies and anchors); all no-own on
     *  this wrapper's own contract (tree-view-defaults.svelte.ts, the
     *  family's read point) */
    density?: DensityLane | QueryResult<DensityLane>;
    size?: SizeLane | QueryResult<SizeLane>;
    shape?: ShapeLane | QueryResult<ShapeLane>;
    radius?: RadiusLane | QueryResult<RadiusLane>;
    color?: ColorLane | QueryResult<ColorLane>;
    theme?: ThemeLane | QueryResult<ThemeLane>;
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    motion?: MotionLane | QueryResult<MotionLane>;
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
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
  }: Props = $props();

  // the family Defaults is the single read point (the A3 law) — the
  // record exists to unwrap query() media lanes at the boundary and
  // keep the wrapper an audited consumer; the resolved lanes forward
  // to the composed TreeView, which owns carriers/anchor/supply
  const d = $derived(
    TreeViewDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

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
  density={d.density}
  size={d.size}
  shape={d.shape}
  radius={d.radius}
  color={d.color}
  theme={d.theme}
  elevation={d.elevation}
  motion={d.motion}
  {onactivate}
>
  {#snippet prefix(ctx: TreeItemCtx<T>)}
    {@const state = stateOf(ctx)}
    <input
      type="checkbox"
      class={cn(
        'jx-tree-check',
        cx(treeStyles.check),
        ctx.disabled ? cx(treeStyles.checkDisabled, treeStyles.checkDisabledInk) : cx(treeStyles.checkEnabled),
      )}
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
