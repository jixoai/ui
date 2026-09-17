<!--
  jixoai TokenTable — the Material3-style token reference table.
  Two columns: Token | Default (aligned with m3's Theming section).
  Data-driven from the caller; tokens are auto-categorized by source.

  tailwindless one-shot (2026-09-16): the utilities became the
  family's stylex atoms (token-table.stylex.ts) joined by
  cx() — never a raw member interpolation.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { tokenTableStyles } from './token-table.stylex';

  export interface TokenEntry {
    name: string;
    default: string;
    description?: string;
    source?: 'density' | 'component' | 'color' | 'structural';
  }

  interface Props {
    tokens: TokenEntry[];
    class?: string;
  }

  let { tokens, class: className = '' }: Props = $props();

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
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

  const sourceLabel = (s?: string) =>
    s === 'density' ? 'density' : s === 'component' ? 'component' : s === 'color' ? 'color' : '';
</script>

<div class={cn(cx(tokenTableStyles.scroller), className)}>
  <table class={cx(tokenTableStyles.table)}>
    <thead>
      <tr class={cx(tokenTableStyles.headRow)}>
        <th class={cx(tokenTableStyles.headCell)}>Token</th>
        <th class={cx(tokenTableStyles.headCell)}>Default</th>
        {#if tokens.some((t) => t.source)}
          <th class={cx(tokenTableStyles.headCell)}>Source</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each tokens as token (token.name)}
        <tr class={cx(tokenTableStyles.bodyRow)}>
          <td class={cx(tokenTableStyles.nameCell)}>
            {token.name}
          </td>
          <td class={cx(tokenTableStyles.defaultCell)}>
            {token.default}
          </td>
          {#if tokens.some((t) => t.source)}
            <td class={cx(tokenTableStyles.sourceCell)}>
              {sourceLabel(token.source)}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
