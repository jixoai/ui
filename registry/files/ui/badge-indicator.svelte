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
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

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
</script>

{#if children}
  <span class="jx-bi-wrap {className}">
    {@render children()}
    {#if visible}
      <span
        class="jx-bi"
        class:jx-bi-dot={dot}
        role={dot ? 'img' : undefined}
        aria-label={dot ? (label ?? 'new activity') : `${text}`}
      ></span>
    {/if}
  </span>
{:else if visible}
  <span
    class="jx-bi jx-bi-standalone {className}"
    class:jx-bi-dot={dot}
    role={dot ? 'img' : undefined}
    aria-label={dot ? (label ?? 'new activity') : `${text}`}
    >{text}</span
  >
{/if}

<style>
  .jx-bi-wrap {
    position: relative;
    display: inline-flex;
  }
  .jx-bi {
    position: absolute;
    top: -0.375rem;
    right: -0.375rem;
    min-width: 1.125rem;
    height: 1.125rem;
    box-sizing: border-box;
    padding: 0 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--background);
    background: var(--destructive);
    color: var(--destructive-foreground);
    font-family: var(--font-mono);
    font-size: 0.625rem;
    line-height: 1;
    border-radius: var(--radius);
  }
  .jx-bi-dot {
    min-width: 0.625rem;
    width: 0.625rem;
    height: 0.625rem;
    padding: 0;
    background: var(--primary);
    border-color: var(--background);
  }
  .jx-bi-standalone {
    position: static;
  }
</style>
