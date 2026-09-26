<!--
  jixoai table (registry/files/ui/table/table.svelte).

  2026-08-22 · responsive deepening (original request: 参考
  codepen.io/viki-code/pen/JjxGgmm 改进 table 组件；配色上需要有一定的
  自由度). The CodePen's container-query law lands here, translated onto
  the jixoai token sheet — the frame reads ITS OWN width, so the same
  table adapts inside any layout column, never the viewport's.

  Orthogonal intents:
  1. frame — the <figure> owns the hairline frame, the radius law
     (var(--radius): 0, bevel upgrade where supported) and BOTH responsive
     engines via `container: jx-table / inline-size` + native overflow-x.
  2. scroll law (frame ≥ 30rem) — table keeps min-width: fit-content so
     columns never compress; the frame scrolls natively. Consumer cells
     opt into pinned columns with data-sticky="start" | "end" on the th
     AND its td's: they stick to the frame scrollport behind a hairline
     fold mark. All pinning geometry is LOGICAL (inset-inline-*, border-
     inline-*) so RTL mirrors for free. Requires border-collapse:
     separate (collapsed borders tear under sticky in some engines) —
     rendering is identical here because the language carries only
     horizontal hairlines.
  3. stack law (frame < 30rem, the CodePen card mode) — thead folds
     away, each row becomes a card: td[data-label] renders a muted
     label ::before with the value flushed right; the first cell takes
     the head surface as the card head. stack={false} pins the table
     to the scroll law at every width (data-stack="off").
  4. color freedom — every paint routes through the --jx-table-* local
     token surface (arbitrary-property utilities below, theme-token
     defaults); hover already carries the --brand-hue flow (one number
     recolors it). Override per instance: <Table style="--jx-table-hover: …">.
  5. semantics — thead/tbody/tfoot/th/td/caption stay real elements
     authored by the consumer as the children snippet; rows are never
     wrapped, and numeric alignment stays a consumer class.

  Zero dependencies. td/th paint an opaque --jx-table-surface so sticky
  cells mask the content scrolling under them (transparent cells would
  leak it). Dense mode survives both laws.

  tw4 (2026-08-24): the frame paint, the local token surface, the
  container declaration and the table/caption statics ride utilities in
  the markup; EVERYTHING that reaches the consumer-authored descendants
  (:global surface), the @container engines and the state machines
  stays in table.css — D1-exempt residue.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getDensityContext, provideDensity, resolveDensity } from '$lib/density.svelte';
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
  import { TableDefaults } from './table-defaults.svelte';
  import { tableStyles } from './table.stylex';
  import './table.css';

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
    /** Density policy root: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) — explicit ?? inherited ?? sm. */
    density?: DensityLane | QueryResult<DensityLane>;
    /** Native caption element — renders as the table title. */
    caption?: string;
    /** Compact row height (0.4rem vertical padding instead of 0.75rem). */
    dense?: boolean;
    /**
     * Fold into card rows when the frame is narrower than 30rem
     * (default). false = keep the scroll law at every width.
     */
    stack?: boolean;
    /** Native thead/tbody/tfoot markup. */
    children: Snippet;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast (the frame is the family's concentric anchor) */
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
    /**
     * Style passthrough landing on the frame — the color-freedom seam:
     * <Table style="--jx-table-hover: …"> retunes one var per instance.
     */
    style?: string;
  }

  let {
    density,
    caption = '',
    dense = false,
    stack = true,
    children,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style: styleAttribute = '',
  }: Props = $props();

  // ---- the density lane: inherit-then-provide, boundary-legal ------
  // The CAPTURE is load-bearing and EAGER (r11 first contract,
  // context-defaults-economy 3.3 — the TODO-5 bare read this replaces):
  // getDensityContext() rides the $derived.by ARGUMENT subtree, which
  // evaluates at this statement — BEFORE provideDensity writes the key —
  // so it captures the PARENT's context object; a lazily-evaluated read
  // would resolve the key to the table's OWN write and self-reference
  // through the very getter it feeds (derived_references_self). The
  // family own 'sm' lives in TableDefaults (the design-frozen local
  // fallback migration — resolveDensity's third argument is retired).
  // The W3 universal lane narrows at the legacy edge (the input-group
  // law): 'auto'/number/query lanes carry no legacy rung — the rung
  // stays ambient (§4), the coefficient rides the carriers on the root
  const legacyDensityLane = $derived(
    typeof density === 'string' && density !== 'auto' ? density : undefined,
  );
  const resolvedDensity = $derived.by(
    ((inherited) => () => resolveDensity(legacyDensityLane, inherited))(getDensityContext()),
  );
  provideDensity(() => resolvedDensity);

  // THE DEFAULTS READ POINT (context-defaults-economy 3.3 + W3-D3),
  // riding ON TOP of the provider lane as the family's single audited
  // read point: the density slot's ambient read resolves the key to
  // the table's own write, whose getter is the captured-parent
  // resolution above, so the chain TERMINATES; the slot's own 'sm' is
  // the floor (explicit → inherited → 'sm', exactly the retired inline
  // fallback); the seven sibling axes ride the same record (the frame
  // is the family's own DOM root — the a11y semantics of the
  // consumer-authored thead/tbody stay untouched). PROVIDER-SNAPSHOT
  // KERNEL LAW: density does NOT ride the provideUniversalLanes
  // literal — the reactive bridged write above carries the universal
  // density supply; the literal carries the other seven axes
  const d = $derived(TableDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }));
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  // §3/§14 radius consumption — the frame's dialect: an explicit lane
  // lands flat on the corner (effective × factor); auto stamps NOTHING
  // so the atom's var fallback keeps the frame's own site-radius
  // default (unlike the sheet's 0px invariants, this surface owns a
  // nonzero resting corner — the concentric inset form belongs to
  // nested surfaces, and the frame IS the border bearer)
  const radiusConsumed = $derived(
    d.radius !== undefined && d.radius !== 'auto'
      ? '--jx-radius-consumed: calc(var(--jx-radius-effective, 0px) * var(--jx-radius-factor-effective, 1))'
      : undefined,
  );
  const rootStyle = $derived(
    [carriers, radiusConsumed, styleAttribute].filter(Boolean).join('; ') || undefined,
  );
</script>

<figure
  bind:this={uniRoot}
  class={cx(
    'jx-table',
    tableStyles.frame,
    className,
  )}
  style={rootStyle}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
>
  <table
    data-density={densityRungOf(d.density)}
    class={cx(tableStyles.table, dense && 'dense')}
    data-stack={stack ? undefined : 'off'}
  >
    {#if caption}
      <caption class={cx(tableStyles.caption)}>{caption}</caption>
    {/if}
    {@render children()}
  </table>
</figure>
