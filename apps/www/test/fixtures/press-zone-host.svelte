<!--
  The zone-texture host (test/fixtures/press-zone-host.svelte, Owner
  2026-09-04): a PressButton under ButtonVariantScope boundaries, in
  the shapes the foot-flat law rides — bare, joined in a ButtonGroup,
  and nested under a PAINT-ONLY scope (the inherit-then-provide path:
  a scope that declares no raised of its own must never un-flatten
  the enclosing zone). bareGrouped renders the group OUTSIDE any
  scope — the cluster-shadow law's own lane (the group WRITES the
  flat texture for its subtree; no zone needed).
-->
<script lang="ts">
  import PressButton, {
    type PressButtonVariant,
  } from '../../src/lib/ui/press-button/press-button.svelte';
  import ButtonVariantScope from '../../src/lib/ui/button-group/button-variant-scope.svelte';
  import ButtonGroup from '../../src/lib/ui/button-group/button-group.svelte';

  let {
    zoneRaised = undefined,
    variant = undefined,
    raised = undefined,
    grouped = false,
    nested = false,
    bareGrouped = false,
  }: {
    /** the scope's raised seam — undefined = a paint-only scope */
    zoneRaised?: boolean;
    variant?: PressButtonVariant;
    raised?: boolean;
    /** render the button joined in a ButtonGroup inside the zone */
    grouped?: boolean;
    /** wrap the button in a paint-only scope inside the zone */
    nested?: boolean;
    /** render the button joined in a BARE ButtonGroup (no zone above) */
    bareGrouped?: boolean;
  } = $props();
</script>

{#if bareGrouped}
  <ButtonGroup label="bare actions">
    <PressButton {variant} {raised}>deploy</PressButton>
  </ButtonGroup>
{:else}
  <ButtonVariantScope variant="ghost" raised={zoneRaised}>
    {#if nested}
      <ButtonVariantScope variant="outline">
        <PressButton {variant} {raised}>deploy</PressButton>
      </ButtonVariantScope>
    {:else if grouped}
      <ButtonGroup label="zone actions">
        <PressButton {variant} {raised}>deploy</PressButton>
      </ButtonGroup>
    {:else}
      <PressButton {variant} {raised}>deploy</PressButton>
    {/if}
  </ButtonVariantScope>
{/if}
