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
  import { cn } from '$lib/utils';
  import { getDensityContext, provideDensity, resolveDensity, type Density } from '$lib/density.svelte';
  import './table.css';

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

  const inheritedDensity = getDensityContext();
  const resolvedDensity = $derived(resolveDensity(density, inheritedDensity, 'sm'));
  provideDensity(() => resolvedDensity);
</script>

<figure
  class={cn(
    'jx-table m-0 overflow-x-auto border border-[color:var(--jx-table-rule)] rounded-(--radius) [container:jx-table_/_inline-size]',
    '[--jx-table-surface:var(--background)]',
    '[--jx-table-head:var(--muted)]',
    '[--jx-table-hover:color-mix(in_oklab,var(--primary)_7%,var(--jx-table-surface))]',
    '[--jx-table-hairline:color-mix(in_oklab,var(--border)_12%,transparent)]',
    '[--jx-table-rule:color-mix(in_oklab,var(--border)_18%,transparent)]',
    '[--jx-table-edge:color-mix(in_oklab,var(--border)_34%,transparent)]',
    className,
  )}
  style={styleAttribute}
  data-density={resolvedDensity}
>
  <table
    data-density={resolvedDensity}
    class={cn('w-full min-w-fit border-separate border-spacing-0 [font-size:var(--jx-text)] [line-height:var(--jx-line)]', dense && 'dense')}
    data-stack={stack ? undefined : 'off'}
  >
    {#if caption}
      <caption class="caption-top [padding-block-end:var(--jx-stack)] text-start [font-size:var(--jx-text-secondary)] [line-height:var(--jx-line-secondary)] text-muted-foreground">{caption}</caption>
    {/if}
    {@render children()}
  </table>
</figure>
