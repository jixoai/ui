<!--
  Icon-button contract-test harness (test/fixtures/icon-button-host.svelte).
  The icon prop must be a real Svelte 5 snippet, so the fixed consumer
  markup lives here. Props mirror the IconButton API; the attachment
  arrives through the COMPONENT TAG — <IconButton {@attach
  pressEffect(builder())}> — the rest lane CHAINS it into the wrapped
  press-button's own spread, exactly as a consumer composes it
  (effect-attachments r4, 2026-09-10).
-->
<script lang="ts">
  import type { Attachment } from 'svelte/attachments';
  import type { PressButtonVariant } from '../../src/lib/ui/press-button/press-button.svelte';
  import IconButton from '../../src/lib/ui/icon-button/icon-button.svelte';

  let {
    text = 'deploy',
    variant = undefined,
    raised = undefined,
    iconOnly = false,
    placement = undefined,
    arrow = undefined,
    attach = undefined,
    dataX = undefined,
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
    attach?: Attachment<HTMLElement>;
    dataX?: string;
    href?: string;
    popovertarget?: string;
    class?: string;
  } = $props();
</script>

{#if href}
  <IconButton {variant} {raised} {iconOnly} {placement} {arrow} {@attach attach} {href} class={className} {text} data-x={dataX}>
    {#snippet icon()}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3 14 9-14 9Z" /></svg>{/snippet}
  </IconButton>
{:else}
  <IconButton {variant} {raised} {iconOnly} {placement} {arrow} {@attach attach} {popovertarget} class={className} {text} data-x={dataX}>
    {#snippet icon()}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3 14 9-14 9Z" /></svg>{/snippet}
  </IconButton>
{/if}
