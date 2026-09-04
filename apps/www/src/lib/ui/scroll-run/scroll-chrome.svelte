<!--
  jixoai scroll chrome (registry/files/ui/scroll-run/
  scroll-chrome.svelte, Owner 2026-09-04 — the unification).

  THE overlay half of the ONE scroll-run contract: the veil layer
  (z 1) and the chevron chips (z 2) a scrollable region mounts on its
  one-cell grid host, beside (never inside) the run. Consumers render
  this once; the paint laws live in scroll-run.css, the stamp machine
  in scroll-run.svelte.ts:

    <div class="jx-scroll-host grid [grid-template-columns:minmax(0,1fr)]" style={knobs}>
      <div data-jx-scroll-run data-axis="horizontal" ...>…the scrolling content…</div>
      <ScrollChrome {effect} run={runEl} />
    </div>

  Everything here is keyed on the run's JS-stamped
  data-jx-scroll-state: a run that cannot scroll (or a page before its
  verdict lands — no JS) paints NO chrome. The chips nudge through
  nudgeRun (one page minus the two lanes, RTL-normalized); the veil
  mounts only under the veil effects (shadow / progressBlur — the ramp
  effects carry no layer).
-->
<script lang="ts">
  import type { ScrollEffect } from './scroll-run.svelte';
  import { nudgeRun } from './scroll-run.svelte';
  import ProgressiveBlur from '../progressive-blur/progressive-blur.svelte';
  // the law sheet rides the chrome (every chrome consumer needs the
  // run/chevron/veil rules; a chrome-less run consumer imports it
  // explicitly)
  import './scroll-run.css';

  let {
    effect,
    run,
    backwardLabel = 'Scroll backward',
    forwardLabel = 'Scroll forward',
  }: {
    /** the active scrollEffect — veil types mount the layer, all
     *  types mount the chips */
    effect: ScrollEffect;
    /** the run the chips nudge (the scroller itself) */
    run: HTMLElement | null | undefined;
    backwardLabel?: string;
    forwardLabel?: string;
  } = $props();

  const veil = $derived(effect.type === 'shadow' || effect.type === 'progressBlur');
</script>

{#if veil}
  <!-- the merged veil layer: ONE grid item (z 1) clipping both edge
       veils; each ENTERS by scroll-driven translate (the host's
       --jx-scroll-progress drives it), gated by the scroll-state
       verdict (the unlayered rules in scroll-run.css) -->
  <div class="jx-scroll-veil-layer pointer-events-none grid [grid-area:1/1]">
    {#if effect.type === 'progressBlur'}
      <!-- hold = 50: with snap retired there is no flush lane to cover —
           the ramp owns half the band and the peak the other half -->
      <ProgressiveBlur
        pin="grid"
        position="start"
        reveal="static"
        height="var(--jx-scroll-veil)"
        hold={50}
        blurLevels={effect.blurLevels}
        class="jx-scroll-veil"
      />
      <ProgressiveBlur
        pin="grid"
        position="end"
        reveal="static"
        height="var(--jx-scroll-veil)"
        hold={50}
        blurLevels={effect.blurLevels}
        class="jx-scroll-veil"
      />
    {:else}
      <!-- the shadow veil: one band per edge — the separator's INK law
           (backdrop contrast SUBTRACTS color toward mid tone, never
           adds black; dark mode reverses itself, zero color tokens) -->
      <div
        class="jx-scroll-shadow jx-scroll-veil [grid-area:1/1] justify-self-start [transform:translateZ(0)]"
        data-position="start"
        aria-hidden="true"
      ></div>
      <div
        class="jx-scroll-shadow jx-scroll-veil [grid-area:1/1] justify-self-end [transform:translateZ(0)]"
        data-position="end"
        aria-hidden="true"
      ></div>
    {/if}
  </div>
{/if}
<!-- the chevrons: REAL DOM BUTTONS on the host, OUTSIDE the run —
     scroll controls are not content actions, the a11y tree stays
     clean; the css keys their existence on the JS-stamped
     scroll-state and their fade on --jx-scroll-progress -->
<button
  type="button"
  tabindex="-1"
  aria-label={backwardLabel}
  data-jx-scroll-chevron="inline-start"
  onclick={() => run && nudgeRun(run, -1)}
></button>
<button
  type="button"
  tabindex="-1"
  aria-label={forwardLabel}
  data-jx-scroll-chevron="inline-end"
  onclick={() => run && nudgeRun(run, 1)}
></button>
