<!--
  jixoai ItemActions — the trailing slot: controls, chevrons, buttons.
  Wraps (flex-wrap) and right-aligns; drops to its own full row when
  the group is narrow (the presence matrix in item.css).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<span {...rest} data-slot="item-actions" class={cn(className)}>{@render children()}</span>
