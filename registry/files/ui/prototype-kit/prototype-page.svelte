<!--
  jixoai prototype page (registry/files/ui/prototype-kit/prototype-page.svelte).
  The viewport frame of the prototype standard (design-studio change,
  2026-09-11): a declarative <iframe> whose src is the design server's
  frame surface — `/__design__/frame?p=<prototype>&f=<ref minus ./>
  &theme=<theme>&w=<width>&h=<height>` — so the ref'd page runs its
  REAL media/container queries against the frame viewport. The
  component resolves only the URL (prototype name from the canvas
  context); ref parsing is the server's convention glob, never
  client-side.

  - width × height lock the viewport; theme lands as the frame
    document's root class (light|dark|auto — auto follows the host).
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
    /** the ref'd page file, relative to the prototype folder
     *  (leading ./ stripped by the URL contract) */
    ref: string;
    /** viewport width in px */
    width: number;
    /** viewport height in px */
    height: number;
    /** frame document root theme (auto = follow the host) */
    theme?: PrototypeTheme;
    /** visible caption over the frame (defaults off) */
    label?: string;
  }

  let {
    id,
    ref,
    width,
    height,
    theme = 'auto',
    label = undefined,
    ...rest
  }: Props = $props();

  const context = getPrototypeContext();
  const prototype = $derived(context?.prototype);

  const src = $derived(
    prototype !== undefined && hasDesignHost()
      ? buildFrameUrl({ prototype, ref, theme, width, height })
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
  kind="page"
  frameRef={ref}
  {theme}
  {src}
  {notice}
  {width}
  {height}
  {label}
  {...rest}
/>
