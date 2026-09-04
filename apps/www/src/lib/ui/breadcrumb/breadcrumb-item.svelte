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
  import { BreadcrumbDefaults } from './breadcrumb-defaults.svelte';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLLIElement> {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
  // THE DEFAULTS READ POINT (context-defaults-economy 3.3): one line —
  // the ambient density stamp resolves through the family contract
  // (no-opinion slot: no explicit prop, inherited else nothing)
  const d = $derived(BreadcrumbDefaults.resolve({}));

  // set by breadcrumb-collapse.svelte — hidden items carry the fold
  // hook so the ellipsis can derive its destination from the DOM
  const collapsed = getContext('jx-breadcrumb-collapse') === true;
</script>

<li
  data-jx-breadcrumb-collapsed={collapsed ? '' : undefined}
  data-density={d.density}
  hidden={collapsed ? true : undefined}
  class={cn(className)}
  {...rest}
>
  {@render children()}
</li>
