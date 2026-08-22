<!--
  tree-view test host (test/fixtures/tree-host.svelte, 2026-08-22).
  Exercises the full extension surface in one mount so the spec can assert
  behavior through the DOM: prefix/suffix snippets, the onPrefixSlotRender /
  onSuffixSlotRender resolvers, disabled subtrees, and the multiselect
  extension with its tri-state cascade.
-->
<script lang="ts">
  import TreeView, { type TreeItemCtx, type TreeNode } from '$lib/ui/tree-view.svelte';
  import TreeViewMulti from '$lib/ui/tree-view-multiselect.svelte';

  let {
    onselect: onselectProp = () => {},
    onactivate = () => {},
  }: {
    onselect?: (id: string) => void;
    onactivate?: (id: string, folder: boolean) => void;
  } = $props();

  // selection lives HERE (page-ownership law, like the demo page): the
  // tree is controlled through `selected`
  let selected = $state<string | null>(null);
  function onselect(id: string): void {
    selected = id;
    onselectProp(id);
  }

  // a THIRD-PARTY-style extension: cancel every default activation via
  // the documented ctx.preventDefault() contract and count instead
  let intercepted = $state(0);

  const nodes: TreeNode[] = [
    {
      name: 'src',
      children: [{ name: 'a.ts' }, { name: 'b', children: [{ name: 'c.css' }] }],
    },
    { name: 'legacy', disabled: true, children: [{ name: 'old.ts' }] },
    { name: 'd.ts' },
  ];

  let multiChecked = $state(['src/a.ts', 'legacy/old.ts']);

  let lastSuffixAction = $state<string | null>(null);
</script>

<TreeView
  {nodes}
  defaultExpanded={['src']}
  ariaLabel="host tree"
  {selected}
  onselect={(ctx) => onselect(ctx.id)}
  onactivate={(ctx) => onactivate(ctx.id, ctx.isFolder)}
  onPrefixSlotRender={(ctx: TreeItemCtx) => (ctx.isFolder ? folderGlyph : fileGlyph)}
  onSuffixSlotRender={(ctx: TreeItemCtx) => (ctx.isFolder ? folderActions : undefined)}
>
  {#snippet folderGlyph(ctx: TreeItemCtx)}<b class="host-folder">{ctx.node.name}</b>{/snippet}
  {#snippet fileGlyph(ctx: TreeItemCtx)}<i class="host-file">{ctx.node.name}</i>{/snippet}
  {#snippet folderActions(ctx: TreeItemCtx)}
    <button type="button" class="host-act" onclick={() => (lastSuffixAction = ctx.id)}>act</button>
  {/snippet}
</TreeView>

<TreeViewMulti nodes={nodes} defaultExpanded={['src']} ariaLabel="host multi" bind:checked={multiChecked} />

<TreeView
  nodes={nodes}
  defaultExpanded={['src']}
  ariaLabel="host custom"
  onselect={() => onselect('SHOULD-NEVER-FIRE')}
  onactivate={(ctx) => {
    ctx.preventDefault();
    intercepted += 1;
  }}
/>
<p class="host-intercepted">intercepted: {intercepted}</p>
