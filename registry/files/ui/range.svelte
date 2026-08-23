<!--
  jixoai range (registry/files/ui/range.svelte).

  2026-08-20 · Form wave 2 (original request: "Range 滑杆完全自绘（不用
  原生 range 控件）"). Fully custom slider: a div + Pointer Events, never
  input[type=range] — the native control paints differently per engine and
  cannot give the brutalist square thumb or the filled progress law.

  Orthogonal intents:
  1. geometry — the shared slider law (2026-08-23 Tier rebase, same
     geometry as the Tier-1 .jx-range lane in the jx-pure sheet):
     a thin bordered track box (1px var(--border), var(--background)
     fill, height 0.5rem incl. borders), a 1.25rem SQUARE thumb
     (var(--primary) fill, 1px border, shadow-2xs hover lift,
     translateY(1px) press), the primary fill from the inline-start
     edge to the thumb (the one law this custom widget adds over the
     native lane), and the optional tick ruler under the track (one 4px
     mark per step). The root stem renamed .jx-range → .jx-slider so
     the Tier-1 sheet owns the .jx-range vocabulary for the native
     control.
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

  Zero dependencies. Decimal steps snap at the step's precision. Form
  submission rides the FACELESS jx-form-field bridge
  (registry/files/lib/form-field.ts): pass name= and the numeric string
  of the committed value reaches FormData through ElementInternals; form
  reset bubbles back as jx-reset, form/fieldset disable as jx-disabled.
  The bridge owns no box, no content, no paint — the slider keeps its
  fully custom geometry.

  NativeHTML base audit (2026-08-20, updated by the form-field bridge the
  same day): deliberately no native
  input[type=range] underneath (see intent 1) — form association rides
  the jx-form-field bridge instead, and
  the a11y contract is hand-held: role="slider" +
  tabindex + aria-valuemin/max/now/valuetext + aria-labelledby (a div
  is not labelable). disabled blocks pointerdown/dblclick AND keydown
  at their entries (tabindex already leaves the tab order at -1); no
  native disabled semantics exist to lean on.
-->
<script lang="ts">
  // side-effect import: registers the faceless <jx-form-field> element
  // (client-only, idempotent) that carries this field's form association
  import '$lib/form-field';

  interface Props {
    /** committed value; bind:value — snapped into [min, max] on the step */
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    /** form field name — the bridge submits the numeric string under it */
    name?: string;
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
    name,
    label,
    error,
    showValue = true,
    ticks = false,
    disabled = false,
    id = autoId,
    class: className = '',
  }: Props = $props();

  // form lifecycle: what jx-reset restores, and the form-disable mirror
  const initialValue = value;
  let formDisabled = $state(false);
  const isDisabled = $derived(disabled || formDisabled);

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
    if (isDisabled || event.button !== 0) return;
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
    if (isDisabled) return;
    commitFromPointer(event as PointerEvent);
  }

  function onKeydown(event: KeyboardEvent) {
    if (isDisabled) return; // keyboard is an interaction path too (2026-08-20 fix)
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
  <!-- faceless form bridge (form-field.ts law): the numeric string of the
       committed value rides ElementInternals into FormData; jx-reset /
       jx-disabled bubble the form lifecycle back into this component.
       Owns no box, no content.
       disabled passes `|| undefined`: Svelte has no boolean-attribute
       semantics for custom elements and would render disabled="false"
       as a PRESENT attribute (presence = true in HTML). -->
  <jx-form-field
    aria-hidden="true"
    {name}
    value={String(value)}
    disabled={isDisabled || undefined}
    onjx-reset={() => (value = initialValue)}
    onjx-disabled={(event: CustomEvent<boolean>) => (formDisabled = event.detail)}
  ></jx-form-field>
  {#if label || showValue}
    <div class="jx-slider-head">
      {#if label}<span class="jx-label" id={labelId}>{label}</span>{/if}
      {#if showValue}<span class="jx-slider-value" class:jx-invalid={invalid}>{display}</span>{/if}
    </div>
  {/if}

  <div
    bind:this={rootEl}
    id={id}
    role="slider"
    tabindex={isDisabled ? -1 : 0}
    aria-labelledby={label ? labelId : undefined}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    aria-valuetext={display}
    aria-orientation="horizontal"
    aria-invalid={invalidAttr}
    aria-describedby={describedBy}
    aria-disabled={isDisabled ? 'true' : undefined}
    class="jx-slider"
    class:jx-pressed={pressed}
    class:jx-invalid={invalid}
    class:jx-disabled={isDisabled}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={endDrag}
    onpointercancel={endDrag}
    ondblclick={onDblClick}
    onkeydown={onKeydown}
  >
    <div class="jx-slider-track">
      <div class="jx-slider-fill" style:width="{fraction * 100}%"></div>
    </div>
    <div class="jx-slider-thumb" style="inset-inline-start: calc({fraction * 100}% - 10px)"></div>
    {#if ticks && tickCount > 0}
      <div class="jx-slider-ticks" style="--jx-tick-step: {tickStepPct}%"></div>
    {/if}
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>

<style>
  /* Tier rebase (2026-08-23): .jx-field / .jx-label / .jx-error scaffolding
     and the box/track/thumb laws live in the Tier-1 jx-pure sheet; this
     block owns ONLY the custom widget's geometry (fill, thumb travel, tick
     ruler) and the bridge layout. */
  /* the faceless bridge owns no box — pre-hydration included, so the
     prerendered HTML never flashes an extra flex gap before upgrade */
  .jx-field > :global(jx-form-field) {
    display: contents;
  }

  /* label left, live value right (font-mono readout) */
  .jx-slider-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
  }
  .jx-slider-value {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--foreground);
    font-variant-numeric: tabular-nums;
  }
  .jx-slider-value.jx-invalid {
    color: var(--destructive);
  }

  /* the interactive strip: 1.75rem hit area (Tier-1 parity), the 8px
     bordered track box and the 20px thumb centered inside it */
  .jx-slider {
    position: relative;
    display: block;
    width: 100%;
    height: 1.75rem;
    margin: 0;
    cursor: pointer;
    touch-action: none; /* the drag owns the gesture on touch */
    user-select: none;
    -webkit-user-select: none;
  }
  .jx-slider:focus-visible {
    outline: none;
  }
  .jx-slider:focus-visible .jx-slider-thumb {
    outline: 1px solid var(--ring);
    outline-offset: 1px;
  }
  .jx-slider.jx-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* the shared track law (Tier-1 .jx-range parity): thin box, 1px border,
     background fill — this widget adds the primary progress fill */
  .jx-slider-track {
    position: absolute;
    inset-inline: 0;
    top: 50%;
    height: calc(0.5rem - 2px); /* 8px incl. the 1px borders */
    transform: translateY(-50%);
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 0; /* straight line — the brutalist law */
  }
  .jx-slider-fill {
    position: absolute;
    inset-inline-start: 0;
    top: 0;
    height: 100%;
    background: var(--primary);
  }

  /* the shared thumb law (Tier-1 parity): 1.25rem SQUARE, primary fill,
     1px border, hover lift, press back into the page */
  .jx-slider-thumb {
    position: absolute;
    top: 50%;
    width: 1.25rem;
    height: 1.25rem;
    transform: translateY(-50%);
    background: var(--primary);
    border: 1px solid var(--border);
    border-radius: 0;
    box-shadow: none;
    pointer-events: none; /* the root owns the pointer geometry */
    transition: box-shadow 150ms ease-out, transform 150ms ease-out;
  }
  .jx-slider:hover:not(.jx-disabled) .jx-slider-thumb {
    box-shadow: var(--shadow-2xs);
  }
  .jx-slider.jx-pressed .jx-slider-thumb {
    transform: translateY(calc(-50% + 1px)); /* press INTO the page */
    box-shadow: none;
  }
  .jx-slider.jx-invalid .jx-slider-thumb {
    border-style: dashed;
    border-color: var(--foreground);
  }

  /* tick ruler: one 4px mark per step, drawn as a repeating gradient
     (a mark every --jx-tick-step %; mirrors under :dir(rtl)) */
  .jx-slider-ticks {
    position: absolute;
    inset-inline: 0;
    top: calc(50% + 10px); /* clear of the 20px thumb's lower half */
    height: 4px;
    background: repeating-linear-gradient(
      to right,
      var(--border) 0 1px,
      transparent 1px var(--jx-tick-step)
    );
    pointer-events: none;
  }
  .jx-slider-ticks:dir(rtl) {
    background: repeating-linear-gradient(
      to left,
      var(--border) 0 1px,
      transparent 1px var(--jx-tick-step)
    );
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-slider-thumb {
      transition: none;
    }
  }
</style>
