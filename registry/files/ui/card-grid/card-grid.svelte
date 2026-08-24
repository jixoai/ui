<!--
  jixoai card grid (registry/files/ui/card-grid.svelte).
  Ships its OWN IO-driven stagger (Owner ruling, 2026-08-24, rev.2):
  an internal IntersectionObserver arms the entrance when the grid
  enters the viewport; cards then animate on the TIME axis with
  per-index delays — the cascade completes regardless of scroll
  behavior (a scroll-progress-driven range would freeze mid-opacity
  whenever scrolling stops). Independent of — and coexisting with —
  the site's scroll-driven reveal: consumers must NOT wrap cards in
  data-reveal; the grid owns its children's entrance. The hidden state
  keys on html.js (the theme's liveness flag): no-JS and pre-hydration
  stay fully visible.

  A grid + subgrid layout that equalizes cards visually: the grid defines
  two rows (header / body); every direct child spans both and opts into
  `grid-template-rows: subgrid`, so card HEADERS align to one shared
  height and card BODIES share the tallest body — no more ragged card
  tops or unequal card bottoms. Works with any card whose first child is
  the header block and second child the body (section-card qualifies
  unchanged).

  The layout rules are :global on purpose: the cards come from the
  consumer's children snippet, so scoped selectors can never reach them
  (a scoped `> *` matches nothing) — subgrid silently never applied until
  this was global. The jx- prefix keeps the global surface safe.

  Responsive: columns are `auto-fit, minmax(min(100%, --jx-grid-min), 1fr)`
  — pass `min` to control the collapse width. The default 320px is tuned
  for the 90rem page column: two equal columns through the laptop band
  (~60–64rem containers, so 4-card groups land 2×2 instead of a ragged
  3+1) while desktop (~86rem+) keeps four columns. A lone child would
  stretch into a full-width banner (auto-fit collapses every empty
  track), so it is capped at an editorial measure. Cards without subgrid
  support fall back to ordinary stacked rows (no worse than before).
-->
<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    /** Minimum column width before the grid collapses a column. */
    min?: string;
    class?: string;
    children: import('svelte').Snippet;
  }

  let { min = '320px', class: className = '', children }: Props = $props();

  let gridEl = $state<HTMLElement | null>(null);

  // the internal entrance: ONE observer on the grid; the first
  // intersection arms .is-entered and the CSS time-cascade takes over
  onMount(() => {
    const grid = gridEl;
    if (!grid) return;
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      grid.classList.add('is-entered');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            grid.classList.add('is-entered');
            io.disconnect();
          }
        }
      },
      { threshold: 0 },
    );
    io.observe(grid);
    return () => io.disconnect();
  });
</script>

<div class="jx-card-grid {className}" style="--jx-grid-min: {min}" bind:this={gridEl}>
  {@render children()}
</div>

<style>
  :global(.jx-card-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--jx-grid-min)), 1fr));
    gap: 1.25rem;
    align-items: stretch;
  }
  /* auto-fit collapses every empty track, so a single-card group would
     stretch to the full container width — one short card as a page-wide
     banner. Cap the lone card at an editorial measure instead. */
  :global(.jx-card-grid > *:only-child) {
    max-width: 46rem;
  }
  @supports (grid-template-rows: subgrid) {
    :global(.jx-card-grid) {
      grid-template-rows: auto 1fr;
    }
    /* every card spans the shared rows and subgrids them: row 1 = header
       (all headers stretch to the tallest, e.g. a two-line eyebrow), row 2
       = body (fills to the tallest). row-gap 0: the card's own chrome
       (borders/padding) provides the internal rhythm. */
    :global(.jx-card-grid > *) {
      display: grid;
      grid-row: span 2;
      grid-template-rows: subgrid;
      row-gap: 0;
    }
    /* opt a child out when it is not a two-block card */
    :global(.jx-card-grid > *[data-no-subgrid]) {
      grid-row: auto;
      grid-template-rows: none;
    }
  }

  /* ── the internal stagger (time axis) ──
     Hidden only while JS is live (html.js) and not yet entered; the
     is-entered class flips the cascade: each card transitions with a
     per-index delay (70ms steps, capped at the 8th child). */
  :global(html.js .jx-card-grid:not(.is-entered) > *) {
    opacity: 0;
    transform: translateY(26px);
  }
  :global(.jx-card-grid.is-entered > *) {
    opacity: 1;
    transform: none;
    transition:
      opacity 320ms ease-out calc(var(--jx-card-i, 0) * 70ms),
      transform 420ms cubic-bezier(0.22, 1, 0.36, 1) calc(var(--jx-card-i, 0) * 70ms);
  }
  :global(.jx-card-grid > *:nth-child(2)) { --jx-card-i: 1; }
  :global(.jx-card-grid > *:nth-child(3)) { --jx-card-i: 2; }
  :global(.jx-card-grid > *:nth-child(4)) { --jx-card-i: 3; }
  :global(.jx-card-grid > *:nth-child(5)) { --jx-card-i: 4; }
  :global(.jx-card-grid > *:nth-child(6)) { --jx-card-i: 5; }
  :global(.jx-card-grid > *:nth-child(7)) { --jx-card-i: 6; }
  :global(.jx-card-grid > *:nth-child(8)) { --jx-card-i: 7; }
  @media (prefers-reduced-motion: reduce) {
    :global(html.js .jx-card-grid:not(.is-entered) > *),
    :global(.jx-card-grid.is-entered > *) {
      transition: none;
    }
  }
</style>
