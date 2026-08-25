<!--
  jixoai ItemEnd — the ONE trailing lane (openspec
  list-item-systemization design §1): ItemAfter (metadata),
  ItemActions (controls) and ItemChevron (glyph) all live INSIDE it,
  so the top-level presence matrix keeps four bits. Wraps to its own
  full row under the narrow @container jx-items law unless
  wrap="never".
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    /** lane's cross-axis posture against tall content */
    align?: 'center' | 'start';
    /** 'never' opts out of the narrow own-row wrap law */
    wrap?: 'auto' | 'never';
    class?: string;
    children: Snippet;
  }

  let { align = 'center', wrap = 'auto', class: className = '', children, ...rest }: Props = $props();
</script>

<span
  {...rest}
  data-slot="item-end"
  data-align={align}
  data-wrap={wrap}
  class={cn(className)}
>{@render children()}</span>
