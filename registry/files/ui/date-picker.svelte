<!--
  jixoai date picker (registry/files/ui/date-picker.svelte).

  Original request (2026-08-20): “开发 File 选择器 和 Date 选择器两个
  Form 组件” — a calendar popover over native Date math, deliberately NOT
  a native <input type="date"> and with zero date libraries. Orthogonal
  intents:

  1. selection state — single commits an ISO "YYYY-MM-DD" string
     ($bindable value); range binds { start?, end? } ($bindable) with
     first-click-anchor / second-click-end / swap-when-backwards
     semantics; a third click re-anchors.
  2. calendar math — hand-rolled: leap years, month lengths, Monday-
     first grid offsets, strict ISO parse/format/compare (zero-padded
     ISO strings compare correctly as plain strings).
  3. popover orchestration — Popover API panel (popover="auto") wired
     with popovertarget and CSS-anchored under a select-style trigger;
     light dismiss, Escape, one-at-a-time, top layer are the browser's;
     the native toggle event drives focus in (grid) and out (trigger) —
     select.svelte law.
  4. keyboard — the grid is one focus stop with an aria-activedescendant
     cursor: ↑↓←→ walk by day/week across month boundaries (the view
     follows the cursor), Enter/Space commit, Escape is native.

  format ('iso' | 'locale') changes the DISPLAY only — the committed
  value stays ISO forever. min/max are inclusive ISO bounds; days
  outside render at 0.3 opacity with cursor: not-allowed.
-->
<script module lang="ts">
  /** Range mode's committed pair (ISO "YYYY-MM-DD" strings). */
  export interface DatePickerRange {
    start?: string;
    end?: string;
  }
</script>

<script lang="ts">
  interface Props {
    /** ISO "YYYY-MM-DD"; $bindable — single mode's committed value */
    value?: string;
    /** { start?, end? }; $bindable — range mode's committed value */
    range?: DatePickerRange;
    /** 'single' (default) | 'range' */
    mode?: 'single' | 'range';
    /** field label; renders label[for] above the trigger */
    label?: string;
    /** error text → aria-invalid + aria-describedby + dashed trigger */
    error?: string;
    /** trigger text when nothing is committed */
    placeholder?: string;
    /** ISO date; earlier days render disabled */
    min?: string;
    /** ISO date; later days render disabled */
    max?: string;
    /** display format — the committed value stays ISO regardless */
    format?: 'iso' | 'locale';
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    value = $bindable(),
    range = $bindable(),
    mode = 'single',
    label,
    error,
    placeholder = 'Select date...',
    min,
    max,
    format = 'iso',
    id = autoId,
    class: className = '',
  }: Props = $props();

  // ---- hand-rolled calendar math (zero dependencies) ---------------------
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const MONTHS_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const WEEKDAYS_FULL = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  ];
  const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
  const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  const pad2 = (n: number): string => String(n).padStart(2, '0');

  function daysInMonth(year: number, month: number): number {
    if (month === 1) {
      const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      return leap ? 29 : 28;
    }
    return MONTH_LENGTHS[month];
  }

  function isoOf(year: number, month: number, day: number): string {
    return `${year}-${pad2(month + 1)}-${pad2(day)}`;
  }

  /** strict parse — null when malformed or not a real calendar day */
  function parseIso(
    iso: string | undefined
  ): { year: number; month: number; day: number } | null {
    if (!iso) return null;
    const m = ISO_RE.exec(iso);
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]) - 1;
    const day = Number(m[3]);
    if (month < 0 || month > 11 || day < 1 || day > daysInMonth(year, month)) return null;
    return { year, month, day };
  }

  /** validated-or-undefined ISO (props arrive as trust-but-verify strings) */
  function validIso(iso: string | undefined): string | undefined {
    const p = parseIso(iso);
    return p ? isoOf(p.year, p.month, p.day) : undefined;
  }

  /** day arithmetic across month/year boundaries (UTC Date, zero-dep);
      internal callers only ever pass validated ISO strings */
  function addDays(iso: string, delta: number): string {
    const p = parseIso(iso)!;
    const d = new Date(Date.UTC(p.year, p.month, p.day + delta));
    return isoOf(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }

  // today, computed once per instantiation — the ring is cosmetic and a
  // per-midnight recompute isn't worth a timer
  const today = new Date();
  const todayIso = isoOf(today.getFullYear(), today.getMonth(), today.getDate());

  // ---- committed state views ----------------------------------------------
  const selectedIso = $derived(mode === 'single' ? validIso(value) : undefined);
  const startIso = $derived(mode === 'range' ? validIso(range?.start) : undefined);
  const endIso = $derived(mode === 'range' ? validIso(range?.end) : undefined);
  const minIso = $derived(validIso(min));
  const maxIso = $derived(validIso(max));

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  const panelId = $derived(`${id}-panel`);
  const gridId = $derived(`${id}-grid`);
  // Anchor names are CSS custom-ident-ish: sanitize the id into a stable
  // dashed token so any consumer id yields a valid --jx-date-* name.
  const anchorName = $derived(`--jx-date-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

  // ---- view state: the month on stage + the keyboard cursor ---------------
  let viewYear = $state(today.getFullYear());
  let viewMonth = $state(today.getMonth());
  let activeIso = $state<string | null>(null);
  let open = $state(false);
  let triggerEl = $state<HTMLButtonElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);
  let gridEl = $state<HTMLDivElement | null>(null);

  interface DayCell {
    iso: string;
    day: number;
    out: boolean;
    disabled: boolean;
    today: boolean;
  }

  const weeks = $derived.by(() => {
    const cells: DayCell[] = [];
    const make = (iso: string, day: number, out: boolean): DayCell => ({
      iso,
      day,
      out,
      disabled: (minIso != null && iso < minIso) || (maxIso != null && iso > maxIso),
      today: iso === todayIso,
    });
    // Monday-first offset of the 1st
    const offset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    const dim = daysInMonth(viewYear, viewMonth);
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevDim = daysInMonth(prevYear, prevMonth);
    for (let i = offset; i > 0; i--) cells.push(make(isoOf(prevYear, prevMonth, prevDim - i + 1), prevDim - i + 1, true));
    for (let d = 1; d <= dim; d++) cells.push(make(isoOf(viewYear, viewMonth, d), d, false));
    // pad the tail so every week row is exactly 7 cells
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const tail = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= tail; d++) cells.push(make(isoOf(nextYear, nextMonth, d), d, true));
    const rows: DayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  });

  const monthLabel = $derived(`${MONTHS[viewMonth]} ${viewYear}`);
  // nav clamps: disable when the entire neighbor month sits out of bounds
  const prevDisabled = $derived.by(() => {
    if (minIso == null) return false;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    return isoOf(y, m, daysInMonth(y, m)) < minIso;
  });
  const nextDisabled = $derived.by(() => {
    if (maxIso == null) return false;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    return isoOf(y, m, 1) > maxIso;
  });

  const activeCellId = $derived(activeIso ? `${id}-d-${activeIso}` : undefined);

  function isAnchor(iso: string): boolean {
    if (mode === 'single') return iso === selectedIso;
    return iso === startIso || iso === endIso;
  }
  function inRange(iso: string): boolean {
    return startIso != null && endIso != null && iso > startIso && iso < endIso;
  }

  // ---- display formatting (value itself is always ISO) --------------------
  function display(iso: string): string {
    if (format === 'iso') return iso;
    const p = parseIso(iso);
    return p ? `${MONTHS_SHORT[p.month]} ${p.day}, ${p.year}` : iso;
  }

  const hasValue = $derived(mode === 'single' ? selectedIso != null : startIso != null);
  const triggerText = $derived.by(() => {
    if (mode === 'range') {
      if (startIso == null) return placeholder;
      return endIso != null
        ? `${display(startIso)} → ${display(endIso)}`
        : `${display(startIso)} → …`;
    }
    return selectedIso != null ? display(selectedIso) : placeholder;
  });

  // ---- selection ------------------------------------------------------------
  function commitDay(cell: DayCell): void {
    if (cell.disabled || cell.out) return;
    activeIso = cell.iso;
    if (mode === 'single') {
      value = cell.iso;
      panelEl?.hidePopover(); // the toggle handler restitutes focus
      return;
    }
    const start = validIso(range?.start);
    const end = validIso(range?.end);
    if (start == null || end != null) {
      // fresh anchor — keep the panel open for the end click
      range = { start: cell.iso };
    } else {
      // end before start ⇒ swap, per the range contract
      range =
        cell.iso < start
          ? { start: cell.iso, end: start }
          : { start, end: cell.iso };
      panelEl?.hidePopover();
    }
  }

  function stepMonth(delta: 1 | -1): void {
    viewMonth += delta;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    } else if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
  }

  // THE orchestration seam: one native event covers every open/close path
  // (popovertarget click, light dismiss, Escape, our own hide/show calls).
  function onPanelToggle(event: ToggleEvent): void {
    open = event.newState === 'open';
    if (open) {
      // continue from context: the committed value, else today
      const anchor = mode === 'range' ? (startIso ?? todayIso) : (selectedIso ?? todayIso);
      const p = parseIso(anchor)!; // anchor is validated-or-todayIso
      viewYear = p.year;
      viewMonth = p.month;
      activeIso = anchor;
      gridEl?.focus();
    } else {
      // focus restitution on EVERY close path
      triggerEl?.focus();
    }
  }

  function onGridKeydown(event: KeyboardEvent): void {
    if (activeIso == null) return;
    let delta = 0;
    if (event.key === 'ArrowLeft') delta = -1;
    else if (event.key === 'ArrowRight') delta = 1;
    else if (event.key === 'ArrowUp') delta = -7;
    else if (event.key === 'ArrowDown') delta = 7;
    if (delta !== 0) {
      event.preventDefault();
      activeIso = addDays(activeIso, delta);
      // the view follows the cursor across month boundaries
      const p = parseIso(activeIso)!;
      viewYear = p.year;
      viewMonth = p.month;
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const cell = weeks.flat().find((c) => c.iso === activeIso);
      if (cell) commitDay(cell);
    }
    // Escape needs no handler: popover="auto" closes on it natively
  }

  // native-select muscle memory: ↑/↓ on the closed trigger opens it
  function onTriggerKeydown(event: KeyboardEvent): void {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      panelEl?.showPopover();
    }
  }
</script>

<div class="jx-date-field">
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <span class="jx-date-wrap" style="anchor-name: {anchorName}">
    <button
      bind:this={triggerEl}
      type="button"
      id={id}
      class="jx-date-trigger {className}"
      popovertarget={panelId}
      aria-haspopup="grid"
      aria-expanded={open}
      aria-controls={gridId}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      onkeydown={onTriggerKeydown}
    >
      <span class="jx-date-value" class:jx-date-placeholder={!hasValue}>{triggerText}</span>
      <svg
        class="jx-date-chevron"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>
  </span>

  <div
    bind:this={panelEl}
    id={panelId}
    popover="auto"
    class="jx-date-panel"
    style="position-anchor: {anchorName}; inset-area: bottom span-all; position-area: bottom span-all;"
    ontoggle={onPanelToggle}
  >
    <div class="jx-date-nav">
      <button
        type="button"
        class="jx-date-nav-btn"
        aria-label="previous month"
        disabled={prevDisabled}
        onclick={() => stepMonth(-1)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
      </button>
      <span class="jx-date-month">{monthLabel}</span>
      <button
        type="button"
        class="jx-date-nav-btn"
        aria-label="next month"
        disabled={nextDisabled}
        onclick={() => stepMonth(1)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6"></path>
        </svg>
      </button>
    </div>

    <div
      bind:this={gridEl}
      id={gridId}
      class="jx-date-grid"
      role="grid"
      tabindex="-1"
      aria-label={label ? `${label} calendar` : 'calendar'}
      aria-activedescendant={activeCellId}
      onkeydown={onGridKeydown}
    >
      <div role="row" class="jx-date-headrow">
        {#each WEEKDAYS as wd, index (wd)}
          <span role="columnheader" class="jx-date-weekday" aria-label={WEEKDAYS_FULL[index]}>{wd}</span>
        {/each}
      </div>
      {#each weeks as week}
        <div role="row" class="jx-date-weekrow">
          {#each week as cell (cell.iso)}
            {#if cell.out}
              <div role="gridcell" class="jx-date-day jx-date-out" aria-hidden="true">{cell.day}</div>
            {:else}
              <!-- cells are click-only BY PATTERN (select.svelte law): the
                   keyboard path rides the focusable grid + the
                   aria-activedescendant cursor, never the cell itself -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <div
                role="gridcell"
                id={`${id}-d-${cell.iso}`}
                class="jx-date-day"
                class:jx-date-today={cell.today}
                class:jx-date-fill={isAnchor(cell.iso)}
                class:jx-date-in={inRange(cell.iso)}
                class:jx-date-off={cell.disabled}
                class:jx-date-active={cell.iso === activeIso}
                aria-selected={isAnchor(cell.iso) ? 'true' : 'false'}
                aria-disabled={cell.disabled ? 'true' : undefined}
                onclick={() => commitDay(cell)}
              >{cell.day}</div>
            {/if}
          {/each}
        </div>
      {/each}
    </div>
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-date-error-mark" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>

<style>
  .jx-date-field {
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

  /* ---- trigger: the closed select's paint, on a real <button> ---------- */
  .jx-date-wrap {
    position: relative;
    display: block;
    width: 100%;
  }
  .jx-date-trigger {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    min-height: 2.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.45;
    text-align: start;
    cursor: pointer;
    transition: box-shadow 150ms ease-out;
  }
  .jx-date-trigger:hover:not(:focus-visible) {
    box-shadow: var(--shadow-2xs);
  }
  /* the site focus law: inset 1px outline on the ring token */
  .jx-date-trigger:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
    box-shadow: none;
  }
  .jx-date-trigger[aria-invalid='true'] {
    border-style: dashed;
  }
  .jx-date-value {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: start;
  }
  .jx-date-placeholder {
    color: var(--muted-foreground);
  }
  .jx-date-chevron {
    flex: none;
    width: 0.75rem;
    height: 0.75rem;
    pointer-events: none;
    color: var(--muted-foreground);
    transition: transform 150ms ease-out;
  }
  .jx-date-trigger[aria-expanded='true'] .jx-date-chevron {
    transform: rotate(180deg);
  }

  /* ---- panel: terminal bezel (select.svelte panel law) ----------------- */
  .jx-date-panel {
    position: fixed;
    margin: 0;
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    width: fit-content;
    padding: 12px 14px;
    font-size: 13px;
    color: var(--terminal-foreground);
    border: 1px solid var(--border);
    background: var(--terminal);
    box-shadow: var(--shadow);
  }
  /* Engines without CSS Anchor Positioning: authored viewport-center —
     the popover.svelte fallback visual, never worse. */
  @supports not (anchor-name: --jx-date-fb) {
    .jx-date-panel {
      position-anchor: auto !important;
      inset-area: none !important;
      inset: 0;
      margin: auto;
    }
  }
  /* Popovers get a ::backdrop too; light dismiss must never dim the page. */
  .jx-date-panel::backdrop {
    background: transparent;
  }

  /* ---- month navigation ------------------------------------------------ */
  .jx-date-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.625rem;
  }
  .jx-date-nav-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border: 1px solid transparent;
    background: transparent;
    color: var(--terminal-foreground);
    cursor: pointer;
    transition: background-color 100ms ease-out, transform 100ms ease-out;
  }
  .jx-date-nav-btn:hover:not(:disabled) {
    background: var(--terminal-hover);
  }
  .jx-date-nav-btn:active:not(:disabled) {
    transform: translateY(1px);
  }
  .jx-date-nav-btn:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-date-nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .jx-date-nav-btn svg {
    width: 13px;
    height: 13px;
  }
  .jx-date-month {
    font-family: var(--font-nav);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  /* ---- the grid: 7 columns of 32px square cells -------------------------- */
  .jx-date-grid {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  /* the grid itself is the programmatic focus stop (aria-activedescendant
     roving pattern) — the active cell IS the focus indication */
  .jx-date-grid:focus-visible {
    outline: none;
  }
  .jx-date-headrow,
  .jx-date-weekrow {
    display: grid;
    grid-template-columns: repeat(7, 2rem);
    gap: 2px;
  }
  .jx-date-weekday {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1.5rem;
    font-family: var(--font-nav);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in oklab, var(--terminal-foreground) 55%, transparent);
  }
  .jx-date-day {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: 1px solid transparent; /* reserved so today's ring never shifts */
    background: transparent;
    color: color-mix(in oklab, var(--terminal-foreground) 72%, transparent);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    transition: background-color 100ms ease-out, color 100ms ease-out;
  }
  .jx-date-day:not(.jx-date-fill):not(.jx-date-off):hover,
  .jx-date-day.jx-date-active:not(.jx-date-fill):not(.jx-date-off) {
    background: var(--terminal-hover);
    color: var(--terminal-foreground);
  }
  .jx-date-today {
    border-color: var(--primary);
  }
  .jx-date-fill {
    background: var(--primary);
    color: var(--primary-foreground);
  }
  .jx-date-in {
    background: color-mix(in oklab, var(--primary) 14%, transparent);
  }
  .jx-date-off {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .jx-date-out {
    opacity: 0.35;
    cursor: default;
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
  .jx-date-error-mark {
    font-weight: 700;
    color: var(--destructive);
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-date-trigger,
    .jx-date-chevron,
    .jx-date-nav-btn,
    .jx-date-day {
      transition: none;
    }
  }
</style>
