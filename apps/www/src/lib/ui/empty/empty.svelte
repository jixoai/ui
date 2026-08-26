<!--
  jixoai empty (registry/files/ui/empty/empty.svelte).
  The no-data state of the eight-state machine — NOTHING more (the
  antd ruling: empty does not absorb error/loading/404; those are
  alert/result surfaces). A figure: terminal-box illustration slot
  (default: the empty directory listing), a title, a description, and
  an optional actions snippet ("create the first…").

    <Empty title="no checks yet">
      {#snippet actions()}<PressButton>add check</PressButton>{/snippet}
    </Empty>

  Pure composition — no JS, no state; the illustration is a slot so
  consumers bring their own glyph without a dependency.

  tw4 (2026-08-24): pure token utilities, zero css residue; `jx-empty*`
  classes are semantic hooks, css defines them not.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';

  interface Props {
    density?: Density;
    title: string;
    description?: string;
    /** custom illustration — defaults to the terminal empty-listing */
    illustration?: Snippet;
    actions?: Snippet;
    class?: string;
  }

  let { density, title, description, illustration, actions, class: className = '' }: Props = $props();
  const resolvedDensity = $derived(resolveDensity(density, getDensityContext()));
</script>

<figure data-jx-empty="" data-density={resolvedDensity} class={cn('flex flex-col items-center [gap:var(--jx-stack)] border border-dashed border-border bg-muted [padding:calc(var(--jx-inset)*2)]', className)}>
  <div data-jx-empty-art="" class="flex flex-col [gap:var(--jx-stack)] border border-border bg-card [padding:var(--jx-inset)] shadow-2xs font-mono [font-size:var(--jx-text)]" aria-hidden="true">
    {#if illustration}
      {@render illustration()}
    {:else}
      <span data-jx-empty-term="" class="text-muted-foreground">ls checks/</span>
      <span data-jx-empty-zero="" class="text-primary">0 items</span>
    {/if}
  </div>
  <figcaption data-jx-empty-caption="" class="flex flex-col items-center [gap:var(--jx-stack)] text-center">
    <p data-jx-empty-title="" class="font-nav [font-size:var(--jx-text)] [line-height:var(--jx-line)] tracking-[0.12em] uppercase text-foreground">{title}</p>
    {#if description}
      <p data-jx-empty-desc="" class="max-w-[36ch] [font-size:var(--jx-text)] [line-height:var(--jx-line)] text-muted-foreground">{description}</p>
    {/if}
    {#if actions}
      <div data-jx-empty-actions="" class="[margin-block-start:var(--jx-stack)] flex flex-wrap justify-center [gap:var(--jx-gap)]">
        {@render actions()}
      </div>
    {/if}
  </figcaption>
</figure>
