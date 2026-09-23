<!--
  jixoai scroll chrome (registry/files/ui/scroll-run/
  scroll-chrome.svelte, Owner 2026-09-04 — the unification; round 2
  the same day: the vertical axis, the merged ramp() toggles, custom
  chip content).

  THE overlay half of the ONE scroll-run contract: the veil layer
  (z 1) and the chevron chips (z 2) a scrollable region mounts on its
  one-cell grid host, beside (never inside) the run. Consumers render
  this once; the paint laws live in scroll-run.css, the stamp machine
  in scroll-run.svelte.ts:

    <div class="jx-scroll-host grid [grid-template-columns:minmax(0,1fr)]" style={knobs}>
      <div data-jx-scroll-run data-axis="horizontal|vertical" ...>…the scrolling content…</div>
      <ScrollChrome {scrollEffect} run={runEl} />
    </div>

  Everything here is keyed on the run's JS-stamped
  data-jx-scroll-state: a run that cannot scroll (or a page before its
  verdict lands — no JS) paints NO chrome. The chips nudge through
  nudgeRun (one page minus the two lanes, axis- and RTL-normalized);
  either chip can be DECLARED disabled (backwardDisabled/forwardDisabled,
  default rendered — a disabled chip does not render AT ALL, Owner
  round 7); the veil mounts only under the veil effects (shadow /
  progressBlur — the ramp scrollEffect carries no layer; the ladder
  rides EITHER axis — inline edges on a horizontal run, block edges
  on a vertical one).

  OWNERSHIP (round 2, widened round 3): THIS component stamps the
  run's data-scroll-effect, the ramp's data-ramp-* toggle flags AND
  the ramp's magnitude vars (--jx-scroll-edge-slide/blur from the
  builder's distance/radius) — the consumer never hand-stamps
  scrollEffect attributes or edge vars on the run.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ScrollEffect } from './scroll-run.svelte';
  import { nudgeRun } from './scroll-run.svelte';
  import {
    provideUniversalLanes,
    type ColorLane,
    type DensityLane,
    type ElevationLane,
    type MotionLane,
    type QueryResult,
    type RadiusLane,
    type ShapeLane,
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import { ScrollRunDefaults } from './scroll-run-defaults.svelte';
  import ProgressiveBlur from '../progressive-blur/progressive-blur.svelte';
  import { scrollChromeStyles } from './scroll-run.stylex';
  // the law sheet rides the chrome (every chrome consumer needs the
  // run/chip/veil rules; a chrome-less run consumer imports it
  // explicitly)
  import './scroll-run.css';

  // the payload's own join (separator's serialize law): atoms are
  // objects in dev — composition goes through THIS joiner (all string
  // values except $$css, space-joined; plain strings pass through)
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  let {
    scrollEffect,
    run,
    backwardLabel = 'Scroll backward',
    forwardLabel = 'Scroll forward',
    backwardContent,
    forwardContent,
    backwardDisabled = false,
    forwardDisabled = false,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
  }: {
    /** the active scrollEffect — veil types mount the layer, all
     *  types mount the chips */
    scrollEffect: ScrollEffect;
    /** the run the chips nudge (the scroller itself) */
    run: HTMLElement | null | undefined;
    backwardLabel?: string;
    forwardLabel?: string;
    /** custom chip CONTENT (the custom scroll-button support): the
     *  snippet renders INSIDE the chip button — the frost, the shape,
     *  the verdict gating and the focusable-button law all stay
     *  (the tabs-indicator paint-override pattern); only the glyph
     *  layer retires */
    backwardContent?: Snippet;
    forwardContent?: Snippet;
    /** DECLARED hidden (default rendered): backwardDisabled/forwardDisabled
     *  retire the chip from the DOM ENTIRELY (Owner round 7 — "disable
     *  chips should hide them completely"); the verdict still owns the
     *  AUTOMATIC gates for rendered chips (a closed edge or a
     *  cannot-scroll run never paints) */
    backwardDisabled?: boolean;
    forwardDisabled?: boolean;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
  } = $props();

  // ── the eight-axis surface, the NO-ROOT (fragment) dialect (W3-D3
  // — FIRST-TIME contract, all no-own; the pattern-hero-set
  // precedent): the chrome renders a FRAGMENT (the optional veil
  // layer + the two chevron chips — every root conditional, nothing
  // guaranteed), so the family supplies the resolved lanes through
  // CONTEXT only — the veil's composed ProgressiveBlur children
  // stamp their own roots through the ambient chain. No carriers and
  // no query() anchor here (a fragment has no single element to
  // bind; the run and its one-cell host are consumer-authored per
  // the raw contract — an @ query() addresses the consumer's own
  // containers). The record is the family's read point (the A3 law)
  const d = $derived(
    ScrollRunDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  void d;
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });

  const vertical = $derived(run?.getAttribute('data-axis') === 'vertical');

  // THIS component owns the run's scrollEffect attributes: the type key the
  // css rules select on, the ramp's per-treatment flags (each css
  // property keys its own flag — a treatment turned off never pays its
  // property), AND the ramp's magnitudes — the builder's distance/radius
  // reach the DOM as run-level inline vars (a toggle off never sets its
  // var; a non-ramp effect clears both). Consumers never hand-write
  // --jx-scroll-edge-* anywhere
  const toggles = $derived(
    scrollEffect.type === 'ramp'
      ? ({
          'data-ramp-opacity': scrollEffect.opacity,
          'data-ramp-blur': scrollEffect.blur,
          'data-ramp-translate': scrollEffect.translate,
        } as Record<string, boolean>)
      : {},
  );
  const magnitudes = $derived<[name: string, value: string | undefined][]>(
    scrollEffect.type === 'ramp'
      ? [
          ['--jx-scroll-edge-slide', scrollEffect.translate ? scrollEffect.distance : undefined],
          ['--jx-scroll-edge-blur', scrollEffect.blur ? scrollEffect.radius : undefined],
        ]
      : [],
  );
  $effect(() => {
    const el = run;
    if (!el) return;
    el.setAttribute('data-scroll-effect', scrollEffect.type);
    // the enumeration is FIXED: a non-ramp effect (toggles empty)
    // clears every flag — stale attrs must never outlive a flip
    for (const [name, on] of Object.entries(toggles)) {
      if (on) el.setAttribute(name, '');
      else el.removeAttribute(name);
    }
    for (const name of ['data-ramp-opacity', 'data-ramp-blur', 'data-ramp-translate']) {
      if (!(name in toggles)) el.removeAttribute(name);
    }
    // same fixed enumeration for the magnitudes (undefined clears —
    // a toggle flipped off must retire its var, not strand it)
    const live = new Map(magnitudes);
    for (const name of ['--jx-scroll-edge-slide', '--jx-scroll-edge-blur']) {
      const value = live.get(name);
      if (value) el.style.setProperty(name, value);
      else el.style.removeProperty(name);
    }
  });

  // the veil layer mounts under the veil effects; the progressBlur
  // LADDER rides either axis — inline edges (start/end) on a
  // horizontal run, block edges (top/bottom) on a vertical one (the
  // component's grid dialect; the old vertical shadow substitution
  // retired — the two effects must read differently on either axis)
  const veil = $derived(scrollEffect.type === 'shadow' || scrollEffect.type === 'progressBlur');
</script>

{#if veil}
  <!-- the merged veil layer: ONE grid item (z 1) clipping both edge
       veils; each ENTERS by scroll-driven translate along the run's
       axis (the host's --jx-scroll-progress drives it), gated by the
       scroll-state verdict (the unlayered rules in scroll-run.css) -->
  <div class={cx('jx-scroll-veil-layer', scrollChromeStyles.veilLayer)}>
    {#if scrollEffect.type === 'progressBlur'}
      <!-- hold = 50: with snap retired there is no flush lane to cover —
           the ramp owns half the band and the peak the other half;
           the positions ride the axis (inline start/end, block
           top/bottom) -->
      <ProgressiveBlur
        pin="grid"
        position={vertical ? 'top' : 'start'}
        reveal="static"
        height="var(--jx-scroll-veil)"
        hold={50}
        blurLevels={scrollEffect.blurLevels}
        class="jx-scroll-veil"
      />
      <ProgressiveBlur
        pin="grid"
        position={vertical ? 'bottom' : 'end'}
        reveal="static"
        height="var(--jx-scroll-veil)"
        hold={50}
        blurLevels={scrollEffect.blurLevels}
        class="jx-scroll-veil"
      />
    {:else}
      <!-- the shadow veil: one band per edge — the separator's INK law
           (backdrop contrast SUBTRACTS color toward mid tone, never
           adds black; dark mode reverses itself, zero color tokens).
           The placement (inline edge on a horizontal run, full-width
           block band on a vertical one) lives in scroll-run.css keyed
           on the host :has axis — NEVER as utilities here: a
           utilities-layer justify-self would beat the components-layer
           vertical rules and collapse the auto-width bands to 0 (the
           vertical no-paint bug, caught live) -->
      <div
        class={cx('jx-scroll-shadow jx-scroll-veil', scrollChromeStyles.shadowVeil)}
        data-position="start"
        aria-hidden="true"
      ></div>
      <div
        class={cx('jx-scroll-shadow jx-scroll-veil', scrollChromeStyles.shadowVeil)}
        data-position="end"
        aria-hidden="true"
      ></div>
    {/if}
  </div>
{/if}
<!-- the chips: REAL DOM BUTTONS on the host, OUTSIDE the run —
     scroll controls are not content actions, the a11y tree stays
     clean; the css keys their existence on the JS-stamped
     scroll-state, their fade on --jx-scroll-progress and their
     placement on the run's data-axis (logical start/end edges). A
     custom-content chip drops the glyph layer only -->
<!-- the chips: REAL DOM BUTTONS on the host, OUTSIDE the run —
     scroll controls are not content actions, the a11y tree stays
     clean; the css keys their existence on the JS-stamped
     scroll-state, their fade on --jx-scroll-progress and their
     placement on the run's data-axis (logical start/end edges). A
     custom-content chip drops the glyph layer only. A DECLARED-
     disabled chip does not render at all (completely hidden) -->
{#if !backwardDisabled}
  <button
    type="button"
    tabindex="-1"
    aria-label={backwardLabel}
    data-jx-scroll-chevron="start"
    data-jx-scroll-chip-content={backwardContent ? '' : undefined}
    onclick={() => run && nudgeRun(run, -1)}
  >
    {#if backwardContent}{@render backwardContent()}{/if}
  </button>
{/if}
{#if !forwardDisabled}
  <button
    type="button"
    tabindex="-1"
    aria-label={forwardLabel}
    data-jx-scroll-chevron="end"
    data-jx-scroll-chip-content={forwardContent ? '' : undefined}
    onclick={() => run && nudgeRun(run, 1)}
  >
    {#if forwardContent}{@render forwardContent()}{/if}
  </button>
{/if}
