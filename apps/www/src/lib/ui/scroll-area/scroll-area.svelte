<!--
  jixoai scroll-area (registry/files/ui/scroll-area/scroll-area.svelte),
  REWORKED 2026-09-15 (Owner ruling, visual-quality-iteration W4): the
  component IS a native scroll container (div + overflow) — wheel,
  touch momentum, keyboard, PageUp/Home, scroll-snap, overscroll
  chaining stay platform behavior — and the scrollbar is ALWAYS
  HAND-DRAWN. The standing dual-mode API (`scrollbar?: ScrollbarVariant`
  with 'native' | 'overlay') RETIRED: no mode branch exists at all
  (breaking, no compat). The platform path is now its own sibling item,
  native-scroll-area; both share the scroll-area-kit lib kernel — this
  component consumes the kit's hand-drawn interaction adapter (idle
  fade, hover growth, drag pin, keyboard, the thumb's a11y contract)
  over the shared core (verdict, geometry, scope math). Behavior lives
  in the kit; paint lives here (scroll-area.css — the chrome on the
  scrollbar-token law, currentColor family, themes/dark stages
  restyle without JS). Chrome PARAMS (Owner r2, same day): the thumb
  is SQUARE-CUT by default (radius 0 — the hard capsule retired; the
  `radius` prop paints any px or the 'full' capsule via the region's
  --jx-scroll-thumb-radius) and the chrome WIDTH rides tiers (`width`
  prop: thin 8px / auto 12px / wide 16px lanes, stamped data-width;
  `none` is native-only vocabulary — a hand-drawn scrollbar that
  draws nothing is the platform tier). The track runs FLUSH to the
  region edge and the hover/drag growth is EDGE-ANCHORED: the thumb's
  edge-side flank pins while the cross size grows INTO the content.

  The thumb contract (the kit's adapter mounts it): role="scrollbar",
  aria-controls → the named viewport, aria-valuenow tracking position
  (0..100), aria-orientation, focusable + keyboard-draggable (arrows
  step, PageUp/PageDown page, Home/End jump). Track-click pages.

  The four auto-hide pins — region focus-within, thumb focus, active
  drag, hover — each suspend the ~700ms idle fade; while any pin
  holds, the thumb stays in the accessibility tree with its role
  intact ("AT-engaged" is not a detectable platform state and is
  deliberately not a pin).

  Floors: content that fits draws NOTHING (the none verdict gates the
  chrome); coarse pointers keep the platform's own momentum bars (the
  drawn chrome is a fine-pointer surface — an environmental floor,
  never an API mode); no-JS/prerendered output shows the platform bar
  (hydration upgrades to the drawn chrome, the code-card posture);
  prefers-reduced-motion keeps the chrome statically visible.

  ToC 联动 unchanged: getViewport() feeds Toc's scrollRoot,
  toc-outline's root, toc-engine's extents — the zero-boilerplate pair.

  API contract（克制原则）: orientation / label / pad / radius /
  width / class / style / onscroll + restProps 透传到滚动口 +
  children. Instance exports (bind:this): getViewport() / scrollTo().
  仅此而已。
-->
<script lang="ts" module>
  /** per-instance viewport ids — aria-controls targets (the thumb's
   * contract points here; module counter keeps SSR unique + stable) */
  let nextViewportId = 0;
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { createHandDrawnScrollbar, type HandDrawnHandle } from '$lib/scroll-area-kit/hand-drawn.svelte';
  import type { OverflowVerdict } from '$lib/scroll-area-kit/core';
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
    type ShapeLane,
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import { scrollAreaStyles } from './scroll-area.stylex';
  import { ScrollAreaDefaults } from './scroll-area-defaults.svelte';
  import './scroll-area.css';

  export type ScrollOrientation = 'vertical' | 'horizontal' | 'both';
  /** the chrome width tiers (Owner r2): the drawn lane's size —
   *  thin 8px / auto 12px / wide 16px. `none` is native-only
   *  vocabulary (a hand-drawn scrollbar that draws nothing is the
   *  platform tier, not this component's). */
  export type ScrollWidthTier = 'auto' | 'thin' | 'wide';
  export type ViewportScrollEvent = HTMLElementEventMap['scroll'] & {
    currentTarget: EventTarget & HTMLDivElement;
  };

  interface Props {
    /** which axes scroll: overflow-y/x mapping (default vertical) */
    orientation?: ScrollOrientation;
    /** a11y name for the scrollable region */
    label?: string;
    /** ring padding (CSS length) around the content, inline-axis —
     *  keeps content clear of the thumb lane. Default 0. */
    pad?: string;
    /** thumb corner radius: a px number, or 'full' for the capsule.
     *  Default undefined → 0 (square-cut) — the hard capsule retired
     *  (Owner r2); stamped as --jx-scroll-thumb-radius on the region.
     *  NOT the radius axis (W3-D2): this chrome param owns the name
     *  ('full' is outside RadiusLane and the target is the THUMB,
     *  never the region's concentric corner; §13 rules no rename —
     *  the chip/badge shape precedent). */
    radius?: number | 'full';
    /** the chrome width tier sizing the drawn lane (thin 8 / auto 12
     *  / wide 16); stamped data-width on the region. Default 'auto'. */
    width?: ScrollWidthTier;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    class?: string;
    style?: string;
    onscroll?: (event: ViewportScrollEvent) => void;
    children: Snippet;
  }

  let {
    orientation = 'vertical',
    label = 'scrollable content',
    pad,
    radius,
    width = 'auto',
    density,
    size,
    shape,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style,
    onscroll,
    children,
    ...restProps
  }: Props = $props();

  // the family Defaults is the single read point (the A1 contract +
  // W3-D2): the thumb-corner literal keeps its absentSlot semantics —
  // absence IS the state, resolved undefined paints nothing and the
  // sheet's 0px default applies (square-cut, the r2 default look).
  // SEVEN universal lanes join (density · size · shape · color ·
  // theme · elevation · motion); the radius AXIS is left out — the
  // chrome param owns the name (see the defaults file's collision
  // note); the axis surface rides the family's OWN region root, the
  // engine (the kit's hand-drawn chrome) stays outside the supply set
  const d = $derived(
    ScrollAreaDefaults.resolve({ radius, density, size, shape, color, theme, elevation, motion }),
  );
  // SEVEN lanes stamp — plus the radius NUMBER lane by the chart §13
  // analogy (the D1 precedent, census-recorded there): a px number is
  // load-bearing thumb chrome AND the universal radius axis' number
  // lane verbatim, so the region becomes the concentric ANCHOR for
  // descendants; 'full' (outside RadiusLane) and the ambient stay out
  const carriers = $derived(
    stampCarriersForLanes({ ...d, radius: typeof radius === 'number' ? radius : undefined }),
  );
  provideUniversalLanes({ density, size, shape, color, theme, elevation, motion });

  // the thumb radius as a CSS value — stamped on the REGION (the
  // sheet's var consumer)
  const thumbRadius = $derived(
    d.radius === undefined ? undefined : d.radius === 'full' ? 'calc(infinity * 1px)' : `${d.radius}px`,
  );

  // the region-root style: the axis carriers + the thumb-corner
  // literal, ONE joined stamp (consumer `style` rides the VIEWPORT
  // below, its historical lane — untouched)
  const rootStyle = $derived(
    [
      carriers,
      thumbRadius === undefined ? undefined : `--jx-scroll-thumb-radius: ${thumbRadius}`,
    ]
      .filter(Boolean)
      .join('; ') || undefined,
  );

  const viewportId = `jx-scroll-viewport-${++nextViewportId}`;

  // the query() anchor rides the region root — declared AFTER the
  // anchor state (the W3-C TDZ kernel note)
  let regionEl = $state<HTMLDivElement | null>(null);
  provideQueryAnchor(() => regionEl ?? null);
  let viewportEl = $state<HTMLDivElement | null>(null);
  let contentEl = $state<HTMLDivElement | null>(null);
  let trackYEl = $state<HTMLDivElement | null>(null);
  let trackXEl = $state<HTMLDivElement | null>(null);
  let thumbYEl = $state<HTMLDivElement | null>(null);
  let thumbXEl = $state<HTMLDivElement | null>(null);

  /** the drawn chrome mounts on fine pointers (hydration upgrade);
   * coarse pointers keep the platform bar — no API mode, an
   * environmental floor */
  let chromeOn = $state(false);
  let verdictY = $state<OverflowVerdict>('none');
  let verdictX = $state<OverflowVerdict>('none');

  export function getViewport(): HTMLDivElement | null {
    return viewportEl;
  }

  /** thin passthrough to the native scrollport */
  export function scrollTo(options?: ScrollToOptions): void {
    viewportEl?.scrollTo(options);
  }

  const handleScroll = (event: ViewportScrollEvent): void => {
    onscroll?.(event);
  };

  // the fine-pointer gate (the old overlay variant's environmental
  // law, now the component's only chrome condition): pointer class
  // changes remount the chrome (a laptop + touchscreen flips live)
  $effect(() => {
    if (typeof matchMedia !== 'function') return;
    const fine = matchMedia('(pointer: fine)');
    const apply = () => {
      chromeOn = fine.matches;
    };
    apply();
    fine.addEventListener('change', apply);
    return () => fine.removeEventListener('change', apply);
  });

  // the kit's hand-drawn adapter: geometry sync + idle fade + the four
  // pins + drag/keyboard/track paging + the thumb's a11y contract.
  // Runs only while the lanes are mounted (chromeOn) — the verdicts
  // stamp through the component's own data channels
  let handle: HandDrawnHandle | null = null;
  $effect(() => {
    if (!chromeOn || !regionEl || !viewportEl || !contentEl) return;
    handle = createHandDrawnScrollbar({
      region: regionEl,
      viewport: viewportEl,
      content: contentEl,
      viewportId,
      thumbs: { y: thumbYEl, x: thumbXEl },
      tracks: { y: trackYEl, x: trackXEl },
      onverdict: ({ y, x }) => {
        verdictY = y;
        verdictX = x;
      },
    });
    return () => {
      handle?.destroy();
      handle = null;
    };
  });

  // orientation → the scrollport's overflow law (deterministic branch;
  // atom members joined through cx — the W1b flip)
  const ORIENTATION_ATOM = {
    vertical: scrollAreaStyles.viewportVertical,
    horizontal: scrollAreaStyles.viewportHorizontal,
    both: scrollAreaStyles.viewportBoth,
  } as const;

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

<div
  class={cx('jx-scroll-area', scrollAreaStyles.region)}
  data-orientation={orientation}
  data-width={width}
  data-chrome={chromeOn ? 'on' : undefined}
  data-verdict-y={verdictY}
  data-verdict-x={verdictX}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  bind:this={regionEl}
>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (the WAI scrollable-
       region pattern: role=region + name + tabindex makes it a keyboard
       scroll surface — the platform's own arrows/PageUp/Home drive it) -->
  <div
    id={viewportId}
    class={cn(cx('jx-scroll-viewport', scrollAreaStyles.viewport, ORIENTATION_ATOM[orientation]), className)}
    role="region"
    aria-label={label}
    tabindex="0"
    bind:this={viewportEl}
    onscroll={handleScroll}
    style={[pad ? `--jx-scroll-pad: ${pad}` : null, style].filter(Boolean).join('; ') || undefined}
    {...restProps}
  >
    <div data-jx-scroll-content class={cx(scrollAreaStyles.content)} bind:this={contentEl}>
      {@render children()}
    </div>
  </div>

  {#if chromeOn}
    {#if orientation !== 'horizontal'}
      <!-- the drawn lanes: bare nodes — the kit's adapter stamps the
           thumb's a11y contract (role/aria/tabindex) and geometry -->
      <div class="jx-scroll-track y" bind:this={trackYEl}>
        <div class="jx-scroll-thumb y" bind:this={thumbYEl} hidden></div>
      </div>
    {/if}
    {#if orientation !== 'vertical'}
      <div class="jx-scroll-track x" bind:this={trackXEl}>
        <div class="jx-scroll-thumb x" bind:this={thumbXEl} hidden></div>
      </div>
    {/if}
  {/if}
</div>
