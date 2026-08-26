<!--
  jixoai BreadcrumbList (registry/files/ui/breadcrumb/breadcrumb-list.svelte,
  2026-08-25).
  The ordered list carrying the trail: the ol's document order IS the
  hierarchy. Items, separators and the collapse fold compose as its
  children. Paint is token utilities (tw4 posture, unchanged from the
  closed component); the CSS chevron lives on the Separator part.
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { resolveDensity, getDensityContext } from '$lib/density.svelte';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLOListElement> {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
  const resolvedDensity = $derived(resolveDensity(undefined, getDensityContext()));
</script>

<ol
  data-jx-breadcrumb-list=""
  data-density={resolvedDensity}
  class={cn(
    'm-0 flex list-none flex-wrap items-center gap-1.5 font-nav text-xs uppercase tracking-[0.08em]',
    className,
  )}
  {...rest}
  role="list"
>
  {@render children()}
</ol>
