<!--
  Icon-button contract-test harness (test/fixtures/icon-button-host.svelte).
  The icon prop must be a real Svelte 5 snippet, so the fixed consumer
  markup lives here. Props mirror the IconButton API; the effect prop
  takes the builders exported from press-button's module script, exactly
  as a consumer would use them.
-->
<script lang="ts">
  import type { PressButtonVariant, PressEffect } from '../../src/lib/ui/press-button/press-button.svelte';
  import IconButton from '../../src/lib/ui/icon-button/icon-button.svelte';

  let {
    text = 'deploy',
    variant = undefined,
    raised = undefined,
    iconOnly = false,
    placement = undefined,
    arrow = undefined,
    effect = undefined,
    href = '',
    popovertarget = undefined,
    class: className = undefined,
  }: {
    text?: string;
    variant?: PressButtonVariant;
    raised?: boolean;
    iconOnly?: boolean;
    placement?: 'top' | 'bottom' | 'top-start' | 'bottom-start' | 'top-end' | 'bottom-end';
    arrow?: boolean;
    effect?: PressEffect;
    href?: string;
    popovertarget?: string;
    class?: string;
  } = $props();
</script>

{#if href}
  <IconButton {variant} {raised} {iconOnly} {placement} {arrow} {effect} {href} class={className} {text}>
    {#snippet icon()}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3 14 9-14 9Z" /></svg>{/snippet}
  </IconButton>
{:else}
  <IconButton {variant} {raised} {iconOnly} {placement} {arrow} {effect} {popovertarget} class={className} {text}>
    {#snippet icon()}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3 14 9-14 9Z" /></svg>{/snippet}
  </IconButton>
{/if}
