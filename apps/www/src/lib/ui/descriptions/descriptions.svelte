<!--
  jixoai descriptions — the ROOT half (registry/files/ui/descriptions.svelte,
  composition-first-apis, 2026-08-25).
  The enterprise detail view (antd's staple), W3C-first and now
  composed: a dl IS a description list — dt/dd pairs in source order,
  laid out as a grid of term/value cells, one DescriptionsItem per
  pair:

    <Descriptions columns={2} bordered>
      <DescriptionsItem term="Owner">gaubee</DescriptionsItem>
    </Descriptions>

  The ruling stands: descriptions never disguises as a table; the
  bordered look is CSS on the same dl, not different semantics.
  columns=N splits rows into N term/value pairs per row (responsive
  down to 1 on narrow containers via container queries — the
  consumer's container owns the width). Both are HOW-props (they
  change how the grid paints, never what renders) and stay on the
  root; `bordered` rides context down to the Items for their hairline
  paint.
-->
<script lang="ts" module>
  /** context surface the family shares (import type where needed) */
  export interface DescriptionsApi {
    /** the bordered hairline frame — Items paint their cell edges from it */
    readonly bordered: boolean;
  }

  /** context key — global symbol registry, independent registry items */
  export const DESCRIPTIONS_KEY = Symbol.for('jx-descriptions');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import './descriptions.css';

  interface Props extends HTMLAttributes<HTMLDListElement> {
    density?: Density;
    /** term/value pairs per row (default 1; responsive clamp to 1) */
    columns?: number;
    /** hairline cell borders (the "bordered" antd look, CSS not table) */
    bordered?: boolean;
    class?: string;
    children: Snippet;
  }

  let { density, columns = 1, bordered = false, class: className = '', children, ...rest }: Props = $props();

  const cols = $derived(Math.max(1, Math.min(4, Math.trunc(columns))));
  const resolvedDensity = $derived(resolveDensity(density, getDensityContext()));

  setContext<DescriptionsApi>(DESCRIPTIONS_KEY, {
    get bordered() {
      return bordered;
    },
  });
</script>

<dl
  data-jx-desc-bordered={bordered ? '' : undefined}
  data-density={resolvedDensity}
  class={cn(
    'jx-desc grid grid-cols-[repeat(var(--jx-desc-cols),minmax(0,1fr))] gap-0 m-0 @container',
    bordered && 'border border-border bg-card',
    className,
  )}
  {...rest}
  style="--jx-desc-cols: {cols}"
>
  {@render children()}
</dl>
