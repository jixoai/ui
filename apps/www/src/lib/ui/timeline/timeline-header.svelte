<!--
  jixoai TimelineHeader (registry/files/ui/timeline/timeline-header.svelte,
  W3 reui-progress upgrade, Owner 2026-09-15).
  The plain wrapper (reui parity): the chronology's heading chrome —
  zero paint of its own beyond the list's own spacing. It mounts as a
  child of the Timeline (inside the list host, before the items):
  timeline.css places it through the CHROME-SPAN LAW — the engine's
  item selectors stay li-type-scoped (:first-of-type/:nth-of-type), so
  the header never shifts the end-caps or the interlaced phase.
  (composition-first-apis posture: a dumb layout part.)
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

<div data-jx-tl-header="" class={cn(className)} {...rest}>
  {@render children()}
</div>
