<!--
  jixoai PaginationLink (registry/files/ui/pagination/pagination-link.svelte,
  2026-08-25).
  One numbered page: real href (server-friendly, JS-off) or an
  onclick-only control (renders a <button> — a link that goes nowhere
  is a lie to every input mode). `isActive` paints the current chip
  and sets aria-current="page".

  child({ props }) contract (design.md): the consumer may replace the
  element; props carry the cn()-merged class, href/onclick and the
  state attributes. The current page rides the law's press without
  its shadow — hover/active poses re-point to none (verbatim from the
  closed component).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props {
    /** which page this link is (its default label) */
    page: number;
    /** the current page — active chip paint + aria-current */
    isActive?: boolean;
    /** where this page lives; omit for an onclick-only control */
    href?: string;
    /** click-only control (renders a button, not a dead link) */
    onclick?: (event: MouseEvent) => void;
    /** replacement-element escape: receives the merged link props */
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
  }: Props = $props();

  // chip geometry + press poses (the closed component's law: the
  // current page rides the press, never its shadow)
  const chipPose =
    '[--jx-press-shadow:none] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)]';
  const chipPoseCurrent =
    '[--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none]';
  const chipBase =
    'inline-flex h-[1.875rem] min-w-[1.875rem] items-center justify-center box-border border px-2 font-nav text-xs no-underline tracking-[0.08em] cursor-pointer focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1';

  const props = $derived({
    'data-jx-page': '',
    'data-jx-page-current': isActive ? '' : undefined,
    class: cn(
      'jx-press',
      chipBase,
      isActive ? chipPoseCurrent : chipPose,
      isActive
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border bg-card text-foreground hover:border-primary hover:text-primary',
      className,
    ),
    'aria-current': isActive ? ('page' as const) : undefined,
    href,
    onclick,
  });
</script>

{#if child}
  {@render child({ props })}
{:else if href !== undefined}
  <a {...props} href={href}>{#if children}{@render children()}{:else}{page}{/if}</a>
{:else}
  <button type="button" {...props}>{#if children}{@render children()}{:else}{page}{/if}</button>
{/if}
