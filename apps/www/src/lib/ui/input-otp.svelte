<!--
  jixoai input OTP (registry/files/ui/input-otp.svelte).
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
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { untrack } from 'svelte';
  import '$lib/form-field';

  interface Props extends Omit<HTMLInputAttributes, 'value' | 'type' | 'maxlength'> {
    /** form field name — the joined code submits under this name */
    name?: string;
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
   *  slot; moves between slots (arrows, typing) are left alone */
  function handleFocusIn(event: FocusEvent): void {
    if (event.currentTarget.contains(event.relatedTarget)) return;
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

<div class="jx-otp {className}" role="group" aria-label={label ?? 'one-time code'}>
    {#if label}
      <label class="jx-otp-label" for="{id}-0">{label}</label>
    {/if}
    <div class="jx-otp-slots" onfocusin={handleFocusIn}>
      {#each chars as ch, index (index)}
        <input
          id="{id}-{index}"
          type="text"
          inputmode={numeric ? 'numeric' : 'text'}
          autocomplete={index === 0 ? 'one-time-code' : undefined}
          maxlength={slots}
          class="jx-otp-slot"
          class:jx-otp-filled={ch !== ''}
          class:jx-otp-complete={complete}
          class:jx-otp-invalid={!!error}
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
      <p id={errorId} class="jx-otp-error"><span aria-hidden="true">!</span>{error}</p>
    {/if}
  </div>

<style>
  .jx-otp {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    width: fit-content;
  }
  .jx-otp-label {
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }
  .jx-otp-slots {
    display: flex;
    gap: 0.375rem;
  }
  .jx-otp-slot {
    box-sizing: border-box;
    width: 2.375rem;
    height: 2.75rem;
    padding: 0;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-mono);
    font-size: 1.125rem;
    text-align: center;
    border-radius: var(--radius);
    caret-color: var(--primary);
  }
  .jx-otp-slot:focus {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-otp-filled {
    border-color: var(--foreground);
  }
  .jx-otp-complete {
    border-color: var(--primary);
  }
  .jx-otp-complete:focus {
    outline-color: var(--primary);
  }
  .jx-otp-invalid {
    border-color: var(--destructive);
    border-style: dashed;
  }
  .jx-otp-slot:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .jx-otp-error {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: var(--destructive);
  }
</style>
