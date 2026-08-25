<!--
  jixoai BreadcrumbCollapse (registry/files/ui/breadcrumb/breadcrumb-collapse.svelte,
  2026-08-25).
  The OPT-IN middle fold, as composition: wrap the collapsible trail
  items and THIS part owns the old collapse UX verbatim — the wrapped
  items self-hide (family context + the platform `hidden` attribute)
  and a single "…" link stands in for them, pointing at the FIRST
  hidden page (one click restores the path; never a dead ellipsis).

    <BreadcrumbItem><BreadcrumbLink href="/">root</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbCollapse>
      <BreadcrumbItem><BreadcrumbLink href="/2">page 2</BreadcrumbLink></BreadcrumbItem>
      …more middle items…
    </BreadcrumbCollapse>
    <BreadcrumbItem><BreadcrumbPage href="/8">page 8</BreadcrumbPage></BreadcrumbItem>

  Destination resolution: an explicit `href` prop wins (SSR/JS-off
  honest). Without one the ellipsis derives its destination from its
  own DOM on hydrate — the first anchor of the collapsed run that
  follows it (DOM delegation; snippets cannot be introspected, so the
  bare-server render shows a placeholder link that hydrates into the
  live one — the documented trade of the composed form).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLLIElement> {
    /** where the ellipsis points — the first collapsed page. Optional:
     *  derived from the wrapped items' first link on hydrate. */
    href?: string;
    class?: string;
    children: Snippet;
  }

  let { href, class: className = '', children, ...rest }: Props = $props();

  // wrapped items render hidden + carry the fold hook (breadcrumb-item
  // reads this context). The ellipsis li below is authored DIRECTLY —
  // a BreadcrumbItem here would eat its own fold context.
  setContext('jx-breadcrumb-collapse', true);

  let ellipsisEl = $state<HTMLAnchorElement | undefined>();
  let derivedHref = $state<string | undefined>(undefined);

  $effect(() => {
    if (href !== undefined) return; // explicit wins
    // walk the collapsed run that follows this ellipsis: the first
    // real link inside it is the fold's destination
    let node: Element | null = ellipsisEl?.closest('li')?.nextElementSibling ?? null;
    while (node?.hasAttribute('data-jx-breadcrumb-collapsed')) {
      const link = node.querySelector('a[href]');
      if (link) {
        derivedHref = link.getAttribute('href') ?? undefined;
        return;
      }
      node = node.nextElementSibling;
    }
    derivedHref = undefined;
  });

  const target = $derived(href ?? derivedHref);
</script>

<li {...rest} class={className}>
  <a
    bind:this={ellipsisEl}
    data-jx-breadcrumb-collapse=""
    class={cn(
      'text-muted-foreground tracking-normal no-underline transition-colors duration-150 ease-out hover:text-primary focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-2',
      className,
    )}
    href={target}
  >…</a>
</li>
{@render children()}
