<!--
  jixoai progress (registry/files/ui/progress/progress.svelte).
  W3C-first: progress IS the native <progress> element — role, value
  semantics, min/max mapping and the indeterminate state are the
  browser's. Passing no value renders the indeterminate bar natively
  (aria-valuenow omitted by the platform); max defaults to 1 so a 0..1
  fraction works without ceremony, matching how the element itself is
  specified.

  The component adds only the jixoai paint (appearance:none, 1px frame,
  brand fill, terminal stripe for the indeterminate run) and an optional
  label + live value readout — announced politely (role=status) because
  progress changes are exactly the "polite update" case; the bar itself
  stays aria-hidden-free (the native element already exposes values).

  tw4 (2026-08-24): utility-authored — the bar frame, the label/value
  readout, and the indeterminate stripe (arbitrary-value background +
  animate utility, gated on the jx-indeterminate hook) live in the
  markup; ONLY the native ::-webkit/::-moz progress pseudo resets, the
  stripe keyframes, and the reduced-motion kills stay in progress.css
  (D1-exempt residue; the kills override markup utilities, so they
  ride the unlayered :where carve-out).
  tailwindless one-shot Wave 1b batch A (2026-09-17): the paint rides
  the family's stylex ATOMS (progress.stylex.ts) joined through cx()
  below; the pseudo resets, keyframes, and the UNLAYERED reduced-motion
  kills stay lane-2 in progress.css (unlayered beats the atoms);
  jx-progress-bar / jx-indeterminate stay the css law's hooks.
-->
<script lang="ts">
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
  import { ProgressDefaults } from './progress-defaults.svelte';
  import { progressStyles } from './progress.stylex';
  import './progress.css';

  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner (all
  // string values except $$css, space-joined).
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

  interface Props {
    /** 0..max; omitted ⇒ indeterminate ("activity", not "progress") */
    value?: number;
    /** default 1 (the element's own spec default) */
    max?: number;
    /** visible label above the bar */
    label?: string;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the readout scales around
     *  the native bar) */
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
    value,
    max = 1,
    label,
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

  // ── the eight-axis surface (W3-D2 — the zero-hit ruling stands:
  //  value/max/label are data semantics; the axes are paint/kinetic
  //  lanes, all no-own — the size axis scales the readout root)
  const d = $derived(
    ProgressDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

  const pct = $derived(
    value === undefined || max <= 0 ? null : Math.min(100, Math.max(0, (value / max) * 100)),
  );
</script>

<div
  bind:this={uniRoot}
  data-jx-progress=""
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={cx(progressStyles.root, className)}
>
  {#if label || pct !== null}
    <div data-jx-progress-head="" class={cx(progressStyles.head)}>
      {#if label}<span data-jx-progress-label="" class={cx(progressStyles.label)}>{label}</span>{/if}
      {#if pct !== null}
        <span data-jx-progress-value="" class={cx(progressStyles.value)} role="status">{Math.round(pct)}%</span>
      {/if}
    </div>
  {/if}
  <progress
    class={cx(
      'jx-progress-bar',
      progressStyles.bar,
      value === undefined && cx('jx-indeterminate', progressStyles.indeterminate),
    )}
    aria-label={label ?? 'progress'}
    {value}
    {max}
  >
    {#if pct !== null}{Math.round(pct)}%{/if}
  </progress>
</div>
