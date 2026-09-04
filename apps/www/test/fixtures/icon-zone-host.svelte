<!--
  The icon-button zone-texture host (test/fixtures/icon-zone-host.svelte,
  Owner 2026-09-04): an IconButton under ButtonVariantScope boundaries —
  the shapes the foot-flat law rides for the square family. The scope
  declares ghost paint (the none-trio strip path) plus the raised seam;
  the button itself stays bare so the zone lane is the ONLY lane.
-->
<script lang="ts">
  import IconButton from '../../src/lib/ui/icon-button/icon-button.svelte';
  import ButtonVariantScope from '../../src/lib/ui/button-group/button-variant-scope.svelte';
  import ButtonGroup from '../../src/lib/ui/button-group/button-group.svelte';

  let {
    zoneRaised = undefined,
    raised = undefined,
    iconOnly = false,
    grouped = false,
  }: {
    /** the scope's raised seam — undefined = a paint-only scope */
    zoneRaised?: boolean;
    raised?: boolean;
    /** exercise the square band too (tooltip posture stays off here) */
    iconOnly?: boolean;
    /** render the button joined in a ButtonGroup inside the zone —
        the ⋯ overflow-trigger path */
    grouped?: boolean;
  } = $props();
</script>

<ButtonVariantScope variant="ghost" raised={zoneRaised}>
  {#if grouped}
    <ButtonGroup label="zone actions">
      <IconButton {raised} {iconOnly} text="deploy">
        {#snippet icon()}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3 14 9-14 9Z" /></svg>{/snippet}
      </IconButton>
    </ButtonGroup>
  {:else}
    <IconButton {raised} {iconOnly} text="deploy">
      {#snippet icon()}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 3 14 9-14 9Z" /></svg>{/snippet}
    </IconButton>
  {/if}
</ButtonVariantScope>
