<!--
  jixoai DensityDemo — the multi-scope live demo. Wraps children in
  [data-density] wrappers side-by-side with scope labels. The default
  stays the four GENERAL rungs — 2xs (2026-09-05-density-2xs) is
  opt-in only (pro-tool operation surfaces, never default docs UI);
  pages documenting the full scale pass it explicitly.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { densityDemoStyles } from './density-demo.stylex';

  interface Props {
    children: Snippet;
    scopes?: ('2xs' | 'xs' | 'sm' | 'default' | 'lg')[];
    class?: string;
  }

  let { children, scopes = ['xs', 'sm', 'default', 'lg'], class: className = '' }: Props = $props();

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

<div class={cn(cx(densityDemoStyles.row), className)}>
  {#each scopes as scope (scope)}
    <div class={cx(densityDemoStyles.cell)}>
      <span class={cx(densityDemoStyles.label)}>
        {scope}
      </span>
      <div data-density={scope} class={cx(densityDemoStyles.scopeBox)}>
        {@render children()}
      </div>
    </div>
  {/each}
</div>
