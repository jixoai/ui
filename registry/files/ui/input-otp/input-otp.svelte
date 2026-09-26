<!--
  jixoai input OTP (registry/files/ui/input-otp/input-otp.svelte).
  The one-time-code field: N single-character inputs (inputmode +
  autocomplete="one-time-code" where it makes sense) with the mechanics
  a raw stack of inputs lacks — auto-advance on type, backstep on
  backspace, paste distributing across the slots, and focus jumping to
  the first EMPTY slot on focus.

  Form semantics through the jx-form-field bridge (the group is not a
  single native control): the FULL code joins the form as one value
  under `name` — a 6-slot OTP submits "123456", not six fragments.
  incomplete codes submit the empty string (never a partial lie);
  required + jx-reset flow through the bridge like every jixoai
  form control.

  Keyboard: the slots are real inputs — arrows walk them, and typing
  anywhere advances. disabled dims the whole set.

  tw4 (2026-08-24) → tailwindless Wave 1 batch 3 (2026-09-17): the
  static slot/label/error paint rides the family's stylex ATOMS
  (input-otp.stylex.ts) joined through cx() — markup-known states
  (filled/complete/invalid borders) walk conditional atoms; only the
  :focus outline law (and its complete-state ink) remains in
  input-otp.css (D1-exempt residue under the layer law).
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { untrack } from 'svelte';
  import { cn } from '$lib/utils';
  import '$lib/form-field';
  import './input-otp.css';
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
  import { InputOtpDefaults } from './input-otp-defaults.svelte';
  import { otpStyles } from './input-otp.stylex';

  interface Props extends Omit<HTMLInputAttributes, 'value' | 'type' | 'maxlength' | 'size' | 'color'> {
    /** form field name — the joined code submits under this name */
    name?: string;
    /** density policy: explicit, inherited, then default */
    /** density policy: explicit, inherited, then default — the
     *  universal §4 lane (named rungs + the documented small/medium/
     *  large aliases · auto · a coefficient number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query(). CONSUMED by the family (the
     *  native element NEVER receives a size attribute from it — the §1
     *  native collision rule; everything the family does not own still
     *  rides {...rest}) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system —
     *  semantic names · hue degrees · raw values · query(). CONSUMED by
     *  the family (the native attribute never receives it, §1) */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp · query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive · a
     *  coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    /** slot count; default 6 */
    length?: number;
    /** the joined code; bindable (bind:value) for controlled use */
    value?: string;
    /** numeric-only slots (default true — most OTPs are digits) */
    numeric?: boolean;
    disabled?: boolean;
    /** reads above the slots */
    label?: string;
    /** error line under the slots */
    error?: string;
    id?: string;
  }

  const autoId = $props.id();

  let {
    name,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    'data-density': _callerDensity,
    length = 6,
    value = $bindable(''),
    numeric = true,
    disabled = false,
    label,
    error,
    id = autoId,
    class: className = '',
    required,
    ...rest
  }: Props = $props();

  const slots = $derived(Math.max(1, Math.min(12, Math.trunc(length))));
  // the family Defaults is the single read point (context-defaults-
  // economy 3.1): explicit ?? ambient scope per slot, one line, no
  // legacy helper channels
  const d = $derived(
    InputOtpDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the root's ANCESTORS are
  // the candidate containers)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  /** per-slot chars, source of truth; value derives from the join */
  // eager from props so SSR paints all slots (no blank first frame)
  let chars = $state<string[]>(
    (() => {
      const next = [...(value ?? '').slice(0, slots)].map((ch) =>
        numeric && !/\d/.test(ch) ? '' : ch,
      );
      while (next.length < slots) next.push('');
      return next;
    })(),
  );
  // two-way sync between slots and value — the equality guard is what
  // keeps the pair of effects from feeding each other forever
  // value → slots ONLY: chars is read untracked so a slot mutation can
  // never be "re-synced" against the not-yet-updated value (the write-
  // back effect owns that direction); without this the pair of effects
  // eats freshly typed chars on the very next flush
  $effect.pre(() => {
    const incoming = (value ?? '').slice(0, slots);
    const synced = untrack(() => chars.length === slots && chars.join('') === incoming);
    if (synced) return;
    const next = [...incoming].map((ch) => (numeric && !/\d/.test(ch) ? '' : ch));
    while (next.length < slots) next.push('');
    chars = next;
  });
  $effect(() => {
    const joined = chars.join('');
    if (joined !== (value ?? '')) value = joined;
  });

  /** form/fieldset disable propagation (the bridge's jx-disabled) */
  let formDisabled = $state(false);
  const isDisabled = $derived(disabled || formDisabled);

  let slotEls = $state<HTMLInputElement[]>([]);
  const errorId = $derived(`${id}-error`);
  const complete = $derived(chars.every((ch) => ch !== ''));

  function syncTo(index: number): void {
    const next = Math.min(index + 1, slots - 1);
    slotEls[next]?.focus();
    slotEls[next]?.select();
  }

  function handleInput(event: Event, index: number): void {
    const input = event.currentTarget as HTMLInputElement;
    // a paste or fast typing can land several chars in one slot —
    // distribute everything typed from this slot onward
    const incoming = [...input.value].filter((ch) => !numeric || /\d/.test(ch));
    if (incoming.length === 0) {
      chars[index] = '';
      input.value = '';
      return;
    }
    for (let i = 0; i < incoming.length && index + i < slots; i++) {
      chars[index + i] = incoming[i];
    }
    for (let i = 0; i < slots; i++) {
      if (slotEls[i]) slotEls[i].value = chars[i] ?? '';
    }
    const filled = Math.min(index + incoming.length, slots - 1);
    slotEls[filled]?.focus();
    slotEls[filled]?.select();
  }

  function handleKeydown(event: KeyboardEvent, index: number): void {
    const input = slotEls[index];
    if (!input) return;
    if (event.key === 'Backspace' && input.value === '' && index > 0) {
      event.preventDefault();
      chars[index - 1] = '';
      slotEls[index - 1].value = '';
      slotEls[index - 1].focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      slotEls[index - 1].focus();
      slotEls[index - 1].select();
    }
    if (event.key === 'ArrowRight' && index < slots - 1) {
      event.preventDefault();
      slotEls[index + 1].focus();
      slotEls[index + 1].select();
    }
  }

  /** focus ENTERING the set from outside lands on the first empty
   * slot; moves between slots (arrows, typing) are left alone */
  function handleFocusIn(event: FocusEvent): void {
    const container = event.currentTarget;
    const prior = event.relatedTarget;
    if (container instanceof HTMLElement && prior instanceof Node && container.contains(prior)) return;
    const target = Math.max(0, chars.findIndex((ch) => ch === ''));
    slotEls[target]?.focus();
    slotEls[target]?.select();
  }

  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner, never a
  // raw class={styles.x} interpolation
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
</script>

<jx-form-field
  aria-hidden="true"
  {name}
  value={complete ? chars.join('') : ''}
  disabled={isDisabled || undefined}
  required={required}
  onjx-reset={() => (value = '')}
  onjx-disabled={(e: CustomEvent<boolean>) => (formDisabled = e.detail)}
></jx-form-field>

<div
  bind:this={uniRoot}
  data-jx-otp
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={carriers || undefined}
  class={cn(cx(otpStyles.group), className)}
  role="group"
  aria-label={label ?? 'one-time code'}>
    {#if label}
      <label data-jx-otp-label class={cx(otpStyles.label)} for="{id}-0">{label}</label>
    {/if}
    <div data-jx-otp-slots class={cx(otpStyles.slots)} onfocusin={handleFocusIn}>
      {#each chars as ch, index (index)}
        <input
          id="{id}-{index}"
          type="text"
          inputmode={numeric ? 'numeric' : 'text'}
          autocomplete={index === 0 ? 'one-time-code' : undefined}
          maxlength={slots}
          data-jx-otp-filled={ch !== '' ? '' : undefined}
          data-jx-otp-invalid={!!error ? '' : undefined}
          class={cn(
            'jx-otp-slot',
            cx(otpStyles.slot),
            ch !== '' && cx(otpStyles.filledBorder),
            complete && `jx-otp-complete ${cx(otpStyles.completeBorder)}`,
            !!error && cx(otpStyles.invalidBorder),
          )}
          disabled={isDisabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          bind:this={slotEls[index]}
          value={ch}
          oninput={(e) => handleInput(e, index)}
          onkeydown={(e) => handleKeydown(e, index)}
          {...rest}
        />
      {/each}
    </div>
    {#if error}
      <p id={errorId} data-jx-otp-error class={cx(otpStyles.error)}><span aria-hidden="true">!</span>{error}</p>
    {/if}
  </div>
