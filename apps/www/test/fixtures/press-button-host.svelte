<!--
  Press-button contract-test harness (test/fixtures/press-button-host.svelte).
  The children prop must be a real Svelte 5 snippet, so the fixed
  consumer markup lives here. Props mirror the PressButton API; the
  effect prop takes the builders exported from the component's module
  script, exactly as a consumer would use them.
-->
<script lang="ts">
  import PressButton, {
    type PressButtonVariant,
    type PressEffect,
  } from '../../src/lib/ui/press-button/press-button.svelte';

  let {
    variant = undefined,
    effect = undefined,
    href = '',
    type = 'button',
    popovertarget = undefined,
  }: {
    variant?: PressButtonVariant;
    effect?: PressEffect;
    href?: string;
    type?: 'button' | 'submit';
    popovertarget?: string;
  } = $props();
</script>

{#if href}
  <PressButton {variant} {effect} {href}>deploy</PressButton>
{:else}
  <PressButton {variant} {effect} {type} {popovertarget}>deploy</PressButton>
{/if}
