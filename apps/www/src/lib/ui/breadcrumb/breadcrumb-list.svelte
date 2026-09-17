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
  import { BreadcrumbDefaults } from './breadcrumb-defaults.svelte';
  import { cn } from '$lib/utils';
  import { breadcrumbStyles } from './breadcrumb.stylex';

  interface Props extends HTMLAttributes<HTMLOListElement> {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
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
</script>

<ol
  data-jx-breadcrumb-list=""
  data-density={d.density}
  class={cn(cx(breadcrumbStyles.list), className)}
  {...rest}
  role="list"
>
  {@render children()}
</ol>
