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
  import { getDensityContext, provideDensity, resolveDensity, type Density } from '$lib/density.svelte';
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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  interface Props {
    /** Density policy root: explicit ?? inherited ?? sm. */
    density?: Density;
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
    density,
    caption = '',
    dense = false,
    stack = true,
    children,
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
  // fallback migration — resolveDensity's third argument is retired)
  const resolvedDensity = $derived.by(
    ((inherited) => () => resolveDensity(density, inherited))(getDensityContext()),
  );
  provideDensity(() => resolvedDensity);

  // THE DEFAULTS READ POINT (context-defaults-economy 3.3), riding ON
  // TOP of the provider lane as the family's single audited read point:
  // the density slot's ambient read resolves the key to the table's own
  // write, whose getter is the captured-parent resolution above, so the
  // chain TERMINATES; the slot's own 'sm' is the floor (explicit →
  // inherited → 'sm', exactly the retired inline fallback)
  const d = $derived(TableDefaults.resolve({ density }));
</script>

<figure
  class={cx(
    'jx-table',
    tableStyles.frame,
    className,
  )}
  style={styleAttribute}
  data-density={d.density}
>
  <table
    data-density={d.density}
    class={cx(tableStyles.table, dense && 'dense')}
    data-stack={stack ? undefined : 'off'}
  >
    {#if caption}
      <caption class={cx(tableStyles.caption)}>{caption}</caption>
    {/if}
    {@render children()}
  </table>
</figure>
