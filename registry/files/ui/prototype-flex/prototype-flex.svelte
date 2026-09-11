<!--
  jixoai prototype flex (registry/files/ui/prototype-flex/prototype-flex.svelte).

  The layout family, alpha track (layout-family-alpha change,
  2026-09-11): the standardized flex primitive the design studio's
  property panel edits live (design-studio-r2 §6). Three laws:

  - SINGLE ROOT + REST SPREAD: the stamp mechanism's family
    precondition (r2 §3) — the consumer's ...rest spreads FIRST,
    the component's data-jx-* stamp AFTER (replace, never merge).
    An omitted prop injects NO style declaration; the CSS initial
    value serves (omission transparency).
  - ZERO TRANSLATION: direction/wrap/align/justify are native CSS
    Box Alignment tokens passed through 1:1 (no 'between' →
    'space-between' mapping layer — the panel edits CSS truth).
    The one type coercion: gap number → px (a bare number is not a
    CSS length).
  - INLINE STYLE ONLY: no Tailwind, no token, no css file, no
    imports — installs and renders in any host (the alpha lane's
    reason to exist apart from utility-first Tier-1).

  Original requirement input: Owner 2026-09-11 — the layout family
  alpha track (Flex/Grid/Waterfall) for the design studio, meta
  stamped alpha, single-root + rest spread as the stamp
  precondition.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** main-axis flow — maps to flex-direction (verbatim) */
    direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
    /** cross-axis wrapping — maps to flex-wrap (verbatim) */
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    /** cross-axis alignment — maps to align-items (verbatim) */
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    /** main-axis distribution — maps to justify-content (verbatim) */
    justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
    /** gap: number → px, string → verbatim */
    gap?: number | string;
  }

  let {
    direction = undefined,
    wrap = undefined,
    align = undefined,
    justify = undefined,
    gap = undefined,
    class: className = undefined,
    children,
    ...rest
  }: Props = $props();

  // undefined stays undefined: Svelte drops the style declaration,
  // so an omitted prop never serializes (omission transparency).
  const gapStyle = $derived(typeof gap === 'number' ? `${gap}px` : gap);
</script>

<div
  {...rest}
  class={className}
  data-jx-prototype-flex
  style:display="flex"
  style:flex-direction={direction}
  style:flex-wrap={wrap}
  style:align-items={align}
  style:justify-content={justify}
  style:gap={gapStyle}
>
  {@render children?.()}
</div>
