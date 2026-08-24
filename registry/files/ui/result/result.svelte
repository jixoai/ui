<!--
  jixoai result (registry/files/ui/result.svelte).
  The page-level outcome of an operation: status glyph + title +
  description + actions. Deliberately THIN (the ruling): no 403/404
  routing logic, no illustration system — bring your own through the
  icon snippet. Status paints through the tone law (success = the
  brand's emphasis voice — there is no green in this language;
  error = destructive; the others stay neutral).

  empty ≠ result: empty says "no data"; result says "an operation
  reached an outcome". They are different states and stay different
  components.

  tw4 (2026-08-24): pure token utilities, zero css residue — status
  maps to icon border/glyph color utilities per prop; `jx-result*`
  classes are semantic hooks, css defines them not.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** success uses the brand voice (no green in this language) */
    status?: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    /** custom glyph — defaults to the status text glyph */
    icon?: Snippet;
    actions?: Snippet;
    class?: string;
  }

  let { status = 'info', title, description, icon, actions, class: className = '' }: Props = $props();

  const glyph = $derived(
    status === 'success' ? '✓' : status === 'error' ? '✕' : status === 'warning' ? '!' : 'i',
  );
  const iconBorder = {
    success: 'border-primary',
    error: 'border-destructive',
    warning: 'border-border',
    info: 'border-border',
  } as const;
  const glyphColor = {
    success: 'text-primary',
    error: 'text-destructive',
    warning: '',
    info: '',
  } as const;
</script>

<div data-jx-result={status} class={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}>
  <div
    data-jx-result-icon=""
    class={cn(
      'inline-flex items-center justify-center size-[3.5rem] border border-border bg-card shadow-xs',
      iconBorder[status],
    )}
    aria-hidden="true"
  >
    {#if icon}
      {@render icon()}
    {:else}
      <span data-jx-result-glyph="" class={cn('font-mono text-2xl leading-none', glyphColor[status])}>{glyph}</span>
    {/if}
  </div>
  <h2 data-jx-result-title="" class="font-nav text-base tracking-[0.06em] uppercase text-foreground">{title}</h2>
  {#if description}
    <p data-jx-result-desc="" class="max-w-[44ch] text-[0.8125rem] leading-[1.6] text-muted-foreground">{description}</p>
  {/if}
  {#if actions}
    <div data-jx-result-actions="" class="mt-2 flex flex-wrap justify-center gap-2.5">
      {@render actions()}
    </div>
  {/if}
</div>
