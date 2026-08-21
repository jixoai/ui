<!--
  jixoai range (registry/files/ui/range.svelte).

  2026-08-20 · Form wave 2 (original request: "Range 滑杆完全自绘（不用
  原生 range 控件）"). Fully custom slider: a div + Pointer Events, never
  input[type=range] — the native control paints differently per engine and
  cannot give the brutalist square thumb or the filled progress law.

  Orthogonal intents:
  1. geometry — 4px track (bg muted, radius 0), primary fill from the
     inline-start edge to the thumb, 16×16 SQUARE thumb (1px border, white
     fill, primary border while pressed, shadow-xs hover), optional tick
     ruler under the track (one 4px mark per step).
  2. interaction — pointerdown/move/up with pointer capture (touch-safe,
     touch-action none), pointerdown jumps to the point, dblclick re-jumps
     (subsumed by the pointerdown jump but kept explicit per request),
     keyboard ←→ step / ↑↓ step / Home / End, aria slider contract:
     role="slider" + aria-valuemin/max/now + aria-orientation + tabindex=0.
  3. semantics — the family law: label (aria-labelledby — a div is not
     labelable, so label[for] cannot bind to it), error → "! message" line
     + aria-describedby + dashed thumb border, showValue readout right of
     the label row, $bindable value snapped to step.
  4. direction — RTL by logical properties: the fill grows from
     inset-inline-start, the thumb rides inset-inline-start, the tick ruler
     mirrors via :dir(rtl); pointer/arrow math flips on computed direction.

  Zero dependencies. Decimal steps snap at the step's precision. A custom
  slider does not submit to FormData by itself — pair it with a hidden
  input when a form must carry it.
-->
<script lang="ts">
  interface Props {
    /** committed value; bind:value — snapped into [min, max] on the step */
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    /** field label rendered above the track (aria-labelledby binding) */
    label?: string;
    /** error text → "! message" line + dashed thumb border */
    error?: string;
    /** show the current value right of the label row (default true) */
    showValue?: boolean;
    /** draw one 4px tick per step under the track */
    ticks?: boolean;
    /** disables pointer + keyboard interaction, mutes the paint */
    disabled?: boolean;
    /** wired into aria-labelledby / error[id]; auto-generated when omitted */
    id?: string;
    class?: string;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    label,
    error,
    showValue = true,
    ticks = false,
    disabled = false,
    id = autoId,
    class: className = '',
  }: Props = $props();

  const labelId = $derived(`${id}-label`);
  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  // step precision: decimals of step/min/max, so 0.5 steps commit 1.5, not 1.4999…
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

  // clamped initial/external writes keep the aria contract honest
  $effect(() => {
    const snapped = clampToStep(value);
    if (snapped !== value) value = snapped;
  });

  const fraction = $derived(max > min ? (value - min) / (max - min) : 0);
  const tickCount = $derived(Math.round((max - min) / step));
  const tickStepPct = $derived(tickCount > 0 ? 100 / tickCount : 100);
  const display = $derived(value.toFixed(decimals));

  let rootEl = $state<HTMLDivElement | null>(null);
  let dragging = $state(false);
  let pressed = $state(false);

  function isRtl(): boolean {
    return rootEl !== null && getComputedStyle(rootEl).direction === 'rtl';
  }

  function fractionFromPointer(event: PointerEvent): number {
    if (!rootEl) return 0;
    const rect = rootEl.getBoundingClientRect();
    if (rect.width === 0) return 0;
    let f = (event.clientX - rect.left) / rect.width;
    if (isRtl()) f = 1 - f;
    return Math.min(1, Math.max(0, f));
  }

  function commitFromPointer(event: PointerEvent): void {
    const f = fractionFromPointer(event);
    value = clampToStep(min + f * (max - min));
  }

  function onPointerDown(event: PointerEvent) {
    if (disabled || event.button !== 0) return;
    dragging = true;
    pressed = true;
    rootEl?.setPointerCapture(event.pointerId);
    commitFromPointer(event);
  }

  function onPointerMove(event: PointerEvent) {
    if (!dragging) return;
    commitFromPointer(event);
  }

  function endDrag(event: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    pressed = false;
    if (rootEl?.hasPointerCapture(event.pointerId)) {
      rootEl.releasePointerCapture(event.pointerId);
    }
  }

  // pointerdown already jumps to the click point; dblclick keeps the
  // explicit contract (a fast double press lands on the same spot)
  function onDblClick(event: MouseEvent) {
    if (disabled) return;
    commitFromPointer(event as PointerEvent);
  }

  function onKeydown(event: KeyboardEvent) {
    let next: number | null = null;
    const rtl = isRtl();
    switch (event.key) {
      case 'ArrowRight':
        next = value + (rtl ? -step : step);
        break;
      case 'ArrowLeft':
        next = value + (rtl ? step : -step);
        break;
      case 'ArrowUp':
        next = value + step;
        break;
      case 'ArrowDown':
        next = value - step;
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    event.preventDefault();
    value = clampToStep(next);
  }
</script>

<div class="jx-field {className}">
  {#if label || showValue}
    <div class="jx-range-head">
      {#if label}<span class="jx-label" id={labelId}>{label}</span>{/if}
      {#if showValue}<span class="jx-range-value" class:jx-invalid={invalid}>{display}</span>{/if}
    </div>
  {/if}

  <div
    bind:this={rootEl}
    id={id}
    role="slider"
    tabindex={disabled ? -1 : 0}
    aria-labelledby={label ? labelId : undefined}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    aria-valuetext={display}
    aria-orientation="horizontal"
    aria-invalid={invalidAttr}
    aria-describedby={describedBy}
    aria-disabled={disabled ? 'true' : undefined}
    class="jx-range"
    class:jx-pressed={pressed}
    class:jx-invalid={invalid}
    class:jx-disabled={disabled}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={endDrag}
    onpointercancel={endDrag}
    ondblclick={onDblClick}
    onkeydown={onKeydown}
  >
    <div class="jx-range-track">
      <div class="jx-range-fill" style:width="{fraction * 100}%"></div>
    </div>
    <div class="jx-range-thumb" style="inset-inline-start: calc({fraction * 100}% - 8px)"></div>
    {#if ticks && tickCount > 0}
      <div class="jx-range-ticks" style="--jx-tick-step: {tickStepPct}%"></div>
    {/if}
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>

<style>
  .jx-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    width: 100%;
  }
  .jx-label {
    width: fit-content;
    font-family: var(--font-nav);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  /* label left, live value right (font-mono readout) */
  .jx-range-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
  }
  .jx-range-value {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--foreground);
    font-variant-numeric: tabular-nums;
  }
  .jx-range-value.jx-invalid {
    color: var(--destructive);
  }

  /* the interactive strip: 20px hit area, 4px visual track inside it */
  .jx-range {
    position: relative;
    display: block;
    width: 100%;
    height: 20px;
    margin: 0;
    cursor: pointer;
    touch-action: none; /* the drag owns the gesture on touch */
    user-select: none;
    -webkit-user-select: none;
  }
  .jx-range:focus-visible {
    outline: none;
  }
  .jx-range:focus-visible .jx-range-thumb {
    outline: 1px solid var(--ring);
    outline-offset: 1px;
  }
  .jx-range.jx-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .jx-range-track {
    position: absolute;
    inset-inline: 0;
    top: 50%;
    height: 4px;
    transform: translateY(-50%);
    background: var(--muted);
    border-radius: 0; /* straight line — the brutalist law */
  }
  .jx-range-fill {
    position: absolute;
    inset-inline-start: 0;
    top: 0;
    height: 100%;
    background: var(--primary);
  }

  /* 16×16 square thumb: 1px border, white fill, primary while pressed */
  .jx-range-thumb {
    position: absolute;
    top: 50%;
    width: 16px;
    height: 16px;
    transform: translateY(-50%);
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 0;
    box-shadow: none;
    pointer-events: none; /* the root owns the pointer geometry */
    transition: box-shadow 150ms ease-out, border-color 150ms ease-out;
  }
  .jx-range:hover:not(.jx-disabled) .jx-range-thumb {
    box-shadow: var(--shadow-xs);
  }
  .jx-range.jx-pressed .jx-range-thumb {
    border-color: var(--primary);
    box-shadow: none;
  }
  .jx-range.jx-invalid .jx-range-thumb {
    border-style: dashed;
    border-color: var(--foreground);
  }

  /* tick ruler: one 4px mark per step, drawn as a repeating gradient
     (a mark every --jx-tick-step %; mirrors under :dir(rtl)) */
  .jx-range-ticks {
    position: absolute;
    inset-inline: 0;
    top: calc(50% + 8px);
    height: 4px;
    background: repeating-linear-gradient(
      to right,
      var(--border) 0 1px,
      transparent 1px var(--jx-tick-step)
    );
    pointer-events: none;
  }
  .jx-range-ticks:dir(rtl) {
    background: repeating-linear-gradient(
      to left,
      var(--border) 0 1px,
      transparent 1px var(--jx-tick-step)
    );
  }

  .jx-error {
    display: flex;
    gap: 0.5em;
    margin: 0;
    font-family: var(--font-nav);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--foreground);
  }
  .jx-error-mark {
    font-weight: 700;
    color: var(--destructive);
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-range-thumb {
      transition: none;
    }
  }
</style>
