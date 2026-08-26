<!--
  jixoai TimelineTime (registry/files/ui/timeline/timeline-time.svelte,
  composition-first-apis, 2026-08-25).
  The timestamp line: a muted mono label wrapping a machine-readable
  <time datetime> — pass the ISO 8601 instant, author the displayed
  text as children (formatting is yours).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLParagraphElement> {
    /** machine-readable instant (ISO 8601) for <time datetime> */
    datetime?: string;
    class?: string;
    children: Snippet;
  }

  let { datetime, class: className = '', children, ...rest }: Props = $props();
</script>

<p data-jx-tl-time="" class={cn('m-0 font-mono [font-size:var(--jx-text-secondary)] [line-height:var(--jx-line-secondary)] text-muted-foreground', className)} {...rest}>
  <time datetime={datetime || undefined}>{@render children()}</time>
</p>
