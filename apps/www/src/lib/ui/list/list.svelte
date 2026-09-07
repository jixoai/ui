<!--
  jixoai list (registry/files/ui/list/list.svelte,
  markdown-coverage-components §1.3). The PROSE list — native <ul> |
  <ol> by `ordered`, `start` passing through on ol only. Deliberately
  NOT list-item (the antd/F7 row system: item-group/item-title/
  item-description data rows) — this is the reading surface's
  document-flow list, and the two must never merge.

  What it OWNS is exactly the face's B8 list channels, as utilities:
  list-disc | list-decimal by `ordered`, ps-6 (the 1.5rem inline
  indent preflight removes), and the marker ink —
  [&_li::marker]:text-muted-foreground, which compiles to
  `li::marker { color: var(--muted-foreground) }`, the B8 law's exact
  form. (The design's first-choice spelling `[&_li]::marker:` does
  NOT compile under TW4 — probed with the site's own compiler: the
  oxide scanner extracts it but no rule is emitted, the silent
  half-apply the variant-grammar guards exist for. The bracket-pseudo
  form emits cleanly, so NO css residue and no D1 exemption were
  needed — the placement law's utility lane wins.)

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
  container-inner sibling stack keep matching the native roots.
  Hook: data-jx-list="ol"|"ul" — the separator's data-orientation
  form: the hook names which native root rendered.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLUListElement> {
    /** true → <ol> (decimal markers, `start` honored); false → <ul> */
    ordered?: boolean;
    /** the first marker value of an ordered list (ol-only passthrough;
     *  ignored on ul — the native element carries no such attribute) */
    start?: number;
    /** the list items — native <li> children (or component trees that
     *  render them); this component styles the list, never the item */
    children?: Snippet;
    class?: string;
  }

  let { ordered = false, start, children, class: className = '', ...rest }: Props = $props();
</script>

{#if ordered}
  <!-- the dual-root cast follows separator: Props is typed on the ul
       shape (the unordered default), the ol branch spreads the same
       rest through the ol element type — the only ol-only attribute
       this component surfaces is `start`, declared and passed
       explicitly above -->
  <ol
    data-jx-list="ol"
    class={cn('list-decimal ps-6 [&_li::marker]:text-muted-foreground', className)}
    {start}
    {...(rest as HTMLAttributes<HTMLOListElement>)}
  >
    {@render children?.()}
  </ol>
{:else}
  <ul
    data-jx-list="ul"
    class={cn('list-disc ps-6 [&_li::marker]:text-muted-foreground', className)}
    {...rest}
  >
    {@render children?.()}
  </ul>
{/if}
