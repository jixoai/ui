<!--
  DropdownMenu position-area probe fixture
  (apps/www/src/lib/__probe__/dropdown-area-probe.svelte).

  visual-quality-iteration W5.1: the standing anchor-sweep probe
  (scripts/verify-popover-area-align.mjs, popover-area precedent)
  needs the REAL DropdownMenu rendered at a DRIVABLE placement — the
  docs demos hard-code the default and no shipped page exercises the
  full side × align matrix under test. This fixture renders the real
  component with the placement chosen by the ?placement= query param
  (validated; default 'bottom-start' = the probe's start-aligned
  primary arm) and the anchor geometry chosen by ?at= (mid = the
  direct-geometry arm — both alignments fit a 1440×900 viewport so no
  flip-inline / ICB-clamp rescue may mask the authored alignment;
  bottom = the flip-block collision arm; right = the flip-inline
  collision arm). The fixture root stamps data-placement/data-at as
  the probe's read-back guard (the params provably reached the
  component). The probe's swapped-map negative control plants the
  pre-sweep inverted area inline (browser-side only — this fixture
  stays dumb).
-->
<script lang="ts">
  import DropdownMenu from '$lib/ui/dropdown-menu/dropdown-menu.svelte';
  import DropdownMenuItem from '$lib/ui/dropdown-menu/dropdown-menu-item.svelte';

  type ProbePlacement = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end';
  const PLACEMENTS: ProbePlacement[] = [
    'bottom', 'bottom-start', 'bottom-end', 'top', 'top-start', 'top-end',
  ];
  type ProbeAt = 'mid' | 'bottom' | 'right';
  let placement = $state<ProbePlacement>('bottom-start');
  let at = $state<ProbeAt>('mid');
  // runs browser-side only (effects never run SSR) — reads the params
  // once per load; non-reactive inputs, so the effect settles
  $effect(() => {
    const q = new URLSearchParams(window.location.search);
    const p = q.get('placement');
    if (PLACEMENTS.includes(p as ProbePlacement)) placement = p as ProbePlacement;
    const a = q.get('at');
    if (a === 'mid' || a === 'bottom' || a === 'right') at = a;
  });

  // fixed-position wrapper: geometry independent of page flow, so the
  // probe's viewport math is deterministic across arms (mid sits low
  // enough that the TOP arms fit above the anchor — flip-block must
  // stay a collision-arm concern, never a mid-geometry accident)
  const pose = $derived(
    at === 'mid' ? 'left-[560px] top-[280px]'
    : at === 'bottom' ? 'left-[560px] bottom-[48px]'
    : 'left-[1300px] top-[280px]',
  );
</script>

<div data-probe-dropdown-area="" data-placement={placement} data-at={at} class="fixed {pose}">
  <DropdownMenu id="probe-dd" triggerLabel="area probe" {placement}>
    {#each ['alpha — fixed-width row one', 'beta — fixed-width row two', 'gamma — fixed-width row three'] as row}
      <DropdownMenuItem onclick={() => {}}>{row}</DropdownMenuItem>
    {/each}
  </DropdownMenu>
</div>
