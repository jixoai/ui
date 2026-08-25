<!--
  jixoai ItemContent — the required middle slot: the title/description
  column. The second content slot in an item stops stretching (the
  shadcn rule) — this component owns that law.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<div {...rest} data-slot="item-content" class={cn(className)}>{@render children()}</div>
