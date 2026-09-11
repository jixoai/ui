<!--
  jixoai prototype waterfall (registry/files/ui/prototype-waterfall/
  prototype-waterfall.svelte).

  The layout family, alpha track (layout-family-alpha change,
  2026-09-11): the standardized waterfall primitive the design
  studio's property panel edits live (design-studio-r2 §6). Same
  three laws as prototype-flex (single root + rest spread with
  omission transparency; zero vocabulary translation; inline style
  only — any host). The engine is CSS multi-column:

  - columns: the CSS `columns` shorthand, verbatim — number is the
    count form, a length string ('14rem') the auto-width form; one
    property, both shapes, no branching.
  - strategy 'balanced' (v0's only member, per the r2 ruling):
    column-fill: balance — the browser equalizes column heights.
    A future 'ordered' (JS-measured shortest-column placement)
    extends the union non-breakingly; the prop ships now for that
    seam.
  - THE DECLARED TRADEOFFS (honest, not hidden): children flow in
    column order (newspaper order, not shortest-column-first), and
    break-inside stays the CONSUMER's call — the component never
    overrides it.

  Original requirement input: Owner 2026-09-11 — the layout family
  alpha track (Flex/Grid/Waterfall) for the design studio, meta
  stamped alpha, single-root + rest spread as the stamp
  precondition.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** the CSS columns shorthand, verbatim: number = the count
     *  form, a length string ('14rem') = the auto-width form */
    columns?: number | string;
    /** column gap: number → px, string → verbatim */
    gap?: number | string;
    /** v0: 'balanced' only — column-fill: balance (browser-equalized
     *  column heights); 'ordered' (JS placement) is the future seam */
    strategy?: 'balanced';
  }

  let {
    columns = undefined,
    gap = undefined,
    strategy = undefined,
    class: className = undefined,
    children,
    ...rest
  }: Props = $props();

  // undefined stays undefined: Svelte drops the style declaration
  // (omission transparency — omitted props never serialize). A bare
  // number is the legal unit-less `columns` count form — no px
  // coercion here (unlike gap, which needs a unit).
  const gapStyle = $derived(typeof gap === 'number' ? `${gap}px` : gap);
  const fillStyle = $derived(strategy === 'balanced' ? 'balance' : undefined);
</script>

<div
  {...rest}
  class={className}
  data-jx-prototype-waterfall
  style:columns={columns}
  style:column-gap={gapStyle}
  style:column-fill={fillStyle}
>
  {@render children?.()}
</div>
