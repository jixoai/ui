<!--
  jixoai IconTable — the icon vocabulary reference table (icons-docs,
  2026-09-02). Sister of TokenTable (same folder/table shape), but the
  first column is a LIVE GLYPH PREVIEW instead of text: the preview
  element paints the vocabulary face itself (`mask`/`background`:
  var(--jx-icon-<slot>)) — never a hand-pasted SVG. Dogfood law: the
  preview column follows the vocabulary sheet, so a slot that changes
  geometry changes here with zero edit.

  Columns: glyph | slot | consumer | technique | overridable (the
  plugin CONCEPT slot that re-bakes this variable, '—' when the
  variable is not plugin-overridable).

  Site-internal lib (NOT in the registry — TokenTable's pure-text
  contract stays untouched for its many existing consumers).
-->
<script lang="ts">
  import { siteChrome } from '$lib/surface/site-chrome.stylex';

  export interface IconRow {
    /** the vocabulary variable, e.g. '--jx-icon-calendar' */
    readonly slot: string;
    /**
     * the paint expression the preview consumes — the vocabulary face
     * itself: `var(--jx-icon-calendar)` for :root slots, or the sheet's
     * var(--slot, <inline-fallback-uri>) embedding law for slots that
     * only exist as inline fallbacks (palette) or land with a parallel
     * batch (check).
     */
    readonly paint: string;
    /** which rule/element paints the slot */
    readonly consumer: string;
    /** 'mask' | 'background-image' | 'mask + background-image' (multi-consumer slots) */
    readonly technique: string;
    /** the plugin concept slot whose override re-bakes this variable ('—' = not overridable) */
    readonly concept: string;
  }

  interface Props {
    rows: IconRow[];
    class?: string;
  }

  let { rows, class: className = '' }: Props = $props();

  // the preview paints with the first technique the slot owns (mask
  // wins ties — it themes through currentColor, the richer face)
  const paintsAsMask = (technique: string): boolean => technique.includes('mask');

  // full style strings (not style: directives) so the paint expression
  // stays byte-inspectable in the DOM — the preview contract the page
  // spec locks on (data-jx-icon-preview carries var(--jx-icon-…)
  const previewStyle = (row: IconRow): string =>
    paintsAsMask(row.technique)
      ? `background-color: currentColor; -webkit-mask: ${row.paint} center / contain no-repeat; mask: ${row.paint} center / contain no-repeat;`
      : `background: ${row.paint} center / contain no-repeat;`;

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
</script>

<div class={cx(siteChrome.itScroller, className)}>
  <table class={cx(siteChrome.itTable)} data-jx-icon-table>
    <thead>
      <tr class={cx(siteChrome.itHeadRow)}>
        <th class={cx(siteChrome.itHeadCell)}>Glyph</th>
        <th class={cx(siteChrome.itHeadCell)}>Slot</th>
        <th class={cx(siteChrome.itHeadCell)}>Consumer</th>
        <th class={cx(siteChrome.itHeadCell)}>Technique</th>
        <th class={cx(siteChrome.itHeadCell)}>Overridable</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.slot)}
        <tr class={cx(siteChrome.itRow)}>
          <td class={cx(siteChrome.itCell)}>
            <span
              data-jx-icon-preview=""
              data-jx-icon-preview-slot={row.slot}
              aria-hidden="true"
              style={previewStyle(row)}
              class={cx(siteChrome.itPreview)}
            ></span>
          </td>
          <td class={cx(siteChrome.itSlotCell)}>
            {row.slot}
          </td>
          <td class={cx(siteChrome.itConsumerCell)}>
            {row.consumer}
          </td>
          <td class={cx(siteChrome.itTechniqueCell)}>
            {row.technique}
          </td>
          <td class={cx(siteChrome.itConceptCell)}>
            {row.concept}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
