<!--
  jixoai result (registry/files/ui/result/result.svelte).
  The page-level outcome of an operation: status glyph + title +
  description + actions. Deliberately THIN (the ruling): no 403/404
  routing logic, no illustration system — bring your own through the
  icon snippet. Status paints by semantic hue (success = the
  brand's emphasis voice — there is no green in this language;
  error = the destructive hue; the others stay neutral).

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
  import { type Density } from '$lib/density.svelte';
  import { ResultDefaults } from './result-defaults.svelte';

  interface Props {
    /** density policy: explicit ?? ambient scope, else unstamped */
    density?: Density;
    /** success uses the brand voice (no green in this language) */
    status?: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    /** custom glyph — defaults to the status text glyph */
    icon?: Snippet;
    actions?: Snippet;
    class?: string;
  }

  let { density, status = 'info', title, description, icon, actions, class: className = '' }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 3.2): the density slot resolves explicit ?? ambient
  // scope; no opinion stamps nothing, the ambient css scope channel
  // keeps flowing
  const d = $derived(ResultDefaults.resolve({ density }));

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

<div data-jx-result={status} data-density={d.density} class={cn('flex flex-col items-center [gap:var(--jx-stack)] [padding-inline:calc(var(--jx-inset)*2)] [padding-block:calc(var(--jx-inset)*4)] text-center', className)}>
  <div
    data-jx-result-icon=""
    class={cn(
      'inline-flex items-center justify-center [width:calc(var(--jx-icon)*2)] [height:calc(var(--jx-icon)*2)] border border-border bg-card shadow-2xs',
      iconBorder[status],
    )}
    aria-hidden="true"
  >
    {#if icon}
      {@render icon()}
    {:else}
      <span data-jx-result-glyph="" class={cn('font-mono [font-size:calc(var(--jx-icon)*1.25)] leading-none', glyphColor[status])}>{glyph}</span>
    {/if}
  </div>
  <h2 data-jx-result-title="" class="font-nav [font-size:var(--jx-text)] [line-height:var(--jx-line)] tracking-[0.06em] uppercase text-foreground">{title}</h2>
  {#if description}
    <p data-jx-result-desc="" class="max-w-[44ch] [font-size:var(--jx-text)] [line-height:var(--jx-line)] text-muted-foreground">{description}</p>
  {/if}
  {#if actions}
    <div data-jx-result-actions="" class="[margin-block-start:var(--jx-stack)] flex flex-wrap justify-center [gap:var(--jx-gap)]">
      {@render actions()}
    </div>
  {/if}
</div>
