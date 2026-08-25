<!--
  jixoai TimelineContent (registry/files/ui/timeline/timeline-content.svelte,
  composition-first-apis, 2026-08-25).
  The text column of an entry: Time, Title and whatever body the
  consumer authors as free children — a dumb layout part.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children }: Props = $props();
</script>

<div data-jx-tl-content="" class={cn('flex flex-col gap-1 min-w-0', className)}>
  {@render children()}
</div>
