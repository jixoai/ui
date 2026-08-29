<!--
  jixoai time stepper (registry/files/ui/date-picker/time-stepper.svelte).

  Original request (2026-08-29): “为 Input 重写补齐 date-picker 家族片段”
  — the popover-internal "HH:MM" editor for the picker family's time /
  datetime-local panels. Orthogonal intents:

  1. controlled time state — value is an "HH:MM" string (or undefined);
     every step/valid edit fires oncommit immediately and the component
     renders from the prop. NO shadow state survives a commit (the only
     local text is an in-flight typing draft, cleared on commit).
  2. wrap stepping — [- HH +] : [- MM +] groups; click/hold/↑/↓ all wrap
     (23→0, 59→0 — clock convention, NOT number-input's clamp law).
  3. press-and-hold — ported verbatim from number-input.svelte: immediate
     step on pointerdown, 300ms delay, then one step every 100ms, with
     window-level pointerup/pointercancel cleanup.
  4. direct typing — the cells are focusable text inputs (maxlength 2);
     1–2 digits validate (hour ≤ 23, minute ≤ 59) and commit on
     change/blur; invalid or empty input reverts to the committed value.

  Conventions: an undefined value renders EMPTY cells (never "--:--"),
  and the first step starts from 00:00 THEN steps — undefined + hour+
  commits "01:00", undefined + minute− commits "00:59". disabled locks
  buttons + cells in lockstep and guards every commit path. The fragment
  renders NO shell of its own — the host panel bezel owns the chrome.

  Styles follow calendar.svelte exactly: markup token utilities + the
  shared date-picker.css sheet (imported below; the .jx-date-nav-btn
  state machine gives the compact 1.75rem icon buttons their hover/
  press/focus-visible/disabled law). value is $bindable — the frozen
  contract signature is unchanged; binding hosts get a synchronous echo
  so hold-repeats never race, oncommit-only hosts work identically.
-->
<script lang="ts">
  import { icons } from '$lib/icons';
  import { pad2 } from './calendar-math';
  import './date-picker.css';

  interface Props {
    /** "HH:MM" or undefined (empty) */
    value?: string;
    /** live commit on every step/valid edit */
    oncommit?: (v: string) => void;
    disabled?: boolean;
    /** aria id prefix (default 'jx-time') */
    idPrefix?: string;
  }

  let {
    value = $bindable(),
    oncommit,
    disabled = false,
    idPrefix = 'jx-time',
  }: Props = $props();

  function parseTime(v: string | undefined): { h: number; m: number } | undefined {
    const m = /^(\d{2}):(\d{2})$/.exec(v ?? '');
    if (!m) return undefined;
    const h = Number(m[1]);
    const mi = Number(m[2]);
    if (h > 23 || mi > 59) return undefined;
    return { h, m: mi };
  }

  const time = $derived(parseTime(value));
  const hourText = $derived(time ? pad2(time.h) : '');
  const minuteText = $derived(time ? pad2(time.m) : '');

  // ---- controlled commit: one exit for every mutation path ----------------
  function commit(next: { h: number; m: number }): void {
    hourDraft = null;
    minuteDraft = null;
    const v = `${pad2(next.h)}:${pad2(next.m)}`;
    value = v; // $bindable echo (local-only when unbound — the host's
    // oncommit/value round-trip is the canonical controlled loop)
    oncommit?.(v);
  }

  /** one WRAPPING step — THE disabled gate every step path funnels
      through (button press, hold repeat, cell ↑/↓) */
  function stepBy(part: 'hour' | 'minute', direction: 1 | -1): void {
    if (disabled) return;
    const base = time ?? { h: 0, m: 0 }; // undefined starts from 00:00
    if (part === 'hour') commit({ h: (base.h + direction + 24) % 24, m: base.m });
    else commit({ h: base.h, m: (base.m + direction + 60) % 60 });
  }

  // ---- press-and-hold: immediate step, 300ms delay, then 100ms/step ---
  const HOLD_DELAY_MS = 300;
  const HOLD_REPEAT_MS = 100;
  let holdDelay = 0;
  let holdInterval = 0;

  function beginHold(part: 'hour' | 'minute', direction: 1 | -1): void {
    if (disabled) return; // never arm timers for a disabled field
    stopHold();
    stepBy(part, direction);
    holdDelay = window.setTimeout(() => {
      holdInterval = window.setInterval(() => stepBy(part, direction), HOLD_REPEAT_MS);
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

  // ---- direct typing: drafts live only between input and change/blur --
  let hourDraft = $state<string | null>(null);
  let minuteDraft = $state<string | null>(null);
  let hourEl = $state<HTMLInputElement | null>(null);

  function onCellInput(part: 'hour' | 'minute', event: Event): void {
    const text = (event.currentTarget as HTMLInputElement).value;
    if (part === 'hour') hourDraft = text;
    else minuteDraft = text;
  }

  /** change/blur: valid 1–2 digit input commits; anything else reverts
      (draft cleared → the derived committed text repaints the cell) */
  function onCellCommit(part: 'hour' | 'minute', event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const committed = part === 'hour' ? hourText : minuteText;
    hourDraft = null;
    minuteDraft = null;
    if (disabled || input.value === committed) return; // tab-through is not an edit
    const limit = part === 'hour' ? 23 : 59;
    const ok = /^\d{1,2}$/.test(input.value) && Number(input.value) <= limit;
    if (!ok) return; // invalid or empty → revert to the committed value
    const base = time ?? { h: 0, m: 0 };
    if (part === 'hour') commit({ h: Number(input.value), m: base.m });
    else commit({ h: base.h, m: Number(input.value) });
  }

  /** ↑/↓ on a cell steps it — keyboard parity with the click path */
  function onCellKeydown(part: 'hour' | 'minute', event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      stepBy(part, 1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      stepBy(part, -1);
    }
  }

  /** focus the hour cell — hosts call this when their popover opens
      (panel-open focus parity with Calendar.focusGrid / Editor.focusFirst) */
  export function focusFirst(): void {
    hourEl?.focus();
  }
</script>

<div data-jx-time class="inline-flex items-center gap-1">
  <div role="group" aria-label="hour" class="inline-flex items-center">
    <button
      type="button"
      data-jx-time-hour-minus
      class="jx-date-nav-btn inline-flex items-center justify-center w-7 h-7 p-0 border border-transparent bg-transparent text-[color-mix(in_oklab,var(--terminal-foreground)_72%,transparent)] hover:text-terminal-foreground cursor-pointer transition-[background-color,transform] duration-100 ease-out disabled:cursor-not-allowed [&_svg]:stroke-[2.5]"
      aria-label="decrease hour"
      {disabled}
      onpointerdown={beginHold.bind(null, 'hour', -1)}
    >{@html icons.minus}</button>
    <input
      bind:this={hourEl}
      id={`${idPrefix}-hour`}
      data-jx-time-hour
      type="text"
      inputmode="numeric"
      maxlength="2"
      class="w-8 h-7 box-border bg-transparent border border-transparent text-center tabular-nums leading-none outline-none text-[color-mix(in_oklab,var(--terminal-foreground)_72%,transparent)] focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1 disabled:cursor-not-allowed disabled:opacity-30"
      aria-label="hour"
      {disabled}
      value={hourDraft ?? hourText}
      oninput={onCellInput.bind(null, 'hour')}
      onchange={onCellCommit.bind(null, 'hour')}
      onblur={onCellCommit.bind(null, 'hour')}
      onkeydown={onCellKeydown.bind(null, 'hour')}
    />
    <button
      type="button"
      data-jx-time-hour-plus
      class="jx-date-nav-btn inline-flex items-center justify-center w-7 h-7 p-0 border border-transparent bg-transparent text-[color-mix(in_oklab,var(--terminal-foreground)_72%,transparent)] hover:text-terminal-foreground cursor-pointer transition-[background-color,transform] duration-100 ease-out disabled:cursor-not-allowed [&_svg]:stroke-[2.5]"
      aria-label="increase hour"
      {disabled}
      onpointerdown={beginHold.bind(null, 'hour', 1)}
    >{@html icons.plus}</button>
  </div>
  <span aria-hidden="true" class="font-nav text-[color-mix(in_oklab,var(--terminal-foreground)_55%,transparent)]">:</span>
  <div role="group" aria-label="minute" class="inline-flex items-center">
    <button
      type="button"
      data-jx-time-minute-minus
      class="jx-date-nav-btn inline-flex items-center justify-center w-7 h-7 p-0 border border-transparent bg-transparent text-[color-mix(in_oklab,var(--terminal-foreground)_72%,transparent)] hover:text-terminal-foreground cursor-pointer transition-[background-color,transform] duration-100 ease-out disabled:cursor-not-allowed [&_svg]:stroke-[2.5]"
      aria-label="decrease minute"
      {disabled}
      onpointerdown={beginHold.bind(null, 'minute', -1)}
    >{@html icons.minus}</button>
    <input
      id={`${idPrefix}-minute`}
      data-jx-time-minute
      type="text"
      inputmode="numeric"
      maxlength="2"
      class="w-8 h-7 box-border bg-transparent border border-transparent text-center tabular-nums leading-none outline-none text-[color-mix(in_oklab,var(--terminal-foreground)_72%,transparent)] focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1 disabled:cursor-not-allowed disabled:opacity-30"
      aria-label="minute"
      {disabled}
      value={minuteDraft ?? minuteText}
      oninput={onCellInput.bind(null, 'minute')}
      onchange={onCellCommit.bind(null, 'minute')}
      onblur={onCellCommit.bind(null, 'minute')}
      onkeydown={onCellKeydown.bind(null, 'minute')}
    />
    <button
      type="button"
      data-jx-time-minute-plus
      class="jx-date-nav-btn inline-flex items-center justify-center w-7 h-7 p-0 border border-transparent bg-transparent text-[color-mix(in_oklab,var(--terminal-foreground)_72%,transparent)] hover:text-terminal-foreground cursor-pointer transition-[background-color,transform] duration-100 ease-out disabled:cursor-not-allowed [&_svg]:stroke-[2.5]"
      aria-label="increase minute"
      {disabled}
      onpointerdown={beginHold.bind(null, 'minute', 1)}
    >{@html icons.plus}</button>
  </div>
</div>
