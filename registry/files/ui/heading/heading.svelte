<!--
  jixoai heading (registry/files/ui/heading/heading.svelte,
  markdown-coverage-components §1.2). The level IS the structural
  axis: renders native h1–h6 by `level` (1–6, clamped) through
  svelte:element — the heading is its level, nothing else. NO paint
  ladder (the separator literal-axis precedent: a component whose only
  axis is structural carries no variant grammar, so no defaults file
  exists — the Defaults law covers families with public style props,
  and `level` is not one).

  The em ladder is MIGRATED from the markdown sheet (§3 of the
  2026-09-06 face) into the component: the old rules were
  `:not(.no-jx-pure)`-guarded, so they stopped matching the moment
  the component escaped — dead law where they stood. As component
  utilities the sizes ride EM, scaling with the ambient font-size
  (the typography trio presets) AND standing alone outside any
  jx-pure scope. What the component OWNS is exactly the face's B1
  heading channels: font-bold, leading-[1.25] (heading-appropriate at
  every preset), text-foreground, and the per-level em sizes
  (h1 1.875em / h2 1.5em / h3 1.25em / h4 1.125em / h5+6 1em).

  NO block margins: preflight zeroes heading margins, the component
  stamps none of them back — the container rhythm law owns root
  spacing (GitHub's container-tight posture owns nested). Do not add
  my-* here; the markdown map's element-based rhythm selectors match
  the native h* roots with zero retargeting (§2.1 — the map mounts
  this root with no-jx-pure, the box-owning block surface escape).

  level defaults to 2 — the SECTION heading is the family's own: h1
  is the page's one-per-page title (a component defaulting to it
  would mint competing page titles), and 2 is the first level body
  documents actually reach for. The markdown map always passes
  `level` explicitly; the default serves standalone composition.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLHeadingElement> {
    /** the heading level 1–6; out-of-range values clamp (rounded to
     *  the nearest integer, then bounded) — the rendered truth is
     *  what the hook stamps */
    level?: number;
    /** optional explicit address (the document addressing surface) */
    id?: string;
    /** the heading text */
    children?: Snippet;
    class?: string;
  }

  let { level = 2, id, children, class: className = '', ...rest }: Props = $props();

  // clamp once, derive both consumers from it: the tag and the
  // valued hook never disagree
  const clamped = $derived(Math.min(6, Math.max(1, Math.round(level))));
  const tag = $derived(`h${clamped}`);

  // the em ladder (deterministic map, index = level; slot 0 unused)
  // — em, never rem: the ladder scales with the ambient preset
  const size = [
    null,
    '[font-size:1.875em]',
    '[font-size:1.5em]',
    '[font-size:1.25em]',
    '[font-size:1.125em]',
    '[font-size:1em]',
    '[font-size:1em]',
  ] as const;
</script>

<svelte:element
  this={tag}
  data-jx-heading={clamped}
  {id}
  class={cn('font-bold leading-[1.25] text-foreground', size[clamped], className)}
  {...rest}
>
  {@render children?.()}
</svelte:element>
