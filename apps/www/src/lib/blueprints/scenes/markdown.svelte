<!-- markdown blueprint: a document caught mid-stream — the keyed
     prefix (heading, emphasized paragraph, GFM table) is settled while
     the trailing caret blinks. The face is the real pipeline: parser
     AST → Table + native prose under the jx-pure scope. -->
<script lang="ts">
  import Markdown from '$lib/ui/markdown/markdown.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  // the payload's own join (separator serialize law): plain strings
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

<Stack align="center" justify="center" class={cx(bpA.markdownStage)}>
  <Markdown class={cx(bpA.markdownFace)} {source} streaming />
</Stack>
