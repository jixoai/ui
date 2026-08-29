<!--
  jixoai date picker (registry/files/ui/date-picker/date-picker.svelte).

  Original request (2026-08-20): “开发 File 选择器 和 Date 选择器两个
  Form 组件” — a calendar popover over native Date math, deliberately NOT
  a native <input type="date"> and with zero date libraries. Orthogonal
  intents:

  1. selection state — single commits an ISO "YYYY-MM-DD" string
     ($bindable value); range binds { start?, end? } ($bindable) with
     first-click-anchor / second-click-end / swap-when-backwards
     semantics; a third click re-anchors.
  2. popover orchestration — Popover API panel (popover="auto") wired
     with popovertarget and CSS-anchored under a select-style trigger;
     light dismiss, Escape, one-at-a-time, top layer are the browser's;
     the native toggle event drives focus in (grid) and out (trigger) —
     select.svelte law.
  3. host-side delegation — the embeddable calendar fragment (nav +
     grid + keyboard cursor) lives in calendar.svelte and the ISO math
     in calendar-math.ts (2026-08-28 extraction, for the Input picker
     bridge); the calendar mounts per open ({#if open}) so every open
     resets view+cursor to the committed anchor, exactly the
     pre-extraction toggle-path behavior. onpick lands in commitDay;
     single closes via hidePopover there, range's anchor/swap law stays.

  format ('iso' | 'locale') changes the DISPLAY only — the committed
  value stays ISO forever. min/max are inclusive ISO bounds; days
  outside render at 0.3 opacity with cursor: not-allowed.

  tw4 (2026-08-24): trigger static paint is token utilities in the
  markup (nav/grid/cell paint moved with calendar.svelte); the
  .jx-label/.jx-error scaffolding is consumed from the jx-pure sheet's
  Part A. Only the anchor-positioned panel (static residue with its
  @supports fallback + ::backdrop), the trigger hover/focus/disabled
  state machines and the reduced-motion kill remain in date-picker.css
  (D1-exempt residue under the layer law).

  Motion kernel (2026-08-25): the panel rides the shared surface motion
  kernel (lib/surface-motion.ts; popover.svelte wiring law) — WAAPI
  animates the single --jx-p progress number, jixoai.css formulas paint
  every visible property; the toggle seam plays 1/0 with
  start/stopTracking, reading open state LIVE from :popover-open
  (ToggleEvent state fields never trusted). The real shadow layer is a
  DOM child (data-jx-date-shadow) because WAAPI cannot animate
  pseudo-elements.
-->
<script module lang="ts">
  /** Range mode's committed pair (ISO "YYYY-MM-DD" strings). */
  export interface DatePickerRange {
    start?: string;
    end?: string;
  }
</script>

<script lang="ts">
  import { onDestroy } from 'svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import { ambientLocale, dayLabel, parseIso, todayIso, validIso } from './calendar-math';
  import Calendar from './calendar.svelte';
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
    /** BCP 47 locale for the panel vocabulary + the 'locale' display
        format (Intl.DateTimeFormat); default = the page's <html lang>
        (2026-08-30 — the hand-rolled English tables retired) */
    locale?: string;
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
    locale,
    id = autoId,
    variant = 'auto',
    class: className = '',
  }: Props = $props();

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

  // ---- popover state -------------------------------------------------------
  let open = $state(false);
  let triggerEl = $state<HTMLButtonElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);
  // the anchor wrapper — the enter kernel measures the slide direction
  // against it at every open
  let anchorEl = $state<HTMLElement | null>(null);
  // structural handle over the mounted calendar (popover.svelte law:
  // bind:this is documented as a structural handle, here { focusGrid })
  let calendarRef = $state<{ focusGrid: () => void } | null>(null);
  // what the fresh-mounted calendar centers on: committed context, else
  // today — set on every open (the reset-on-open law)
  let openAnchor = $state<string | undefined>(undefined);

  // anchor fill days: single = the committed value; range = both edges
  const anchorList = $derived.by(() => {
    if (mode === 'single') return selectedIso != null ? [selectedIso] : [];
    return [startIso, endIso].filter((iso): iso is string => iso != null);
  });

  // ---- display formatting (value itself is always ISO) --------------------
  const loc = $derived(locale ?? ambientLocale());
  function display(iso: string): string {
    if (format === 'iso') return iso;
    // Intl owns the field order and spacing ("Aug 30, 2026" /
    // "2026年8月30日") — never hand concatenation
    return dayLabel(loc, iso);
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
  // onpick arrives from the calendar (guaranteed non-disabled non-out):
  // single commits and closes; range keeps the anchor/swap law here
  function commitDay(iso: string): void {
    if (mode === 'single') {
      value = iso;
      panelEl?.hidePopover(); // the toggle handler restitutes focus
      return;
    }
    const start = validIso(range?.start);
    const end = validIso(range?.end);
    if (start == null || end != null) {
      // fresh anchor — keep the panel open for the end click
      range = { start: iso };
    } else {
      // end before start ⇒ swap, per the range contract
      range =
        iso < start
          ? { start: iso, end: start }
          : { start, end: iso };
      panelEl?.hidePopover();
    }
  }

  // THE orchestration seam: one native event covers every open/close path
  // (popovertarget click, light dismiss, Escape, our own hide/show calls).
  // Open state is read LIVE from :popover-open at fire time — ToggleEvent
  // state fields are never trusted (popover.svelte law).
  function onPanelToggle(): void {
    open = panelEl?.matches(':popover-open') ?? false;
    if (open) {
      motion.play(1);
      motion.startTracking();
      // continue from context: the committed value, else today — the
      // calendar below mounts with this initialView, resetting view and
      // cursor on EVERY open (the pre-extraction behavior)
      openAnchor = mode === 'range' ? (startIso ?? todayIso()) : (selectedIso ?? todayIso());
    } else {
      panelEl?.classList.remove('jx-rest');
      motion.play(0);
      motion.stopTracking();
      // focus restitution on EVERY close path
      triggerEl?.focus();
    }
  }

  // ── MOTION KERNEL — the shared declarative half (r29): see
  // lib/surface-motion.ts. WAAPI animates ONE @property number
  // (--jx-p); every visible property is a CSS formula of it (the
  // declarative motion law in jixoai.css). The kernel here only wires
  // the panel's toggle seam and live anchor
  const motion = createSurfaceMotion(() => panelEl, { anchor: () => anchorEl });

  onDestroy(() => motion.destroy());

  // the calendar mounts inside {#if open}; bind:this lands during that
  // render, so this post-flush effect sees the ref and focuses the grid
  // in on every open
  $effect(() => {
    if (open) calendarRef?.focusGrid();
  });

  // native-select muscle memory: ↑/↓ on the closed trigger opens it
  function onTriggerKeydown(event: KeyboardEvent): void {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      panelEl?.showPopover();
    }
  }
</script>

<div data-jx-date-field class="flex flex-col items-stretch gap-2 w-full">
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <span data-jx-date-wrap class="relative block w-full" style="anchor-name: {anchorName}" bind:this={anchorEl}>
    <!-- jx-html-input (B3, ui-plugin-followup): the trigger's form-lane
         law is the standard layer's text-like control box — border, hit,
         inset, text/leading, hover/focus/disabled/invalid states all
         single-sourced there (this retires the hand-rolled min-h-10/
         py-2 px-3/text-sm literals in favor of the density aliases the
         select family already rides); markup keeps only layout (flex
         row) and the closed-control cursor. Core utilities sort AFTER
         the custom @utility in the built sheet, so `flex` reliably
         overrides the law's display:block (probe-verified). -->
    <button
      bind:this={triggerEl}
      type="button"
      id={id}
      class={cn(
        'jx-date-trigger jx-html-input flex items-center gap-3 text-start cursor-pointer',
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
        data-jx-date-value
        data-jx-date-placeholder={!hasValue ? '' : undefined}
        class={cn(
          'flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-start',
          !hasValue && 'text-muted-foreground',
        )}
      >{triggerText}</span>
      <!-- the calendar trigger = an ICON SLOT (B3): the glyph span paints
           currentColor through a mask on --jx-icon-calendar (the icon
           vocabulary variable the face publishes at :root and the
           standard layer's ::-webkit-calendar-picker-indicator reads), so
           a face/plugin override re-skins every calendar glyph together.
           The inline lucide SVG fallback default keeps the glyph without
           the sheet; the .jx-date-chevron class stays the css hook. -->
      <span
        class={cn(
          'jx-date-chevron flex-none w-3 h-3 pointer-events-none text-muted-foreground transition-transform duration-150 ease-out',
          open && 'rotate-180',
        )}
        aria-hidden="true"
      ></span>
    </button>
  </span>

  <div
    bind:this={panelEl}
    id={panelId}
    popover="auto"
    class={cn('jx-date-panel jx-surface', motion.supported && 'jx-waapi')}
    data-variant={variant}
    style="position-anchor: {anchorName}; inset-area: bottom span-all; position-area: bottom span-all;"
    ontoggle={onPanelToggle}
  >
    <!-- the REAL shadow layer: a DOM child because pseudo-elements are
         unreachable from WAAPI — the kernel animates it in lockstep
         (Owner ruling r18) -->
    <div data-jx-date-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
    <!-- surface body (bezel paint + ::after shadow); the popover element
         paints nothing (floating-surface law arch r3) -->
    <div data-jx-date-surface class="jx-surface-body px-3.5 py-3">
      {#if open}
        <!-- the embeddable calendar (2026-08-28 extraction): nav + grid +
             keyboard cursor live in calendar.svelte; mounting it per open
             makes initialView={openAnchor} the reset-on-open seam. The
             grid id is `${idPrefix}-grid` — aria-controls above matches -->
        <Calendar
          anchors={anchorList}
          rangeStart={startIso}
          rangeEnd={endIso}
          min={minIso}
          max={maxIso}
          initialView={openAnchor}
          {locale}
          idPrefix={id}
          ariaLabel={label ? `${label} calendar` : 'calendar'}
          onpick={commitDay}
          bind:this={calendarRef}
        />
      {/if}
  </div>
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span data-jx-date-error-mark class="font-bold text-destructive" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>
