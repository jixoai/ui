<!--
  jixoai range (registry/files/ui/range/range.svelte; native rebase
  2026-09-01).

  Owner ruling (2026-09-01, restating the standing law the 2026-08-20
  divergence had inverted): the registry component rides the NATIVE
  input[type=range] as its base — jx-pure is the foundation of the
  whole form face; the registry version's job is richer slots and a
  more semantic surface, NEVER a re-drawn simulation. The old "fully
  custom slider, never input[type=range]" (div + Pointer Events +
  hand-held role=slider + the jx-form-field bridge) is retired WITH its
  entire shadow system: the platform now owns the pointer, the
  keyboard (←/→/↑/↓ step, Home/End jump, PageUp/PageDown stride), RTL,
  the labelable-element contract (a real label[for] binds — a div
  never could), and form submission (real name/value into FormData,
  native reset and form-disable). "For free" is NOT absolute: native
  reset restores the input's own value but fires NO input/change
  events, so the reset listener below re-syncs the $bindable by hand
  (E-4, 2026-09-02) — the readout and aria-valuetext follow the state.

  Ruler ruling (owner, 2026-09-02): the tick ruler is anchored to the
  THUMB's travel, not the track's raw box — the thumb center runs
  inset half a thumb from each end, so the ruler carries the same
  half-thumb inline inset and its marks land exactly where the thumb
  can sit. The ruler is also a live fine-tune surface: pointerdown
  snaps to the nearest mark, and commits ride the input's OWN channel
  (assign input.value + dispatch the input/change pair a user gesture
  would — bind:value, the readout, aria-valuetext and form truth all
  follow one path). The wheel fine-tunes, declarative in the
  touch-action axis grammar (owner ruling, 2026-09-02): `wheel` —
  true/'xy' (default) = both axes, 'y' = the plain wheel, 'x' = the
  shift+wheel gesture (the engines axis-swap it onto deltaX),
  false/'none' = off (the event is not ours, the page scrolls
  freely), `{ x?, y? }` = per-axis config with a per-detent
  multiplier (input-steps; fractional = several detents per
  input-step; 0.2 → five detents per step, 5 → one detent, five
  steps). The engine counts DETENTS — each event clamped to ±20px —
  so a physical mouse notch and a trackpad detent both step exactly
  once. A gesture on an owned axis is swallowed (an ancestor
  handler/scroll region never acts) AND default-prevented (the page
  never scrolls under the slider); ctrlKey pinch-zoom is never
  hijacked. The geometry is written in logical properties so the
  orientation faces inherit it.

  Orientation round (owner, 2026-09-02): `orientation="vertical"` rides
  the PLATFORM's vertical slider — the input carries `orient="vertical"`
  (Gecko's native attribute; the law's vertical branch keys on it and
  adds writing-mode: vertical-lr + direction: rtl so min sits at the
  physical BOTTOM everywhere). The geometry swaps to the width axis
  (100cqw), the ruler becomes a vertical strip on the inline end inset
  on the BLOCK axis (half a thumb, top and bottom), and the click
  mapping runs bottom-up (min at the bottom; no RTL flip — the value
  axis is fixed by the law).

  What the registry version ADDS over the bare jx-pure face (the
  family's slot + semantic layer, unchanged in shape from the custom
  era): the label row (a REAL label[for] now), the live value readout
  (step-precision formatting), the tick ruler (one mark per step, at
  the SNAP points i·step — plus the explicit end tick at 100%, E-12),
  the error line (aria-describedby + aria-invalid + the dashed-ring
  thumb repaint), density tiers, and external-write snapping into
  [min,max] on the step. The paint is the jx-pure range law VERBATIM,
  mounted on the component's own hook through the GENERATED
  range-mount marker slot in range.css (E-1, 2026-09-02 — the 4th
  mounting surface is machine-projected from laws/range.ts, gated by
  the css-laws build; a registry component cannot assume the consumer
  mounted .jx-pure, but the visual law is ONE).
-->
<script lang="ts">
  import { setContext, untrack } from 'svelte';
  import type { HTMLInputAttributes, HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import RangeTick, { RANGE_TICK_CONTEXT, type RangeTickContext } from './range-tick.svelte';
  import './range.css';

  // native passthrough (the input.svelte law): the interface rides the
  // platform's own attribute surface, so aria-label without a label,
  // title, data-testid, required… all land on the REAL input through
  // the rest spread — a label-less slider keeps its accessible name
  interface Props extends HTMLInputAttributes {
    /** committed value; bind:value — external writes snap into [min, max] on the step */
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    /** form field name — the native input submits its numeric string under it */
    name?: string;
    /** field label rendered above the track (a real label[for] binding) */
    label?: string;
    /** error text → "! message" line + dashed-ring thumb */
    error?: string;
    /** visually hide the label while keeping the label[for] wiring
        (field-like compositions name the control from outside) */
    srLabel?: boolean;
    /** show the current value right of the label row (default true) */
    showValue?: boolean;
    /** the tick ruler: `true` draws one default mark per step; pass a
        `ticks` snippet to compose RangeTick scales (the ruler metaphor
        — minor ticks short, major ticks long); `false` (default) draws
        nothing. The ruler insets to the thumb's travel and pointerdown
        snaps to the nearest mark */
    ticks?: boolean | Snippet;
    /** slider axis — vertical rides the platform's writing-mode face
        (min at the physical bottom; Gecko's orient attribute) */
    orientation?: 'horizontal' | 'vertical';
    /** the wheel fine-tune surface, declarative in the touch-action
        axis grammar: `true`/'xy' (default) = both axes, one input-step
        per detent; 'y' = the plain wheel; 'x' = the shift+wheel
        gesture (axis-swapped onto deltaX by the engines); false/'none'
        disables it; `{ x?, y? }` configures each axis separately —
        false off, true = step 1, a number = input-steps per detent
        (0.2 → five detents per input-step, 5 → one detent, five
        steps). Owned gestures are swallowed and default-prevented —
        the page never scrolls under the slider. ctrlKey pinch-zoom is
        never captured. Fully reactive: wheel={bbb()} */
    wheel?:
      | boolean
      | 'x'
      | 'y'
      | 'xy'
      | 'none'
      | { x?: boolean | number; y?: boolean | number };
    /** the platform's own disabled semantics (pointer, keyboard, form) */
    disabled?: boolean;
    /** pairs the label[for] and the error's aria-describedby; auto-generated when omitted */
    id?: string;
    class?: string;
    density?: Density;
    'data-density'?: string;
    /** caller-supplied validation relations — used only when the
        control's own error wiring is absent (the input.svelte merge) */
    'aria-invalid'?: 'true' | 'false' | undefined;
    'aria-describedby'?: string | undefined;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    name,
    label,
    error,
    srLabel = false,
    showValue = true,
    ticks = false,
    orientation = 'horizontal',
    wheel = true,
    disabled = false,
    id = autoId,
    class: className = '',
    density,
    'data-density': _callerDensity,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    ...rest
  }: Props = $props();

  const inheritedDensity = getDensityContext();
  const resolvedDensity = $derived(resolveDensity(density, inheritedDensity));

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const vertical = $derived(orientation === 'vertical');
  // the ruler: on when the boolean is true OR a ticks snippet composes it
  const ticksSnippet = $derived(typeof ticks === 'function' ? ticks : null);
  const ticksOn = $derived(ticks === true || ticksSnippet !== null);

  // ---- the ruler's registration channel (the parent manages its ticks)
  // RangeTick strips register their scale here; the ranking is BY VALUE
  // (order-independent) so the default lengths grade ascending. The
  // mutations run UNTRACKED: a registration effect that pushed to a
  // tracked array would read its own write and loop forever.
  const tickScales = $state<number[]>([]);
  function registerTickScale(scale: number): () => void {
    untrack(() => tickScales.push(scale));
    return () =>
      untrack(() => {
        const at = tickScales.indexOf(scale);
        if (at !== -1) tickScales.splice(at, 1);
      });
  }
  const tickContext: RangeTickContext = {
    register: registerTickScale,
    scales: () => [...new Set(tickScales)].sort((a, b) => a - b),
    stepPct: () => tickStepPct,
  };
  setContext(RANGE_TICK_CONTEXT, tickContext);
  // the error law outranks caller aria, but never DROPS it (input.svelte)
  const describedBy = $derived(invalid ? errorId : ariaDescribedBy);
  const invalidAttr = $derived(invalid ? 'true' : ariaInvalid);

  // step precision: decimals of step/min/max, so 0.5 steps commit 1.5,
  // not 1.4999… (the readout formats at the same precision). Exponent
  // notation carries its magnitude in the exponent ('1e-7' → 7).
  function decimalsOf(n: number): number {
    if (!Number.isFinite(n)) return 0;
    const s = String(n);
    if (s.includes('e')) {
      const [mantissa, exponent] = s.split('e');
      const dot = mantissa.indexOf('.');
      const mantissaDecimals = dot === -1 ? 0 : mantissa.length - dot - 1;
      return Math.max(0, mantissaDecimals - Number(exponent));
    }
    const dot = s.indexOf('.');
    return dot === -1 ? 0 : s.length - dot - 1;
  }
  const decimals = $derived(Math.max(decimalsOf(step), decimalsOf(min), decimalsOf(max)));

  // step guard (E-8): step<=0 or non-finite would NaN-poison the snap
  // math and the tick ruler — fall back to the platform default (1)
  const safeStep = $derived(step > 0 && Number.isFinite(step) ? step : 1);

  function clampToStep(raw: number): number {
    const bounded = Math.min(max, Math.max(min, raw));
    // min and max are TERMINAL snap points (platform truth, 2026-09-02):
    // the native step scale anchors both ends — a step-mismatched max
    // (100 with step 7) is still a value the platform holds and the
    // ruler's end tick commits verbatim. Everything else snaps to the
    // nearest step and is RE-CLAMPED (E-13, 2026-09-02): rounding can
    // jump PAST max (value=100/min=0/max=100/step=60 used to commit
    // 120 into the bindable) — the public [min,max] contract outranks
    // the snap
    if (bounded === min || bounded === max) return Number(bounded.toFixed(decimals));
    const stepped = min + Math.round((bounded - min) / safeStep) * safeStep;
    return Number(Math.min(max, Math.max(min, stepped)).toFixed(decimals));
  }

  // external/initial writes keep the $bindable contract honest (the
  // input's OWN commits are already step-snapped by the platform)
  $effect(() => {
    const snapped = clampToStep(value);
    if (snapped !== value) value = snapped;
  });

  // tick math (E-3, 2026-09-02): one mark per SNAP point —
  // i·step/(max−min)·100 — not an even split of 100% across a rounded
  // tick count (a non-dividing step used to drift the ruler off its
  // own snap points). The quotient is cleaned at 1e-6 percent — far
  // below any sub-pixel the ruler can express — so 7/100·100 renders
  // as 7%, never 7.000000000000001%
  const span = $derived(max - min);
  const tickCount = $derived(span > 0 ? Math.round(span / safeStep) : 0);
  const tickStepPct = $derived(
    tickCount > 0 ? Math.round(((safeStep / span) * 100) * 1e6) / 1e6 : 100,
  );
  const display = $derived(value.toFixed(decimals));

  // ---- form reset sync (E-4, the toggle-group law) ----------------------
  // the platform restores the input's own value (the markup's value
  // attribute at parse time) but fires NO input/change events — the
  // bind:value channel stays stale. Re-read once the browser has
  // applied the reset (microtask); the readout + aria-valuetext derive
  // from `value` and follow for free.
  let inputEl = $state<HTMLInputElement | null>(null);
  $effect(() => {
    if (!inputEl) return;
    const form = inputEl.closest('form');
    form?.addEventListener('reset', onFormReset);
    return () => form?.removeEventListener('reset', onFormReset);
  });
  function onFormReset(): void {
    queueMicrotask(() => {
      const restored = Number(inputEl?.value);
      if (Number.isFinite(restored) && restored !== value) value = restored;
    });
  }

  // ---- the ruler as a fine-tune surface (owner ruling, 2026-09-02) -----
  // Click-to-snap + wheel step, committed through the input's OWN
  // channel: assign input.value and dispatch the input/change pair a
  // user gesture would — bind:value, the readout, aria-valuetext and
  // form submission follow one path (the form-reset honesty, E-4).
  let rulerEl = $state<HTMLDivElement | null>(null);

  function commitValue(raw: number): void {
    if (!inputEl || disabled) return;
    const snapped = clampToStep(raw);
    if (String(snapped) === inputEl.value) return;
    inputEl.value = String(snapped);
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change'));
  }

  // pointerdown snaps to the NEAREST mark (generous hit targets even
  // at dense tick counts); index tickCount is the ::after end tick —
  // max itself when the step does not divide the span. Horizontal
  // maps along the inline axis (RTL mirrors); vertical maps along the
  // block axis bottom-up — the law pins min at the physical bottom,
  // so no direction flip exists on that axis. Focus follows the
  // platform's own click so the arrows refine from the new value.
  function onRulerPointerDown(event: PointerEvent): void {
    if (disabled || !inputEl || !rulerEl) return;
    const rect = rulerEl.getBoundingClientRect();
    let ratio: number;
    if (vertical) {
      if (rect.height <= 0) return;
      ratio = 1 - (event.clientY - rect.top) / rect.height;
    } else {
      if (rect.width <= 0) return;
      ratio = (event.clientX - rect.left) / rect.width;
      if (getComputedStyle(inputEl).direction === 'rtl') ratio = 1 - ratio;
    }
    const i = Math.min(tickCount, Math.max(0, Math.round(ratio * tickCount)));
    commitValue(i >= tickCount ? max : min + i * safeStep);
    inputEl.focus();
  }

  // one detent = one step unit (owner ruling, 2026-09-02 — "every
  // detent steps"): a wheel event is CLAMPED to ±20px (one trackpad
  // detent), so a physical mouse notch (~100px in one event) and a
  // trackpad detent (~20px) both count exactly once. The per-axis
  // multiplier scales the unit — fractional values make one input-step
  // take several detents (0.2 → five detents), multipliers above 1
  // stride several steps per detent — with the fraction carried over
  // losslessly between gestures.
  const WHEEL_DETENT = 20;
  let wheelUnits = 0;
  function wheelAxisStep(v: boolean | number | undefined): number | null {
    if (v === false || v == null) return null;
    if (v === true) return 1;
    return Number.isFinite(v) && v > 0 ? v : 1;
  }
  const wheelAxes = $derived.by((): { x: number | null; y: number | null } => {
    if (wheel === false || wheel === 'none') return { x: null, y: null };
    if (wheel === 'x') return { x: 1, y: null };
    if (wheel === 'y') return { y: 1, x: null };
    if (wheel === true || wheel === 'xy') return { x: 1, y: 1 };
    return { x: wheelAxisStep(wheel.x), y: wheelAxisStep(wheel.y) };
  });
  function onWheel(event: WheelEvent): void {
    if (disabled || !inputEl || event.ctrlKey) return;
    // Shift+wheel arrives axis-swapped on most engines (the gesture
    // rides deltaX, deltaY stays 0) — the live axis decides ownership:
    // an axis the config turns off is NOT ours — the page scrolls,
    // ancestor handlers act
    const onY = event.deltaY !== 0;
    const axis = onY ? wheelAxes.y : wheelAxes.x;
    const raw = onY ? event.deltaY : event.deltaX;
    if (raw === 0 || axis === null) return;
    let delta = event.deltaMode === 1 ? raw * 33 : event.deltaMode === 2 ? raw * 100 : raw;
    delta = Math.max(-WHEEL_DETENT, Math.min(WHEEL_DETENT, delta));
    // the slider OWNS the gesture: swallowed (no ancestor acts) and
    // default-prevented (the page never scrolls under it), detent or not
    event.stopPropagation();
    event.preventDefault();
    wheelUnits += (delta / WHEEL_DETENT) * axis;
    const steps = Math.trunc(wheelUnits);
    if (steps === 0) return;
    wheelUnits -= steps;
    // wheel up (negative delta) raises the value — a dial, not a scrollbar
    commitValue(value - steps * safeStep);
  }

  $effect(() => {
    const el = inputEl;
    const ruler = rulerEl;
    if (!el) return;
    // non-passive by necessity: the slider owns its wheel while hovered
    el.addEventListener('wheel', onWheel, { passive: false });
    ruler?.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      ruler?.removeEventListener('wheel', onWheel);
    };
  });
</script>

<div
  data-density={resolvedDensity}
  data-orient={vertical ? 'vertical' : undefined}
  class={cn('jx-field', className)}
>
  {#if label || showValue}
    <div data-jx-slider-head class="flex items-baseline justify-between gap-3">
      {#if label}
        <label class={'jx-label' + (srLabel ? ' sr-only' : '')} for={id}>{label}</label>
      {/if}
      {#if showValue}
        <span
          data-jx-slider-value
          class={cn('jx-slider-value font-mono text-foreground tabular-nums', invalid && 'text-destructive')}
        >{display}</span>
      {/if}
    </div>
  {/if}

  <!-- the body: input + ruler share one row container so the vertical
       face can lay them side by side (horizontal keeps the plain block
       flow — the wrapper renders identically). The base: a REAL
       input[type=range] — semantics, keyboard, pointer, RTL, label[for]
       and form submission are the platform's. `orient` is Gecko's own
       vertical attribute and the law's vertical hook; the law pairs it
       with writing-mode for Chromium (min at the physical bottom).
       aria-valuetext carries the step-precision readout for assistive
       tech (decimal steps); every other value/min/max/step attribute is
       native truth. The rest spread lands HERE (aria-label without a
       label, title, data-testid…) and sits BEFORE the component-owned
       wiring, so type/value/step/aria can never be hijacked through it
       (input.svelte law) -->
  <div data-jx-range-body>
    <input
      id={id}
      bind:this={inputEl}
      {...rest}
      type="range"
      data-jx-range=""
      orient={vertical ? 'vertical' : undefined}
      bind:value
      {min}
      {max}
      step={safeStep}
      {name}
      {disabled}
      aria-valuetext={display}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      class:jx-invalid={invalid}
    />

    {#if ticksOn && tickCount > 0}
      <!-- svelte-ignore a11y_no_static_element_interactions — the ruler
           intentionally stays aria-hidden (the step semantics live on
           the input); pointerdown is a redundant fine-tune surface.
           The parent owns the surface and its events; the strips are
           composed declaratively — the default single scale, or the
           consumer's RangeTick rulers via the ticks snippet -->
      <div
        bind:this={rulerEl}
        class="jx-slider-ticks"
        aria-hidden="true"
        onpointerdown={onRulerPointerDown}
      >
        {#if ticksSnippet}
          {@render ticksSnippet()}
        {:else}
          <RangeTick scale={1} />
        {/if}
      </div>
    {/if}
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>
