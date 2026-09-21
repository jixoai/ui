<!--
  jixoai accordion (registry/files/ui/accordion/accordion.svelte).
  W3C-first: the accordion IS <details>/<summary>. Native toggle
  semantics, native keyboard support, native SSR state (the open item
  ships open in the HTML) — no ARIA roles to maintain, nothing to
  hydrate. This file is the GROUP half; pair with accordion-item.svelte.

  The group adds exactly what a pile of bare <details> lacks:
    1. border collapse — one 1px frame around the set, 1px seams
       between items (not a stack of double borders)
    2. exclusive mode — opt-in "radio behavior": opening one item
       closes its siblings. Implemented by ONE capture-phase `toggle`
       listener on this container (toggle does not bubble, but capture
       sees it; Svelte events have no capture modifier, so it is a
       manual addEventListener in the action below), and it also
       governs raw <details> children a consumer drops in —
       composition over registration.

  Height animation is progressive enhancement: interpolate-size:
  allow-keywords + ::details-content transition animates to
  height:auto on supporting engines; everywhere else it snaps (native
  behavior, never broken).

  tw4 (2026-08-24): utility-authored — the frame and the ghost
  variant (conditional utilities, same element) live in the markup;
  ONLY the sibling seam (a `> * + *` boundary no utility may own) and
  the @supports interpolate-size gate stay in accordion.css (D1-exempt
  residue, static @layer components).

  tailwindless one-shot W1 (2026-09-17): the frame and ghost paint
  ride the family's stylex ATOMS (accordion.stylex.ts — structural
  constants verbatim, theme slots on tokens/ruler channels); the css
  keeps the sibling seam + the interpolate-size gate.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fromAction } from 'svelte/attachments';
  import { cn } from '$lib/utils';
  import {
    densityRungOf,
    provideQueryAnchor,
    provideUniversalLanes,
    stampCarriersForLanes,
    type ColorLane,
    type DensityLane,
    type ElevationLane,
    type MotionLane,
    type QueryResult,
    type RadiusLane,
    type ShapeLane,
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import { AccordionDefaults } from './accordion-defaults.svelte';
  import { accordionStyles } from './accordion.stylex';
  import './accordion.css';

  interface Props {
    /** radio behavior: opening one DIRECT child closes its siblings
     *  (nested accordions and wrapper divs do not participate) */
    exclusive?: boolean;
    /** antd's ghost paint: frameless — no outer border/card, items keep
     *  only the hairline separators (antd Collapse ghost mapping) */
    ghost?: boolean;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (ONE number moves summary +
     *  body: the whole disclosure set scales) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast (the frame SUPPLIES the anchor; a nested auto
     *  consumer computes R−inset) */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    children: Snippet;
    class?: string;
    style?: string;
  }

  let {
    exclusive = false,
    ghost = false,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    children,
    class: className = '',
    style: consumerStyle,
  }: Props = $props();

  // ── the eight-axis surface (W3-D5 — FIRST-TIME contract, all
  // no-own): ONE resolve record at the GROUP root — the frame div
  // stamps the §10 carriers (JOINing the consumer style attr, the
  // merge law), supplies downward via provideUniversalLanes and
  // anchors query() after the anchor state declaration (the W3-C TDZ
  // law). accordion-item rides the supply chain: its details/summary
  // content is IN-FLOW inside the frame (the native-disclosure
  // architecture has no portal boundary — the content inherits the
  // frame's stamped carriers through the plain cascade; the portal
  // law has nothing to self-carry here)
  const d = $derived(
    AccordionDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(
    [carriers, consumerStyle ?? undefined].filter(Boolean).join('; ') || undefined,
  );

  // the payload's own join (separator's serialize law, tailwindless
  // task 2.1): stylex members are objects in dev and joined strings
  // in shipped payloads — composition goes through THIS joiner (all
  // string values except $$css, space-joined), never a raw
  // interpolation (an object renders [object Object]).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  /** capture-phase toggle delegation (see header note); parameterized so
   *  a dynamic `exclusive` flip takes effect without a remount. Mounted
   *  through the fromAction bridge (effect-attachments): an action-shaped
   *  {update, destroy} return cannot ride {@attach} bare — only FUNCTION
   *  returns are teardown, the object return would leak silently */
  function exclusiveGuard(node: HTMLElement, enabled: boolean) {
    let on = enabled;
    const handler = (event: Event) => {
      if (!on) return;
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || !details.open) return;
      if ((event as ToggleEvent).newState !== 'open') return;
      for (const sibling of node.querySelectorAll(':scope > details[open]')) {
        if (sibling !== details) sibling.removeAttribute('open');
      }
    };
    node.addEventListener('toggle', handler, true);
    return {
      update(next: boolean) {
        on = next;
      },
      destroy: () => node.removeEventListener('toggle', handler, true),
    };
  }
</script>

<div
  bind:this={uniRoot}
  data-jx-accordion-ghost={ghost ? '' : undefined}
  class="jx-accordion {cn(cx(accordionStyles.group, ghost && accordionStyles.ghost), className)}"
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  {@attach fromAction(exclusiveGuard, () => exclusive)}
>
  {@render children()}
</div>
