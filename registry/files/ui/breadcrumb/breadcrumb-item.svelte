<!--
  jixoai BreadcrumbItem (registry/files/ui/breadcrumb/breadcrumb-item.svelte,
  2026-08-25).
  One step of the trail — an li whose content is the consumer's
  (BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator…). Inside a
  BreadcrumbCollapse the item self-hides via the family context (the
  fold is the Collapse part's behavior, not the author's concern).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { resolveDensity, getDensityContext } from '$lib/density.svelte';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLLIElement> {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
  const resolvedDensity = $derived(resolveDensity(undefined, getDensityContext()));

  // set by breadcrumb-collapse.svelte — hidden items carry the fold
  // hook so the ellipsis can derive its destination from the DOM
  const collapsed = getContext('jx-breadcrumb-collapse') === true;
</script>

<li
  data-jx-breadcrumb-collapsed={collapsed ? '' : undefined}
  data-density={resolvedDensity}
  hidden={collapsed ? true : undefined}
  class={cn(className)}
  {...rest}
>
  {@render children()}
</li>
