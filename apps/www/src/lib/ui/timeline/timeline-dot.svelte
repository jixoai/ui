<!--
  jixoai TimelineDot (registry/files/ui/timeline/timeline-dot.svelte;
  grid-engine rebuild, 2026-09-01).
  The 9-GRID NODE: the dot itself is the center cell, and up to EIGHT
  logical-direction snippets compose the surrounding cells — free
  spatial information at every point of the spine. LOGICAL names keep
  their meaning when the axis flips (block-start stays "before the
  flow"; the engine transposes):

                       blockStartInlineStart  blockStart  blockStartInlineEnd
                       inlineStart              ● the dot    inlineEnd
                       blockEndInlineStart    blockEnd     blockEndInlineEnd

    blockStart / blockEnd   ride the SPINE channel — a labeled cutout
                             on the line (the time, the phase): the
                             cell's ground interrupts the spine by
                             essence, because the line occupies exactly
                             these two slots when nothing else does
    inlineStart / inlineEnd flank the dot inside the spine lane
    the four corners        the diagonal compositions

  The dot variant: 'square' (default, the site square) | 'round' |
  'ring'. The FILL is attribute paint — timeline.css fills it primary
  and hollows it when the owning item carries data-jx-tl-pending — so
  every part stays stateless.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    /** square (default) · round · ring */
    variant?: 'square' | 'round' | 'ring';
    /** the cell before the flow — a labeled cutout ON the spine */
    blockStart?: Snippet;
    /** the cell after the flow — a labeled cutout ON the spine */
    blockEnd?: Snippet;
    /** flanks the dot against the flow's inline start */
    inlineStart?: Snippet;
    /** flanks the dot against the flow's inline end */
    inlineEnd?: Snippet;
    blockStartInlineStart?: Snippet;
    blockStartInlineEnd?: Snippet;
    blockEndInlineStart?: Snippet;
    blockEndInlineEnd?: Snippet;
    class?: string;
  }

  let {
    variant = 'square',
    blockStart,
    blockEnd,
    inlineStart,
    inlineEnd,
    blockStartInlineStart,
    blockStartInlineEnd,
    blockEndInlineStart,
    blockEndInlineEnd,
    class: className = '',
    ...rest
  }: Props = $props();

  // one cell per snippet — a fragment of grid children placed by
  // timeline.css through the valued data-dir hook
  const cells: [dir: string, snippet: Snippet | undefined][] = [
    ['bsIs', blockStartInlineStart],
    ['bs', blockStart],
    ['bsIe', blockStartInlineEnd],
    ['is', inlineStart],
    ['ie', inlineEnd],
    ['beIs', blockEndInlineStart],
    ['be', blockEnd],
    ['beIe', blockEndInlineEnd],
  ];
</script>

{#each cells as [dir, snippet] (dir)}
  {#if snippet}
    <div data-jx-tl-slot data-dir={dir}>{@render snippet()}</div>
  {/if}
{/each}
<span
  data-jx-tl-dot=""
  data-variant={variant}
  class={className}
  {...rest}
  aria-hidden="true"
></span>
