<!--
  jixoai TerminalFooterColumn (registry/files/ui/terminal-footer/
  terminal-footer-column.svelte, 2026-08-25).
  One column of the footer's meta row: a title (optional — omit for an
  untitled link stack) and FREE children — the links are authored by
  the consumer, not passed as data. Their hover-warm paint rides
  terminal-footer.css (descendant rules; utilities cannot reach
  consumer-authored anchors).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { terminalFooterStyles } from './terminal-footer.stylex';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** the column heading (omit for an untitled link stack) */
    title?: string;
    class?: string;
    children: Snippet;
  }

  let { title, class: className = '', children, ...rest }: Props = $props();

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

<div data-jx-terminal-footer-column="" class={cn(cx(terminalFooterStyles.column), className)} {...rest}>
  {#if title}
    <span class={cx(terminalFooterStyles.columnTitle)}>
      {title}
    </span>
  {/if}
  <div data-jx-terminal-footer-links="" class={cx(terminalFooterStyles.columnLinks)}>
    {@render children()}
  </div>
</div>
