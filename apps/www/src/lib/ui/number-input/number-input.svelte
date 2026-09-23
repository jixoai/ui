<!--
  jixoai number-input (registry/files/ui/number-input/number-input.svelte).
  A stepper, not a text field fork: the [- NUM +] segmented control for
  bounded quantities. The shell is one bordered row — 1px var(--border),
  radius 0, var(--background) fill, min-height 2.5rem (the 40px family
  law every text-like control shares) — split into two full-height
  stepper squares riding the density hit channel (24/28/32/40/48px across
  the rungs — measured; their own 1px borders form the dividers,
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

  Standard-layer adoption (2026-08-28, ui-plugin-followup B6): the
  inner input rides jx-html-control-lane DIRECTLY (jixoai.css standard
  layer) instead of the face's .jx-control-lane — identical
  declarations (the face class is an @apply of the same utility), so
  the lane carries zero face dependency. Steppers stay
  component-specific (platform stepper law: appearance:textfield pins
  the native spinners off, the [- +] pair owns stepping).

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
  import { getContext } from 'svelte';
  import { CONTROL_CHROME_KEY, type ControlChrome } from '$lib/control-chrome.svelte';
  import {
    densityRungOf,
    provideQueryAnchor,
    provideUniversalLanes,
    stampCarriersForLanes,
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
  import { NumberInputDefaults } from './number-input-defaults.svelte';
  import { numberInputStyles } from './number-input.stylex';
  import './number-input.css';

  interface Props extends Omit<HTMLInputAttributes, 'size' | 'color'> {
    /** committed quantity; bind:value — undefined renders empty */
    value?: number;
    /** density policy: explicit, inherited, then default — the
     *  universal §4 lane (named rungs + the documented small/medium/
     *  large aliases · auto · a coefficient number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query(). SUPPLY-ONLY — zero family
     *  readers (grep-receipted; the native element NEVER receives a size
     *  attribute — the §1 native collision rule; everything the family
     *  does not own still rides {...rest}) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system —
     *  semantic names · hue degrees · raw values · query(). SUPPLY-ONLY —
     *  zero family readers (the native attribute never receives it, §1) */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp · query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive · a
     *  coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
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
    /** caller-supplied validation relations — used only when the
        control's own error wiring is absent (the ItemField adapters
        own the error text; their computed chains must survive — the
        Input merge law, grindstone #17-3) */
    'aria-invalid'?: 'true' | 'false' | undefined;
    'aria-describedby'?: string | undefined;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    value = $bindable(),
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    'data-density': _callerDensity,
    min,
    max,
    step = 1,
    label,
    id = autoId,
    error,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    disabled = false,
    class: className = '',
    chrome: chromeProp = undefined,
    ...rest
  }: Props = $props();

  // the chrome axis ambient (inline read — see lib/control-chrome.svelte.ts)
  const ambientChrome = getContext<{ chrome?: ControlChrome }>(CONTROL_CHROME_KEY)?.chrome;

  const errorId = $derived(`${id}-error`);
  // the family Defaults is the single read point (context-defaults-
  // economy 3.1): explicit ?? ambient scope per slot, one line, no
  // legacy helper channels
  const d = $derived(
    NumberInputDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the root's ANCESTORS are
  // the candidate containers)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const invalid = $derived(error != null && error !== '');
  // the Input merge law: the own error wiring wins, the caller's
  // relations survive otherwise (the ItemField adapters own the text)
  const describedBy = $derived(invalid ? errorId : ariaDescribedBy);
  const invalidAttr = $derived(invalid ? 'true' : ariaInvalid);

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

  // the payload's own join (separator's serialize law): every string
  // declaration except the $$css marker, space-joined — atoms are
  // objects in dev, raw interpolation would render [object Object]
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<div
  bind:this={uniRoot}
  class="jx-field"
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={carriers || undefined}
  data-self-inset="">
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <div
    class={cn(
      'jx-num',
      cx(
        numberInputStyles.shell,
        invalid && numberInputStyles.shellInvalid,
        disabled && numberInputStyles.shellOff,
      ),
      className,
    )}
    data-jx-num-invalid={invalid ? '' : undefined}
    data-chrome={chromeProp ?? ambientChrome ?? 'frame'}
  >
    <button
      type="button"
      data-jx-num-minus
      class={cn('jx-num-btn', cx(numberInputStyles.stepper, numberInputStyles.stepStart))}
      aria-label="decrease"
      {disabled}
      onpointerdown={beginHold.bind(null, -1)}
    >-</button>
    <!-- disabled ⇒ READONLY, not disabled: the value stays focusable and
         selectable (AT can still read it) while typing and native ↑/↓ are
         blocked by the platform; buttons + stepBy guards cover the rest.
         jx-html-control-lane (the STANDARD layer's lane law, B6
         2026-08-28 — previously the face's .jx-control-lane, an @apply
         of the same utility) owns the chromeless typography + placeholder
         distinction; the atoms here only center the text and flex the
         cell (appearance:textfield pins the spinner OFF — this composite
         owns its own [- +] pair, the platform stepper law) -->
    <input
      {...rest}
      {id}
      type="number"
      class={'jx-html-control-lane ' + cn('jx-num-input', cx(numberInputStyles.cell, disabled && numberInputStyles.cellOff))}
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
      class={cn('jx-num-btn', cx(numberInputStyles.stepper, numberInputStyles.stepEnd))}
      aria-label="increase"
      {disabled}
      onpointerdown={beginHold.bind(null, 1)}
    >+</button>
  </div>
  {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
</div>
