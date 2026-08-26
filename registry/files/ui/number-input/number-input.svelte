<!--
  jixoai number-input (registry/files/ui/number-input.svelte).
  A stepper, not a text field fork: the [- NUM +] segmented control for
  bounded quantities. The shell is one bordered row — 1px var(--border),
  radius 0, var(--background) fill, min-height 2.5rem (the 40px family
  law every text-like control shares) — split into two full-height
  28px-wide stepper buttons (their own 1px borders form the dividers,
  negative margins overlap the shell border so every line stays 1px)
  around a borderless, centered native <input type="number">. The native
  spinners are hidden (appearance:none) but native behavior is kept:
  ↑/↓ on the input steps with min/max/step read straight off the
  element attributes.

  2026-08-23 · Tier rebase: the inner input carries the Tier-1
  .jx-control-lane class (jx-pure sheet) — chromeless typography,
  placeholder distinction and the spinner law (hidden; engines reject
  custom paint on spin pseudos, see the sheet's decision record) live
  there, shared with bare markup.

  Buttons are text glyphs — font-nav bold "-" / "+", no icon dependency.
  DOM order is minus, input, plus; the row is plain flex, so under
  dir="rtl" it flips by itself (minus lands on the inline-end, plus on
  the inline-start — the semantic swap with zero physical CSS), and the
  only side-aware styles are logical properties.

  Behavior: click steps once and clamps into [min, max]; hold steps once,
  then accelerates (300ms delay, then one step every 100ms) until
  pointerup/pointercancel — window-level, so sliding off the button
  never strands the interval. Direct typing is first-class: the input
  commits on change (blur/Enter) — empty reverts to undefined, values
  clamp into range. The displayed value is derived from `value`, so
  committed rewrites ("007" → "7") normalize without fighting typing.

  Same semantics law as input.svelte: label[for] block (auto id via
  $props.id()), error string → aria-invalid + aria-describedby +
  "! message" line + dashed shell border, inset 1px focus-visible
  outline on the ring token. Everything else (name, placeholder,
  autocomplete…) flows through restProps onto the native input;
  `disabled` is intercepted so both buttons disable in lockstep while
  the input turns READONLY, not disabled — it stays focusable and
  selectable for AT (the value must remain readable) while typing and
  ↑/↓ stepping are blocked; stepBy/beginHold/onCommit all guard the
  entry so no path mutates a disabled field (engines differ on whether
  disabled buttons swallow pointerdown). One trade to know: a readonly
  value still submits with the form — drop the `name` when a disabled
  field must exit FormData.

  NativeHTML base audit (2026-08-20): the inner control IS a native
  type="number" — ↑/↓ stepping and min/max/step live on the element,
  only the spinners are repainted away. Form association is therefore
  real (name + value ride into FormData). No second native <select>/
  <input> is needed to carry it.

  tw4 (2026-08-24): the composite's static paint (shell row, steppers,
  centered number cell) is token/arbitrary utilities in the markup —
  deliberately NOT the sheet's .jx-control-shell (its disabled law here is
  readonly-not-disabled); the .jx-field/.jx-label/.jx-error scaffolding
  is consumed from jx-pure Part A. Only the hover/focus/press state
  machines and the reduced-motion kill remain in number-input.css
  (D1-exempt residue under the layer law).
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import './number-input.css';

  interface Props extends HTMLInputAttributes {
    /** committed quantity; bind:value — undefined renders empty */
    value?: number;
    /** density policy: explicit, inherited, then default */
    density?: Density;
    /** lower bound; stepping and the change-commit clamp into it */
    min?: number;
    /** upper bound; stepping and the change-commit clamp into it */
    max?: number;
    /** step increment (default 1); also the native input's step */
    step?: number;
    /** field label; renders label[for] above the control */
    label?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    value = $bindable(),
    density,
    'data-density': _callerDensity,
    min,
    max,
    step = 1,
    label,
    id = autoId,
    error,
    disabled = false,
    class: className = '',
    ...rest
  }: Props = $props();

  const errorId = $derived(`${id}-error`);
  const outerDensity = getDensityContext();
  const resolvedDensity: Density = $derived(resolveDensity(density, outerDensity));
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  // float-step safety: snap arithmetic to the step's decimal precision
  // (step 0.1 must land on 0.2, not 0.30000000000000004)
  const stepDecimals = $derived(Math.max(0, (String(step).split('.')[1] ?? '').length));

  function clamp(n: number): number {
    let out = n;
    if (min != null && out < min) out = min;
    if (max != null && out > max) out = max;
    return out;
  }

  function snap(n: number): number {
    return Number(n.toFixed(stepDecimals));
  }

  /** one step in direction, clamped into range; an unset value starts
      from min (else 0) so the first press is always meaningful.
      THE disabled gate: every step path (button press, hold repeat)
      funnels through here, so one guard blocks them all */
  function stepBy(direction: 1 | -1): void {
    if (disabled) return;
    const base = value != null && Number.isFinite(value) ? value : (min ?? 0);
    value = clamp(snap(base + direction * step));
  }

  // ---- press-and-hold: immediate step, 300ms delay, then 100ms/step ---
  const HOLD_DELAY_MS = 300;
  const HOLD_REPEAT_MS = 100;
  let holdDelay = 0;
  let holdInterval = 0;

  function beginHold(direction: 1 | -1): void {
    if (disabled) return; // never arm timers for a disabled field
    stopHold();
    stepBy(direction);
    holdDelay = window.setTimeout(() => {
      holdInterval = window.setInterval(() => stepBy(direction), HOLD_REPEAT_MS);
    }, HOLD_DELAY_MS);
    // window-level so pointerup ANYWHERE ends the run — sliding off the
    // button can never strand a running interval
    window.addEventListener('pointerup', stopHold);
    window.addEventListener('pointercancel', stopHold);
  }

  function stopHold(): void {
    if (holdDelay) window.clearTimeout(holdDelay);
    if (holdInterval) window.clearInterval(holdInterval);
    holdDelay = 0;
    holdInterval = 0;
    window.removeEventListener('pointerup', stopHold);
    window.removeEventListener('pointercancel', stopHold);
  }

  // release timers + listeners if the component unmounts mid-hold
  $effect(() => () => stopHold());

  // ---- direct typing: commit on change, then clamp/normalize ---------
  function onCommit(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    if (disabled) {
      // readonly should never fire change, but an engine that lets one
      // through must not mutate a disabled field — revert to committed
      input.value = value == null ? '' : String(value);
      return;
    }
    const n = input.valueAsNumber;
    value = Number.isFinite(n) ? clamp(snap(n)) : undefined;
    // forward a caller-supplied change handler from the rest props
    (rest as { onchange?: (event: Event) => void }).onchange?.(event);
  }
</script>

<div class="jx-field" data-density={resolvedDensity}>
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <div
    class={cn(
      'jx-num flex items-stretch w-full max-w-full min-h-[var(--jx-hit)] border border-border rounded-none bg-background text-foreground transition-[box-shadow] duration-150 ease-out',
      invalid && 'border-dashed',
      disabled && 'jx-num-off opacity-50 cursor-not-allowed',
      className,
    )}
    data-jx-num-invalid={invalid ? '' : undefined}
  >
    <button
      type="button"
      data-jx-num-minus
      class="jx-num-btn flex-none min-w-[var(--jx-hit)] min-h-[var(--jx-hit)] -ms-px inline-flex items-center justify-center p-0 border border-border rounded-none bg-background text-foreground font-nav font-bold text-[length:var(--jx-text)] leading-none cursor-pointer touch-manipulation transition-[background-color,transform] duration-150 ease-out disabled:cursor-not-allowed"
      aria-label="decrease"
      {disabled}
      onpointerdown={beginHold.bind(null, -1)}
    >-</button>
    <!-- disabled ⇒ READONLY, not disabled: the value stays focusable and
         selectable (AT can still read it) while typing and native ↑/↓ are
         blocked by the platform; buttons + stepBy guards cover the rest.
         jx-control-lane (Tier-1 jx-pure sheet) owns the chromeless
         typography + placeholder distinction + spinner law; the utilities
         here only center the text and flex the cell (appearance:textfield
         pins the spinner OFF — this composite owns its own [- +] pair) -->
    <input
      {...rest}
      {id}
      type="number"
      class={'jx-control-lane ' + cn('jx-num-input flex-1 min-w-0 text-center [appearance:textfield]', disabled && 'cursor-not-allowed')}
      {min}
      {max}
      {step}
      readonly={disabled}
      value={value == null ? '' : String(value)}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      onchange={onCommit}
    />
    <button
      type="button"
      data-jx-num-plus
      class="jx-num-btn flex-none min-w-[var(--jx-hit)] min-h-[var(--jx-hit)] -me-px inline-flex items-center justify-center p-0 border border-border rounded-none bg-background text-foreground font-nav font-bold text-[length:var(--jx-text)] leading-none cursor-pointer touch-manipulation transition-[background-color,transform] duration-150 ease-out disabled:cursor-not-allowed"
      aria-label="increase"
      {disabled}
      onpointerdown={beginHold.bind(null, 1)}
    >+</button>
  </div>
  {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
</div>
