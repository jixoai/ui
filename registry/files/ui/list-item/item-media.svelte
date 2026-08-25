<!--
  jixoai ItemMedia — the leading slot: avatar host (default), a 16px
  icon (icon), or a fixed square image (image). Shrinks under sm/xs
  items; self-starts when a description is present (optical rule in
  item.css).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    variant?: 'default' | 'icon' | 'image';
    /** for image variants: the img src (renders the img for you) */
    src?: string;
    alt?: string;
    class?: string;
    children?: Snippet;
  }

  let { variant = 'default', src, alt = '', class: className = '', children }: Props = $props();
</script>

<span data-slot="item-media" data-variant={variant} class={cn(className)}>
  {#if variant === 'image' && src}
    <img {src} {alt} />
  {/if}
  {#if children}{@render children()}{/if}
</span>
