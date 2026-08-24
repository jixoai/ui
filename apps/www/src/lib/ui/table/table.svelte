<!--
  jixoai table (registry/files/ui/table.svelte).

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
     token surface below; defaults follow the theme sheet, and hover
     already carries the --brand-hue flow (one number recolors it).
     Override per instance: <Table style="--jx-table-hover: …">.
  5. semantics — thead/tbody/tfoot/th/td/caption stay real elements
     authored by the consumer as the children snippet; rows are never
     wrapped, and numeric alignment stays a consumer class.

  Zero dependencies. td/th paint an opaque --jx-table-surface so sticky
  cells mask the content scrolling under them (transparent cells would
  leak it). Dense mode survives both laws.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
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
    class?: string;
    /**
     * Style passthrough landing on the frame — the color-freedom seam:
     * <Table style="--jx-table-hover: …"> retunes one var per instance.
     */
    style?: string;
  }

  let {
    caption = '',
    dense = false,
    stack = true,
    children,
    class: className = '',
    style: styleAttribute = '',
  }: Props = $props();
</script>

<figure class={`jx-table ${className}`} style={styleAttribute}>
  <table class:dense={dense} data-stack={stack ? undefined : 'off'}>
    {#if caption}
      <caption>{caption}</caption>
    {/if}
    {@render children()}
  </table>
</figure>

<style>
  .jx-table {
    /* color-freedom surface — one var each, theme-token defaults */
    --jx-table-surface: var(--background);
    --jx-table-head: var(--muted);
    --jx-table-hover: color-mix(in oklab, var(--primary) 7%, var(--jx-table-surface));
    --jx-table-hairline: color-mix(in oklab, var(--border) 12%, transparent);
    --jx-table-rule: color-mix(in oklab, var(--border) 18%, transparent);
    --jx-table-edge: color-mix(in oklab, var(--border) 34%, transparent);

    border: 1px solid var(--jx-table-rule);
    border-radius: var(--radius);
    container: jx-table / inline-size;
    margin: 0;
    overflow-x: auto;
  }

  .jx-table table {
    border-collapse: separate; /* sticky law: collapsed borders tear */
    border-spacing: 0;
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
    text-align: start;
  }

  .jx-table :global(th),
  .jx-table :global(td) {
    background: var(--jx-table-surface); /* opaque: masks scrolled rows */
    border-bottom: 1px solid var(--jx-table-hairline);
    padding: 0.75rem;
    text-align: start;
    vertical-align: top;
  }

  .jx-table :global(thead th) {
    background: var(--jx-table-head);
    border-bottom: 1px solid var(--jx-table-rule);
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
  .jx-table :global(tbody tr:hover th),
  .jx-table :global(tbody tr:hover td) {
    background: var(--jx-table-hover);
  }

  .jx-table :global(tfoot th),
  .jx-table :global(tfoot td) {
    border-bottom: none;
    border-top: 1px solid var(--jx-table-rule);
    font-weight: 500;
  }

  /* the figure frame closes the outer edge — no doubled bottom hairline */
  .jx-table :global(tbody tr:last-child td),
  .jx-table :global(tbody tr:last-child th) {
    border-bottom: none;
  }

  .jx-table table.dense :global(th),
  .jx-table table.dense :global(td) {
    padding: 0.4rem 0.75rem;
  }

  /* ------------------------------------------------------------------
     scroll law (frame ≥ 30rem): pin consumer columns to the scrollport.
     Inside @container the scope anchor is the component-rendered table
     (the container itself never matches its own query).
  ------------------------------------------------------------------ */
  @container jx-table (width >= 30rem) {
    table :global([data-sticky='start']),
    table :global([data-sticky='end']) {
      position: sticky;
    }
    /* logical insets + logical fold borders: RTL mirrors for free */
    table :global([data-sticky='start']) {
      border-inline-end: 1px solid var(--jx-table-edge);
      inset-inline-start: 0;
    }
    table :global([data-sticky='end']) {
      border-inline-start: 1px solid var(--jx-table-edge);
      inset-inline-end: 0;
    }
    table :global(thead [data-sticky]) {
      z-index: 3;
    }
    table :global(tbody [data-sticky]),
    table :global(tfoot [data-sticky]) {
      z-index: 2;
    }
  }

  /* ------------------------------------------------------------------
     stack law (frame < 30rem): the CodePen card mode. Every rule rides
     table:not([data-stack='off']) so stack={false} keeps the table a
     table at any width.
  ------------------------------------------------------------------ */
  @container jx-table (width < 30rem) {
    table:not([data-stack='off']) {
      display: block;
      min-width: 0;
      width: 100%;
    }
    table:not([data-stack='off']) :global(thead) {
      display: none;
    }
    table:not([data-stack='off']) :global(tbody tr) {
      border-bottom: 1px solid var(--jx-table-hairline);
      display: block;
    }
    table:not([data-stack='off']) :global(tbody tr:last-child) {
      border-bottom: none;
    }

    table:not([data-stack='off']) :global(td) {
      align-items: baseline;
      border-bottom: none;
      display: flex;
      gap: 1.25rem;
      justify-content: space-between;
    }
    /* label:value row — only cells that carry data-label get one */
    table:not([data-stack='off']) :global(td[data-label])::before {
      color: var(--muted-foreground);
      content: attr(data-label);
      flex: none;
      font-family: var(--font-nav);
      font-size: 10px;
      letter-spacing: 0.12em;
      text-align: start;
      text-transform: uppercase;
    }
    table:not([data-stack='off']) :global(td:not([data-label])) {
      justify-content: flex-start;
    }
    /* first cell becomes the card head; the hover law still tints it —
       the head paint would otherwise out-cascade the row hover */
    table:not([data-stack='off']) :global(tbody td:first-child) {
      background: var(--jx-table-head);
      color: var(--foreground);
      font-weight: 500;
    }
    table:not([data-stack='off']) :global(tbody tr:hover td:first-child) {
      background: color-mix(in oklab, var(--jx-table-hover) 55%, var(--jx-table-head));
    }

    /* tfoot: same flex law, closes with the rule hairline */
    table:not([data-stack='off']) :global(tfoot) {
      border-top: 1px solid var(--jx-table-rule);
      display: block;
    }
    table:not([data-stack='off']) :global(tfoot tr) {
      display: block;
    }
    table:not([data-stack='off']) :global(tfoot th),
    table:not([data-stack='off']) :global(tfoot td) {
      border-top: none;
      display: flex;
      gap: 1.25rem;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-table :global(tbody tr) {
      transition: none;
    }
  }
</style>
