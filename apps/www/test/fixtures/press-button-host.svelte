<!--
  Press-button contract-test harness (test/fixtures/press-button-host.svelte).
  The children prop must be a real Svelte 5 snippet, so the fixed
  consumer markup lives here. Props mirror the PressButton API; the
  attachment arrives through the COMPONENT TAG — <PressButton
  {@attach pressEffect(builder())}> — exactly as a consumer composes it
  (effect-attachments r4, 2026-09-10: the attachments record retired,
  the rest lane forwards the symbol-keyed prop onto the root).
-->
<script lang="ts">
  import type { Attachment } from 'svelte/attachments';
  import PressButton, {
    type PressButtonVariant,
  } from '../../src/lib/ui/press-button/press-button.svelte';

  let {
    variant = undefined,
    attach = undefined,
    dataX = undefined,
    loading = false,
    href = '',
    type = 'button',
    popovertarget = undefined,
    raised = undefined,
  }: {
    variant?: PressButtonVariant;
    attach?: Attachment<HTMLElement>;
    dataX?: string;
    loading?: boolean;
    href?: string;
    type?: 'button' | 'submit';
    popovertarget?: string;
    raised?: boolean;
  } = $props();
</script>

{#if href}
  <PressButton {variant} {@attach attach} {loading} {href} {raised} data-x={dataX}>deploy</PressButton>
{:else}
  <PressButton {variant} {@attach attach} {loading} {type} {popovertarget} {raised} data-x={dataX}>deploy</PressButton>
{/if}
