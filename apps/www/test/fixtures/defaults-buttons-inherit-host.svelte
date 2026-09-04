<!--
  defaults-buttons-inherit-host — test fixture
  (defaults-buttons.spec.ts, context-defaults-economy task 2.1).

  The derived_references_self pin: a density provider ABOVE an
  opinion-less ButtonGroup whose tier is a rerenderable prop. The
  group's own provideDensity write must never shadow its eager
  capture — rendering alone proves the chain terminates, and the
  parent flip proves the re-resolution path (the pre-2.1 code's
  reactivity) survives the migration.
-->
<script lang="ts">
  import { provideDensity, type Density } from '../../src/lib/density.svelte';
  import PressButton from '../../src/lib/ui/press-button/press-button.svelte';
  import ButtonGroup from '../../src/lib/ui/button-group/button-group.svelte';

  let { parentDensity = 'lg' }: { parentDensity?: Density } = $props();
  provideDensity(() => parentDensity);
</script>

<ButtonGroup label="inherit" data-testid="inherit-group">
  <PressButton>inherit adopted</PressButton>
</ButtonGroup>
