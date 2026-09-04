<!--
  PaintZoneHost — availability-gate fixture (codex r1 B4): the narrow
  families (badge/kbd/inline-code) and the full-union control
  (press-button) rendered under the requested zone variant, plus
  explicit-wins cases, all behind data-testid probes.
-->
<script lang="ts">
  import { providePaintZone, type ZonePaintVariant } from '$lib/paint.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import Kbd from '$lib/ui/kbd/kbd.svelte';
  import InlineCode from '$lib/ui/inline-code/inline-code.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';

  let { variant, children }: { variant: ZonePaintVariant; children?: Snippet } = $props();
  providePaintZone(() => variant);
</script>

<div data-zone={variant}>
  <span data-testid="probe-badge"><Badge>beta</Badge></span>
  <span data-testid="probe-kbd"><Kbd>⌘K</Kbd></span>
  <span data-testid="probe-code"><InlineCode>notify.toml</InlineCode></span>
  <span data-testid="probe-press"><PressButton>Rerun</PressButton></span>
  <span data-testid="probe-press-explicit"><PressButton variant="tonal">Pinned</PressButton></span>
  <span data-testid="probe-badge-explicit"><Badge variant="outline">pinned</Badge></span>
  {#if children}{@render children()}{/if}
</div>
