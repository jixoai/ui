<!--
  jixoai PagedCode (paged-doc-family) — the print-aware code block.

  printOverflow="flow" (default): the scrollport flattens under print
  — the audited `flatten` verb on the <pre>, so long lines regain
  their native inter-line break points instead of clipping.
  printOverflow="shrink": the font-size steps down instead (the
  @layer components print rule). Screen behavior is identical either
  way: a plain scrollable pre.

  Print carries a numbered gutter (Owner acceptance r1/r2, 2026-08-30):
  each line renders as a .jx-paged-line span so the print projection
  can wrap long lines AND number them via a CSS counter ::before —
  screen stays clean (no gutter), the sim preview mirrors print. The
  gutter is the `lineNumbers` prop, default ON, opt-out per block.
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
    /** the print/sim numbered gutter — default ON (Owner acceptance r2) */
    lineNumbers?: boolean;
    class?: string;
  }

  let {
    code,
    caption,
    printOverflow = 'flow',
    lineNumbers = true,
    class: className = '',
  }: Props = $props();

  // per-line spans: block-level inside the pre, so rendering is
  // line-for-line identical to plain text while giving the print
  // projection a numbering anchor. An empty line keeps its height.
  const lines = $derived(code.split('\n'));
</script>

<figure
  data-jx-paged-code
  data-print-overflow={printOverflow}
  data-line-numbers={lineNumbers ? undefined : 'false'}
  class={className}
>
  {#if caption}
    <figcaption data-jx-paged-code-caption>{caption}</figcaption>
  {/if}
  <!-- the flatten verb: whitelisted print rule lifts overflow AND any
       block-size cap, defeating utilities riding the same node -->
  <pre data-jx-print={printOverflow === 'flow' ? 'flatten' : undefined}><code>{#each lines as line, i (i)}<span class="jx-paged-line" data-line={i + 1}>{line || ' '}</span>{/each}</code></pre>
</figure>
