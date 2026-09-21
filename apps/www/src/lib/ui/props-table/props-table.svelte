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
    class?: string;
  }

  let {
    props,
    meta,
    docs,
    title = 'Properties',
    universal = false,
    class: className = '',
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
  // renders, the eight axis rows leave the main table (the section is
  // their one home — no duplication)
  let showUniversal = $derived(universal || (meta != null && metaHasUniversalSurface(meta)));
  let mainRows = $derived(showUniversal ? rows.filter((row) => !UNIVERSAL_AXIS_NAMES.has(row.name)) : rows);
  let uniRows = $derived(showUniversal ? universalRows(meta) : []);
  if (!meta && !props) {
    console.warn('[PropsTable] neither `meta` nor `props` given — empty table');
  }
</script>

<!-- data-jx-props-table-scroll: the print-projection markup contract
     (paged-doc-family, 2026-08-30) — the audited unlayered whitelist
     flattens this wrapper's overflow under print/sim so wide API
     tables flow instead of clipping. Component-owned stamp: pages
     never hand-write it (source-guarded). -->
<div data-jx-props-table-scroll="" class={cn(cx(propsTableStyles.scroller), className)}>
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
