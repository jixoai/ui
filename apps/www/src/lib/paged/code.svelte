<!--
  jixoai PagedCode (paged-doc-family) — the print-aware code block.

  printOverflow="flow" (default): the scrollport flattens under print
  — the audited `flatten` verb on the <pre>, so long lines regain
  their native inter-line break points instead of clipping.
  printOverflow="shrink": the font-size steps down instead (the
  @layer components print rule). Screen behavior is identical either
  way: a plain scrollable pre.
-->
<script lang="ts">
  interface Props {
    /** the code sample (runtime string, text-rendered — no highlight
        dependency in the family; pair with CodeCard for Shiki) */
    code: string;
    /** optional caption line above the block */
    caption?: string;
    /** flow (default) = flatten the scrollport; shrink = font step-down */
    printOverflow?: 'flow' | 'shrink';
    class?: string;
  }

  let { code, caption, printOverflow = 'flow', class: className = '' }: Props = $props();
</script>

<figure data-jx-paged-code data-print-overflow={printOverflow} class={className}>
  {#if caption}
    <figcaption data-jx-paged-code-caption>{caption}</figcaption>
  {/if}
  <!-- the flatten verb: whitelisted print rule lifts overflow AND any
       block-size cap, defeating utilities riding the same node -->
  <pre data-jx-print={printOverflow === 'flow' ? 'flatten' : undefined}><code>{code}</code></pre>
</figure>
