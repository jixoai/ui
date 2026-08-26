<!--
  Chip contract-test harness (test/fixtures/chip-host.svelte).
  children/slot snippets must be real Svelte 5 snippets, so the fixed
  consumer markup lives here (slots in their implicit tag form — the
  compiler types them against the component's own Snippet props). Props
  mirror the Chip API; the effect prop takes the builders exported
  from press-button's module script (or null to disable every loop),
  exactly as a consumer would.
-->
<script lang="ts">
  import Chip from '../../src/lib/ui/chip/chip.svelte';
  import type { PressEffect } from '../../src/lib/ui/press-button/press-button.svelte';

  let {
    variant = undefined,
    shape = undefined,
    effect = undefined,
    href = '',
    type = 'button',
    onclick = undefined,
    ariaLabel = undefined,
    withSlots = false,
  }: {
    variant?: 'fill' | 'tonal' | 'outline' | 'ghost';
    shape?: 'square' | 'pill';
    effect?: PressEffect | null;
    href?: string;
    type?: 'button' | 'submit';
    onclick?: () => void;
    ariaLabel?: string;
    withSlots?: boolean;
  } = $props();
</script>

{#if href}
  <Chip {variant} {shape} {effect} {href} {ariaLabel}>filter</Chip>
{:else if withSlots}
  <Chip {variant} {shape} {effect} {type} {onclick} {ariaLabel}>
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
  <Chip {variant} {shape} {effect} {type} {onclick} {ariaLabel}>filter</Chip>
{/if}
