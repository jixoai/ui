<!--
  jixoai TimelineTime (registry/files/ui/timeline/timeline-time.svelte,
  composition-first-apis, 2026-08-25).
  The timestamp line: a muted mono label wrapping a machine-readable
  <time datetime> — pass the ISO 8601 instant, author the displayed
  text as children (formatting is yours).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** machine-readable instant (ISO 8601) for <time datetime> */
    datetime?: string;
    class?: string;
    children: Snippet;
  }

  let { datetime, class: className = '', children }: Props = $props();
</script>

<p data-jx-tl-time="" class={cn('m-0 font-mono text-[0.6875rem] text-muted-foreground', className)}>
  <time datetime={datetime || undefined}>{@render children()}</time>
</p>
