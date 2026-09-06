<!-- markdown blueprint: a document caught mid-stream — the keyed
     prefix (heading, emphasized paragraph, GFM table) is settled while
     the trailing caret blinks. The face is the real pipeline: parser
     AST → Table + native prose under the jx-pure scope. -->
<script lang="ts">
  import Markdown from '$lib/ui/markdown/markdown.svelte';

  const source = `## Streaming, memoized

The frozen prefix never remounts while chunks arrive — \`code_block\`
**maps to** CodeCard, \`table\` to Table.

| node | maps to |
| --- | --- |
| code_block | CodeCard |
| table | Table |
| prose | jx-pure |

The tail mutates in place`;
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <Markdown class="w-full max-w-[520px]" {source} streaming />
</div>
