<!--
  defaults-buttons-host — test fixture (defaults-buttons.spec.ts,
  context-defaults-economy task 2.1).

  The button families' zero-behavior-change lock: every lane below
  exercised the PRE-2.1 inline reads (variant ?? group?.variant ??
  'outline', resolveDensity(density, getDensityContext()), the
  top-level enclosingGroup capture) and must resolve identically
  through the family Defaults — the restate lane (icon-button
  resolving and passing explicit values down) included.
-->
<script lang="ts">
  import PressButton from '../../src/lib/ui/press-button/press-button.svelte';
  import IconButton from '../../src/lib/ui/icon-button/icon-button.svelte';
  import ButtonGroup from '../../src/lib/ui/button-group/button-group.svelte';
  import ButtonGroupDivider from '../../src/lib/ui/button-group/button-group-divider.svelte';
  import ButtonVariantScope from '../../src/lib/ui/button-group/button-variant-scope.svelte';
</script>

<!-- the press-button lanes: own rung, explicit rungs, zone adoption -->
<span data-testid="pb-bare"><PressButton>pb bare</PressButton></span>
<span data-testid="pb-explicit"><PressButton variant="fill">pb fill</PressButton></span>
<span data-testid="pb-link"><PressButton variant="link">pb link</PressButton></span>

<!-- zone adoption through a dual-writing group; explicit still wins -->
<ButtonGroup label="ghost zone" variant="ghost" data-testid="pb-ghost-group">
  <PressButton>pb adopted</PressButton>
  <PressButton variant="fill">pb explicit wins</PressButton>
</ButtonGroup>

<!-- zone adoption through the scope (the dialog zone shape) -->
<ButtonVariantScope variant="tonal">
  <span data-testid="pb-scope"><PressButton>pb scoped</PressButton></span>
</ButtonVariantScope>

<!-- the icon-button restate lane: same ambient, resolved and passed
     down as the child's explicit props -->
<ButtonGroup label="tonal icons" variant="tonal" data-testid="ib-tonal-group">
  <IconButton text="ib adopted">{#snippet icon()}x{/snippet}</IconButton>
  <IconButton text="ib explicit" variant="fill">{#snippet icon()}y{/snippet}</IconButton>
</ButtonGroup>
<span data-testid="ib-bare"><IconButton text="ib bare">{#snippet icon()}z{/snippet}</IconButton></span>

<!-- the separator policy keys the (reshaped) effectiveVariant -->
<ButtonGroup label="plain" data-testid="plain-group"><PressButton>plain</PressButton></ButtonGroup>
<ButtonGroup label="vertical laws" orientation="vertical" variant="ghost" data-testid="v-ghost-group">
  <PressButton>v-one</PressButton>
  <ButtonGroupDivider />
  <PressButton>v-two</PressButton>
</ButtonGroup>
<ButtonVariantScope variant="ghost">
  <ButtonGroup label="scope ghost" data-testid="scope-ghost-group"><PressButton>scoped</PressButton></ButtonGroup>
</ButtonVariantScope>
<ButtonVariantScope variant="ghost">
  <ButtonGroup label="scope shadow" variant="tonal" data-testid="scope-tonal-group">
    <PressButton>shadowed</PressButton>
  </ButtonGroup>
</ButtonVariantScope>

<!-- the density lanes: provided, explicit-over-provider, no-opinion -->
<ButtonGroup label="dense" variant="ghost" density="sm" data-testid="dense-group">
  <PressButton>dense adopted</PressButton>
  <PressButton density="lg">dense explicit</PressButton>
</ButtonGroup>
