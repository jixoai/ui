<!--
  jixoai website scaffold (registry/files/ui/website-scaffold.svelte).
  Layered overlay architecture (Owner, 2026-08-21):

    .jx-shell                 h-100dvh relative
    ├── .jx-top-layer         absolute overlay, z-40 — moves as ONE unit:
    │   ├── scaffold-header   the nav band
    │   └── scaffold-float    docked to the top layer's flow (ToC rail,
    │                          mobile glass bar, …) — sticks visually
    │                          because the top layer is the scroll-free
    │                          plane over the scrolling body
    └── .jx-shell-body        the scroll container (overflow-y auto):
        ├── main#main
        └── footer

  The body reserves a measured padding-top for the header band
  (ResizeObserver-tracked; the mobile disclosure row re-reserves on
  grow/shrink). Immersive behavior moves the WHOLE top layer: scrolling
  DOWN slides it out (translateY -101%) — header and float leave
  together; the slightest scroll UP slides it back; the body top always
  shows it. Reduced motion swaps to instant.

  The float slot is provider-style (like shadcn Dialog's portal): the
  scaffold owns the insertion point, consumers adopt their live nodes
  into it through the `jx-top-layer` context (Owner request, 2026-08-23:
  "if a topLayer exists, the ToC automatically uses it; a prop can
  disable this"). ONE adoption mechanism, many consumers — scaffold-float
  portals arbitrary children; the toc adopts itself automatically. Both
  ride the immersive slide by construction.

  View transitions (SPA page-carousel): the header band keeps
  view-transition-name "site-header" (persists across navigations);
  main#main keeps "page-main" (slide + blur + reveal mask per
  app-shell.css).
-->
<script lang="ts">
  import { getContext, onMount, setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  /** Context contract: adopt live DOM nodes into the scaffold's top layer
   *  (the float plane). Ordered and multi-node: adoption order is the
   *  slot's child order. Consumers keep node ownership — the returned
   *  release fn only unregisters; reclaiming the node itself (returning
   *  it to its authoring anchor) is the consumer's teardown job. */
  export interface TopLayerApi {
    /** Adopt a live DOM node into the top layer; the returned fn
     *  releases it (the portal component reclaims its nodes). */
    adopt: (node: HTMLElement) => () => void;
  }

  interface Props {
    header: Snippet;
    children: Snippet;
    footer?: Snippet;
  }

  let { header, children, footer }: Props = $props();

  // float plane state — the ORDERED set of adopted nodes (scaffold-float
  // portals, the toc self-adopts; the slot renders them in adoption order)
  let floatNodes = $state<HTMLElement[]>([]);
  setContext<TopLayerApi>('jx-top-layer', {
    adopt: (node) => {
      floatNodes = [...floatNodes.filter((n) => n !== node), node];
      return () => {
        floatNodes = floatNodes.filter((n) => n !== node);
      };
    },
  });

  let headerEl = $state<HTMLElement | null>(null);
  let floatSlotEl = $state<HTMLElement | null>(null);
  let bodyEl = $state<HTMLElement | null>(null);
  let hidden = $state(false);

  // float adoption: move the adopted live nodes into the top-layer slot,
  // in adoption order (an appendChild/insertBefore re-run is a no-op once
  // every node already sits at its index)
  $effect(() => {
    if (!floatSlotEl) return;
    // capture: the narrowed $state can't cross the forEach closure
    const slot = floatSlotEl;
    floatNodes.forEach((node, i) => {
      const current = slot.children[i];
      if (current === node) return;
      slot.insertBefore(node, current ?? null);
    });
  });

  onMount(() => {
    // reserve exactly the header's height (incl. the mobile disclosure
    // row) as the body's top padding — the overlay never covers content
    let reserved = -1;
    const reserve = () => {
      if (!headerEl || !bodyEl) return;
      const h = headerEl.offsetHeight;
      if (h !== reserved) {
        reserved = h;
        bodyEl.style.paddingTop = `${h}px`;
      }
    };
    const ro = new ResizeObserver(reserve);
    if (headerEl) ro.observe(headerEl);
    reserve();

    // immersive hide/reveal driven by the BODY's own scroll; the WHOLE
    // top layer (header + float) moves as one unit
    let lastY = bodyEl?.scrollTop ?? 0;
    let raf = 0;
    const THRESHOLD = 8;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = bodyEl?.scrollTop ?? 0;
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
    bodyEl?.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      ro.disconnect();
      bodyEl?.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  });
</script>

<div class="jx-shell flex min-h-svh flex-col bg-background text-foreground">
  <a href="#main" class="jx-skip-link">Skip to content</a>

  <div class="jx-top-layer" class:jx-top-layer-hidden={hidden}>
    <div class="jx-scaffold-header" bind:this={headerEl}>
      {@render header()}
    </div>
    <!-- float plane insertion point: portal nodes are adopted here -->
    <div class="jx-float-slot" bind:this={floatSlotEl}></div>
  </div>

  <div class="jx-shell-body" bind:this={bodyEl}>
    <main id="main" class="jx-page-main flex-1">
      {@render children()}
    </main>
    {#if footer}
      {@render footer()}
    {/if}
  </div>
</div>
