<!--
  jixoai Breadcrumb root (registry/files/ui/breadcrumb/breadcrumb.svelte,
  composition-first, 2026-08-25).
  W3C-first: a breadcrumb trail is a nav landmark wrapping an ordered
  list of ordinary links — the entire ARIA story is nav[aria-label] +
  ol + a[aria-current="page"]. No microdata obligations, no roles to
  maintain; the ol's order IS the hierarchy.

  The root owns NOTHING but the landmark (composition-first: the old
  closed `crumbs[]` data prop died). The trail is authored as parts —

    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="/">root</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
        <BreadcrumbItem><BreadcrumbPage href="/leaf">leaf</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

  Long trails opt into the fold by wrapping the middle items in
  <BreadcrumbCollapse> (no width magic here, no collapse prop — the
  nesting IS the decision).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** nav landmark label (announced before the trail) */
    label?: string;
    class?: string;
    children: Snippet;
  }

  let { label = 'Breadcrumb', class: className = '', children, ...rest }: Props = $props();
</script>

<nav data-jx-breadcrumb="" class={cn(className)} {...rest} aria-label={label}>
  {@render children()}
</nav>
