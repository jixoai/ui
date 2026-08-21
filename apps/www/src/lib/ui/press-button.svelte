<!--
  jixoai press button (registry/files/ui/press-button.svelte).
  Brutalist press physics: hover lifts toward the viewer (shadow xs → sm),
  active presses back into the page. Variants: primary / outline / copied.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'outline' | 'copied';
    href?: string;
    /** Opens non-internal hrefs (not starting with "/") in a new tab. */
    external?: boolean;
    onclick?: () => void;
    type?: 'button' | 'submit';
    ariaLabel?: string;
    children: Snippet;
  }

  let {
    variant = 'outline',
    href,
    external = undefined,
    onclick,
    type = 'button',
    ariaLabel,
    children,
  }: Props = $props();

  const base =
    'inline-flex items-center gap-2.5 border border-border px-3.5 py-2.5 text-sm font-medium shadow-xs transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sm active:translate-x-px active:translate-y-px active:shadow-none motion-reduce:transition-none';
  const variants = {
    primary: 'bg-primary text-primary-foreground',
    outline: 'bg-background hover:bg-muted',
    copied: 'bg-secondary text-secondary-foreground',
  } as const;
  const classes = $derived(`${base} ${variants[variant]}`);
  const isExternal = $derived(external ?? (href !== undefined && !href.startsWith('/')));
</script>

{#if href}
  <a
    {href}
    target={isExternal ? '_blank' : undefined}
    rel={isExternal ? 'noreferrer' : undefined}
    aria-label={ariaLabel}
    class={classes}
  >
    {@render children()}
  </a>
{:else}
  <button {type} {onclick} aria-label={ariaLabel} class={classes}>
    {@render children()}
  </button>
{/if}
