<script module lang="ts">
  /** stroke-nature glyphs (viewBox 24, lucide geometry, inlined) */
  const SET: Record<string, { v: string; n: 'stroke' | 'fill'; d: string }> = {
    chevronDown: { v: '0 0 24 24', n: 'stroke', d: '<path d="m6 9 6 6 6-6"/>' },
    check: { v: '0 0 24 24', n: 'stroke', d: '<path d="M20 6 9 17l-5-5"/>' },
    copy: {
      v: '0 0 24 24',
      n: 'stroke',
      d: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    },
    x: { v: '0 0 24 24', n: 'stroke', d: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>' },
  };

  export type IconName = keyof typeof SET;
</script>

<script lang="ts">
  // icon.svelte — the named-glyph renderer, StyleX re-authoring. The
  // corpus demo inlines a 4-glyph set (registry items stay dependency-
  // free; the real set is plugin-generated — out of corpus scope, the
  // RENDERER's visual intent is the surface under test: currentColor
  // by artwork nature, square size edge, round caps/joins, the
  // reserved box for async paths).
  import * as stylex from '@stylexjs/stylex';
  import { iconStyles as s } from './icon.stylex';

  interface Props {
    name: IconName;
    size?: number | string;
    strokeWidth?: number | string;
    /** demo lane: force the async reserved box (the lazy path's
     *  SSR-stable square — hydration never rewrites the box) */
    pending?: boolean;
    [key: string]: unknown;
  }

  let { name, size = 16, strokeWidth = 2, pending = false, ...rest }: Props = $props();

  const cssSize = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

{#if pending}
  <!-- the reserved box: fixed square, display:inline-block + the
       FACTORY-produced dynamic width/height (compiles to a custom
       property + inline style — the spike-report §5.6 idiom) -->
  <span
    data-jx-icon-pending=""
    {...stylex.attrs(s.reserved, s.reservedSize(cssSize))}
    {...rest}
    aria-hidden="true"></span>
{:else}
  <svg
    {...rest}
    xmlns="http://www.w3.org/2000/svg"
    viewBox={SET[name].v}
    width={size}
    height={size}
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    data-jx-icon=""
    fill={SET[name].n === 'fill' ? 'currentColor' : 'none'}
    stroke={SET[name].n === 'fill' ? 'none' : 'currentColor'}
  >{@html SET[name].d}</svg>
{/if}
