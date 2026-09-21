<!--
  jixoai TokenTable — the Material3-style token reference table.
  Two columns: Token | Default (aligned with m3's Theming section).
  Data-driven from the caller; tokens are auto-categorized by source.

  tailwindless one-shot (2026-09-16): the utilities became the
  family's stylex atoms (token-table.stylex.ts) joined by
  cx() — never a raw member interpolation.

  The EIGHT-AXIS SURFACE (explicit-props W3-D4, siteOnly): size ·
  shape · radius · density · color · theme · elevation · motion ride
  TokenTableDefaults (first-time, all no-own — the token-table.svelte
  root is the scroller: the size axis scales it, the cells reflow
  through inheritance); the carriers join the consumer style attr
  (the merge law); nothing stamps when no lane is passed.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { tokenTableStyles } from './token-table.stylex';
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
  import { TokenTableDefaults } from './token-table-defaults.svelte';

  export interface TokenEntry {
    name: string;
    default: string;
    description?: string;
    source?: 'density' | 'component' | 'color' | 'structural';
  }

  interface Props {
    tokens: TokenEntry[];
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (one number scales the
     *  whole reference table) */
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
    tokens,
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

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
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

  const sourceLabel = (s?: string) =>
    s === 'density' ? 'density' : s === 'component' ? 'component' : s === 'color' ? 'color' : '';

  // ── the eight-axis surface (W3-D4 — FIRST-TIME contract, all
  // no-own): one resolution record; the carriers JOIN the consumer
  // style attr (the merge law); the supply + the query() anchor
  // follow the standard wiring (the anchor after the state decl)
  const d = $derived(
    TokenTableDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
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
  class={cn(cx(tokenTableStyles.scroller), className)}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
>
  <table class={cx(tokenTableStyles.table)}>
    <thead>
      <tr class={cx(tokenTableStyles.headRow)}>
        <th class={cx(tokenTableStyles.headCell)}>Token</th>
        <th class={cx(tokenTableStyles.headCell)}>Default</th>
        {#if tokens.some((t) => t.source)}
          <th class={cx(tokenTableStyles.headCell)}>Source</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each tokens as token (token.name)}
        <tr class={cx(tokenTableStyles.bodyRow)}>
          <td class={cx(tokenTableStyles.nameCell)}>
            {token.name}
          </td>
          <td class={cx(tokenTableStyles.defaultCell)}>
            {token.default}
          </td>
          {#if tokens.some((t) => t.source)}
            <td class={cx(tokenTableStyles.sourceCell)}>
              {sourceLabel(token.source)}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
