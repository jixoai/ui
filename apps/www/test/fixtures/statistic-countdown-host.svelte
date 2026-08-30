<!--
  Test host for the statistic countdown + precision recipes (openspec
  2026-08-30-table-grid-toolbar).

  countdown: the Statistic component has no countdown mode — the recipe
  composes page-owned time state (a 1s interval over remaining ms,
  mm:ss formatting, a finished flag) under the readout. The fixture is
  deliberately interval-driven (not rAF) so fake timers can pin the
  tick law deterministically.

  precision: value formatting is the caller's (Intl.NumberFormat law)
  — the fixture exposes digits as data for the precision assertions.
-->
<script lang="ts">
  import Statistic from '../../src/lib/ui/statistic/statistic.svelte';

  let durationMs = $state(3_000);
  let remainingMs = $state(durationMs);
  let running = $state(false);
  let finished = $state(false);
  let timer: ReturnType<typeof setInterval> | undefined;

  function start(): void {
    if (running) return;
    running = true;
    timer = setInterval(() => {
      remainingMs = Math.max(0, remainingMs - 1_000);
      if (remainingMs === 0) {
        stop();
        finished = true;
      }
    }, 1_000);
  }
  function stop(): void {
    running = false;
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  }
  function reset(): void {
    stop();
    remainingMs = durationMs;
    finished = false;
  }

  const mmss = $derived(
    `${String(Math.floor(remainingMs / 60_000)).padStart(2, '0')}:${String(Math.floor((remainingMs % 60_000) / 1_000)).padStart(2, '0')}`,
  );

  // precision recipe: one number, three digit policies
  const raw = 1234.5;
  const precisionOptions = [0, 2, 3] as const;
  let digits = $state<(typeof precisionOptions)[number]>(2);
  const precise = $derived(
    new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(raw),
  );
</script>

<div data-countdown-host data-finished={finished ? 'yes' : ''} data-running={running ? 'yes' : ''}>
  <Statistic title="deploy window closes" value={mmss} />
  <div class="mt-3 flex gap-2">
    <button type="button" data-countdown-start onclick={start}>start</button>
    <button type="button" data-countdown-reset onclick={reset}>reset</button>
  </div>
</div>

<div data-precision-host data-digits={digits}>
  <Statistic title="precision" value={precise} />
  <div class="mt-3 flex gap-2">
    {#each precisionOptions as option (option)}
      <button type="button" data-precision-btn={option} onclick={() => (digits = option)} aria-pressed={digits === option}>
        {option} digits
      </button>
    {/each}
  </div>
</div>
