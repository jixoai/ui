<!--
  jixoai TokenTable — the Material3-style token reference table.
  Two columns: Token | Default (aligned with m3's Theming section).
  Data-driven from the caller; tokens are auto-categorized by source.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

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

  const sourceLabel = (s?: string) =>
    s === 'density' ? 'density' : s === 'component' ? 'component' : s === 'color' ? 'color' : '';
</script>

<div class={cn('w-full overflow-x-auto', className)}>
  <table class="w-full border-collapse text-left">
    <thead>
      <tr class="border-b border-border">
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Token</th>
        <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Default</th>
        {#if tokens.some((t) => t.source)}
          <th class="font-nav py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">Source</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each tokens as token (token.name)}
        <tr class="border-b border-border/50">
          <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text)] whitespace-nowrap">
            {token.name}
          </td>
          <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] font-mono text-[length:var(--jx-text)] text-muted-foreground">
            {token.default}
          </td>
          {#if tokens.some((t) => t.source)}
            <td class="py-[var(--jx-stack)] px-[var(--jx-inset)] text-[length:var(--jx-text-secondary)] text-muted-foreground">
              {sourceLabel(token.source)}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
