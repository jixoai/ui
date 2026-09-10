<!--
  Chip contract-test harness (test/fixtures/chip-host.svelte).
  children/slot snippets must be real Svelte 5 snippets, so the fixed
  consumer markup lives here (slots in their implicit tag form — the
  compiler types them against the component's own Snippet props). Props
  mirror the Chip API; the attachment arrives through the COMPONENT TAG
  — <Chip {@attach pressEffect(builder())}> — exactly as a consumer
  composes it (effect-attachments r4, 2026-09-10: the record retired,
  the effect prop and its default ripple died with the earlier migration).
-->
<script lang="ts">
  import type { Attachment } from 'svelte/attachments';
  import Chip from '../../src/lib/ui/chip/chip.svelte';

  let {
    variant = undefined,
    shape = undefined,
    attach = undefined,
    dataX = undefined,
    href = '',
    type = 'button',
    onclick = undefined,
    ariaLabel = undefined,
    withSlots = false,
  }: {
    variant?: 'fill' | 'tonal' | 'outline' | 'ghost';
    shape?: 'square' | 'pill';
    attach?: Attachment<HTMLElement>;
    dataX?: string;
    href?: string;
    type?: 'button' | 'submit';
    onclick?: () => void;
    ariaLabel?: string;
    withSlots?: boolean;
  } = $props();
</script>

{#if href}
  <Chip {variant} {shape} {@attach attach} {href} {ariaLabel} data-x={dataX}>filter</Chip>
{:else if withSlots}
  <Chip {variant} {shape} {@attach attach} {type} {onclick} {ariaLabel} data-x={dataX}>
    {#snippet slotStart()}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
      </svg>
    {/snippet}
    {#snippet slotEnd()}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    {/snippet}
    filter
  </Chip>
{:else}
  <Chip {variant} {shape} {@attach attach} {type} {onclick} {ariaLabel} data-x={dataX}>filter</Chip>
{/if}
