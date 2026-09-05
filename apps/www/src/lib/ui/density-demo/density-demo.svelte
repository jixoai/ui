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

  interface Props {
    children: Snippet;
    scopes?: ('2xs' | 'xs' | 'sm' | 'default' | 'lg')[];
    class?: string;
  }

  let { children, scopes = ['xs', 'sm', 'default', 'lg'], class: className = '' }: Props = $props();
</script>

<div class={cn('flex flex-wrap gap-[var(--jx-gap)]', className)}>
  {#each scopes as scope (scope)}
    <div class="flex-1 min-w-[200px]">
      <span class="font-nav mb-[var(--jx-stack)] block text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em] text-muted-foreground">
        {scope}
      </span>
      <div data-density={scope} class="border border-border/50 p-[var(--jx-inset)]">
        {@render children()}
      </div>
    </div>
  {/each}
</div>
