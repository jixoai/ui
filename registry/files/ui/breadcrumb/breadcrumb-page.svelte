<!--
  jixoai BreadcrumbPage (registry/files/ui/breadcrumb/breadcrumb-page.svelte,
  2026-08-25).
  The current page — aria-current="page" on real foreground paint. With
  href it stays a REAL anchor (the closed component's law: deep links
  and reloads stay honest); without one it renders the span form of the
  same semantics. Either way the trail's leaf tells assistive tech
  "you are here".
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { densityRungOf } from '$lib/defaults.svelte';
  import { breadcrumbStyles } from './breadcrumb.stylex';
  import { BreadcrumbDefaults } from './breadcrumb-defaults.svelte';

  interface Props extends Omit<HTMLAnchorAttributes, 'aria-current'> {
    /** keep the leaf a real link when the page has a URL of its own */
    href?: string;
    class?: string;
    children: Snippet;
  }

  let { href, class: className = '', children, ...rest }: Props = $props();
  // THE DEFAULTS READ POINT (context-defaults-economy 3.3): one line —
  // the ambient density stamp resolves through the family contract
  // (no-opinion slot: no explicit prop, inherited else nothing)
  const d = $derived(BreadcrumbDefaults.resolve({}));

  // the payload's own join (separator's serialize law): objects in
  // dev, joined strings in payloads — never a raw interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

{#if href}
  <a
    data-jx-breadcrumb-current=""
    data-density={densityRungOf(d.density)}
    class={cn(cx(breadcrumbStyles.page), className)}
    {href}
    {...rest}
    aria-current="page"
  >
    {@render children()}
  </a>
{:else}
  <!-- the span form: same standing contract, retyped for the span element
       (anchor-only attrs cannot appear — href is destructured out) -->
  <span
    data-jx-breadcrumb-current=""
    data-density={densityRungOf(d.density)}
    class={cn(cx(breadcrumbStyles.page), className)}
    {...(rest as HTMLAttributes<HTMLSpanElement>)}
    aria-current="page"
  >
    {@render children()}
  </span>
{/if}
