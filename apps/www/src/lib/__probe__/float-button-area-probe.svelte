<!--
  FloatButton position-area probe fixture
  (apps/www/src/lib/__probe__/float-button-area-probe.svelte).

  visual-quality-iteration W5.1: the standing anchor-sweep probe
  (scripts/verify-popover-area-align.mjs, popover-area precedent)
  needs the REAL FloatButton menu idiom at a DRIVABLE corner — the
  docs demo pins bottom-left and no shipped page exercises the default
  corner the authored literal targets. This fixture renders the real
  component (menu idiom, actions snippet; the panel id is
  auto-generated — the probe selects .jx-fab-menu) with the corner
  chosen by the ?corner= query param (validated; default
  'bottom-right' = the component's own default — the corner whose
  DIRECT geometry the authored area must name; 'bottom-left' = the
  mirror corner the engine's flip-inline adapts by design). The
  marker div stamps data-probe-fab-area/data-corner as the probe's
  read-back guard. The probe's swapped-map negative control plants
  the pre-sweep literal ('top span-right') inline with position-try
  neutered, so the authored start-alignment renders unmasked
  (browser-side only — this fixture stays dumb).
-->
<script lang="ts">
  import FloatButton from '$lib/ui/float-button/float-button.svelte';

  type ProbeCorner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  const CORNERS: ProbeCorner[] = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
  let corner = $state<ProbeCorner>('bottom-right');
  // runs browser-side only (effects never run SSR) — reads the param
  // once per load; non-reactive input, so the effect settles
  $effect(() => {
    const c = new URLSearchParams(window.location.search).get('corner');
    if (CORNERS.includes(c as ProbeCorner)) corner = c as ProbeCorner;
  });
</script>

<!-- zero-size marker: the probe's read-back guard (the stack itself
     is fixed to the viewport corners by the component's own law) -->
<div data-probe-fab-area="" data-corner={corner} class="fixed left-0 top-0 h-0 w-0"></div>

<FloatButton label="area probe" {corner}>
  <span aria-hidden="true">+</span>
  {#snippet actions()}
    <!-- block-stacked rows (the docs pages style .jx-fab-menu-item; the
         fixture styles its own rows) — deterministic panel width -->
    <button type="button" role="menuitem" class="block w-full px-3 py-1.5 text-left text-sm" onclick={() => {}}>probe action one</button>
    <button type="button" role="menuitem" class="block w-full px-3 py-1.5 text-left text-sm" onclick={() => {}}>probe action two</button>
    <button type="button" role="menuitem" class="block w-full px-3 py-1.5 text-left text-sm" onclick={() => {}}>probe action three</button>
  {/snippet}
</FloatButton>
