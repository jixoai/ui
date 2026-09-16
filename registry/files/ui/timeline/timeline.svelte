<!--
  jixoai timeline — the ROOT half (registry/files/ui/timeline/timeline.svelte;
  W3 drawn-spine rework, Owner 2026-09-15; grid-engine rebuild 2026-09-01).
  The chronology is a ONE-CELL GRID HOST stacking two grid-area:1/1
  siblings — the whole-list SVG SPINE LAYER (first child: source order
  paints it UNDER the items, the zero-z dialect; pointer-events:none;
  aria-hidden) and the semantic ol (the 5-lane grid engine whose items
  SUBGRID into content · slot · spine · slot · content lanes). The
  host owns three HOW-props and the spine seam:

    axis?:       'vertical' (default) | 'horizontal' — the flow axis;
                 the engine transposes, the logical slot names never
                 change meaning
    direction?:  'ltr' (default) | 'revert' | 'interlaced' — which
                 zone(s) content takes; ltr collapses the start zone,
                 revert mirrors, interlaced alternates item by item
    animation?:  'none' (default) | 'view' | 'scroll' — view = each
                 item rises as it enters the scrollport; scroll = the
                 spine's progress stroke draws on with the nearest
                 scroller (stroke-dashoffset; @supports-gated — engines
                 without scroll() timelines never show it)
    spine?:      'plain' (default) | 'dashed' | 'beam' — the drawn
                 presets (names preserved) — or a custom Snippet
                 receiving the measured TimelineSpineGeometry payload
                 (node centers in list-root coordinates, flow order;
                 axis/direction/interlaced/rtl metadata; per-segment
                 path data with the dot-edge phase anchor; the STOPS
                 milestone table + pathLength; the density scale).
                 The snippet renders INSIDE the spine svg — author
                 <path>/<circle>/… directly. BREAKING successor of the
                 retired line(i) per-item seam.

    THE VALUE CONTRACT (reui parity, W3 2026-09-15): defaultValue = 1
    seeds the uncontrolled current step; `value` overrides read-side
    (controlled); every setStep change fires onValueChange; decimals
    are first-class (never rounded). Items register their step through
    the context channel (step defaults to DOM order + 1; strictly
    ascending — duplicates normalize through the milestone table, the
    LATER node owning the milestone, dev-warned). The value maps onto
    the measured run through the STOPS protocol (timelineProgressLength)
    as the progress stroke — EXCEPT under animation='scroll', where the
    scroller owns the stroke channel and the value drives only the
    discrete data-completed paint.

  THE FLOOR (the code-card posture): SSR and pre-hydration paint the
  plain per-item CSS line (the authored-free [data-jx-tl-line] every
  item carries); hydration's measurement flips data-jx-spine to
  'drawn' — the floor lines retire, the measured SVG spine takes the
  channel. No JS (or a degenerate box) keeps the floor standing.

  THE LADDER roots at the host (isolation: isolate — the spine layer
  and the item list are its grid-area:1/1 siblings; the law's own
  timeline ruling: a multi-parent ladder isolates at its TRUE common
  parent, never per-item). The ol isolates its own intra-list ladder
  (dot z1 over floor-line z0 bridging across items).

  A timeline is a chronology display, not a stepper; the in-flight
  semantic stays the per-item `pending` flag. role=list survives
  list-none (Safari strips list semantics from marker-less lists).
-->
<script module lang="ts">
  /** the value-contract context channel (items read `current`, drive
   *  `setStep`, and register their resolved step for the duplicate
   *  warn — reui's TimelineContext, Svelte-shaped) */
  export interface TimelineApi {
    /** the effective current step (controlled value ?? internal state) */
    readonly current: number;
    /** move the current step; fires onValueChange (reui's exact semantics) */
    setStep(step: number): void;
    /** an item's resolved ladder position (the dev duplicate-warn channel) */
    registerStep(el: HTMLElement, step: number): void;
    unregisterStep(el: HTMLElement): void;
  }

  /** context key — global symbol registry so the family files stay
   *  independent registry items (the menubar precedent) */
  export const TIMELINE_KEY = Symbol.for('jx-timeline-value');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
  import { cn } from '$lib/utils';
  import type { Density } from '$lib/density.svelte';
  import { TimelineDefaults } from './timeline-defaults.svelte';
  import {
    mountTimelineSpine,
    timelineProgressLength,
    type TimelineSpineGeometry,
    type TimelineSpinePreset,
  } from './timeline-spine.svelte';
  import './timeline.css';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** the flow axis; the engine transposes, slot names stay logical */
    axis?: 'vertical' | 'horizontal';
    /** ltr (default) · revert (mirrored) · interlaced (alternating) */
    direction?: 'ltr' | 'revert' | 'interlaced';
    /** none (default) · view (per-item entrance) · scroll (spine progress) */
    animation?: 'none' | 'view' | 'scroll';
    /** the drawn spine: 'plain' | 'dashed' | 'beam' or a custom snippet */
    spine?: TimelineSpinePreset | Snippet<[TimelineSpineGeometry]>;
    /** the uncontrolled seed (decimals first-class — never rounded) */
    defaultValue?: number;
    /** the controlled current step (overrides the internal state) */
    value?: number;
    /** fires on every setStep change */
    onValueChange?: (v: number) => void;
    density?: Density;
    class?: string;
    children: Snippet;
  }

  let {
    axis = 'vertical',
    direction = 'ltr',
    animation = 'none',
    spine = 'plain',
    defaultValue = 1,
    value,
    onValueChange,
    density,
    class: className = '',
    children,
    ...rest
  }: Props = $props();
  // THE DEFAULTS READ POINT (context-defaults-economy 3.3): one line —
  // density resolves through the family contract (the no-opinion axis
  // slot: explicit ?? inherited ?? undefined; no opinion stamps
  // nothing, the ambient css scope channel keeps flowing)
  const d = $derived(TimelineDefaults.resolve({ density }));

  const dev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;

  // ── the value contract (reui parity): one $state number, the
  //    controlled input wins read-side, setStep is the context drive —
  //    uncontrolled writes flow, controlled consumers sync through
  //    onValueChange; every change fires the callback ──
  // svelte-ignore state_referenced_locally
  let activeStep = $state(defaultValue);
  const current = $derived(value ?? activeStep);

  function setStep(step: number): void {
    if (value === undefined) activeStep = step;
    onValueChange?.(step);
  }

  // the step registry: the dev strictly-ascending-warn channel (the
  // geometry engine builds the milestone table from the items'
  // data-step attributes — this registration exists to catch the
  // violation at author time: duplicates AND inversions, Gate-2 r1)
  const stepOwners = new Map<HTMLElement, number>();
  function registerStep(el: HTMLElement, step: number): void {
    stepOwners.set(el, step);
    if (!dev) return;
    // the Map's iteration order is registration order (DOM order in
    // practice) — adjacent pairs carry the whole ladder check
    const ladder = [...stepOwners.values()];
    for (let i = 0; i + 1 < ladder.length; i++) {
      const a = ladder[i]!;
      const b = ladder[i + 1]!;
      if (b === a) {
        console.warn(
          `jixoai timeline: duplicate step ${a} — steps must be strictly ascending in DOM order; the later item owns the milestone, the earlier keeps its discrete completed paint`,
        );
      } else if (b < a) {
        console.warn(
          `jixoai timeline: step ${a} → ${b} descends — steps must be strictly ascending in DOM order; the milestone table normalizes to ascending (arcs stay bound to their owning nodes)`,
        );
      }
    }
  }
  function unregisterStep(el: HTMLElement): void {
    stepOwners.delete(el);
  }

  setContext<TimelineApi>(TIMELINE_KEY, {
    get current() {
      return current;
    },
    setStep,
    registerStep,
    unregisterStep,
  });

  // ── the measured spine (post-hydration only; SSR paints the floor) ──
  let geometry = $state<TimelineSpineGeometry | null>(null);
  let hostEl = $state<HTMLDivElement | null>(null);
  let listEl = $state<HTMLOListElement | null>(null);

  // re-measure triggers ride the effect's dependency set (axis/
  // direction/density flips) + the runtime's own observers (resize,
  // membership, attribute re-scoping)
  $effect(() => {
    if (!hostEl || !listEl) return;
    void axis;
    void direction;
    void d.density;
    return mountTimelineSpine(hostEl, listEl, (g) => {
      geometry = g;
    });
  });

  // ── the stroke channel's lengths — ALL dasharray consumers ride the
  //    cumulative polyline pathLength (the chord runLength RETIRED
  //    from this arithmetic: it under-measured non-collinear runs) ──
  const pathLength = $derived(geometry?.pathLength ?? 0);
  const progressLen = $derived(
    geometry ? timelineProgressLength(geometry.stops, current, geometry.pathLength) : 0,
  );

  // the beam segment's inline length: a fifth of the run, floor 48px
  // (the 1px×11px pulse era is what this rework retires)
  const beamLen = $derived(
    geometry ? Math.max(48, Math.round(geometry.pathLength * 0.2)) : 0,
  );
</script>

<div
  bind:this={hostEl}
  data-jx-tl-host=""
  data-jx-timeline=""
  data-jx-spine="floor"
  data-axis={axis}
  data-direction={direction}
  data-anim={animation}
  data-density={d.density}
  class={cn(className)}
  {...rest}
>
  <!-- the drawn spine: FIRST child — grid-area 1/1 sibling of the list,
       painted UNDER the items by source order; pointer-events none and
       aria-hidden are the decorative-layer law. No viewBox: user units
       map 1:1 to the overlay's CSS px (the payload's list-root space) -->
  <svg data-jx-tl-spine="" aria-hidden="true">
    {#if geometry}
      {#if typeof spine === 'function'}
        {@render spine(geometry)}
      {:else if spine === 'dashed'}
        {#each geometry.segments as segment (segment.d)}
          <path
            data-jx-tl-seg=""
            data-jx-tl-dashed=""
            d={segment.d}
            stroke-dasharray="4 4"
            stroke-dashoffset={segment.edgePhase}
          ></path>
        {/each}
      {:else if spine === 'beam'}
        <path data-jx-tl-base="" d={geometry.runPath}></path>
        <defs>
          <!-- objectBoundingBox units: the gradient maps onto each
               referencing path's own box, so one shared def id serves
               every instance identically (axis-keyed per render) -->
          {#if geometry.axis === 'vertical'}
            <linearGradient id="jx-tl-beam-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style="stop-color: var(--border); stop-opacity: 0" />
              <stop offset="0.5" style="stop-color: var(--primary)" />
              <stop offset="1" style="stop-color: var(--border); stop-opacity: 0" />
            </linearGradient>
          {:else}
            <linearGradient id="jx-tl-beam-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" style="stop-color: var(--border); stop-opacity: 0" />
              <stop offset="0.5" style="stop-color: var(--primary)" />
              <stop offset="1" style="stop-color: var(--border); stop-opacity: 0" />
            </linearGradient>
          {/if}
        </defs>
        <path
          data-jx-tl-beam=""
          d={geometry.runPath}
          stroke="url(#jx-tl-beam-grad)"
          stroke-dasharray="{beamLen} {pathLength}"
          style="--jx-tl-run: {pathLength}px; --jx-tl-beam-len: {beamLen}px; --jx-tl-beam-park: -{geometry.nodeRadius}px"
        ></path>
      {:else}
        <path data-jx-tl-base="" d={geometry.runPath}></path>
      {/if}
      {#if animation === 'scroll'}
        <!-- the scroller OWNS the stroke channel under scroll mode:
             the value-driven inline dashoffset is NOT painted at all
             (the frozen interplay — value still drives data-completed) -->
        <path
          data-jx-tl-progress=""
          d={geometry.runPath}
          stroke-dasharray="{pathLength} {pathLength}"
          style="--jx-tl-run: {pathLength}px"
        ></path>
      {:else}
        <!-- the value-driven progress stroke: dasharray = pathLength,
             dashoffset = pathLength − len(value) from the STOPS mapping
             (the 300ms css transition on the dashoffset lives in
             timeline.css; reduced motion: none) -->
        <path
          data-jx-tl-progress=""
          d={geometry.runPath}
          stroke-dasharray={pathLength}
          stroke-dashoffset={pathLength - progressLen}
        ></path>
      {/if}
    {/if}
  </svg>
  <ol bind:this={listEl} data-jx-tl-list="" role="list" class="m-0 p-0 list-none">
    {@render children()}
  </ol>
</div>
