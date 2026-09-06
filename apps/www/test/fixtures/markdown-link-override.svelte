<!--
  Markdown override-seam fixture (test/fixtures/markdown-link-override.svelte).
  A stand-in app component for the components prop: consumes { node } raw
  (the trusted-boundary contract) and DELEGATES its children through the
  exported MarkdownNode — the documented delegation path.
-->
<script lang="ts">
  import type { LinkNode } from 'stream-markdown-parser';
  import MarkdownNode from '$lib/ui/markdown/markdown-node.svelte';

  let { node }: { node: LinkNode } = $props();
</script>

<a class="glossary-link" href={node.href} data-glossary>
  {#each node.children as child, i (i)}<MarkdownNode node={child} />{/each}
</a>
