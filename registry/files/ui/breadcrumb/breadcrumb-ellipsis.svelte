<!--
  jixoai BreadcrumbEllipsis (registry/files/ui/breadcrumb/breadcrumb-ellipsis.svelte,
  2026-08-25).
  A MANUAL gap glyph — the author's own "pages were omitted here"
  decoration (aria-hidden; screen readers hear the nav label and the
  links, not the gaps). For the live fold (ellipsis that links to the
  first hidden page) use BreadcrumbCollapse instead.
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { breadcrumbStyles } from './breadcrumb.stylex';
  import { BreadcrumbDefaults } from './breadcrumb-defaults.svelte';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    class?: string;
  }

  let { class: className = '', ...rest }: Props = $props();
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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<span
  data-jx-breadcrumb-ellipsis=""
  data-density={d.density}
  class={cn(cx(breadcrumbStyles.ellipsis), className)}
  {...rest}
  aria-hidden="true"
>…</span>
