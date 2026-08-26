<!--
  jixoai TimelineContent (registry/files/ui/timeline/timeline-content.svelte,
  composition-first-apis, 2026-08-25).
  The text column of an entry: Time, Title and whatever body the
  consumer authors as free children — a dumb layout part.
  (props-discipline sweep, 2026-08-25)
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

<div data-jx-tl-content="" class={cn('flex flex-col [gap:var(--jx-stack)] min-w-0', className)} {...rest}>
  {@render children()}
</div>
