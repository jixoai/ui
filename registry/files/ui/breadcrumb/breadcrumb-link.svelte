<!--
  jixoai BreadcrumbLink (registry/files/ui/breadcrumb/breadcrumb-link.svelte,
  2026-08-25).
  An ordinary trail link — muted, warming to the brand hue on hover
  (the atom's own :hover condition; the transition rides the
  .jx-bc-link class in breadcrumb.css), real href so every input
  mode can use it.

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
  import { breadcrumbStyles } from './breadcrumb.stylex';
  import { BreadcrumbDefaults } from './breadcrumb-defaults.svelte';

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
  // THE DEFAULTS READ POINT (context-defaults-economy 3.3): one line —
  // the ambient density stamp resolves through the family contract
  // (no-opinion slot: no explicit prop, inherited else nothing)
  const d = $derived(BreadcrumbDefaults.resolve({}));

  // the payload's own join (separator's serialize law): objects in
  // dev, joined strings in payloads — never a raw interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        Object.entries(style).flatMap(([key, value]) =>
          key !== '$$css' && typeof value === 'string' ? [value] : [],
        ).join(' '),
      )
      .join(' ');

  const props = $derived({
    // hover/focus paint rides the atom's pseudo conditions; the
    // 150ms color transition rides the .jx-bc-link class (motion
    // literals live in breadcrumb.css — and the CLASS rides the
    // string so the child({ props }) form keeps it)
    class: cn(cx(breadcrumbStyles.link), 'jx-bc-link', className),
    href,
    ...rest,
  });
</script>

{#if child}
  {@render child({ props })}
{:else}
  <a data-jx-breadcrumb-link="" data-density={d.density} {...props}>{@render children?.()}</a>
{/if}
