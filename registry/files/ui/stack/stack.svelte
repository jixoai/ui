<!--
  jixoai stack (registry/files/ui/stack/stack.svelte).
  The Layout family's FLOW primitive: a one-dimensional arrangement
  over the site's typed space ladder. Every gap is a --jx-space-N
  rung (token-bound atoms, stack.stylex.ts); the axis vocabulary is
  the closed CSS set. A Stack paints NOTHING else — no color, no
  padding, no typography — it is layout only (the goal's Layout
  lane; surface modules' hand-rolled flex declarations migrate onto
  this face one slice at a time).

  Props are STRUCTURAL, not style-vocabulary: direction/gap/align/
  justify/wrap/inline name layout intent, not paint — outside the
  context gate's 9-word detection vocabulary and classified
  never-ambient (an axis would have nothing meaningful to inherit — a
  row is a row because its consumer says so). The EIGHT-AXIS SURFACE
  (W3-D3) is the paint half: size · shape · radius · density · color
  · theme · elevation · motion ride StackDefaults (first-time, all
  no-own — the prototype-flex layout-primitive posture); the
  structural props stay outside the contract exactly as founded.

  Single root, rest-spread BEFORE the component's own stamp (the
  layout-family law: consumer attributes replace, never merge).
  Omitted props add NOTHING (omission transparency).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
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
  import { StackDefaults } from './stack-defaults.svelte';
  import { stackStyles, type StackGap } from './stack.stylex';

  type Axis = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  type Justify = 'start' | 'center' | 'end' | 'between' | 'stretch';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
    /** the flow axis; row is flex's default (no atom needed) */
    direction?: 'row' | 'column';
    /** the typed space ladder rung (token-bound; sheet's --jx-space-N) */
    gap?: StackGap;
    /** cross-axis alignment (align-items) */
    align?: Axis;
    /** main-axis distribution (justify-content) */
    justify?: Justify;
    /** allow wrapping onto multiple lines */
    wrap?: boolean;
    /** inline flow (display: inline-flex) instead of block flow */
    inline?: boolean;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
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
    /** the flow's contents */
    children?: Snippet;
  }

  let {
    direction = 'row',
    gap,
    align,
    justify,
    wrap = false,
    inline = false,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style: consumerStyle,
    children,
    ...rest
  }: Props = $props();

  // the payload's own join (the serialize law): objects in dev,
  // joined strings in payloads — composition through THE joiner only
  const cx = (
    ...styles: (object | undefined | string | false)[]
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

  const ALIGN_ATOM = {
    start: stackStyles.alignStart,
    center: stackStyles.alignCenter,
    end: stackStyles.alignEnd,
    baseline: stackStyles.alignBaseline,
    stretch: stackStyles.alignStretch,
  } as const;
  const JUSTIFY_ATOM = {
    start: stackStyles.justifyStart,
    center: stackStyles.justifyCenter,
    end: stackStyles.justifyEnd,
    between: stackStyles.justifyBetween,
    stretch: stackStyles.justifyStretch,
  } as const;
  // gap rung → atom: the sheet's ladder is the vocabulary
  const GAP_ATOM: Record<StackGap, object> = {
    '2': stackStyles.gap2,
    '4': stackStyles.gap4,
    '6': stackStyles.gap6,
    '8': stackStyles.gap8,
    '10': stackStyles.gap10,
    '12': stackStyles.gap12,
    '14': stackStyles.gap14,
    '16': stackStyles.gap16,
    '18': stackStyles.gap18,
    '20': stackStyles.gap20,
    '24': stackStyles.gap24,
    '28': stackStyles.gap28,
    '32': stackStyles.gap32,
    '40': stackStyles.gap40,
    '48': stackStyles.gap48,
    '80': stackStyles.gap80,
  };

  const flow = $derived(
    cx(
      inline ? stackStyles.baseInline : stackStyles.base,
      direction === 'column' && stackStyles.column,
      wrap && stackStyles.wrap,
      align && ALIGN_ATOM[align],
      justify && JUSTIFY_ATOM[justify],
      gap && GAP_ATOM[gap],
    ),
  );

  // ── the eight-axis surface (W3-D3 — FIRST-TIME contract, all
  // no-own): the paint axes join the structural face; the carriers
  // join the CONSUMER style attr (the merge law, prototype-flex)
  const d = $derived(
    StackDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(
    [carriers, consumerStyle ?? undefined].filter(Boolean).join('; ') || undefined,
  );
</script>

<div
  bind:this={uniRoot}
  class={cn(flow, className)}
  {...rest}
  data-jx-stack=""
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
>
  {@render children?.()}
</div>
