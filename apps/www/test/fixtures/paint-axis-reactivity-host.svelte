<!--
  paint-axis-reactivity-host — test fixture (paint-axis.spec.ts).

  The ZONE REACTIVITY assertion carrier: one variant prop on the
  ButtonGroup; a flip must re-derive the slot's probe and the
  button's stamp in the SAME frame — one DOM read, no intermediate
  state (single-key law, Owner 2026-09-04).
-->
<script lang="ts">
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Probe from './paint-axis-probe.svelte';
  import type { ZonePaintVariant } from '$lib/paint.svelte';

  let { variant = 'tonal' }: { variant?: ZonePaintVariant } = $props();
</script>

<ButtonGroup label="reactivity" {variant} data-testid="reactive-group">
  <Probe testid="reactive-probe" />
  <PressButton>reactive consumer</PressButton>
</ButtonGroup>
