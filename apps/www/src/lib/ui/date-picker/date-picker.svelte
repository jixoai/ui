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

  tw4 (2026-08-24): trigger/nav/grid/cell static paint is token utilities
  in the markup (markup-known cell states — today ring, anchor fill,
  in-range tint, off/out dim — ride conditional utilities); the
  .jx-label/.jx-error scaffolding is consumed from the jx-pure sheet's
  Part A. Only the anchor-positioned panel (static residue with its
  @supports fallback + ::backdrop), the hover/focus/disabled state
  machines (incl. the nav glyph svg sizing) and the reduced-motion kill
  remain in date-picker.css (D1-exempt residue under the layer law).
-->
<script module lang="ts">
  /** Range mode's committed pair (ISO "YYYY-MM-DD" strings). */
  export interface DatePickerRange {
    start?: string;
    end?: string;
  }
</script>

<script lang="ts">
  import { cn } from '$lib/utils';
  import './date-picker.css';

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
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency; the bezel fill
        follows the variant through the jx-surface fill props) */
    variant?: 'solid' | 'acrylic' | 'auto';
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
    variant = 'auto',
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

<div class="jx-date-field flex flex-col items-stretch gap-2 w-full">
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <span class="jx-date-wrap relative block w-full" style="anchor-name: {anchorName}">
    <button
      bind:this={triggerEl}
      type="button"
      id={id}
      class={cn(
        'jx-date-trigger flex items-center gap-3 w-full min-h-10 py-2 px-3 border border-border rounded-none bg-background text-foreground text-sm leading-[1.45] text-start cursor-pointer transition-[box-shadow] duration-150 ease-out',
        className,
      )}
      popovertarget={panelId}
      aria-haspopup="grid"
      aria-expanded={open}
      aria-controls={gridId}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      onkeydown={onTriggerKeydown}
    >
      <span
        class={cn(
          'jx-date-value flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-start',
          !hasValue && 'jx-date-placeholder text-muted-foreground',
        )}
      >{triggerText}</span>
      <svg
        class={cn(
          'jx-date-chevron flex-none w-3 h-3 pointer-events-none text-muted-foreground transition-transform duration-150 ease-out',
          open && 'rotate-180',
        )}
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
    class="jx-date-panel jx-surface"
    data-variant={variant}
    style="position-anchor: {anchorName}; inset-area: bottom span-all; position-area: bottom span-all;"
    ontoggle={onPanelToggle}
  >
    <!-- surface body (bezel paint + ::after shadow); the popover element
         paints nothing (floating-surface law arch r3) -->
    <div class="jx-date-surface jx-surface-body px-3.5 py-3">
    <div class="jx-date-nav flex items-center justify-between gap-2 -mb-2.5">
      <button
        type="button"
        class="jx-date-nav-btn inline-flex items-center justify-center w-7 h-7 p-0 border border-transparent bg-transparent text-terminal-foreground cursor-pointer transition-[background-color,transform] duration-100 ease-out disabled:cursor-not-allowed"
        aria-label="previous month"
        disabled={prevDisabled}
        onclick={() => stepMonth(-1)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
      </button>
      <span class="jx-date-month font-nav text-[11px] tracking-[0.2em] uppercase">{monthLabel}</span>
      <button
        type="button"
        class="jx-date-nav-btn inline-flex items-center justify-center w-7 h-7 p-0 border border-transparent bg-transparent text-terminal-foreground cursor-pointer transition-[background-color,transform] duration-100 ease-out disabled:cursor-not-allowed"
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
      class="jx-date-grid flex flex-col gap-0.5"
      role="grid"
      tabindex="-1"
      aria-label={label ? `${label} calendar` : 'calendar'}
      aria-activedescendant={activeCellId}
      onkeydown={onGridKeydown}
    >
      <div role="row" class="jx-date-headrow grid grid-cols-[repeat(7,2rem)] gap-0.5">
        {#each WEEKDAYS as wd, index (wd)}
          <span role="columnheader" class="jx-date-weekday flex items-center justify-center h-6 font-nav text-[10px] tracking-[0.08em] uppercase text-[color-mix(in_oklab,var(--terminal-foreground)_55%,transparent)]" aria-label={WEEKDAYS_FULL[index]}>{wd}</span>
        {/each}
      </div>
      {#each weeks as week}
        <div role="row" class="jx-date-weekrow grid grid-cols-[repeat(7,2rem)] gap-0.5">
          {#each week as cell (cell.iso)}
            {#if cell.out}
              <div role="gridcell" class="jx-date-day jx-date-out inline-flex items-center justify-center w-8 h-8 border border-transparent bg-transparent text-[color-mix(in_oklab,var(--terminal-foreground)_72%,transparent)] tabular-nums leading-none cursor-default select-none opacity-35" aria-hidden="true">{cell.day}</div>
            {:else}
              <!-- cells are click-only BY PATTERN (select.svelte law): the
                   keyboard path rides the focusable grid + the
                   aria-activedescendant cursor, never the cell itself -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <div
                role="gridcell"
                id={`${id}-d-${cell.iso}`}
                class={cn(
                  'jx-date-day inline-flex items-center justify-center w-8 h-8 border border-transparent bg-transparent text-[color-mix(in_oklab,var(--terminal-foreground)_72%,transparent)] tabular-nums leading-none cursor-pointer select-none transition-[background-color,color] duration-100 ease-out',
                  cell.today && 'jx-date-today border-primary',
                  isAnchor(cell.iso) && 'jx-date-fill bg-primary text-primary-foreground',
                  inRange(cell.iso) && 'jx-date-in bg-[color-mix(in_oklab,var(--primary)_14%,transparent)]',
                  cell.disabled && 'jx-date-off opacity-30 cursor-not-allowed',
                  cell.iso === activeIso && 'jx-date-active',
                )}
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
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-date-error-mark font-bold text-destructive" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>
