<!-- tree-view blueprint: the file workbench pane — the ui/ branch
     expanded down to the leaves, tree-view.svelte selected (terminal
     fill + primary edge), package.json at the root.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import TreeView, { type TreeNode } from '$lib/ui/tree-view/tree-view.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

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

<Stack align="center" justify="center" class={cx(bpB.treeViewStage)}>
  <div class={cx(bpB.treeViewPane)}>
    <TreeView {nodes} {defaultExpanded} {selected} />
  </div>
</Stack>
