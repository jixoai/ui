<!--
  jixoai BreadcrumbLink (registry/files/ui/breadcrumb/breadcrumb-link.svelte,
  2026-08-25).
  An ordinary trail link — muted, warming to the brand hue on hover,
  real href so every input mode can use it.

  child({ props }) contract (design.md, the typed form): when the
  consumer passes a `child` snippet the part does NOT render its own
  element — it hands over `{ class, href, ...rest }` (class already
  cn()-merged; the consumer appends own utilities via
  `class={cn(props.class, 'own')}` and owns the element's semantics).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAnchorAttributes {
    href: string;
    /** replacement-element escape: receives the merged anchor props */
    child?: Snippet<[{ props: HTMLAnchorAttributes & { class: string } }]>;
    children?: Snippet;
  }

  let {
    href,
    child,
    children,
    class: className = '',
    ...rest
  }: Props = $props();

  const props = $derived({
    class: cn(
      'text-muted-foreground no-underline transition-colors duration-150 ease-out hover:text-primary focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-2',
      className,
    ),
    href,
    ...rest,
  });
</script>

{#if child}
  {@render child({ props })}
{:else}
  <a data-jx-breadcrumb-link="" {...props}>{@render children?.()}</a>
{/if}
