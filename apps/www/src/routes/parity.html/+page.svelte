<!--
  The native-parity fixture page (native-contract-fusion Phase 6,
  2026-08-27): every vocabulary row rendered TWICE — tier0 (the bare
  DOM the jx-pure law paints) beside tier1 (the registry component) —
  under identical density/darkness. scripts/verify-native-parity.mjs
  probes both sides' computed styles across the state matrix and
  fails on drift. Not linked from any navigation; a gate surface.
-->
<script lang="ts">
  import ToggleGroup from '$lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '$lib/ui/toggle-group/toggle-group-item.svelte';
</script>

<svelte:head>
  <title>native parity fixtures</title>
</svelte:head>

<main class="flex flex-col gap-10 p-10">
  <!-- row: toggle-group — both renderers consume the SAME Part A law
       (.jx-tgroup), so parity here guards against component-side
       overrides ever creeping in -->
  <section data-parity="toggle-group" class="flex flex-wrap items-start gap-10">
    <div data-renderer="tier0" data-density="default">
      <div class="jx-tgroup" role="radiogroup" aria-label="parity tgroup">
        <label><input type="radio" name="parity-tg-0" value="a" checked /><span>a</span></label>
        <label><input type="radio" name="parity-tg-0" value="b" /><span>b</span></label>
        <label><input type="radio" name="parity-tg-0" value="c" disabled /><span>c</span></label>
      </div>
    </div>
    <div data-renderer="tier1" data-density="default">
      <ToggleGroup name="parity-tg-1" label="parity tgroup" type="single" value="a">
        <ToggleGroupItem value="a">a</ToggleGroupItem>
        <ToggleGroupItem value="b">b</ToggleGroupItem>
        <ToggleGroupItem value="c" disabled>c</ToggleGroupItem>
      </ToggleGroup>
    </div>
  </section>
</main>
