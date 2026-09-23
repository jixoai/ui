<!--
  jixoai DensityDemo — the multi-scope live demo. Wraps children in
  [data-density] wrappers side-by-side with scope labels. The default
  stays the four GENERAL rungs — 2xs (2026-09-05-density-2xs) is
  opt-in only (pro-tool operation surfaces, never default docs UI);
  pages documenting the full scale pass it explicitly.

  The EIGHT-AXIS SURFACE (explicit-props W3-D4, siteOnly) DOGFOODS the
  axis: size · shape · radius · density · color · theme · elevation ·
  motion ride DensityDemoDefaults (first-time, all no-own) on the row
  root. An explicit density lane stamps the rung for the demo's OWN
  chrome (labels, row gaps — the visible §4 bridge) while the scope
  boxes keep their per-rung stamps: explicit scope > ambient root, the
  fleet law live inside the demo that teaches it. Nothing stamps when
  no lane is passed — every existing demo renders unchanged.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { densityDemoStyles } from './density-demo.stylex';
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
  import { DensityDemoDefaults } from './density-demo-defaults.svelte';

  interface Props {
    /** plain clone form — omit when childrenScoped is given (id-bearing
     *  seats must use the scoped form, never this one) */
    children?: Snippet;
    /** scope-aware render: when given, each rung renders THIS snippet with
     *  its scope key — the id-bearing-seat law (popover 1st review, LAW
     *  #19 class): a zero-arg snippet cloned across rungs mints duplicate
     *  ids/anchor-names (the popover page's density-pop ×4 measured);
     *  seats that stamp ids adopt this form and compose per-rung ids */
    childrenScoped?: Snippet<[('2xs' | 'xs' | 'sm' | 'default' | 'lg')]>;
    scopes?: ('2xs' | 'xs' | 'sm' | 'default' | 'lg')[];
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) — the DOGFOOD lane: an explicit rung stamps
     *  the demo's own chrome; the scope boxes below keep their
     *  explicit stamps (explicit scope > ambient root) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (one number scales the
     *  whole demo row) */
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
    class?: string;
    style?: string;
  }

  let {
    children,
    childrenScoped,
    scopes = ['xs', 'sm', 'default', 'lg'],
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
  }: Props = $props();

  // the payload's own join (separator's serialize law — the chip
  // precedent): objects in dev, joined strings in payloads, never a
  // raw class={styles.x} interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ── the eight-axis surface (W3-D4 — FIRST-TIME contract, all
  // no-own, the DOGFOOD): one resolution record on the row root; the
  // carriers JOIN the consumer style attr (the merge law); the
  // supply + the query() anchor follow the standard wiring. The
  // scope boxes below stamp their own rungs AFTER the root's — the
  // explicit scope wins over the ambient root lane, visibly
  const d = $derived(
    DensityDemoDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
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
  class={cn(cx(densityDemoStyles.row), className)}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
>
  {#each scopes as scope (scope)}
    <div class={cx(densityDemoStyles.cell)}>
      <span class={cx(densityDemoStyles.label)}>
        {scope}
      </span>
      <div data-density={scope} class={cx(densityDemoStyles.scopeBox)}>
        {#if childrenScoped}
            {@render childrenScoped(scope)}
          {:else if children}
            {@render children()}
          {/if}
      </div>
    </div>
  {/each}
</div>
