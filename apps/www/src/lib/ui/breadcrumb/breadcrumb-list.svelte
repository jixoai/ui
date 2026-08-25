<!--
  jixoai BreadcrumbList (registry/files/ui/breadcrumb/breadcrumb-list.svelte,
  2026-08-25).
  The ordered list carrying the trail: the ol's document order IS the
  hierarchy. Items, separators and the collapse fold compose as its
  children. Paint is token utilities (tw4 posture, unchanged from the
  closed component); the CSS chevron lives on the Separator part.
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

<ol
  data-jx-breadcrumb-list=""
  class={cn(
    'm-0 flex list-none flex-wrap items-center gap-1.5 font-nav text-xs uppercase tracking-[0.08em]',
    className,
  )}
  role="list"
>
  {@render children()}
</ol>
