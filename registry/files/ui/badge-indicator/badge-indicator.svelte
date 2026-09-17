<!--
  jixoai badge indicator (registry/files/ui/badge-indicator/badge-indicator.svelte).
  antd Badge's other half — the COUNT/DOT overlay chip.badge is
  the static status chip; this is the live indicator riding on a
  corner of its child (an avatar, an icon, a tab):

    dot       a solid brand dot — presence/unread presence (no number)
    count     the number, capped by overflow (default 99+)
    standalone (no children) renders inline — a plain count chip

  hidden states are honest: count=0 hides the indicator entirely
  (zero unread IS no badge); showZero opts into showing it.

  tw4 (2026-08-24): utility-authored, zero css residue. dot and count
  paint as two DETERMINISTIC utility strings (never two utilities for
  one property — the sheet's internal order must never be load-
  bearing); the hooks ride `data-jx-bi*` attributes (data-jx-hooks,
  2026-08-25 — no css ever defined the classes).
  tailwindless one-shot Wave 1b batch A (2026-09-17): the paint rides
  the family's stylex ATOMS (badge-indicator.stylex.ts) joined
  through cx() below — two deterministic ATOM groups (one per idiom),
  the corner placement a conditional group; the data-jx-bi* hooks
  stay attributes (css-less anchors, unchanged). Still zero css.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { badgeIndicatorStyles } from './badge-indicator.stylex';

  interface Props {
    /** the dot idiom — beats count when only presence matters */
    dot?: boolean;
    /** the count idiom; hidden at 0 unless showZero */
    count?: number;
    /** cap before "n+" (default 99) */
    overflow?: number;
    /** render count=0 instead of hiding */
    showZero?: boolean;
    /** what the indicator rides on (omitted = standalone chip) */
    children?: Snippet;
    /** accessible name for the dot (required in dot mode) */
    label?: string;
    class?: string;
  }

  let { dot, count, overflow = 99, showZero = false, children, label, class: className = '' }: Props =
    $props();

  const visible = $derived(dot || (count !== undefined && (count > 0 || showZero)));
  const text = $derived.by(() => {
    if (dot) return '';
    if (count === undefined) return '';
    return count > overflow ? `${overflow}+` : String(count);
  });

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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // two complete paints: the count chip (18px min box, destructive) and
  // the 10px primary presence dot — standalone drops the corner offsets
  // (a bare span is position:static already)
  const chip = cx(badgeIndicatorStyles.base, dot ? badgeIndicatorStyles.dot : badgeIndicatorStyles.count);
  const placement = children ? cx(badgeIndicatorStyles.anchored) : '';
</script>

{#if children}
  <span data-jx-bi-wrap class={cx(badgeIndicatorStyles.wrap, className)}>
    {@render children()}
    {#if visible}
      <span
        data-jx-bi
        data-jx-bi-dot={dot ? '' : undefined}
        data-jx-bi-standalone={children ? undefined : ''}
        class={cx(chip, placement)}
        role={dot ? 'img' : undefined}
        aria-label={dot ? (label ?? 'new activity') : `${text}`}
        >{text}</span
      >
    {/if}
  </span>
{:else if visible}
  <span
    data-jx-bi
    data-jx-bi-dot={dot ? '' : undefined}
    data-jx-bi-standalone={children ? undefined : ''}
    class={cx(chip, placement, className)}
    role={dot ? 'img' : undefined}
    aria-label={dot ? (label ?? 'new activity') : `${text}`}
    >{text}</span
  >
{/if}
