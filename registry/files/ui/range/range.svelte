<!--
  jixoai range (registry/files/ui/range.svelte).

  2026-08-20 · Form wave 2 (original request: "Range 滑杆完全自绘（不用
  原生 range 控件）"). Fully custom slider: a div + Pointer Events, never
  input[type=range] — the native control paints differently per engine and
  cannot give the brutalist square thumb or the filled progress law.

  Orthogonal intents:
  1. geometry — the shared slider law (2026-08-23 Tier rebase, same
     geometry as the Tier-1 .jx-range lane in the jx-pure sheet):
     the daisyUI round language (2026-08-24 rebuild) — a pill groove at
     half-thumb height, a light disc thumb on a thick primary ring, the
     primary fill as a full-strip-height pill from the inline-start edge,
     and the optional tick ruler under the track (one 4px mark per step).
     The root stem is .jx-slider so the Tier-1 sheet owns the .jx-range
     vocabulary for the native control.
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

  tw4 (2026-08-24): static geometry (head row, readout, groove, fill,
  disc thumb, tick ruler geometry) is token/arbitrary utilities in the
  markup; the .jx-field/.jx-label/.jx-error scaffolding is CONSUMED from
  the jx-pure sheet's Part A; only the tick ruler's repeating-gradient
  pair (:dir(rtl) mirror utilities cannot key on computed direction),
  the focus-visible machine (root outline kill + thumb ring) and the
  invalid→thumb repaint remain in range.css (D1-exempt residue). The
  old scoped block's vestigial reduced-motion kill (a transition:none
  on a thumb that carries no transition) was dropped as a no-op.
-->
<script lang="ts">
  // side-effect import: registers the faceless <jx-form-field> element
  // (client-only, idempotent) that carries this field's form association
  import '$lib/form-field';
  import { cn } from '$lib/utils';
  import './range.css';

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

<div class={cn('jx-field', className)}>
  <!-- faceless form bridge (form-field.ts law): the numeric string of the
       committed value rides ElementInternals into FormData; jx-reset /
       jx-disabled bubble the form lifecycle back into this component.
       Owns no box, no content — the `contents` utility keeps the
       prerendered HTML from flashing an extra flex gap pre-upgrade.
       disabled passes `|| undefined`: Svelte has no boolean-attribute
       semantics for custom elements and would render disabled="false"
       as a PRESENT attribute (presence = true in HTML). -->
  <jx-form-field
    class="contents"
    aria-hidden="true"
    {name}
    value={String(value)}
    disabled={isDisabled || undefined}
    onjx-reset={() => (value = initialValue)}
    onjx-disabled={(event: CustomEvent<boolean>) => (formDisabled = event.detail)}
  ></jx-form-field>
  {#if label || showValue}
    <div class="jx-slider-head flex items-baseline justify-between gap-3">
      {#if label}<span class="jx-label" id={labelId}>{label}</span>{/if}
      {#if showValue}<span class={cn('jx-slider-value font-mono text-xs text-foreground tabular-nums', invalid && 'text-destructive')} class:jx-invalid={invalid}>{display}</span>{/if}
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
    class={cn(
      'jx-slider relative block w-full h-7 m-0 cursor-pointer touch-none select-none',
      isDisabled && 'jx-disabled opacity-50 cursor-not-allowed',
    )}
    class:jx-pressed={pressed}
    class:jx-invalid={invalid}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={endDrag}
    onpointercancel={endDrag}
    ondblclick={onDblClick}
    onkeydown={onKeydown}
  >
    <div
      class="jx-slider-track absolute inset-x-0 top-1/2 h-[calc(var(--jx-slider-thumb,1.5rem)/2)] -translate-y-1/2 bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)] rounded-[calc(infinity*1px)]"
    ></div>
    <div
      class="jx-slider-fill absolute start-0 h-[var(--jx-slider-thumb,1.5rem)] bg-primary rounded-[calc(infinity*1px)] [inset-block:calc(var(--jx-slider-thumb,1.5rem)/-4)]"
      style:width="{fraction * 100}%"
    ></div>
    <div
      class="jx-slider-thumb absolute top-1/2 -translate-y-1/2 w-[var(--jx-slider-thumb,1.5rem)] h-[var(--jx-slider-thumb,1.5rem)] bg-background border-4 border-primary rounded-[calc(infinity*1px)] shadow-none pointer-events-none"
      style="inset-inline-start: calc({fraction * 100}% - 10px)"
    ></div>
    {#if ticks && tickCount > 0}
      <div class="jx-slider-ticks absolute inset-x-0 top-[calc(50%_+_10px)] h-1 pointer-events-none" style="--jx-tick-step: {tickStepPct}%"></div>
    {/if}
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>
