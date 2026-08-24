<!--
  jixoai icon button (registry/files/ui/icon-button.svelte).
  The icon+text button with an explicit two-part contract:

    icon  the glyph — ALWAYS decorative (the component wraps it
          aria-hidden; bring your own svg/glyph snippet)
    text  the ONE label — a single string, single-sourced

  Two variants:
    normal     icon + text side by side (press-button outline surface)
    icon-only  a square button; text does not disappear — it moves to
               the tooltip AND stays the accessible name (aria-label).
               An icon-only button must say itself.

  Press law verbatim (theme .jx-press): hover grows the shadow only —
  the body never moves; active presses +1px on an anchored shadow.
  href renders an anchor instead; hrefs outside "/" open a new tab
  with noreferrer automatically.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Tooltip from '$lib/ui/tooltip/tooltip.svelte';

  interface Props {
    /** the glyph — always decorative; an svg or character snippet */
    icon: Snippet;
    /** the ONE label: visible text in normal, tooltip + accessible name in icon-only */
    text: string;
    /** normal = icon + text; icon-only = square button, text becomes the tooltip */
    variant?: 'normal' | 'icon-only';
    /** icon-only: which side the tooltip leans */
    placement?: 'top' | 'bottom' | 'top-start' | 'bottom-start' | 'top-end' | 'bottom-end';
    href?: string;
    /** Opens non-internal hrefs (not starting with "/") in a new tab. */
    external?: boolean;
    onclick?: () => void;
    type?: 'button' | 'submit';
    class?: string;
  }

  let {
    icon,
    text,
    variant = 'normal',
    placement,
    href,
    external = undefined,
    onclick,
    type = 'button',
    class: className = '',
  }: Props = $props();

  const iconOnly = $derived(variant === 'icon-only');

  const base =
    'jx-press inline-flex items-center justify-center border border-border bg-background hover:bg-muted text-sm font-medium';
  // same height as a text press-button in normal; a lone square in icon-only
  const shape = $derived(iconOnly ? 'size-9' : 'gap-2.5 px-3.5 py-2.5');
  const classes = $derived(`${base} ${shape} ${className}`);
  const isExternal = $derived(external ?? (href !== undefined && !href.startsWith('/')));
</script>

{#snippet control()}
  {#if href}
    <a
      {href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer' : undefined}
      aria-label={iconOnly ? text : undefined}
      class={classes}
    >
      <span class="shrink-0" aria-hidden="true">{@render icon()}</span>
      {#if !iconOnly}<span>{text}</span>{/if}
    </a>
  {:else}
    <button {type} {onclick} aria-label={iconOnly ? text : undefined} class={classes}>
      <span class="shrink-0" aria-hidden="true">{@render icon()}</span>
      {#if !iconOnly}<span>{text}</span>{/if}
    </button>
  {/if}
{/snippet}

<!-- one control, two shells — the tooltip wraps it only in icon-only -->
{#if iconOnly}
  <Tooltip {text} placement={placement ?? 'top'}>
    {@render control()}
  </Tooltip>
{:else}
  {@render control()}
{/if}
