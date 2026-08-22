<!--
  Test host for the tooltip arrow contract: the opt-in pin and its
  per-placement aims. jsdom cannot lay out anchor positioning or real
  rects, so the spec asserts the structural contract (opt-in flag, no
  inline anchor() — the Chromium constraint — toggle-time aiming wiring);
  the aim geometry itself is verified in a real browser.
-->
<script lang="ts">
  import Tooltip from '../../src/lib/ui/tooltip.svelte';
</script>

<Tooltip text="Aimed at the anchor's top-center" arrow>
  <button type="button">pin</button>
</Tooltip>

<Tooltip text="Aimed at the anchor's bottom-end corner" arrow placement="bottom-end">
  <button type="button">corner</button>
</Tooltip>

<Tooltip text="Aim clamped to the start corner" arrow placement="top-start">
  <button type="button">start</button>
</Tooltip>

<Tooltip text="No pin unless asked" placement="top">
  <button type="button">bare</button>
</Tooltip>
