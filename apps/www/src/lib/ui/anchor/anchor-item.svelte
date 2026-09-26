<!--
  jixoai AnchorItem (registry/files/ui/anchor/anchor-item.svelte,
  2026-08-25).
  One fragment link of the rail: REAL href, native navigation, native
  smooth scrolling via the theme's scroll-behavior. The active pick
  arrives through family context (the root's scrollspy) — aria-current
  ="location" plus the spine highlight paint on the item that owns the
  viewport-top line.

  child({ props }) contract (design.md): the consumer may replace the
  element; props carry the joined class (active paint included), href,
  aria-current and any rest attributes.
  tailwindless one-shot Wave 1b batch A (2026-09-17): the paint rides
  the family's stylex ATOMS (anchor.stylex.ts) joined through cx()
  below — the active/idle spine walks a static two-member table.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { ANCHOR_KEY, type AnchorApi } from './anchor.svelte';
  import { anchorStyles } from './anchor.stylex';

  interface Props extends Omit<HTMLAnchorAttributes, 'aria-current'> {
    /** in-page fragment, '#section-id' */
    href: string;
    /** replacement-element escape: receives the merged anchor props */
    child?: Snippet<[{ props: HTMLAnchorAttributes & { class: string } }]>;
    children?: Snippet;
  }

  let { href, child, children, class: className = '', ...rest }: Props = $props();

  const anchor = getContext<AnchorApi | undefined>(ANCHOR_KEY);
  const fragmentId = $derived(href.startsWith('#') ? href.slice(1) : '');
  const active = $derived(anchor !== undefined && fragmentId !== '' && anchor.activeId === fragmentId);

  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner (all
  // string values except $$css, space-joined).
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

  const props = $derived({
    'data-jx-anchor-link': '',
    'data-jx-anchor-active': active ? '' : undefined,
    class: cx(
      anchorStyles.link,
      active ? anchorStyles.linkActive : anchorStyles.linkIdle,
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
