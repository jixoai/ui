<!--
  jixoai A11yTable — the keyboard/ARIA reference table.

  tailwindless one-shot W1 (2026-09-17): paint rides the table's own
  stylex atoms (a11y-table.stylex.ts — the density channels flow as
  plain var() strings); the heading's 500 weight rides the
  .jx-a11y-heading lane-2 rule (a11y-table.css).

  The EIGHT-AXIS SURFACE (explicit-props W3-D4, siteOnly): size ·
  shape · radius · density · color · theme · elevation · motion ride
  A11yTableDefaults (first-time, all no-own — the root scales, the
  reference cells reflow through inheritance); nothing stamps when no
  lane is passed (no doc page of its own — the surfaces live inside
  every family page's Accessibility section).
-->
<script lang="ts">
  import { cn } from '$lib/utils';
  import { a11yTableStyles } from './a11y-table.stylex';
  import './a11y-table.css';
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
  import { A11yTableDefaults } from './a11y-table-defaults.svelte';

  export interface KeyEntry {
    key: string;
    action: string;
  }

  interface Props {
    keys?: KeyEntry[];
    aria?: { name: string; value: string; description: string }[];
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
    style?: string;
  }

  let {
    keys = [],
    aria = [],
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

  // the payload's own join (separator's serialize law): objects in
  // dev, joined strings in payloads — never a raw interpolation
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
  // no-own): one resolution record; the carriers JOIN the consumer
  // style attr (the merge law); the standard supply + anchor wiring
  const d = $derived(
    A11yTableDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
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
  class={cn(cx(a11yTableStyles.root), className)}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
>
  {#if keys.length > 0}
    <div>
      <h4 class="jx-a11y-heading {cx(a11yTableStyles.heading)}">Keyboard</h4>
      <div class={cx(a11yTableStyles.scroller)}>
        <table class={cx(a11yTableStyles.table)}>
          <thead>
            <tr class={cx(a11yTableStyles.headRow)}>
              <th class={cx(a11yTableStyles.headCell)}>Key</th>
              <th class={cx(a11yTableStyles.headCell)}>Action</th>
            </tr>
          </thead>
          <tbody>
            <!-- site-polish F10: the key is NAME+INDEX — a component
                 legitimately documents the SAME attribute on several
                 elements (dialog's two aria-label rows), and a keyed each
                 over the bare name threw each_key_duplicate on hydration,
                 collapsing whole pages to their last sections (the
                 "gutted dialog/sheet" misdiagnosis) -->
            {#each keys as entry, i (entry.key + ':' + i)}
              <tr class={cx(a11yTableStyles.bodyRow)}>
                <td class={cx(a11yTableStyles.cell)}>
                  <kbd class={cx(a11yTableStyles.kbd)}>{entry.key}</kbd>
                </td>
                <td class={cx(a11yTableStyles.cell)}>{entry.action}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
  {#if aria.length > 0}
    <div>
      <h4 class="jx-a11y-heading {cx(a11yTableStyles.heading)}">ARIA</h4>
      <div class={cx(a11yTableStyles.scroller)}>
        <table class={cx(a11yTableStyles.table)}>
          <thead>
            <tr class={cx(a11yTableStyles.headRow)}>
              <th class={cx(a11yTableStyles.headCell)}>Attribute</th>
              <th class={cx(a11yTableStyles.headCell)}>Value</th>
              <th class={cx(a11yTableStyles.headCell)}>Description</th>
            </tr>
          </thead>
          <tbody>
            {#each aria as entry, i (entry.name + ':' + i)}
              <tr class={cx(a11yTableStyles.bodyRow)}>
                <td class={cx(a11yTableStyles.cellMono)}>{entry.name}</td>
                <td class={cx(a11yTableStyles.cellMonoSecondary)}>{entry.value}</td>
                <td class={cx(a11yTableStyles.cell)}>{entry.description}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
