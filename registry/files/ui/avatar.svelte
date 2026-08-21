<!--
  jixoai avatar (registry/files/ui/avatar.svelte).
  NativeHTML first: it IS an <img> — lazy, async-decoded, intrinsic
  width/height so layout never shifts. radius 0 law = brutalist square.

  Fallback: when the image fails to load (or no src is given), the img
  is swapped for an initials block derived from `name` —
    "Ada Lovelace"      → "AL"   (first char of first + last word)
    "Gaubee"            → "Ga"   (single word: first 2 chars, CJK-safe
                                   by code-point slicing)
  The failure state resets whenever src changes, so swapping in a valid
  URL recovers the image. A caller's own onerror composes with the
  fallback (both run; the fallback still wins the DOM swap).

  alt defaults to `name` (the avatar is content); pass alt="" explicitly
  for decorative avatars next to a visible name — the fallback block
  honors it too (aria-hidden, no label).

  Sizes are one geometry prop:  sm 24 · md 32 (default) · lg 40.
-->
<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLImgAttributes, 'alt'> {
    /** image URL; empty/failed loads fall back to the initials block */
    src?: string;
    /** the person — fuels alt text and the initials fallback */
    name: string;
    /** defaults to `name`; pass "" for a decorative avatar */
    alt?: string;
    /** sm 24px · md 32px (default) · lg 40px */
    size?: 'sm' | 'md' | 'lg';
  }

  let {
    src,
    name,
    alt = name,
    size = 'md',
    class: className = '',
    onerror,
    ...rest
  }: Props = $props();

  let failed = $state(false);
  // a changed src is a fresh chance: reset the failure state
  $effect(() => {
    void src;
    failed = false;
  });

  /** run the caller's onerror, then swap to the fallback */
  function handleError(event: Event & { currentTarget: EventTarget & HTMLImageElement }) {
    onerror?.(event);
    failed = true;
  }

  const decorative = $derived(alt === '');
  const px = $derived(size === 'sm' ? 24 : size === 'lg' ? 40 : 32);

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
    width={px}
    height={px}
    onerror={handleError}
    {...rest}
  />
{:else}
  <span
    class="jx-avatar jx-avatar-{size} jx-avatar-fallback {className}"
    role={decorative ? undefined : 'img'}
    aria-label={decorative ? undefined : name}
    aria-hidden={decorative || undefined}
  >
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
