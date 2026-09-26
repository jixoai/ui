<!--
  jixoai website scaffold (registry/files/ui/website-scaffold/website-scaffold.svelte).
  Grid architecture (Owner + Codex review, 2026-08-23 — supersedes the
  2026-08-21 overlay plane):

    .jx-shell-host      the named container (container-type: inline-size,
                        container-name: jx-shell) — the ONE responsive
                        truth source; forms switch on ITS width, so the
                        scaffold is embeddable (a narrow host shows the
                        narrow form inside a wide window)
    .jx-shell           one grid; both layers overlap by spanning all
                        columns of row 1 (line placement — NEVER
                        grid-template-areas on the shell: an areas string
                        pins its named area to the first column only)
    .jx-top-layer       column-subgrid + own rows/areas per form; the
                        click-through chrome plane (pointer-events none,
                        children opt back in); per-zone immersive
                        transforms — the plane itself never moves
    .jx-shell-body      spans the whole shell (grid-column 1 / -1 — no
                        subgrid since the 2026-09-01 full-width+padding
                        form; row-subgrid was disproven by a live
                        Chromium test: tall main overflows the page
                        track and overlaps the footer); the scroll
                        container; reserves chrome via padding driven by
                        the single measured var --jx-header-h

  THE OVERLAY POINTER LAW (adjudicated D-1 fix, 2026-09-02): overlay
  containers are pointer-TRANSPARENT; real content opts back in.
  Chrome surfaces (header/toc/tree) opt in as whole nodes, but an
  adopted FLOAT wrapper never does — float content re-enables pointers
  only on its own interactive surface, so a float plane covering the
  stage can never shield the page beneath it (see the float-slot rules
  in website-scaffold.css).

  Forms (container queries on jx-shell; areas on the top layer):
    >=1200px  cols [rail 16rem][content 1fr][toc 15rem]   tree nav rail
    900–1199  cols [content 1fr][toc 15rem]                tree bottom bar
    <900      cols [content] + tocbar row under the header tree bottom bar

  Immersive law (per-zone, Owner rulings 2026-08-23/24): scroll DOWN
  hides the header and the tree bottom bar, scroll UP reveals them; the
  reading/navigation rails NEVER leave — they compact by the header
  height instead (the compaction is a GROWTH law, 2026-09-05: the
  rails' height caps grow by the same header-h the transform gives
  up, both riding one transition, so a cap-bound rail's bottom edge
  stays pinned — no header-height hole at its foot):
    header → translateY(-101%)          toc → translateY(-header-h)
                                          + max-height +header-h
    tree  → bar +100%; rail compacts    (css: website-scaffold.css)
    like the toc (the rail's cap grows in its own component css)

  The float slot spans the whole top layer as a subgrid; adopted nodes are
  placed by their [data-area] role ('toc' | 'tree' | 'float' default) into
  the form's named areas. Consumers keep node ownership; adopt(node,
  { area }) returns a release fn and teardown is the consumer's job
  (the portal component reclaims its nodes).

  View transitions (SPA page-carousel): the header band keeps
  view-transition-name "site-header" (persists across navigations);
  main#main keeps "page-main" (slide + blur + reveal mask per css below).
-->
<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import './website-scaffold.css';
  import type { Snippet } from 'svelte';
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
  import { WebsiteScaffoldDefaults } from './website-scaffold-defaults.svelte';
  import { scaffoldStyles } from './website-scaffold.stylex';

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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  /** Semantic placement roles for adopted float nodes. The physical grid
   *  cell is resolved per container form by website-scaffold.css — one
   *  role, many cells, no per-breakpoint JS. */
  export type TopLayerArea = 'toc' | 'tree' | 'float';

  /** Context contract: adopt live DOM nodes into the scaffold's top layer.
   *  Ordered and multi-node: adoption order is the slot's child order.
   *  Consumers keep node ownership — the returned release fn only
   *  unregisters; reclaiming the node itself (returning it to its
   *  authoring anchor) is the consumer's teardown job. */
  export interface TopLayerApi {
    adopt: (node: HTMLElement, opts?: { area?: TopLayerArea }) => () => void;
  }

  interface Props {
    header: Snippet;
    /** the BOOT SPLASH seat (the FOUC round, 2026-09-19 — Owner
     *  design): rendered at the HOST ROOT, above every layer, before
     *  the shell — the splash's own styles ride the HTML itself
     *  (inline attributes + a head-carried style block), so it paints
     *  before any async stylesheet and masks the unstyled window */
    splash?: Snippet;
    /** Static chrome, SSR-stable (Owner + Codex ruling, 2026-08-24): the
     *  toc rail and the catalog tree render HERE — authored in their final
     *  position from the first paint, never moved by hydration. Dynamic
     *  float adoption (scaffold-float) stays on .jx-float-slot; the two
     *  never mix, so the ordered-adoption logic cannot touch static nodes. */
    chrome?: Snippet;
    children: Snippet;
    footer?: Snippet;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the site-level type-scale
     *  seam: one number scales the whole scaffold) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
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
  }

  let {
    header,
    splash,
    chrome,
    children,
    footer,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
  }: Props = $props();

  // ── the eight-axis surface (W3-D3 — FIRST-TIME contract, all
  // no-own, a NO-OWN CONTAINER): the scaffold's zones/regions stay
  // structural; the size axis scales the HOST root and every axis
  // supplies downward (header, toc rail and page content are the
  // consumers — 吃也供)
  const d = $derived(
    WebsiteScaffoldDefaults.resolve({
      density,
      size,
      shape,
      radius,
      color,
      theme,
      elevation,
      motion,
    }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  const rootStyle = $derived(carriers || undefined);

  // dynamic float plane state — the ORDERED set of adopted nodes
  // (scaffold-float portals; static chrome never passes through here)
  let floatNodes = $state<{ node: HTMLElement; area: TopLayerArea }[]>([]);
  setContext<TopLayerApi>('jx-top-layer', {
    adopt: (node, opts) => {
      const area = opts?.area ?? 'float';
      floatNodes = [...floatNodes.filter((n) => n.node !== node), { node, area }];
      node.dataset.area = area;
      return () => {
        floatNodes = floatNodes.filter((n) => n.node !== node);
        delete node.dataset.area;
      };
    },
  });

  let hostEl = $state<HTMLElement | null>(null);
  // the query() anchor rides the HOST root (declared above — the
  // W3-C TDZ law)
  provideQueryAnchor(() => hostEl ?? null);
  let shellEl = $state<HTMLElement | null>(null);
  let headerEl = $state<HTMLElement | null>(null);
  let floatSlotEl = $state<HTMLElement | null>(null);
  let bodyEl = $state<HTMLElement | null>(null);
  let hidden = $state(false);

  // float adoption: move the adopted live nodes into the top-layer slot,
  // in adoption order (an insertBefore re-run is a no-op once every node
  // already sits at its index)
  $effect(() => {
    if (!floatSlotEl) return;
    // capture: the narrowed $state can't cross the forEach closure
    const slot = floatSlotEl;
    floatNodes.forEach(({ node }, i) => {
      const current = slot.children[i];
      if (current === node) return;
      slot.insertBefore(node, current ?? null);
    });
  });

  onMount(() => {
    if (!shellEl || !headerEl || !bodyEl) return;
    const shell = shellEl;
    const body = bodyEl;
    const band = headerEl;

    // Header height: the CSS tokens per container form are the PRIMARY
    // source (SSR-correct first paint — no 64→74 jump, Codex firstpaint
    // ruling); this RO only corrects deviations (the mobile disclosure
    // row growing the band). Everything derives from --jx-header-h in
    // CSS — body reservation, the toc compaction offset and the shared
    // --jx-toc-line. THE SEAM (2026-09-05, the toc-flush bug): the
    // correction MUST land on .jx-shell — the var's DECLARING scope.
    // .jx-shell re-declares --jx-header-h on itself (58px/74px per
    // form), so a host-level write is shadowed for every descendant
    // and the toc's compaction transform (calc(-1 * var(--jx-header-h)))
    // ran on the stale token while the real band measured differently —
    // the hidden toc parked a few px short of flush.
    let reserved = -1;
    const reserve = () => {
      const h = band.offsetHeight;
      if (h !== reserved) {
        reserved = h;
        shell.style.setProperty('--jx-header-h', `${h}px`);
      }
    };
    const ro = new ResizeObserver(reserve);
    ro.observe(band);
    reserve();

    // immersive hide/reveal driven by the BODY's own scroll; ONE state,
    // per-zone transforms (header/tree leave, toc compacts — see css)
    let lastY = body.scrollTop;
    let raf = 0;
    const THRESHOLD = 8;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = body.scrollTop;
        const delta = y - lastY;
        lastY = y;
        if (y <= THRESHOLD) {
          hidden = false;
          return;
        }
        if (delta > THRESHOLD) hidden = true;
        else if (delta < -THRESHOLD) hidden = false;
      });
    };
    body.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      ro.disconnect();
      body.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  });
</script>

<div
  class="jx-shell-host"
  bind:this={hostEl}
  data-hidden={hidden || undefined}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
>
  {#if splash}
    {@render splash()}
  {/if}
  <a href="#main" class="jx-skip-link">Skip to content</a>

  <div class="jx-shell" bind:this={shellEl}>
    <div class="jx-shell-body" bind:this={bodyEl}>
      <main id="main" class={cx('jx-page-main', scaffoldStyles.main)}>
        {@render children()}
      </main>
      {#if footer}
        {@render footer()}
      {/if}
    </div>

    <div class="jx-top-layer">
      <div class="jx-scaffold-header" bind:this={headerEl}>
        {@render header()}
      </div>
      <!-- static chrome plane (SSR-stable): consumers author toc/tree
           nodes here with permanent data-area roles -->
      {#if chrome}
        <div class="jx-chrome-slot">
          {@render chrome()}
        </div>
      {/if}
      <!-- dynamic float plane: adopted (moved) nodes land here through
           the jx-top-layer context — scaffold-float's territory -->
      <div class="jx-float-slot" bind:this={floatSlotEl}></div>
    </div>
  </div>
</div>
