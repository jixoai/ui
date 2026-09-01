<!--
  jixoai timeline — the ROOT half (registry/files/ui/timeline/timeline.svelte;
  grid-engine rebuild, 2026-09-01).
  The chronology ol as a 5-lane grid (content zone · slot · spine ·
  slot · content zone); items SUBGRID into it. The root owns three
  HOW-props and one seam, all SSR-honest (context + plain reads — no
  lifecycle anywhere in the family):

    axis?:       'vertical' (default) | 'horizontal' — the flow axis;
                 the engine transposes, the logical slot names never
                 change meaning
    direction?:  'ltr' (default) | 'revert' | 'interlaced' — which
                 zone(s) content takes; ltr collapses the start zone,
                 revert mirrors, interlaced alternates item by item
    animation?:  'none' (default) | 'view' | 'scroll' — view = each
                 item rises as it enters the scrollport; scroll = the
                 spine's progress overlay grows with the nearest
                 scroller (both @supports-gated; engines without
                 scroll-driven animations render the final state)
    line?:       Snippet<[number]> — replaces the DEFAULT line at every
                 node with the consumer's own ({#snippet line(1)} picks
                 its paint by index); presets: TimelineLineDashed,
                 TimelineLineBeam. Absent → the default 1px line is
                 auto-rendered by every item (the line is authored-free).

  A timeline is a chronology display, not a stepper; the in-flight
  semantic stays the per-item `pending` flag. role=list survives
  list-none (Safari strips list semantics from marker-less lists).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import './timeline.css';

  /** the context surface: the line seam + the SSR-honest index counter
   *  (instantiation order IS document order, server and client alike) */
  export interface TimelineApi {
    readonly line: Snippet<[number]> | undefined;
    nextIndex(): number;
  }

  interface Props extends HTMLAttributes<HTMLOListElement> {
    /** the flow axis; the engine transposes, slot names stay logical */
    axis?: 'vertical' | 'horizontal';
    /** ltr (default) · revert (mirrored) · interlaced (alternating) */
    direction?: 'ltr' | 'revert' | 'interlaced';
    /** none (default) · view (per-item entrance) · scroll (spine progress) */
    animation?: 'none' | 'view' | 'scroll';
    /** per-node line replacement, keyed by the item's index */
    line?: Snippet<[number]>;
    density?: Density;
    class?: string;
    children: Snippet;
  }

  let {
    axis = 'vertical',
    direction = 'ltr',
    animation = 'none',
    line,
    density,
    class: className = '',
    children,
    ...rest
  }: Props = $props();
  const resolvedDensity = $derived(resolveDensity(density, getDensityContext()));

  let counter = 0;
  setContext<TimelineApi>('jx-timeline', {
    line,
    nextIndex: () => counter++,
  });
</script>

<ol
  data-jx-timeline=""
  data-axis={axis}
  data-direction={direction}
  data-anim={animation}
  data-density={resolvedDensity}
  class={cn('m-0 p-0 list-none', className)}
  {...rest}
  role="list"
>
  {#if animation === 'scroll'}
    <!-- the progress spine: a grid child riding the whole spine channel
         (paint is @supports-gated — engines without scroll() timelines
         never show it) -->
    <span data-jx-tl-progress aria-hidden="true"></span>
  {/if}
  {@render children()}
</ol>
