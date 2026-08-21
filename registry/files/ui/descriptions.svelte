<!--
  jixoai descriptions (registry/files/ui/descriptions.svelte).
  The enterprise detail view (antd's staple), W3C-first: a dl IS a
  description list — dt/dd pairs in source order, laid out as a grid
  of term/value cells. The ruling: descriptions never disguises as a
  table; the bordered look is CSS on the same dl, not different
  semantics. columns=N splits rows into N term/value pairs per row
  (responsive down to 1 on narrow containers via container queries —
  the consumer's container owns the width).
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

  const cols = $derived(Math.max(1, Math.min(4, Math.trunc(columns))));
</script>

<dl
  class="jx-desc {className}"
  class:jx-desc-bordered={bordered}
  style="--jx-desc-cols: {cols}"
>
  {#each items as item, index (item.term + index)}
    <div class="jx-desc-cell">
      <dt class="jx-desc-term">{item.term}</dt>
      <dd class="jx-desc-value">
        {#if value}
          {@render value(item, index)}
        {:else}
          {item.value ?? '—'}
        {/if}
      </dd>
    </div>
  {/each}
</dl>

<style>
  .jx-desc {
    display: grid;
    grid-template-columns: repeat(var(--jx-desc-cols), minmax(0, 1fr));
    gap: 0;
    margin: 0;
    container-type: inline-size;
  }
  .jx-desc-cell {
    display: grid;
    grid-template-columns: minmax(7rem, 12rem) 1fr;
    min-width: 0;
  }
  /* narrow containers: one pair per row regardless of columns */
  @container (max-width: 640px) {
    .jx-desc {
      grid-template-columns: 1fr;
    }
  }
  .jx-desc-term {
    padding: 0.5rem 0.75rem;
    font-family: var(--font-nav);
    font-size: 0.6875rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted-foreground);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .jx-desc-value {
    margin: 0;
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--foreground);
    min-width: 0;
    overflow-wrap: anywhere;
  }

  /* bordered: hairline grid on the same dl — never a table in disguise */
  .jx-desc-bordered {
    border: 1px solid var(--border);
    background: var(--card);
  }
  .jx-desc-bordered .jx-desc-cell {
    border-bottom: 1px solid var(--border);
  }
  .jx-desc-bordered .jx-desc-term {
    background: var(--muted);
    border-right: 1px solid var(--border);
  }
</style>
