<!-- tree-view blueprint: the file workbench pane — the ui/ branch
     expanded down to the leaves, tree-view.svelte selected (terminal
     fill + primary edge), package.json at the root. -->
<script lang="ts">
  import TreeView, { type TreeNode } from '$lib/ui/tree-view.svelte';

  const leaf = (name: string): TreeNode => ({ name });

  const nodes: TreeNode[] = [
    {
      name: 'src',
      children: [
        {
          name: 'lib',
          children: [
            {
              name: 'ui',
              children: [leaf('press-button.svelte'), leaf('tree-view.svelte'), leaf('dialog.svelte')],
            },
            leaf('shiki.ts'),
            leaf('toast-store.ts'),
          ],
        },
      ],
    },
    leaf('package.json'),
  ];

  const defaultExpanded = ['src', 'src/lib', 'src/lib/ui'];
  const selected = 'src/lib/ui/tree-view.svelte';
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <div class="border-border bg-card w-full max-w-[360px] border p-4 shadow-2xs">
    <TreeView {nodes} {defaultExpanded} {selected} />
  </div>
</div>
