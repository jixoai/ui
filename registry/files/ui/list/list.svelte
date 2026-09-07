<!--
  jixoai list (registry/files/ui/list/list.svelte,
  markdown-coverage-components §1.3). The PROSE list — native <ul> |
  <ol> by `ordered`, `start`/`reversed` passing through on ol only.
  Deliberately NOT list-item (the antd/F7 row system:
  item-group/item-title/item-description data rows) — this is the
  reading surface's document-flow list, and the two must never merge.

  What it OWNS is exactly the face's B8 list channels, as utilities:
  the marker (`marker ?? (ordered ? 'decimal' : 'disc')` — omitted
  keeps today's B8 restoration byte-parity; an explicit marker
  OVERRIDES), ps-6 (the 1.5rem inline indent preflight removes), and
  the marker ink — [&_li::marker]:text-muted-foreground, which
  compiles to `li::marker { color: var(--muted-foreground) }`, the B8
  law's exact form. (The design's first-choice spelling
  `[&_li]::marker:` does NOT compile under TW4 — probed with the
  site's own compiler: the oxide scanner extracts it but no rule is
  emitted, the silent half-apply the variant-grammar guards exist
  for. The bracket-pseudo form emits cleanly, so NO css residue and
  no D1 exemption were needed — the placement law's utility lane
  wins.)

  The marker vocabulary (2026-09-07, typography-context-and-parts
  §4): disc|circle|square|decimal|alpha|roman|none — element-agnostic,
  frozen small set, lowercase only (upper = the escape hatch; prose
  norm). Probed against the site's own TW 4.2.1 compiler: list-disc /
  list-decimal / list-none are core utilities, but list-circle and
  list-square SILENTLY NO-OP (the scanner accepts them, no rule is
  emitted — the exact half-apply hazard above), so every shape
  without a core utility rides the arbitrary [list-style:] form.
  Marker ink stays the B8 law; marker SIZE deliberately absent (rides
  the ambient font-size — the no-font-size kinship); spacing/density
  deliberately absent (the no-margins recorded law — a spacing axis
  would fight the container rhythm). `none` keeps ps-6 (indent is
  structural).

  NAV mode: `nav?: string` (the aria-label; presence switches the
  container) renders <nav aria-label data-jx-list-nav> wrapping the
  list, defaulting marker none + ps-0 (an explicit marker overrides
  the list-style default only — ps-0 STAYS: a nav list is chrome, the
  structural indent belongs to document flow). class/rest stay on the
  LIST element (the spec-pinned contract); the wrapper carries ONLY
  aria-label + data-jx-list-nav. Bare <a> children inside a face
  scope get the B2 chrome lane free; standalone, this component does
  NOT re-implement B2 — the docs state the lane split (plain anchors
  in-scope vs the Link part as the prose lane).

  NO paint ladder, NO defaults file (no public style prop — the
  Defaults law covers style-prop families). NO margins: preflight
  zeroes them and the rhythm/flush laws own spacing, as with heading.
  The task-item DOM-shape laws (marker suppression on
  li:has(> input), checkbox middle alignment) stay container-level in
  markdown.css — they are descendant DOM-shape laws, not list paint;
  this component never knows about them.

  The markdown map mounts the root with no-jx-pure (§2.1, the
  box-owning block escape) and recurses children inside — list_item
  stays a native <li>, so the element-based rhythm selectors and the
  container-inner sibling stack keep matching the native roots. The
  map passes ordered/start ONLY — byte-identical stamps for every
  existing document; it never emits nav/marker.
  Hook: data-jx-list="ol"|"ul" — the separator's data-orientation
  form: the hook names which native root rendered.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  /** the marker vocabulary — frozen small set, element-agnostic;
   *  lowercase only (upper = the escape hatch) */
  type ListMarker = 'disc' | 'circle' | 'square' | 'decimal' | 'alpha' | 'roman' | 'none';

  interface Props extends HTMLAttributes<HTMLUListElement> {
    /** true → <ol> (ordered markers, `start`/`reversed` honored);
     *  false → <ul> */
    ordered?: boolean;
    /** the marker style; omitted → the per-element platform default
     *  (decimal on ol, disc on ul — today's B8 restoration,
     *  byte-parity); in nav mode omitted defaults to none */
    marker?: ListMarker;
    /** presence switches the nav container: the aria-label of a
     *  <nav data-jx-list-nav> wrapper (marker defaults none, ps-0) */
    nav?: string;
    /** the first marker value of an ordered list (ol-only passthrough;
     *  ignored on ul — the native element carries no such attribute) */
    start?: number;
    /** descending marker order (ol-only passthrough, the start/reversed
     *  native pair; ignored on ul) */
    reversed?: boolean;
    /** the list items — native <li> children (or component trees that
     *  render them); this component styles the list, never the item */
    children?: Snippet;
    class?: string;
  }

  let {
    ordered = false,
    marker,
    nav,
    start,
    reversed,
    children,
    class: className = '',
    ...rest
  }: Props = $props();

  // marker resolution: explicit OVERRIDES; omitted keeps the per-element
  // platform law (the B8 restoration byte-parity) — except in nav mode,
  // where omitted means none (chrome list, no document-flow marker)
  const resolvedMarker = $derived(marker ?? (nav !== undefined ? 'none' : ordered ? 'decimal' : 'disc'));

  // probed against the site's TW 4.2.1 compiler: circle/square have NO
  // core utility (silent no-op) — the arbitrary [list-style:] form is
  // the only honest spelling for them; disc/decimal/none ride core
  // utilities (today's byte-parity stamps)
  const MARKER_UTILITIES = {
    disc: 'list-disc',
    circle: '[list-style:circle]',
    square: '[list-style:square]',
    decimal: 'list-decimal',
    alpha: '[list-style:lower-alpha]',
    roman: '[list-style:lower-roman]',
    none: 'list-none',
  } as const;

  // the B8 channels as utilities; the nav mode drops the structural
  // indent (ps-0 stays even with an explicit marker — chrome list)
  const listClass = $derived(
    cn(
      MARKER_UTILITIES[resolvedMarker],
      nav !== undefined ? 'ps-0' : 'ps-6',
      '[&_li::marker]:text-muted-foreground',
      className,
    ),
  );
</script>

{#snippet theList()}
  <!-- the dual-root cast follows separator: Props is typed on the ul
       shape (the unordered default), the ol branch spreads the same
       rest through the ol element type — the only ol-only attributes
       this component surfaces are `start` and `reversed`, declared
       and passed explicitly above -->
  {#if ordered}
    <ol data-jx-list="ol" class={listClass} {start} {reversed} {...(rest as HTMLAttributes<HTMLOListElement>)}>
      {@render children?.()}
    </ol>
  {:else}
    <ul data-jx-list="ul" class={listClass} {...rest}>
      {@render children?.()}
    </ul>
  {/if}
{/snippet}

{#if nav !== undefined}
  <!-- the wrapper carries ONLY the landmark semantics (F14 pin) —
       class/rest stay on the LIST element -->
  <nav aria-label={nav} data-jx-list-nav>
    {@render theList()}
  </nav>
{:else}
  {@render theList()}
{/if}
