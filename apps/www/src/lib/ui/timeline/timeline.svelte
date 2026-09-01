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

  THE line(index) SEAM CONTRACT (2026-09-02, the C-5 ruling): the index
  handed to the snippet is the item's INSTANTIATION ordinal — SSR-honest
  and lifecycle-free, but Svelte 5 MOVES keyed {#each} children without
  re-instantiating them, so a reorder keeps every item's first-mount
  index. The seam therefore contracts on AUTHORED/stable order: dynamic
  insert/remove/reorder of TimelineItems is out of contract while a
  `line` snippet is supplied (the default authored-free line ignores
  the index and is unaffected). Making the index reorder-correct needs
  mount-time registration — banned by the family's SSR-honest
  zero-lifecycle law; documented here instead.

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
   *  (instantiation order IS document order, server and client alike —
   *  the C-5 seam contract lives in the header comment above) */
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
    // GETTER (2026-09-02): a swapped `line` snippet reaches already-
    // mounted items — the api object is set once (SSR-honest, no
    // lifecycle), so the seam must read through it, not capture it
    get line() {
      return line;
    },
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
    <!-- the progress spine: the ol's FIRST child, out of flow (timeline.css
         parks it on the absolute-positioning channel so it covers every
         implicit item row; paint is @supports-gated — engines without
         scroll() timelines never show it. Being a span, it never counts
         in the li-scoped :first-of-type/:nth-of-type engine selectors) -->
    <span data-jx-tl-progress aria-hidden="true"></span>
  {/if}
  {@render children()}
</ol>
