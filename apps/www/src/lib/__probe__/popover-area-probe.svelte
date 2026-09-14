<!--
  Popover position-area probe fixture
  (apps/www/src/lib/__probe__/popover-area-probe.svelte).

  stylex-kernel-phase0 P0.1: the permanent regression probe
  (scripts/verify-popover-area-align.mjs) needs the REAL Popover
  component rendered at a DRIVABLE placement — the docs demos
  hard-code the default and the canvas rides the physical
  (tryFallbacks) path, so no shipped page exercises the area map
  under test. This fixture renders the real component on the area
  path (no tryFallbacks) with the placement chosen by the
  ?placement= query param (validated; default 'bottom-start' = the
  probe's primary arm). Geometry is authored to keep BOTH probe arms
  inside a 1440×900 viewport, so the panel renders its DIRECT
  geometry — no flip-inline / viewport-clamp rescue may mask the
  authored alignment. The fixture root stamps data-placement as the
  probe's read-back guard (the param provably reached the component).
-->
<script lang="ts">
  import Popover from '$lib/ui/popover/popover.svelte';

  type ProbePlacement = 'bottom-start' | 'bottom-end';
  let placement = $state<ProbePlacement>('bottom-start');
  // runs browser-side only (effects never run SSR) — reads the param
  // once per load; non-reactive input, so the effect settles
  $effect(() => {
    const p = new URLSearchParams(window.location.search).get('placement');
    if (p === 'bottom-start' || p === 'bottom-end') placement = p;
  });
</script>

<div data-probe-popover-area="" data-placement={placement} class="mt-[120px] w-fit pl-[176px]">
  <Popover id="probe-pop" triggerLabel="area probe" {placement}>
    <p class="w-64 text-[13px] leading-6">
      position-area alignment probe panel — fixed-width content so the panel
      geometry is stable across runs and the primary/control deltas stay
      comparable.
    </p>
  </Popover>
</div>
