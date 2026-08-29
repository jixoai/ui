<!--
  jixoai image (registry/files/ui/image/image.svelte).
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
  2rem box directly); the hooks ride `data-jx-image` /
  `data-jx-image-broken` attributes (data-jx-hooks, 2026-08-25).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLImgAttributes } from 'svelte/elements';
  import { icons } from '$lib/icons';
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
    data-jx-image-broken
    class="box-border inline-flex items-center justify-center border border-dashed border-border bg-muted text-muted-foreground p-6 [&_svg]:w-8 [&_svg]:h-8 [&_svg]:stroke-[1.5]"
    style="width: {typeof width === 'number' ? `${width}px` : width}; height: {typeof height === 'number' ? `${height}px` : height};"
    role={alt === '' ? undefined : 'img'}
    aria-label={alt === '' ? undefined : 'image unavailable'}
    aria-hidden={alt === '' || undefined}
  >
    <!-- lucide image glyph from the shared module; the panel owns its
         2rem box and the lighter stroke through consuming utilities -->
    {@html icons.image}
  </span>
{:else}
  <img
    data-jx-image
    class={cn('max-w-full h-auto', className)}
    {alt}
    {width}
    {height}
    loading="lazy"
    decoding="async"
    onerror={handleError}
    {...rest}
  />
{/if}
