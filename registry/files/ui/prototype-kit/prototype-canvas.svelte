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
    densityRungOf,
    provideQueryAnchor,
    provideUniversalLanes,
    stampCarriersForLanes,
    type ColorLane,
    type DensityLane,
    type ElevationLane,
    type MotionLane,
    type QueryResult,
    type RadiusLane,
    type ShapeLane,
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import {
    PROTOTYPE_KIT_KEY,
    derivePrototypeFromLocation,
    getPrototypeContext,
    hasDesignHost,
    isStudioHost,
    type PrototypeKitContext,
  } from './context';
  import { PrototypeKitDefaults } from './prototype-kit-defaults.svelte';
  import { prototypeKitStyles } from './prototype-kit.stylex';
  import { installOverlayScrollbar } from './overlay-scrollbar';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
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
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (scales the caption chrome;
     *  the FRAMES are separate iframe documents — their content
     *  never sees the carriers) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) — NOT the framed
     *  documents' environment channel (that rides the frames' own
     *  `theme` prop, the context round-2 exemptions) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
  }

  let {
    gridCols = undefined,
    gridRows = undefined,
    gap = 16,
    prototype = undefined,
    label = undefined,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style: consumerStyle,
    children,
    ...rest
  }: Props = $props();

  // ── the eight-axis surface (W3-D2 — FIRST-TIME contract, all
  // no-own, carried by the CANVAS root — the family's one container
  // face; the ENGINE half — PrototypePage/PrototypeComponent frames,
  // frame-view, the URL contract — is outside the supply set: a
  // frame's content is a separate iframe document, and neither the
  // CSS carriers nor the context chain cross the frame boundary)
  const d = $derived(
    PrototypeKitDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(
    [carriers, consumerStyle ?? undefined].filter(Boolean).join('; ') || undefined,
  );

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

  // the payload's own join (separator's serialize law — the chip
  // precedent): objects in dev, joined strings in payloads, never a
  // raw class={styles.x} interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<section
  data-jx-prototype-canvas
  bind:this={uniRoot}
  aria-label={label}
  class={cn(cx(prototypeKitStyles.canvas), className)}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  style:display="grid"
  style:grid-template-columns={columnsStyle}
  style:grid-template-rows={rowsStyle}
  style:gap={gapStyle}
  {...rest}
>
  {#if label}
    <p
      data-jx-prototype-canvas-label
      class={cx(prototypeKitStyles.caption)}
      style:grid-column="1 / -1"
    >
      {label}
    </p>
  {/if}
  {@render children?.()}
</section>
