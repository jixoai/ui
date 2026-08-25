<!--
  jixoai ItemAfter — non-interactive trailing metadata inside ItemEnd
  (counts, timestamps, shortcuts). NEVER receives button/link
  semantics; interactive tails are ItemActions' job.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    tone?: 'muted' | 'default';
    class?: string;
    children: Snippet;
  }

  let { tone = 'muted', class: className = '', children, ...rest }: Props = $props();
</script>

<span {...rest} data-slot="item-after" data-tone={tone} class={cn(className)}>{@render children()}</span>
