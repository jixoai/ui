<!--
  jixoai descriptions — the ROOT half (registry/files/ui/descriptions/descriptions.svelte,
  composition-first-apis, 2026-08-25).
  The enterprise detail view (antd's staple), W3C-first and now
  composed: a dl IS a description list — dt/dd pairs in source order,
  laid out as a grid of term/value cells, one DescriptionsItem per
  pair:

    <Descriptions columns={2} bordered>
      <DescriptionsItem term="Owner">gaubee</DescriptionsItem>
    </Descriptions>

  The ruling stands: descriptions never disguises as a table; the
  bordered look is CSS on the same dl, not different semantics.
  columns=N splits rows into N term/value pairs per row (responsive
  down to 1 on narrow containers via container queries — the
  consumer's container owns the width). Both are HOW-props (they
  change how the grid paints, never what renders) and stay on the
  root; `bordered` rides context down to the Items for their hairline
  paint.
  tailwindless one-shot Wave 1b batch A (2026-09-17): the paint rides
  the family's stylex ATOMS (descriptions.stylex.ts) joined through
  cx() below; the narrow-container fallback stays lane-2 in
  descriptions.css (.jx-desc hook, unlayered — it must beat the grid
  atoms).
-->
<script lang="ts" module>
  /** context surface the family shares (import type where needed) */
  export interface DescriptionsApi {
    /** the bordered hairline frame — Items paint their cell edges from it */
    readonly bordered: boolean;
  }

  /** context key — global symbol registry, independent registry items */
  export const DESCRIPTIONS_KEY = Symbol.for('jx-descriptions');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
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
  import { DescriptionsDefaults } from './descriptions-defaults.svelte';
  import { descriptionsStyles } from './descriptions.stylex';
  import './descriptions.css';

  interface Props extends Omit<HTMLAttributes<HTMLDListElement>, 'color'> {
    /** term/value pairs per row (default 1; responsive clamp to 1) */
    columns?: number;
    /** hairline cell borders (the "bordered" antd look, CSS not table) */
    bordered?: boolean;
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
    children: Snippet;
  }

  let {
    density,
    columns = 1,
    bordered,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style = '',
    children,
    ...rest
  }: Props = $props();

  const cols = $derived(Math.max(1, Math.min(4, Math.trunc(columns))));
  // the family Defaults is the single read point (context-defaults-
  // economy 3.1 + W3-D1): bordered rides the literal slot (own
  // false), the eight universal axes resolve one record
  const d = $derived(
    DescriptionsDefaults.resolve({
      density,
      bordered,
      size,
      shape,
      radius,
      color,
      theme,
      elevation,
      motion,
    }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDListElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(
    [carriers, style, `--jx-desc-cols: ${cols}`].filter(Boolean).join('; ') || undefined,
  );

  setContext<DescriptionsApi>(DESCRIPTIONS_KEY, {
    get bordered() {
      return d.bordered;
    },
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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<dl
  bind:this={uniRoot}
  data-jx-desc-bordered={d.bordered ? '' : undefined}
  data-density={densityRungOf(d.density)}
  class={cx(
    'jx-desc',
    descriptionsStyles.root,
    d.bordered && descriptionsStyles.bordered,
    className,
  )}
  class:dark={d.theme === 'dark'}
  {...rest}
  style={rootStyle}
>
  {@render children()}
</dl>
