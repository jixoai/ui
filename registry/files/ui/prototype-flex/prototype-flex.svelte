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
  import { PrototypeFlexDefaults } from './prototype-flex-defaults.svelte';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
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
  }

  let {
    direction = undefined,
    wrap = undefined,
    align = undefined,
    justify = undefined,
    gap = undefined,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = undefined,
    style: consumerStyle,
    children,
    ...rest
  }: Props = $props();

  // undefined stays undefined: Svelte drops the style declaration,
  // so an omitted prop never serializes (omission transparency).
  const gapStyle = $derived(typeof gap === 'number' ? `${gap}px` : gap);

  // ── the eight-axis surface (W3-D2 — FIRST-TIME contract, all
  // no-own: the alpha lane's zero-translation posture extends to the
  // paint axes; the carriers join the CONSUMER style attr — the
  // merge law the layout family's spec pins — and the style:
  // directives below stay untouched)
  const d = $derived(
    PrototypeFlexDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
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
  {...rest}
  bind:this={uniRoot}
  class={className}
  data-jx-prototype-flex
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  style:display="flex"
  style:flex-direction={direction}
  style:flex-wrap={wrap}
  style:align-items={align}
  style:justify-content={justify}
  style:gap={gapStyle}
>
  {@render children?.()}
</div>
