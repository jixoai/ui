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
  native reset and form-disable) — engine-tested for free.

  What the registry version ADDS over the bare jx-pure face (the
  family's slot + semantic layer, unchanged in shape from the custom
  era): the label row (a REAL label[for] now), the live value readout
  (step-precision formatting), the tick ruler (one mark per step), the
  error line (aria-describedby + aria-invalid + the dashed-ring thumb
  repaint), density tiers, and external-write snapping into [min,max]
  on the step. The paint is the jx-pure range recipe verbatim, mounted
  UNSCOPED on the component's own hook (a registry component cannot
  assume the consumer mounted .jx-pure) — one visual law, two mounting
  surfaces.
-->
<script lang="ts">
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import './range.css';

  interface Props {
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
    /** draw one 4px tick per step under the track */
    ticks?: boolean;
    /** the platform's own disabled semantics (pointer, keyboard, form) */
    disabled?: boolean;
    /** pairs the label[for] and the error's aria-describedby; auto-generated when omitted */
    id?: string;
    class?: string;
    density?: Density;
    'data-density'?: string;
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
    disabled = false,
    id = autoId,
    class: className = '',
    density,
    'data-density': _callerDensity,
  }: Props = $props();

  const inheritedDensity = getDensityContext();
  const resolvedDensity = $derived(resolveDensity(density, inheritedDensity));

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  // step precision: decimals of step/min/max, so 0.5 steps commit 1.5,
  // not 1.4999… (the readout formats at the same precision)
  function decimalsOf(n: number): number {
    if (!Number.isFinite(n)) return 0;
    const dot = String(n).indexOf('.');
    return dot === -1 ? 0 : String(n).length - dot - 1;
  }
  const decimals = $derived(Math.max(decimalsOf(step), decimalsOf(min), decimalsOf(max)));

  function clampToStep(raw: number): number {
    const bounded = Math.min(max, Math.max(min, raw));
    const stepped = min + Math.round((bounded - min) / step) * step;
    return Number(stepped.toFixed(decimals));
  }

  // external/initial writes keep the $bindable contract honest (the
  // input's OWN commits are already step-snapped by the platform)
  $effect(() => {
    const snapped = clampToStep(value);
    if (snapped !== value) value = snapped;
  });

  const tickCount = $derived(Math.round((max - min) / step));
  const tickStepPct = $derived(tickCount > 0 ? 100 / tickCount : 100);
  const display = $derived(value.toFixed(decimals));
</script>

<div data-density={resolvedDensity} class={cn('jx-field', className)}>
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

  <!-- the base: a REAL input[type=range] — semantics, keyboard,
       pointer, RTL, label[for] and form submission are the platform's.
       aria-valuetext carries the step-precision readout for assistive
       tech (decimal steps); every other value/min/max/step attribute is
       native truth -->
  <input
    type="range"
    id={id}
    data-jx-range=""
    bind:value
    {min}
    {max}
    {step}
    {name}
    {disabled}
    aria-valuetext={display}
    aria-invalid={invalidAttr}
    aria-describedby={describedBy}
    class:jx-invalid={invalid}
  />

  {#if ticks && tickCount > 0}
    <div
      class="jx-slider-ticks mt-0.5 h-1"
      style="--jx-tick-step: {tickStepPct}%"
      aria-hidden="true"
    ></div>
  {/if}

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>
