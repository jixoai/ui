<!--
  jixoai ItemDivider — the explicit full-strength boundary between
  group rows (replaces ItemSeparator, openspec
  list-item-systemization). Childless + decorative in v1: an empty
  presentation <li>; the automatic adjacency divider (38% mix) is
  structurally exclusive with it — one source per edge. Group-only by
  contract: it IS a list child; rendering it outside an ItemGroup is
  a consumer error.
-->
<script lang="ts">
  import { cn } from '$lib/utils';
  import { itemStyles } from './item.stylex';

  let { class: className = '' }: { class?: string } = $props();

  // the payload's own join (separator's serialize law — the chip
  // precedent): objects in dev, joined strings in payloads, never a
  // raw class={styles.x} interpolation
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
</script>

<li role="presentation" data-slot="item-divider" class={cn(cx(itemStyles.divider), className)}></li>
