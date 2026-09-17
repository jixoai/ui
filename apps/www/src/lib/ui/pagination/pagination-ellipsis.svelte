<!--
  jixoai PaginationEllipsis (registry/files/ui/pagination/pagination-ellipsis.svelte,
  2026-08-25).
  The collapsed-pages glyph, rendered wherever pageRange() yields an
  'ellipsis-start' | 'ellipsis-end' token — aria-hidden decoration:
  screen readers hear the nav label, the numbered links and
  aria-current, not the gaps.
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { paginationStyles } from './pagination.stylex';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    class?: string;
  }

  let { class: className = '', ...rest }: Props = $props();

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
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
  data-jx-page-gap=""
  class={cn(cx(paginationStyles.ellipsis), className)}
  {...rest}
  aria-hidden="true"
>…</span>
