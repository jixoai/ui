<!--
  jixoai prototype component (registry/files/ui/prototype-kit/prototype-component.svelte).
  The component frame of the prototype standard (design-studio change,
  2026-09-11): the same declarative frame URL as PrototypePage, but the
  viewport HEIGHT is a starting value — the frame adapts to its content
  (same-origin measurement against the loaded design frame) unless
  `fill` locks it. The URL carries the semantics explicitly:
  `&fill=0` (adaptive, the default) or `&fill=1` (locked); `h` is
  present when an initial height was given, omitted otherwise.

  - State matrices are REAL ref'd files (multiple state files or one
    wrapper) — the frame never invents a props-injection protocol
    (v0 boundary, design.md §7).
  - Outside a design-server host (or without a prototype context) the
    frame renders the visible notice state instead of a dead iframe.
  - The id is the DOM anchor (navigator deep link); dev mode warns on
    duplicates within the canvas, first occurrence wins.

  Original requirement input: Owner 2026-09-11 — the prototype
  standard (canvas/page/component) for `jixoai-ui design`.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { getPrototypeContext, hasDesignHost, type PrototypeTheme } from './context';
  import { buildFrameUrl } from './frame-url';
  import FrameView from './frame-view.svelte';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** DOM anchor id, unique within the canvas (dev warning on dup) */
    id: string;
    /** the ref'd component file, relative to the prototype folder
     *  (leading ./ stripped by the URL contract) */
    ref: string;
    /** frame width in px */
    width: number;
    /** INITIAL frame height in px (omitted → a small default until
     *  the content measurement takes over) */
    height?: number;
    /** lock the height instead of adapting to content */
    fill?: boolean;
    /** frame document root theme (auto = follow the host) */
    theme?: PrototypeTheme;
    /** visible caption over the frame (defaults off) */
    label?: string;
  }

  let {
    id,
    ref,
    width,
    height = undefined,
    fill = false,
    theme = 'auto',
    label = undefined,
    ...rest
  }: Props = $props();

  const context = getPrototypeContext();
  const prototype = $derived(context?.prototype);

  const src = $derived(
    prototype !== undefined && hasDesignHost()
      ? buildFrameUrl({ prototype, ref, theme, width, height, fill })
      : undefined
  );

  const notice = $derived(
    prototype === undefined
      ? 'prototype frame: no prototype context — mount inside a PrototypeCanvas (or give the canvas a prototype prop).'
      : 'prototype frame requires the design server — run `jixoai-ui design` and open this canvas through it.'
  );
</script>

<FrameView
  {id}
  kind="component"
  frameRef={ref}
  {theme}
  {src}
  {notice}
  {width}
  {height}
  adaptive={!fill}
  {label}
  {...rest}
/>
