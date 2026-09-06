<!--
  Doc-link (markdown.html/doc-link.svelte) — the live stand-in for the
  markdown `components` override seam on this docs page (the same
  pattern the repo itself uses in test/fixtures/markdown-link-override.
  svelte: a page-local app component, NOT a registry item).

  Original requirement (2026-09-06, markdown-streaming): "推出 markdown
  渲染组件，支持流式渲染，AST 映射内部组件" — this file exists only to
  demo the override seam live: consumes { node } raw (trusted
  application code, design §3.3) and delegates children through the
  exported MarkdownNode. One intent, one file.
-->
<script lang="ts">
  // MarkdownNode is a NAMED export of the barrel (the default is the
  // Markdown root itself — the delegation seam is the node mapper)
  import { MarkdownNode, type LinkNode } from '$lib/ui/markdown';

  let { node }: { node: LinkNode } = $props();

  // absolute http(s) opens externally; app routes keep same-tab default
  const external = $derived(/^https?:\/\//i.test(node.href));
</script>

<a
  href={node.href}
  title={node.title ?? undefined}
  target={external ? '_blank' : undefined}
  rel={external ? 'noreferrer' : undefined}
  data-doc-link-external={external ? '' : undefined}
>
  {#each node.children as child, i (i)}<MarkdownNode node={child} />{/each}
  {#if external}<span class="doc-link-glyph" aria-hidden="true">↗</span>{/if}
</a>

<style>
  .doc-link-glyph {
    color: var(--primary);
    font-size: 0.8em;
    margin-inline-start: 0.2em;
  }
  a[data-doc-link-external] {
    text-decoration-style: dotted;
    text-underline-offset: 3px;
  }
</style>
