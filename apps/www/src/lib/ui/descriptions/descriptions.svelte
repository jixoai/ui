<!--
  jixoai descriptions (registry/files/ui/descriptions.svelte).
  The enterprise detail view (antd's staple), W3C-first: a dl IS a
  description list — dt/dd pairs in source order, laid out as a grid
  of term/value cells. The ruling: descriptions never disguises as a
  table; the bordered look is CSS on the same dl, not different
  semantics. columns=N splits rows into N term/value pairs per row
  (responsive down to 1 on narrow containers via container queries —
  the consumer's container owns the width).

  tw4 (2026-08-24): static paint + the column math ride token
  utilities in the markup (columns flow through the --jx-desc-cols
  custom property on an arbitrary-value grid template); ONLY the
  narrow-container @container fallback stays in descriptions.css —
  D1-exempt residue (container queries on the element itself never
  self-match, so no utility can express it).
-->
<script lang="ts">
  export interface DescriptionItem {
    term: string;
    /** plain value text; compose richer cells through the value snippet */
    value?: string;
  }

  interface Props {
    items: DescriptionItem[];
    /** term/value pairs per row (default 1; responsive clamp to 1) */
    columns?: number;
    /** hairline cell borders (the "bordered" antd look, CSS not table) */
    bordered?: boolean;
    /** optional per-item rich cell — snippet keyed by the item */
    value?: Snippet<[DescriptionItem, number]>;
    class?: string;
  }

  let { items, columns = 1, bordered = false, value, class: className = '' }: Props = $props();

  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import './descriptions.css';

  const cols = $derived(Math.max(1, Math.min(4, Math.trunc(columns))));
</script>

<dl
  class={cn(
    'jx-desc grid grid-cols-[repeat(var(--jx-desc-cols),minmax(0,1fr))] gap-0 m-0 @container',
    bordered && 'jx-desc-bordered border border-border bg-card',
    className,
  )}
  style="--jx-desc-cols: {cols}"
>
  {#each items as item, index (item.term + index)}
    <div class={cn('jx-desc-cell grid grid-cols-[minmax(7rem,12rem)_1fr] min-w-0', bordered && 'border-b border-border')}>
      <dt class={cn('jx-desc-term truncate px-3 py-2 font-nav text-[0.6875rem] tracking-[0.12em] uppercase text-muted-foreground', bordered && 'bg-muted border-r border-border')}>{item.term}</dt>
      <dd class="jx-desc-value m-0 px-3 py-2 text-[0.8125rem] leading-[1.5] text-foreground min-w-0 [overflow-wrap:anywhere]">
        {#if value}
          {@render value(item, index)}
        {:else}
          {item.value ?? '—'}
        {/if}
      </dd>
    </div>
  {/each}
</dl>
