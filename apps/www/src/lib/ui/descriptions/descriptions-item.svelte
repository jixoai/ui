<!--
  jixoai DescriptionsItem (registry/files/ui/descriptions/descriptions-item.svelte,
  composition-first-apis, 2026-08-25).
  One term/value pair: the `term` prop renders the dt, children render
  the dd — rich cells are just children (badges, links, markup). A
  childless Item renders the em dash, never a blank cell. The bordered
  hairline paint (cell bottom edge, muted term background + rule)
  derives from the root's `bordered` through context — one decision,
  painted everywhere.
  tailwindless one-shot Wave 1b batch A (2026-09-17): the paint rides
  the family's stylex ATOMS (descriptions.stylex.ts) joined through
  cx() below.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { DESCRIPTIONS_KEY, type DescriptionsApi } from './descriptions.svelte';
  import { descriptionsStyles } from './descriptions.stylex';

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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

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
  class={cx(descriptionsStyles.cell, descriptions.bordered && descriptionsStyles.cellBordered, className)}
  {...rest}
>
  <dt
    data-jx-desc-term=""
    class={cx(descriptionsStyles.term, descriptions.bordered && descriptionsStyles.termBordered)}
  >{term}</dt>
  <dd data-jx-desc-value="" class={cx(descriptionsStyles.value)}>
    {#if children}{@render children()}{:else}—{/if}
  </dd>
</div>
