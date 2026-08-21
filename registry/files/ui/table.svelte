<!--
  jixoai table (registry/files/ui/table.svelte).
  Native <table> with the full semantic set preserved — thead/tbody/tfoot/
  th/td/caption stay real elements authored by the consumer as the children
  snippet; the <figure> wrapper owns only the hairline frame and the
  responsive overflow-x scroll (the table keeps min-width: fit-content so
  columns never compress; narrow viewports scroll natively). Numeric columns
  opt into right alignment with consumer classes; the component never
  forces it.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** Native caption element — renders as the table title. */
    caption?: string;
    /** Compact row height (0.4rem vertical padding instead of 0.75rem). */
    dense?: boolean;
    /** Native thead/tbody/tfoot markup. */
    children: Snippet;
    class?: string;
  }

  let { caption = '', dense = false, children, class: className = '' }: Props = $props();
</script>

<figure class={`jx-table ${className}`}>
  <table class:dense={dense}>
    {#if caption}
      <caption>{caption}</caption>
    {/if}
    {@render children()}
  </table>
</figure>

<style>
  .jx-table {
    border: 1px solid color-mix(in oklab, var(--border) 18%, transparent);
    margin: 0;
    overflow-x: auto;
  }

  .jx-table table {
    border-collapse: collapse;
    font-size: 12.5px;
    line-height: 1.5;
    min-width: fit-content;
    width: 100%;
  }

  .jx-table caption {
    caption-side: top;
    color: var(--muted-foreground);
    font-size: 12px;
    padding-bottom: 0.5rem;
    text-align: left;
  }

  .jx-table :global(th),
  .jx-table :global(td) {
    border-bottom: 1px solid color-mix(in oklab, var(--border) 12%, transparent);
    padding: 0.75rem;
    text-align: left;
    vertical-align: top;
  }

  .jx-table :global(thead th) {
    background: var(--muted);
    border-bottom: 1px solid color-mix(in oklab, var(--border) 18%, transparent);
    color: var(--muted-foreground);
    font-family: var(--font-nav);
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .jx-table :global(tbody tr) {
    transition: background-color 150ms ease-out;
  }
  .jx-table :global(tbody tr:hover) {
    background: color-mix(in oklab, var(--muted) 55%, transparent);
  }

  .jx-table :global(tfoot th),
  .jx-table :global(tfoot td) {
    border-bottom: none;
    border-top: 1px solid color-mix(in oklab, var(--border) 18%, transparent);
    font-weight: 500;
  }

  /* the figure frame closes the outer edge — no doubled bottom hairline */
  .jx-table :global(tbody tr:last-child td) {
    border-bottom: none;
  }

  .jx-table table.dense :global(th),
  .jx-table table.dense :global(td) {
    padding: 0.4rem 0.75rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-table :global(tbody tr) {
      transition: none;
    }
  }
</style>
