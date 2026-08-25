<!--
  jixoai TimelineConnector (registry/files/ui/timeline/timeline-connector.svelte,
  composition-first-apis, 2026-08-25).
  The spine segment: an authored, zero-footprint overlay (absolute
  inset-0, pointer-transparent) whose ::before line is drawn by
  timeline.css — 1px border-colored, running from this entry's dot down
  into the next. Inside the LAST item it self-hides (the chrome
  exception, REAL DOM hooks — component names never appear in the DOM).
-->
<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<span data-jx-tl-connector="" aria-hidden="true" class={cn('pointer-events-none absolute inset-0', className)}></span>
