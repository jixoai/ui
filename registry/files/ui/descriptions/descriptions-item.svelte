<!--
  jixoai DescriptionsItem (registry/files/ui/descriptions/descriptions-item.svelte,
  composition-first-apis, 2026-08-25).
  One term/value pair: the `term` prop renders the dt, children render
  the dd — rich cells are just children (badges, links, markup). A
  childless Item renders the em dash, never a blank cell. The bordered
  hairline paint (cell bottom edge, muted term background + rule)
  derives from the root's `bordered` through context — one decision,
  painted everywhere.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { DESCRIPTIONS_KEY, type DescriptionsApi } from './descriptions.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** the dt label */
    term: string;
    class?: string;
    children?: Snippet;
  }

  let { term, class: className = '', children, ...rest }: Props = $props();

  const descriptions = getContext<DescriptionsApi>(DESCRIPTIONS_KEY);
</script>

<div
  data-jx-desc-cell=""
  class={cn('grid grid-cols-[minmax(7rem,12rem)_1fr] min-w-0', descriptions.bordered && 'border-b border-border', className)}
  {...rest}
>
  <dt
    data-jx-desc-term=""
    class={cn(
      'truncate [padding:var(--jx-gap)_var(--jx-inset)] font-nav [font-size:var(--jx-text-secondary)] [line-height:var(--jx-line-secondary)] tracking-[0.12em] uppercase text-muted-foreground',
      descriptions.bordered && 'bg-muted border-r border-border',
    )}
  >{term}</dt>
  <dd data-jx-desc-value="" class="m-0 [padding:var(--jx-gap)_var(--jx-inset)] [font-size:var(--jx-text)] [line-height:var(--jx-line)] text-foreground min-w-0 [overflow-wrap:anywhere]">
    {#if children}{@render children()}{:else}—{/if}
  </dd>
</div>
