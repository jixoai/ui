<!--
  jixoai BreadcrumbPage (registry/files/ui/breadcrumb/breadcrumb-page.svelte,
  2026-08-25).
  The current page — aria-current="page" on real foreground paint. With
  href it stays a REAL anchor (the closed component's law: deep links
  and reloads stay honest); without one it renders the span form of the
  same semantics. Either way the trail's leaf tells assistive tech
  "you are here".
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends Omit<HTMLAnchorAttributes, 'aria-current'> {
    /** keep the leaf a real link when the page has a URL of its own */
    href?: string;
    class?: string;
    children: Snippet;
  }

  let { href, class: className = '', children }: Props = $props();
</script>

{#if href}
  <a
    data-jx-breadcrumb-current=""
    class={cn('text-foreground no-underline', className)}
    {href}
    aria-current="page"
  >
    {@render children()}
  </a>
{:else}
  <span data-jx-breadcrumb-current="" class={cn('text-foreground no-underline', className)} aria-current="page">
    {@render children()}
  </span>
{/if}
