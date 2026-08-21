<!--
  jixoai number-input (registry/files/ui/number-input.svelte).
  A stepper, not a text field fork: the [- NUM +] segmented control for
  bounded quantities. The shell is one bordered row — 1px var(--border),
  radius 0, var(--background) fill — split into two 28px square buttons
  (their own 1px borders form the dividers, negative margins overlap the
  shell border so every line stays 1px) around a borderless, centered
  native <input type="number">. The native spinners are hidden
  (appearance:none) but native behavior is kept: ↑/↓ on the input steps
  with min/max/step read straight off the element attributes.

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
  `disabled` is intercepted so both buttons disable in lockstep.
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends HTMLInputAttributes {
    /** committed quantity; bind:value — undefined renders empty */
    value?: number;
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
      from min (else 0) so the first press is always meaningful */
  function stepBy(direction: 1 | -1): void {
    const base = value != null && Number.isFinite(value) ? value : (min ?? 0);
    value = clamp(snap(base + direction * step));
  }

  // ---- press-and-hold: immediate step, 300ms delay, then 100ms/step ---
  const HOLD_DELAY_MS = 300;
  const HOLD_REPEAT_MS = 100;
  let holdDelay = 0;
  let holdInterval = 0;

  function beginHold(direction: 1 | -1): void {
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
    const n = input.valueAsNumber;
    value = Number.isFinite(n) ? clamp(snap(n)) : undefined;
    // forward a caller-supplied change handler from the rest props
    (rest as { onchange?: (event: Event) => void }).onchange?.(event);
  }
</script>

<div class="jx-field">
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <div class="jx-num {className}" class:jx-num-invalid={invalid}>
    <button
      type="button"
      class="jx-num-btn jx-num-minus"
      aria-label="decrease"
      {disabled}
      onpointerdown={beginHold.bind(null, -1)}
    >-</button>
    <input
      {...rest}
      {id}
      type="number"
      class="jx-num-input"
      {min}
      {max}
      {step}
      {disabled}
      value={value == null ? '' : String(value)}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      onchange={onCommit}
    />
    <button
      type="button"
      class="jx-num-btn jx-num-plus"
      aria-label="increase"
      {disabled}
      onpointerdown={beginHold.bind(null, 1)}
    >+</button>
  </div>
  {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
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

  /* ---- the shell: one bordered row, dividers from the button borders -
     height = 28px buttons + the shell's own 1px borders. Plain flex row:
     under dir="rtl" it flips by itself — minus sits inline-end, plus
     inline-start, no physical-CSS involvement. */
  .jx-num {
    display: flex;
    align-items: stretch;
    width: 100%;
    height: 30px;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color: var(--foreground);
    transition: box-shadow 150ms ease-out;
  }
  .jx-num:hover:not(:focus-within) {
    box-shadow: var(--shadow-2xs);
  }
  .jx-num:focus-within {
    box-shadow: none;
  }
  .jx-num:has(input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .jx-num-invalid {
    border-style: dashed;
  }

  /* ---- 28px square steppers; the outer edge overlaps the shell border
     (negative inline margin) so nothing reads as 2px */
  .jx-num-btn {
    flex: none;
    width: 28px;
    height: 28px;
    align-self: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-nav);
    font-weight: 700;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    touch-action: manipulation; /* no double-tap-zoom delay on touch */
    transition: background-color 150ms ease-out, transform 150ms ease-out;
  }
  .jx-num-minus {
    margin-inline-start: -1px;
  }
  .jx-num-plus {
    margin-inline-end: -1px;
  }
  .jx-num-btn:hover:not(:disabled) {
    background: var(--muted);
  }
  /* press physics, direction-neutral: press back INTO the page */
  .jx-num-btn:active:not(:disabled) {
    transform: translateY(1px);
  }
  .jx-num-btn:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-num-btn:disabled {
    cursor: not-allowed;
  }

  /* ---- the number: borderless, centered, native spinners hidden but
     native ↑/↓ stepping kept (min/max/step live on the element) ------- */
  .jx-num-input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.45;
    text-align: center;
    appearance: textfield;
    -moz-appearance: textfield;
  }
  .jx-num-input::-webkit-outer-spin-button,
  .jx-num-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .jx-num-input::placeholder {
    color: var(--muted-foreground);
    opacity: 1;
  }
  /* the site focus law rides the INPUT (typing is the primary path) */
  .jx-num-input:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-num-input:disabled {
    cursor: not-allowed;
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
    .jx-num,
    .jx-num-btn {
      transition: none;
    }
  }
</style>
