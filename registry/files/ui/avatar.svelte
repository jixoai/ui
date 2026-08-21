<!--
  jixoai avatar (registry/files/ui/avatar.svelte).
  NativeHTML first: it IS an <img> — lazy, async-decoded, intrinsic
  width/height so layout never shifts. radius 0 law = brutalist square.

  Fallback: when the image fails to load (or no src is given), the img is
  swapped for an initials block derived from `name` —
    "Ada Lovelace"      → "AL"   (first char of first + last word)
    "Gaubee"            → "Ga"   (single word: first 2 chars, CJK-safe
                                   by code-point slicing)
  alt defaults to `name` (the avatar is content); pass alt="" explicitly
  for decorative avatars next to a visible name.

  Sizes are one geometry prop:  sm 24 · md 32 (default) · lg 40.
-->
<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements';

  interface Props extends HTMLImgAttributes {
    /** image URL; empty/failed loads fall back to the initials block */
    src?: string;
    /** the person — fuels alt text and the initials fallback */
    name: string;
    /** sm 24px · md 32px (default) · lg 40px */
    size?: 'sm' | 'md' | 'lg';
  }

  let { src, name, size = 'md', class: className = '', alt = name, ...rest }: Props = $props();

  let failed = $state(false);

  const initials = $derived.by(() => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '?';
    if (words.length === 1) return [...words[0]].slice(0, 2).join('').toUpperCase();
    return (words[0][0] + words.at(-1)![0]).toUpperCase();
  });
</script>

{#if src && !failed}
  <img
    class="jx-avatar jx-avatar-{size} {className}"
    {src}
    {alt}
    loading="lazy"
    decoding="async"
    width={size === 'sm' ? 24 : size === 'lg' ? 40 : 32}
    height={size === 'sm' ? 24 : size === 'lg' ? 40 : 32}
    onerror={() => (failed = true)}
    {...rest}
  />
{:else}
  <span class="jx-avatar jx-avatar-{size} jx-avatar-fallback {className}" role="img" aria-label={name}>
    {initials}
  </span>
{/if}

<style>
  .jx-avatar {
    flex: none;
    display: inline-block;
    box-sizing: border-box;
    object-fit: cover;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
    color: var(--muted-foreground);
  }
  .jx-avatar-sm {
    width: 24px;
    height: 24px;
  }
  .jx-avatar-md {
    width: 32px;
    height: 32px;
  }
  .jx-avatar-lg {
    width: 40px;
    height: 40px;
  }
  .jx-avatar-fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--muted);
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
</style>
