<!--
  jixoai badge indicator (registry/files/ui/badge-indicator/badge-indicator.svelte).
  antd Badge's other half — the COUNT/DOT overlay chip.badge is
  the static status chip; this is the live indicator riding on a
  corner of its child (an avatar, an icon, a tab):

    dot       a solid brand dot — presence/unread presence (no number)
    count     the number, capped by overflow (default 99+)
    standalone (no children) renders inline — a plain count chip

  hidden states are honest: count=0 hides the indicator entirely
  (zero unread IS no badge); showZero opts into showing it.

  tw4 (2026-08-24): utility-authored, zero css residue. dot and count
  paint as two DETERMINISTIC utility strings (never two utilities for
  one property — the sheet's internal order must never be load-
  bearing); the hooks ride `data-jx-bi*` attributes (data-jx-hooks,
  2026-08-25 — no css ever defined the classes).
  tailwindless one-shot Wave 1b batch A (2026-09-17): the paint rides
  the family's stylex ATOMS (badge-indicator.stylex.ts) joined
  through cx() below — two deterministic ATOM groups (one per idiom),
  the corner placement a conditional group; the data-jx-bi* hooks
  stay attributes (css-less anchors, unchanged). Still zero css.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
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
  import { BadgeIndicatorDefaults } from './badge-indicator-defaults.svelte';
  import { badgeIndicatorStyles } from './badge-indicator.stylex';

  interface Props {
    /** the dot idiom — beats count when only presence matters */
    dot?: boolean;
    /** the count idiom; hidden at 0 unless showZero */
    count?: number;
    /** cap before "n+" (default 99) */
    overflow?: number;
    /** render count=0 instead of hiding */
    showZero?: boolean;
    /** what the indicator rides on (omitted = standalone chip) */
    children?: Snippet;
    /** accessible name for the dot (required in dot mode) */
    label?: string;
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
    /** universal elevation axis (§7): official M3 levels · dp · query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive · a
     *  coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    class?: string;
  }

  let {
    dot,
    count,
    overflow = 99,
    showZero = false,
    children,
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

  // the family Defaults is the single read point (explicit-props W3-B):
  // the eight universal axes resolve in one record, all no-own — the
  // indicator rides the ambient context of the element it decorates
  const d = $derived(
    BadgeIndicatorDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the ROOT is the wrap span
  // when riding a child, else the standalone chip)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLSpanElement>();
  provideQueryAnchor(() => uniRoot ?? null);

  const visible = $derived(dot || (count !== undefined && (count > 0 || showZero)));
  const text = $derived.by(() => {
    if (dot) return '';
    if (count === undefined) return '';
    return count > overflow ? `${overflow}+` : String(count);
  });

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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // two complete paints: the count chip (18px min box, destructive) and
  // the 10px primary presence dot — standalone drops the corner offsets
  // (a bare span is position:static already)
  const chip = cx(badgeIndicatorStyles.base, dot ? badgeIndicatorStyles.dot : badgeIndicatorStyles.count);
  const placement = children ? cx(badgeIndicatorStyles.anchored) : '';
</script>

{#if children}
  <span
    bind:this={uniRoot}
    data-jx-bi-wrap
    class={cx(badgeIndicatorStyles.wrap, className)}
    data-density={densityRungOf(d.density)}
    class:dark={d.theme === 'dark'}
    style={carriers || undefined}
  >
    {@render children()}
    {#if visible}
      <span
        data-jx-bi
        data-jx-bi-dot={dot ? '' : undefined}
        data-jx-bi-standalone={children ? undefined : ''}
        class={cx(chip, placement)}
        role={dot ? 'img' : undefined}
        aria-label={dot ? (label ?? 'new activity') : `${text}`}
        >{text}</span
      >
    {/if}
  </span>
{:else if visible}
  <span
    bind:this={uniRoot}
    data-jx-bi
    data-jx-bi-dot={dot ? '' : undefined}
    data-jx-bi-standalone={children ? undefined : ''}
    class={cx(chip, placement, className)}
    role={dot ? 'img' : undefined}
    aria-label={dot ? (label ?? 'new activity') : `${text}`}
    data-density={densityRungOf(d.density)}
    class:dark={d.theme === 'dark'}
    style={carriers || undefined}
    >{text}</span
  >
{/if}
