<!--
  jixoai PaginationLink (registry/files/ui/pagination/pagination-link.svelte,
  2026-08-25).
  One numbered page: real href (server-friendly, JS-off) or an
  onclick-only control (renders a <button> — a link that goes nowhere
  is a lie to every input mode). `isActive` paints the current chip
  and sets aria-current="page".

  child({ props: linkProps }) contract (design.md): ANCHOR-form only — the
  escape renders exclusively on the href branch (single concrete
  element-kind law, Codex impl-r1 P1-4). The onclick-only button is
  not replaceable (a link that goes nowhere is a lie to every input
  mode). The current page rides the law's press without its shadow —
  hover/active poses re-point to none (verbatim from the closed
  component).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { paginationStyles } from './pagination.stylex';
  import './pagination.css';

  interface Props extends Omit<HTMLAnchorAttributes, 'aria-current'> {
    /** which page this link is (its default label) */
    page: number;
    /** the current page — active chip paint + aria-current */
    isActive?: boolean;
    /** where this page lives; omit for an onclick-only control */
    href?: string;
    /** click-only control (renders a button, not a dead link) */
    onclick?: (event: MouseEvent) => void;
    /** replacement-element escape (ANCHOR form: requires href) */
    child?: Snippet<[{ props: HTMLAnchorAttributes & { class: string } }]>;
    children?: Snippet;
    class?: string;
  }

  let {
    page,
    isActive = false,
    href,
    onclick,
    child,
    children,
    class: className = '',
    ...rest
  }: Props = $props();

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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // chip geometry + press poses (the closed component's law: the
  // current page rides the press, never its shadow) — tailless: the
  // geometry is the chip atom, the press channel poses + hover/focus
  // pseudos live in pagination.css keyed on the data hooks

  const linkProps = $derived({
    'data-jx-page': '',
    'data-jx-page-current': isActive ? '' : undefined,
    class: cn(
      'jx-press',
      cx(paginationStyles.chip),
      isActive ? cx(paginationStyles.chipCurrent) : cx(paginationStyles.chipIdle),
      className,
    ),
    'aria-current': isActive ? ('page' as const) : undefined,
    href,
    onclick,
    ...rest,
  } as HTMLAnchorAttributes & { class: string });
</script>

{#if child && href !== undefined}
  {@render child({ props: linkProps })}
{:else if href !== undefined}
  <a {...linkProps} href={href}>{#if children}{@render children()}{:else}{page}{/if}</a>
{:else}
  <!-- the button branch ENUMERATES its legal members — never spreads the
       anchor-typed bag (a cast would launder invalid HTML onto a <button>;
       the T141 adjudication) -->
  <button
    data-jx-page=""
    data-jx-page-current={isActive ? '' : undefined}
    class={linkProps.class}
    aria-current={isActive ? 'page' : undefined}
    onclick={onclick}
    type="button"
  >{#if children}{@render children()}{:else}{page}{/if}</button>
{/if}
