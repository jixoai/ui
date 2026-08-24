<!--
  jixoai image (registry/files/ui/image.svelte).
  The general-purpose picture on avatar's proven laws: a native <img>,
  lazy, async-decoded, with REQUIRED intrinsic width/height (layout
  never shifts — the ruling made this explicit), alt semantics (text
  by default; alt="" opts into decorative), and a failure fallback
  slot with the src-change reset + composed onerror of avatar.svelte.

  Deliberately NOT here (batch-2 ruling): lightbox/zoom/preview —
  that is a dialog composition recipe (see the recipes page); no
  galleries, no thumbnail navigation, no gesture zoom.

  tw4 (2026-08-24): utility-authored, zero css residue — the img's
  responsive law and the broken-source panel are token utilities in
  the markup (the fallback svg is component-owned, so it takes its
  2rem box directly); `jx-image*` stay as semantic hooks only.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLImgAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends Omit<HTMLImgAttributes, 'alt' | 'width' | 'height'> {
    /** the picture's meaning; "" marks it decorative */
    alt: string;
    /** REQUIRED intrinsic width — the no-CLS contract */
    width: number | string;
    /** REQUIRED intrinsic height — the no-CLS contract */
    height: number | string;
    /** rendered width/height classes when different from intrinsic */
    class?: string;
    /** failure state (broken src, offline) — composed slot. CONTRACT:
     *  keep the intrinsic dims in your slot markup; the default
     *  fallback carries them so failure never shifts layout either */
    fallback?: Snippet;
  }

  let {
    alt,
    width,
    height,
    class: className = '',
    fallback,
    onerror,
    ...rest
  }: Props = $props();

  let failed = $state(false);
  // a changed src is a fresh chance (avatar.svelte's proven law)
  $effect(() => {
    void rest.src;
    failed = false;
  });

  function handleError(event: Event & { currentTarget: EventTarget & HTMLImageElement }): void {
    try {
      onerror?.(event);
    } finally {
      failed = true;
    }
  }
</script>

{#if failed && fallback}
  {@render fallback()}
{:else if failed}
  <!-- decorative pictures (alt="") stay decorative through failure;
       content pictures get a name. Size carries the intrinsic dims so
       failure never shifts layout either -->
  <span
    class="jx-image-broken box-border inline-flex items-center justify-center border border-dashed border-border bg-muted text-muted-foreground p-6"
    style="width: {typeof width === 'number' ? `${width}px` : width}; height: {typeof height === 'number' ? `${height}px` : height};"
    role={alt === '' ? undefined : 'img'}
    aria-label={alt === '' ? undefined : 'image unavailable'}
    aria-hidden={alt === '' || undefined}
  >
    <svg
      class="w-8 h-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" />
      <path d="m4 16 4.5-4.5 3 3L15 11l5 5" />
      <path d="M9.5 8.5h.01" />
    </svg>
  </span>
{:else}
  <img
    class={cn('jx-image max-w-full h-auto', className)}
    {alt}
    {width}
    {height}
    loading="lazy"
    decoding="async"
    onerror={handleError}
    {...rest}
  />
{/if}
