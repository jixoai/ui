<!--
  jixoai empty (registry/files/ui/empty/empty.svelte).
  The no-data state of the eight-state machine — NOTHING more (the
  antd ruling: empty does not absorb error/loading/404; those are
  alert/result surfaces). A figure: terminal-box illustration slot
  (default: the empty directory listing), a title, a description, and
  an optional actions snippet ("create the first…").

    <Empty title="no checks yet">
      {#snippet actions()}<PressButton>add check</PressButton>{/snippet}
    </Empty>

  Pure composition — no JS, no state; the illustration is a slot so
  consumers bring their own glyph without a dependency.

  tw4 (2026-08-24): pure token utilities, zero css residue; `jx-empty*`
  classes are semantic hooks, css defines them not.

  tailwindless one-shot Wave 1 (2026-09-17): the paint rides the
  family's stylex ATOMS (empty.stylex.ts); the utility strip below is
  gone — composed class strings join through the payload's own cx().
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
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
  import { EmptyDefaults } from './empty-defaults.svelte';
  import { emptyStyles } from './empty.stylex';

  interface Props {
    title: string;
    description?: string;
    /** custom illustration — defaults to the terminal empty-listing */
    illustration?: Snippet;
    actions?: Snippet;
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
    class?: string;
  }

  let {
    title,
    description,
    illustration,
    actions,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
  }: Props = $props();

  // ── the eight-axis surface (W3-D1 — the migrated contract, all
  // no-own: the no-data state is flat content; the supply chain is
  // the point)
  const d = $derived(
    EmptyDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

  // the payload's own join (separator's serialize law): every string
  // declaration except the $$css marker, space-joined — atoms are
  // objects in dev, so raw interpolation would render [object Object]
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
</script>

<figure
  bind:this={uniRoot}
  data-jx-empty=""
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={cn(cx(emptyStyles.figure), className)}
>
  <div data-jx-empty-art="" class={cx(emptyStyles.art)} aria-hidden="true">
    {#if illustration}
      {@render illustration()}
    {:else}
      <span data-jx-empty-term="" class={cx(emptyStyles.term)}>ls checks/</span>
      <span data-jx-empty-zero="" class={cx(emptyStyles.zero)}>0 items</span>
    {/if}
  </div>
  <figcaption data-jx-empty-caption="" class={cx(emptyStyles.caption)}>
    <p data-jx-empty-title="" class={cx(emptyStyles.title)}>{title}</p>
    {#if description}
      <p data-jx-empty-desc="" class={cx(emptyStyles.desc)}>{description}</p>
    {/if}
    {#if actions}
      <div data-jx-empty-actions="" class={cx(emptyStyles.actions)}>
        {@render actions()}
      </div>
    {/if}
  </figcaption>
</figure>
