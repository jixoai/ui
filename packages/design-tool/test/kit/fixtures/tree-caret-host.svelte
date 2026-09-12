<!--
  tree-view caret test fixture (test/kit/fixtures/tree-caret-host.svelte,
  design-studio #35): exercises the caret snippet extension — the
  consumer owns the glyph column per node ctx.
-->
<script lang="ts">
  import TreeView, { type TreeItemCtx, type TreeNode } from '../../../../../registry/files/ui/tree-view';
  let {
    loadingId = 'loading',
  }: {
    loadingId?: string;
  } = $props();

  const nodes: TreeNode<{ kind: string }>[] = [
    {
      name: 'loading',
      children: [{ name: 'a' }],
      meta: { kind: 'page' },
    },
    { name: 'ready', children: [{ name: 'b' }], meta: { kind: 'page' } },
    { name: 'leaf' },
  ];
</script>

<TreeView {nodes} defaultExpanded={['loading', 'ready']} ariaLabel="caret host" caret={glyph}>
  {#snippet glyph(ctx: TreeItemCtx<{ kind: string }>)}
    {#if ctx.id === loadingId}
      <span class="host-spin" role="status">↻</span>
    {:else}
      <svg class="host-chev" viewBox="0 0 24 24" width="10" height="10" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" /></svg>
    {/if}
  {/snippet}
</TreeView>
