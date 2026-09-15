<!--
  Tooltip position-area probe fixture
  (apps/www/src/lib/__probe__/tooltip-area-probe.svelte).

  visual-quality-iteration W5.1: the standing anchor-sweep probe
  (scripts/verify-popover-area-align.mjs, popover-area precedent)
  needs the REAL Tooltip rendered at a DRIVABLE placement — the docs
  demos hard-code the default top and no shipped page exercises the
  side × align matrix under test. This fixture renders the real
  component (arrow ON — the notch aim must follow the corrected map)
  with the placement chosen by the ?placement= query param (validated;
  default 'top-start' = the probe's start-aligned primary arm) and the
  anchor geometry chosen by ?at= (mid = the direct-geometry arm — both
  alignments fit a 1440×900 viewport so no flip-inline / ICB-clamp
  rescue may mask the authored alignment; bottom = the flip-block
  collision arm; right = the flip-inline collision arm). The fixture
  root stamps data-placement/data-at as the probe's read-back guard.
  The probe's swapped-map negative control plants the pre-sweep
  inverted area inline (browser-side only — this fixture stays dumb).
-->
<script lang="ts">
  import Tooltip from '$lib/ui/tooltip/tooltip.svelte';

  type ProbePlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';
  const PLACEMENTS: ProbePlacement[] = [
    'top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end',
  ];
  type ProbeAt = 'mid' | 'bottom' | 'right';
  let placement = $state<ProbePlacement>('top-start');
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
    at === 'mid' ? 'left-[560px] top-[320px]'
    : at === 'bottom' ? 'left-[560px] bottom-[64px]'
    : 'left-[1300px] top-[320px]',
  );
</script>

<div data-probe-tooltip-area="" data-placement={placement} data-at={at} class="fixed {pose}">
  <!-- the tip text is DELIBERATELY long unbreakable tokens wrapping to
       multiple lines: min-content wider than the at=right region arms
       flip-inline, wrapped height taller than the at=bottom clearance
       arms flip-block — both collision flips must engage on this one
       fixture content -->
  <Tooltip id="probe-tip" text="positionareaprobegeomfix unbreakabletokensforallaxes keepthebubblemincontentwide flipblockandinlinebotharmed" arrow {placement}>
    <span data-probe-tip-trigger="" class="inline-block w-28 py-2 text-center text-[13px] underline decoration-dotted">hover me</span>
  </Tooltip>
</div>
