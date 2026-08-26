<!--
  jixoai AnchorItem (registry/files/ui/anchor/anchor-item.svelte,
  2026-08-25).
  One fragment link of the rail: REAL href, native navigation, native
  smooth scrolling via the theme's scroll-behavior. The active pick
  arrives through family context (the root's scrollspy) — aria-current
  ="location" plus the spine highlight paint on the item that owns the
  viewport-top line.

  child({ props }) contract (design.md): the consumer may replace the
  element; props carry the cn()-merged class (active paint included),
  href, aria-current and any rest attributes.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { ANCHOR_KEY, type AnchorApi } from './anchor.svelte';

  type Props = Omit<HTMLAnchorAttributes, 'aria-current'> & {
    /** in-page fragment, '#section-id' */
    href: string;
    /** replacement-element escape: receives the merged anchor props */
    child?: Snippet<[{ props: HTMLAnchorAttributes & { class: string } }]>;
    children?: Snippet;
  };

  let { href, child, children, class: className = '', ...rest }: Props = $props();

  const anchor = getContext<AnchorApi | undefined>(ANCHOR_KEY);
  const fragmentId = $derived(href.startsWith('#') ? href.slice(1) : '');
  const active = $derived(anchor !== undefined && fragmentId !== '' && anchor.activeId === fragmentId);

  const props = $derived({
    'data-jx-anchor-link': '',
    'data-jx-anchor-active': active ? '' : undefined,
    class: cn(
      '-ml-px flex min-h-[var(--jx-d-ctl-hit)] items-center border-l-2 px-[var(--jx-d-ctl-pad)] font-nav text-[length:var(--jx-d-ctl-text)] leading-[var(--jx-d-ctl-line)] uppercase tracking-[0.08em] no-underline transition-[color,border-color] duration-150 ease-out hover:text-foreground focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1',
      active ? 'border-l-primary text-foreground' : 'border-l-transparent text-muted-foreground',
      className,
    ),
    href,
    'aria-current': active ? ('location' as const) : undefined,
    ...rest,
  });
</script>

{#if child}
  {@render child({ props })}
{:else}
  <a {...props}>{@render children?.()}</a>
{/if}
