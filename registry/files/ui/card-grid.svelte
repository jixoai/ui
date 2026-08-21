<!--
  jixoai card grid (registry/files/ui/card-grid.svelte).
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
  interface Props {
    /** Minimum column width before the grid collapses a column. */
    min?: string;
    class?: string;
    children: import('svelte').Snippet;
  }

  let { min = '320px', class: className = '', children }: Props = $props();
</script>

<div class="jx-card-grid {className}" style="--jx-grid-min: {min}">
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
</style>
