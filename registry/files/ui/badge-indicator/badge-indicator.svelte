<!--
  jixoai badge indicator (registry/files/ui/badge-indicator.svelte).
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
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

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

  // two complete paints: the count chip (18px min box, destructive) and
  // the 10px primary presence dot — standalone drops the corner offsets
  // (a bare span is position:static already)
  const chip = dot
    ? 'w-2.5 min-w-2.5 h-2.5 p-0 box-border inline-flex items-center justify-center border border-background bg-primary font-mono text-[0.625rem] leading-none rounded-(--radius)'
    : 'min-w-[1.125rem] h-[1.125rem] box-border px-1 py-0 inline-flex items-center justify-center border border-background bg-destructive text-destructive-foreground font-mono text-[0.625rem] leading-none rounded-(--radius)';
  const placement = children ? 'absolute -top-1.5 -right-1.5' : '';
</script>

{#if children}
  <span data-jx-bi-wrap class={cn('relative inline-flex', className)}>
    {@render children()}
    {#if visible}
      <span
        data-jx-bi
        data-jx-bi-dot={dot ? '' : undefined}
        data-jx-bi-standalone={children ? undefined : ''}
        class={cn(chip, placement)}
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
    class={cn(chip, placement, className)}
    role={dot ? 'img' : undefined}
    aria-label={dot ? (label ?? 'new activity') : `${text}`}
    >{text}</span
  >
{/if}
