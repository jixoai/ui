<!--
  paint-axis-matrix-host — test fixture (paint-axis.spec.ts, task 1.2;
  single-key law, Owner 2026-09-04).

  The zone matrix in one render, each state its own named region:
    ① zone provider + consumers hit the ONE paint key
    ② group with an own variant — provider and consumers agree on
       one lane (the former "dual write" state, pre-retirement)
    ③ nested-mixed — the inner scope's zone shadows the outer
       group's; outside the scope the outer value holds
  plus the orientation/separator no-regression regions.
-->
<script lang="ts">
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import ButtonGroupDivider from '$lib/ui/button-group/button-group-divider.svelte';
  import ButtonVariantScope from '$lib/ui/button-group/button-variant-scope.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Probe from './paint-axis-probe.svelte';
  import ZoneProvider from './paint-axis-zone-provider.svelte';
</script>

<!-- ① zone-only: migrated consumers hit the one paint key -->
<ZoneProvider variant="ghost">
  <Probe testid="new-only-probe" />
  <PressButton>new-only consumer</PressButton>
</ZoneProvider>

<!-- ② the in-repo shape: one effectiveVariant getter, one key,
     provider-side and consumer-side reads agree -->
<ButtonGroup label="group" variant="tonal" data-testid="dual-group">
  <Probe testid="dual-probe" />
  <PressButton>group consumer</PressButton>
</ButtonGroup>

<!-- ③ nested-mixed: the inner scope's zone shadows the outer group's;
     outside the scope the outer value holds -->
<ButtonGroup label="nested outer" variant="tonal" data-testid="nested-outer">
  <Probe testid="nested-outer-probe" />
  <ButtonVariantScope variant="ghost">
    <Probe testid="nested-inner-probe" />
    <PressButton>nested consumer</PressButton>
  </ButtonVariantScope>
  <ButtonGroupDivider />
  <PressButton>after divider</PressButton>
</ButtonGroup>

<!-- orientation/separator no-regression under the zone lane -->
<ButtonGroup label="vertical laws" orientation="vertical" variant="ghost" data-testid="vertical-ghost-group">
  <PressButton>v-one</PressButton>
  <PressButton>v-two</PressButton>
</ButtonGroup>
<ButtonGroup label="horizontal plain" data-testid="horizontal-plain-group">
  <PressButton>h-one</PressButton>
</ButtonGroup>
