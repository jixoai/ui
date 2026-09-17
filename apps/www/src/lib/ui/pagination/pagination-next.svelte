<!--
  jixoai PaginationNext (registry/files/ui/pagination/pagination-next.svelte,
  2026-08-25).
  The trailing edge control — PaginationPrevious's mirror. href → a
  real link; onclick only → a button; NEITHER → the honest disabled
  span (aria-disabled, not a dead link) at the last page.

  child({ props }) contract per design.md: ANCHOR-form only — the
  child escape renders exclusively on the href branch (the single
  concrete element-kind law, Codex impl-r1 P1-4). The onclick-only
  button and the honest disabled span are not replaceable; the
  disabled span IS the no-affordance answer.
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes, HTMLAnchorAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { paginationStyles } from './pagination.stylex';
  import './pagination.css';

  type Props = HTMLAttributes<HTMLElement> & {
    /** the next page's URL; omit at the last page */
    href?: string;
    /** click-only control (renders a button) */
    onclick?: (event: MouseEvent) => void;
    /** replacement-element escape (ANCHOR form: requires href) */
    child?: Snippet<[{ props: HTMLAnchorAttributes & { class: string } }]>;
    children?: Snippet;
    class?: string;
  };

  let { href, onclick, child, children, class: className = '', ...rest }: Props = $props();

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

  const edgeChip = cn(
    'jx-press',
    cx(paginationStyles.chip, paginationStyles.chipIdle, paginationStyles.chipUpper),
  );

  const props = $derived({ class: cn(edgeChip, className), href, onclick, ...rest });
</script>

{#if child && href !== undefined}
  {@render child({ props })}
{:else if href !== undefined}
  <a data-jx-page-edge="" {...props} href={href}>{#if children}{@render children()}{:else}next ›{/if}</a>
{:else if onclick !== undefined}
  <button type="button" data-jx-page-edge="" {...props} onclick={onclick}>
    {#if children}{@render children()}{:else}next ›{/if}
  </button>
{:else}
  <span
    data-jx-page-edge=""
    data-jx-page-edge-off=""
    class={cn(cx(paginationStyles.chipOff), className)}
    {...rest}
    aria-disabled="true"
  >
    {#if children}{@render children()}{:else}next ›{/if}
  </span>
{/if}
