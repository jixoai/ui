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
  import Icon from '$lib/ui/icon';
  import { cn } from '$lib/utils';
  import { imageStyles } from './image.stylex';

  // the payload's own join (separator's serialize law): atoms are
  // objects in dev — composition goes through THIS joiner (all string
  // values except $$css, space-joined; plain strings pass through)
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
    class={cx(imageStyles.broken)}
    style="width: {typeof width === 'number' ? `${width}px` : width}; height: {typeof height === 'number' ? `${height}px` : height};"
    role={alt === '' ? undefined : 'img'}
    aria-label={alt === '' ? undefined : 'image unavailable'}
    aria-hidden={alt === '' || undefined}
  >
    <!-- lucide image glyph through the Icon component; the panel owns
         the layout, the component owns the 2rem box and the lighter
         stroke through its props -->
    <Icon name="image" size={32} strokeWidth={1.5} />
  </span>
{:else}
  <img
    data-jx-image
    class={cn(cx(imageStyles.img), className)}
    {alt}
    {width}
    {height}
    loading="lazy"
    decoding="async"
    onerror={handleError}
    {...rest}
  />
{/if}
