<!--
  jixoai prototype canvas (registry/files/ui/prototype-kit/prototype-canvas.svelte).
  The container half of the prototype standard (design-studio change,
  2026-09-11): a CSS grid that lays out frame matrices and, through
  svelte context, tells its descendant frames WHICH prototype folder
  they belong to. The canvas never resolves refs itself — frames are
  declarative URLs against the design server's convention glob.

  - GRID ONLY (css-architecture grid law): display:grid with
    prop-driven template tracks; no position anywhere in the kit.
    gridCols: number → repeat(N, minmax(0,1fr)); string → verbatim
    (the escape hatch for named/hybrid tracks); omitted → the adaptive
    default repeat(auto-fill, minmax(min(100%, 30rem), 1fr)) — a
    responsive wrap whose 1fr cells stretch while frames keep their
    real viewport (the frame shell scales to fit, never stretches).
    gridRows follows the same three forms; gap is number(px)|string.
  - CONTEXT: `prototype ?? inherited ?? derived-from-location` — an
    explicit prop wins, a nested canvas inherits the nearest outer
    canvas unless it provides its own, and the top-level canvas falls
    back to the design server's canvas-page URL
    (/prototypes/<name>/…). The payload is ONE getter (re-derived
    live; never a mount-time snapshot).
  - LABEL: a full-row caption (grid-column: 1 / -1), aria-label on
    the section; the label is chrome, never a heading (the page
    outline stays page-owned — the component-canvas floor law).

  Original requirement input: Owner 2026-09-11 — the prototype
  standard (canvas/page/component) for `jixoai-ui design`.
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import {
    PROTOTYPE_KIT_KEY,
    derivePrototypeFromLocation,
    getPrototypeContext,
    type PrototypeKitContext,
  } from './context';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** explicit column tracks: number → repeat(N, minmax(0,1fr)),
     *  string → verbatim; omitted → the adaptive auto-fill default */
    gridCols?: number | string;
    /** explicit row tracks, same three forms as gridCols (omitted →
     *  implicit rows, content-sized) */
    gridRows?: number | string;
    /** grid gap: number → px, string → verbatim */
    gap?: number | string;
    /** prototype folder name override (nested canvas escape hatch);
     *  omitted → inherit the nearest canvas, else derive from the
     *  canvas-page URL */
    prototype?: string;
    /** full-row caption above the grid (chrome, never a heading) */
    label?: string;
  }

  let {
    gridCols = undefined,
    gridRows = undefined,
    gap = 16,
    prototype = undefined,
    label = undefined,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  // context resolution: explicit ?? inherited ?? canvas-page URL
  const inherited = getPrototypeContext();
  const resolvedPrototype = $derived(
    prototype ?? inherited?.prototype ?? derivePrototypeFromLocation()
  );

  setContext(PROTOTYPE_KIT_KEY, {
    get prototype() {
      return resolvedPrototype;
    },
  } satisfies PrototypeKitContext);

  function trackStyle(
    value: number | string | undefined,
    fallback: string | undefined
  ): string | undefined {
    if (value === undefined) return fallback;
    if (typeof value === 'number') return `repeat(${value}, minmax(0, 1fr))`;
    return value;
  }

  const columnsStyle = $derived(
    trackStyle(gridCols, 'repeat(auto-fill, minmax(min(100%, 30rem), 1fr))')
  );
  const rowsStyle = $derived(trackStyle(gridRows, undefined));
  const gapStyle = $derived(typeof gap === 'number' ? `${gap}px` : gap);
</script>

<section
  data-jx-prototype-canvas
  aria-label={label}
  class={cn('min-w-0', className)}
  style:display="grid"
  style:grid-template-columns={columnsStyle}
  style:grid-template-rows={rowsStyle}
  style:gap={gapStyle}
  {...rest}
>
  {#if label}
    <p
      data-jx-prototype-canvas-label
      class="font-mono text-xs tracking-wide text-muted-foreground uppercase"
      style:grid-column="1 / -1"
    >
      {label}
    </p>
  {/if}
  {@render children?.()}
</section>
