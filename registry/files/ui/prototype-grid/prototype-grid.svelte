<!--
  jixoai prototype grid (registry/files/ui/prototype-grid/prototype-grid.svelte).

  The layout family, alpha track (layout-family-alpha change,
  2026-09-11): the standardized grid primitive the design studio's
  property panel edits live (design-studio-r2 §6). Same three laws
  as prototype-flex (single root + rest spread with omission
  transparency; zero vocabulary translation; inline style only —
  any host), plus the track coercion per the design-studio-r2
  ruling (2026-09-11, cross-branch precedent — the studio's
  prototype-canvas, not an in-repo item):

  - cols/rows: number → repeat(N, minmax(0, 1fr)) — the
    no-max-content-blowout track form (css-architecture grid law
    vocabulary); string → verbatim (named/hybrid tracks).
  - gap: number → px, string → verbatim.
  - areas: a single verbatim grid-template-areas string
    ('"head head" "side main"'); an array-join form is a recorded
    future enhancement, deliberately not guessed in v0.

  Original requirement input: Owner 2026-09-11 — the layout family
  alpha track (Flex/Grid/Waterfall) for the design studio, meta
  stamped alpha, single-root + rest spread as the stamp
  precondition.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** column tracks: number → repeat(N, minmax(0, 1fr)), string → verbatim */
    cols?: number | string;
    /** row tracks, same two forms as cols */
    rows?: number | string;
    /** grid gap: number → px, string → verbatim */
    gap?: number | string;
    /** grid-template-areas string, verbatim */
    areas?: string;
  }

  let {
    cols = undefined,
    rows = undefined,
    gap = undefined,
    areas = undefined,
    class: className = undefined,
    children,
    ...rest
  }: Props = $props();

  // undefined stays undefined: Svelte drops the style declaration
  // (omission transparency — omitted props never serialize).
  const trackStyle = (value: number | string | undefined): string | undefined =>
    typeof value === 'number' ? `repeat(${value}, minmax(0, 1fr))` : value;
  const columnsStyle = $derived(trackStyle(cols));
  const rowsStyle = $derived(trackStyle(rows));
  const gapStyle = $derived(typeof gap === 'number' ? `${gap}px` : gap);
</script>

<div
  {...rest}
  class={className}
  data-jx-prototype-grid
  style:display="grid"
  style:grid-template-columns={columnsStyle}
  style:grid-template-rows={rowsStyle}
  style:grid-template-areas={areas}
  style:gap={gapStyle}
>
  {@render children?.()}
</div>
