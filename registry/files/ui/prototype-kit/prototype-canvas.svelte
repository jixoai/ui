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
    STUDIO MODE (#24): embedded by the design studio (?studio=1 →
    isStudioHost), numeric/adaptive tracks swap to max-content — the
    matrix renders at natural size and the studio's camera owns all
    view scaling; standalone pages keep the responsive regime.
  - CONTEXT: `prototype ?? inherited ?? derived-from-location` — an
    explicit prop wins, a nested canvas inherits the nearest outer
    canvas unless it provides its own, and the top-level canvas falls
    back to the design server's canvas-page URL
    (/prototypes/<name>/…). The payload is ONE getter (re-derived
    live; never a mount-time snapshot).
  - LABEL: a full-row caption (grid-column: 1 / -1), aria-label on
    the section; the label is chrome, never a heading (the page
    outline stays page-owned — the component-canvas floor law).
  - OVERLAY SCROLLBAR (#22): on a design server's canvas PAGE the
    document's viewport scrollbar becomes the overlay law (native bar
    hidden + floating thumb) — the grid's 1fr cells never lose width
    to a scrollbar. See overlay-scrollbar.ts.

  Original requirement input: Owner 2026-09-11 — the prototype
  standard (canvas/page/component) for `jixoai-ui design`;
  2026-09-12 issue #22 (the canvas-page scrollbar law).
-->
<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import {
    PROTOTYPE_KIT_KEY,
    derivePrototypeFromLocation,
    getPrototypeContext,
    hasDesignHost,
    isStudioHost,
    type PrototypeKitContext,
  } from './context';
  import { installOverlayScrollbar } from './overlay-scrollbar';

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

  // the #22 law on the canvas page itself: the /prototypes/ document
  // the design server serves hosts this grid, and its viewport
  // scrollbar would steal layout width from every 1fr frame cell the
  // moment the grid overflows — the overlay law installs instead.
  // Scoped tight: design-host canvas PAGES only (nested canvases hit
  // the re-entrancy guard in overlay-scrollbar.ts; tests, embedded
  // mounts and every other host document stay untouched).
  onMount(() => {
    if (!hasDesignHost()) return;
    if (typeof location === 'undefined' || !location.pathname.startsWith('/prototypes/')) {
      return;
    }
    return installOverlayScrollbar(window, document);
  });

  function trackStyle(
    value: number | string | undefined,
    fallback: string | undefined
  ): string | undefined {
    if (value === undefined) return fallback;
    if (typeof value === 'number') {
      // studio mode (#24): natural-size tracks — the authored COUNT
      // stands, the sizing regime swaps (the stage's camera is the one
      // view-scaling authority; max-content keeps the matrix
      // container-independent, so the metrics report is stable)
      return isStudioHost() ? `repeat(${value}, max-content)` : `repeat(${value}, minmax(0, 1fr))`;
    }
    return value;
  }

  const columnsStyle = $derived(
    trackStyle(
      gridCols,
      isStudioHost() ? 'repeat(auto-fill, max-content)' : 'repeat(auto-fill, minmax(min(100%, 30rem), 1fr))'
    )
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
