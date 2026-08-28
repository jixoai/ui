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

  tw4 (2026-08-24): static slot/label/error paint is token utilities in
  the markup (markup-known states — filled/complete/invalid borders —
  ride conditional utilities); only the :focus outline law (and its
  complete-state ink) remains in input-otp.css (D1-exempt residue under
  the layer law).
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { untrack } from 'svelte';
  import { cn } from '$lib/utils';
  import '$lib/form-field';
  import './input-otp.css';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';

  interface Props extends Omit<HTMLInputAttributes, 'value' | 'type' | 'maxlength'> {
    /** form field name — the joined code submits under this name */
    name?: string;
    /** density policy: explicit, inherited, then default */
    density?: Density;
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
  const outerDensity = getDensityContext();
  const resolvedDensity = $derived(resolveDensity(density, outerDensity));
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

<div data-jx-otp data-density={resolvedDensity} class={cn('flex flex-col gap-[var(--jx-gap)] w-fit', className)} role="group" aria-label={label ?? 'one-time code'}>
    {#if label}
      <label data-jx-otp-label class="font-nav text-[length:var(--jx-text-secondary)] tracking-[0.1em] uppercase text-muted-foreground" for="{id}-0">{label}</label>
    {/if}
    <div data-jx-otp-slots class="flex gap-[var(--jx-gap)]" onfocusin={handleFocusIn}>
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
            'jx-otp-slot box-border min-w-[max(var(--jx-hit),calc(var(--jx-line)*2))] min-h-[max(var(--jx-hit),calc(var(--jx-line)*2))] p-0 border border-border bg-background text-foreground font-mono text-[length:var(--jx-text)] text-center rounded-(--radius) caret-primary disabled:opacity-50 disabled:cursor-not-allowed',
            ch !== '' && 'border-foreground',
            complete && 'jx-otp-complete border-primary',
            !!error && 'border-destructive border-dashed',
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
      <p id={errorId} data-jx-otp-error class="m-0 flex items-center gap-1.5 text-xs text-destructive"><span aria-hidden="true">!</span>{error}</p>
    {/if}
  </div>
