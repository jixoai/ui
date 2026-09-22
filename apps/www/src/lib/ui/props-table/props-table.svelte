<!--
  jixoai PropsTable — the API reference table (Material3 API section).
  Four columns: Property | Type | Default | Description.

  Sources (docs-demo-standard 4.1): EITHER the single source of truth —
  the component's GENERATED meta (`meta` + the `docs` curation layer,
  see from-meta.ts) — OR the legacy hand-written `props` array kept as
  a fallback so unmigrated pages render unchanged. The table element
  carries data-doc-props-table: the skeleton lint's API-section marker.

  Ambient column (context-defaults-economy 4.3): a slot-carrying prop's
  `ambient` IR field renders in the Default column as the frozen
  three-state marker — `ambient zone` / `ambient scope` /
  `Own default, not ambient` — appended after the own value when one is
  statically extractable, alone otherwise (the hand-written track's
  foot-note wording, promoted to the meta chain).

  The EIGHT-AXIS SURFACE (explicit-props W3-D4, siteOnly): size ·
  shape · radius · density · color · theme · elevation · motion ride
  PropsTableDefaults (first-time, all no-own) on the scroller root.
  Load-bearing infra discipline: the adoption is MINIMAL and ADDITIVE —
  with no lane passed nothing stamps and the rendered tables (the
  shared Universal props section included) are byte-identical to the
  pre-D4 form; the section this component renders is untouched.
-->
<script lang="ts">
  import { cn } from '$lib/utils';
  import {
    propsFromMeta,
    universalRows,
    UNIVERSAL_AXIS_NAMES,
    metaHasUniversalSurface,
    type PropsDocs,
  } from './from-meta';
  import { propsTableStyles } from './props-table.stylex';
  import './props-table.css';
  import type { AmbientKind, ComponentMeta } from '$lib/schema/ir';
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
  import { PropsTableDefaults } from './props-table-defaults.svelte';

  export interface PropEntry {
    name: string;
    type: string;
    default?: string;
    description: string;
    required?: boolean;
    bindable?: boolean;
    /** defaults-contract state — rendered as the Default-column marker
     * (context-defaults-economy 4.3; the three frozen spellings) */
    ambient?: AmbientKind;
  }

  /** The frozen three-state wording (design r11 #4), verbatim. */
  const AMBIENT_MARKER: Record<AmbientKind, string> = {
    zone: 'ambient zone',
    scope: 'ambient scope',
    own: 'Own default, not ambient',
  };

  /** the Default cell: own value + marker when both exist, marker alone
   * for the no-own slots (the ambient css scope lane), legacy path
   * untouched — composed in one expression so Svelte never trims the
   * separator edges */
  const defaultCell = (prop: PropEntry): string =>
    !prop.ambient
      ? (prop.default ?? '—')
      : prop.default !== undefined && prop.default !== '—'
        ? `${prop.default} · ${AMBIENT_MARKER[prop.ambient]}`
        : AMBIENT_MARKER[prop.ambient];

  interface Props {
    /** legacy hand-written rows (fallback; unmigrated pages) */
    props?: PropEntry[];
    /** the GENERATED meta — the single source of truth */
    meta?: ComponentMeta;
    /** docs curation layered over the meta (prose, flags, corrections) */
    docs?: PropsDocs;
    title?: string;
    /** render the shared "Universal props" section (the eight-axis
     * surface, from the ONE shared source — explicit-props W3-A
     * pulled-forward 4.3). Meta tables auto-detect (the family's own
     * props carry the axis names); hand-written tables pass it once —
     * the rows themselves are never hand-copied */
    universal?: boolean;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (one number scales the
     *  reference table) */
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
    props,
    meta,
    docs,
    title = 'Properties',
    universal = false,
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

  // meta wins when both are given (the migration's direction); neither
  // is a dev-mode bug, named loudly instead of rendering an empty table
  let rows: PropEntry[] = $derived(meta ? propsFromMeta(meta, docs) : (props ?? []));
  // the universal section: meta tables auto-detect the family's axis
  // surface; hand-written tables opt in with the bare flag. When it
  // renders, the GENERATED axis rows leave the main table (the section
  // is their one home — no duplication). The curation's extra lane is
  // EXEMPT: those rows are deliberate docs (chip/badge's family-local
  // `shape`, the attachment/bind:this handles) — dropping them by name
  // would document an absent prop, the exact drift the lane exists to
  // kill (reference identity: propsFromMeta spreads docs.extra as-is).
  let showUniversal = $derived(universal || (meta != null && metaHasUniversalSurface(meta)));
  let extraRows = $derived(new Set(docs?.extra ?? []));
  let mainRows = $derived(
    showUniversal
      ? rows.filter((row) => !UNIVERSAL_AXIS_NAMES.has(row.name) || extraRows.has(row))
      : rows,
  );
  let uniRows = $derived(showUniversal ? universalRows(meta) : []);
  if (!meta && !props) {
    console.warn('[PropsTable] neither `meta` nor `props` given — empty table');
  }

  // ── the eight-axis surface (W3-D4 — FIRST-TIME contract, all
  // no-own): one resolution record AFTER the table derivation (the
  // carriers join the consumer style attr, the merge law); the supply
  // + the query() anchor follow the standard wiring (the anchor
  // after the state decl). Minimal + additive: nothing stamps when
  // no lane is passed — the rendered tables are unchanged
  const d = $derived(
    PropsTableDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(
    [carriers, consumerStyle ?? undefined].filter(Boolean).join('; ') || undefined,
  );
</script>

<!-- data-jx-props-table-scroll: the print-projection markup contract
     (paged-doc-family, 2026-08-30) — the audited unlayered whitelist
     flattens this wrapper's overflow under print/sim so wide API
     tables flow instead of clipping. Component-owned stamp: pages
     never hand-write it (source-guarded). -->
<div
  data-jx-props-table-scroll=""
  bind:this={uniRoot}
  class={cn(cx(propsTableStyles.scroller), className)}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
>
  {#if title}
    <h4 data-jx-props-table-title="" class={cx(propsTableStyles.title)}>{title}</h4>
  {/if}
  <table data-doc-props-table="" class={cx(propsTableStyles.table)}>
    <thead>
      <tr class={cx(propsTableStyles.headRow)}>
        <th class={cx(propsTableStyles.headCell)}>Property</th>
        <th class={cx(propsTableStyles.headCell)}>Type</th>
        <th class={cx(propsTableStyles.headCell)}>Default</th>
        <th class={cx(propsTableStyles.headCell)}>Description</th>
      </tr>
    </thead>
    <tbody>
      {#each mainRows as prop (prop.name)}
        <tr class={cx(propsTableStyles.bodyRow)}>
          <td class={cx(propsTableStyles.nameCell)}>
            {prop.name}
            {#if prop.required}<span class={cx(propsTableStyles.required)}>*</span>{/if}
            {#if prop.bindable}<code class={cx(propsTableStyles.bindChip)}>bind</code>{/if}
          </td>
          <td class={cx(propsTableStyles.typeCell)}>
            {prop.type}
          </td>
          <td class={cx(propsTableStyles.defaultCell)}>
            {defaultCell(prop)}
          </td>
          <td class={cx(propsTableStyles.descriptionCell)}>
            {prop.description}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if showUniversal}
    <!-- the universal eight-axis section (explicit-props §0/§17): rows
         from the ONE shared source (meta.universal / the shared
         artifact); every axis defaults 'auto' and resolves
         explicit ?? ambient ?? 'auto'; query() wraps any lane for
         responsive/container-conditional values -->
    <h4 data-jx-props-table-universal="" class={cx(propsTableStyles.title)}>Universal props</h4>
    <table data-doc-props-table="" class={cx(propsTableStyles.table)}>
      <thead>
        <tr class={cx(propsTableStyles.headRow)}>
          <th class={cx(propsTableStyles.headCell)}>Property</th>
          <th class={cx(propsTableStyles.headCell)}>Type</th>
          <th class={cx(propsTableStyles.headCell)}>Default</th>
          <th class={cx(propsTableStyles.headCell)}>Description</th>
        </tr>
      </thead>
      <tbody>
        {#each uniRows as prop (prop.name)}
          <tr class={cx(propsTableStyles.bodyRow)}>
            <td class={cx(propsTableStyles.nameCell)}>
              {prop.name}
            </td>
            <td class={cx(propsTableStyles.typeCell)}>
              {prop.type}
            </td>
            <td class={cx(propsTableStyles.defaultCell)}>
              {defaultCell(prop)}
            </td>
            <td class={cx(propsTableStyles.descriptionCell)}>
              {prop.description}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
