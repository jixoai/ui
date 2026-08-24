<!--
  jixoai website scaffold (registry/files/ui/website-scaffold.svelte).
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
    .jx-shell-body      column-subgrid ONLY (row-subgrid disproven by a
                        live Chromium test: tall main overflows the page
                        track and overlaps the footer); the scroll
                        container; reserves chrome via padding driven by
                        the single measured var --jx-header-h

  Forms (container queries on jx-shell; areas on the top layer):
    >=1200px  cols [rail 16rem][content 1fr][toc 15rem]   tree nav rail
    900–1199  cols [content 1fr][toc 15rem]                tree bottom bar
    <900      cols [content] + tocbar row under the header tree bottom bar

  Immersive law (per-zone, Owner rulings 2026-08-23/24): scroll DOWN
  hides the header and the tree bottom bar, scroll UP reveals them; the
  reading/navigation rails NEVER leave — they compact by the header
  height instead:
    header → translateY(-101%)          toc → translateY(-header-h)
    tree  → bar +100%; rail compacts    (css: website-scaffold.css)
                                          like the toc

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
  import type { Snippet } from 'svelte';

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
    /** Static chrome, SSR-stable (Owner + Codex ruling, 2026-08-24): the
     *  toc rail and the catalog tree render HERE — authored in their final
     *  position from the first paint, never moved by hydration. Dynamic
     *  float adoption (scaffold-float) stays on .jx-float-slot; the two
     *  never mix, so the ordered-adoption logic cannot touch static nodes. */
    chrome?: Snippet;
    children: Snippet;
    footer?: Snippet;
  }

  let { header, chrome, children, footer }: Props = $props();

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
    if (!hostEl || !headerEl || !bodyEl) return;
    const host = hostEl;
    const body = bodyEl;
    const band = headerEl;

    // Header height: the CSS tokens per container form are the PRIMARY
    // source (SSR-correct first paint — no 64→74 jump, Codex firstpaint
    // ruling); this RO only corrects deviations (the mobile disclosure
    // row growing the band). Everything derives from --jx-header-h in
    // CSS — body reservation, the toc compaction offset and the shared
    // --jx-toc-line.
    let reserved = -1;
    const reserve = () => {
      const h = band.offsetHeight;
      if (h !== reserved) {
        reserved = h;
        host.style.setProperty('--jx-header-h', `${h}px`);
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

<div class="jx-shell-host" bind:this={hostEl} data-hidden={hidden || undefined}>
  <a href="#main" class="jx-skip-link">Skip to content</a>

  <div class="jx-shell">
    <div class="jx-shell-body" bind:this={bodyEl}>
      <main id="main" class="jx-page-main flex-1">
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
