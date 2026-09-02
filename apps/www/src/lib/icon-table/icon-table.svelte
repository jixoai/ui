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
  import { cn } from '$lib/utils';

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
</script>

<div class={cn('w-full overflow-x-auto', className)}>
  <table class="w-full border-collapse text-left" data-jx-icon-table>
    <thead>
      <tr class="border-b border-border">
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Glyph</th>
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Slot</th>
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Consumer</th>
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Technique</th>
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Overridable</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.slot)}
        <tr class="border-b border-border/50">
          <td class="py-[var(--jx-stack)] px-[var(--jx-inset)]">
            <span
              data-jx-icon-preview=""
              data-jx-icon-preview-slot={row.slot}
              aria-hidden="true"
              style={previewStyle(row)}
              class="block size-5 rounded-[2px] bg-clip-border"
            ></span>
          </td>
          <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text)] whitespace-nowrap">
            {row.slot}
          </td>
          <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text-secondary)] text-muted-foreground">
            {row.consumer}
          </td>
          <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text-secondary)] text-muted-foreground whitespace-nowrap">
            {row.technique}
          </td>
          <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text)]">
            {row.concept}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
