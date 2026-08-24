<!--
  jixoai empty (registry/files/ui/empty.svelte).
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

  interface Props {
    title: string;
    description?: string;
    /** custom illustration — defaults to the terminal empty-listing */
    illustration?: Snippet;
    actions?: Snippet;
    class?: string;
  }

  let { title, description, illustration, actions, class: className = '' }: Props = $props();
</script>

<figure data-jx-empty="" class={cn('flex flex-col items-center gap-4 border border-dashed border-border bg-muted px-6 py-10', className)}>
  <div data-jx-empty-art="" class="flex flex-col gap-1 border border-border bg-card px-4 py-3 shadow-2xs font-mono text-xs" aria-hidden="true">
    {#if illustration}
      {@render illustration()}
    {:else}
      <span data-jx-empty-term="" class="text-muted-foreground">ls checks/</span>
      <span data-jx-empty-zero="" class="text-primary">0 items</span>
    {/if}
  </div>
  <figcaption data-jx-empty-caption="" class="flex flex-col items-center gap-1.5 text-center">
    <p data-jx-empty-title="" class="font-nav text-[0.8125rem] tracking-[0.12em] uppercase text-foreground">{title}</p>
    {#if description}
      <p data-jx-empty-desc="" class="max-w-[36ch] text-[0.8125rem] leading-[1.55] text-muted-foreground">{description}</p>
    {/if}
    {#if actions}
      <div data-jx-empty-actions="" class="mt-1.5 flex flex-wrap justify-center gap-2.5">
        {@render actions()}
      </div>
    {/if}
  </figcaption>
</figure>
