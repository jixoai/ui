<!--
  jixoai input (registry/files/ui/input/input.svelte).
  NativeHTML base field: the native <input> IS the contract — every type
  passes through untouched, no per-type wrappers. Rendering lanes by type:

    text-like (text/password/email/number/search/url/tel/date/time/...)
      1px var(--border) shell, var(--background) fill, radius 0; hover
      lifts one pixel (shadow-2xs), focus-visible takes the site's inset
      1px outline law (outline-offset: -1px on the ring token).
    checkbox / radio / toggle / file
      SPLIT OUT — checkbox/radio/toggle redraw in their own components
      (checkbox.svelte, radio.svelte, toggle.svelte); the professional
      file picker (previews, variants, sizes, maxFiles) lives in
      file-input.svelte (2026-08-20). Passing any of these types here
      renders the plain native passthrough in the text shell — route
      them to the dedicated components.
    range
      the Tier-1 pure-CSS slider (.jx-slider in the jx-pure sheet):
      bordered thin track, square primary thumb, hover lift / press.
    color
      the Tier-1 color field (.jx-color-shell wrapper + .jx-color-swatch
      swatch): locked square swatch + pipette glyph.
    hidden
      bare passthrough, no chrome, no slots.

  2026-08-23 · Tier rebase (original request: "native-input styling
  overhaul — a pure HTML+CSS Tier-1 form layer + Tier-2 components
  consuming it"). The box/lane laws moved to the shared jx-pure
  sheet (registry item `jx-pure`, imported once from app.css after
  jixoai.css); this component keeps ONLY what is component-owned: the
  snippet slots, the clear button, and the outer slot spacing. The
  native-control styling (range track/thumb, color swatch + pipette
  glyph, date/time picker indicator, number spinners, placeholder
  distinction) all lives in Tier-1 so bare markup gets the same paint
  with zero JS.

  Semantics added on top: label[for] (auto id via $props.id() when not
  supplied), error string → aria-invalid + aria-describedby + "! message"
  line + dashed control border. Everything else (placeholder, disabled,
  name, required, checked, accept, min/max/step…) flows through
  restProps onto the native element.

  2026-08-20 · InputGroup slot system (original request: "实现 InputGroup
  槽位体系，升级 Input 和 TextArea 组件"). Four snippet slots around the
  lanes (the text-like shell takes all four; range/color take only
  the outer pair):

    outerBlockStart   outside, above — replaces the label row when given
    innerInlineStart  inside the shell, left (prefix icon / unit)
    innerInlineEnd    inside the shell, right (suffix / unit / action)
    outerBlockEnd     outside, below — the error line still renders above

  The shell — not the <input> — owns border/fill/hover/focus, so slots
  never repaint the box law. Inner slots land muted at 0.75rem; the
  wrapper is utility-authored now, so override it with a plain utility
  (text-foreground) or an inline style. Overflow law for narrow hosts:
  the field shrinks (min-width 0) and the shell clamps (max-width
  100%) — inner slots keep flex:none while the input lane gives way,
  so a 390px viewport compresses the text lane, never the container.
  `clearable` adds an × button in
  the inline-end area: it clears the DOM value, syncs the bound value and
  re-emits `input` + a bubbling `clear` event. `value` is $bindable:
  bound ⇒ controlled; absent ⇒ the field stays purely uncontrolled
  (Svelte skips undefined writes, so FormData and form.reset() keep
  native behavior).

  tw4 (2026-08-24; mirror law 2026-08-27): the component-owned paint
  (the clear button's hit-lane geometry) mirrors from input.css
  (@layer components :where()); the slot rows stay inline (one-off
  wrappers). ONLY the clear glyph's svg descendant sizing, the
  search-cancel pseudo kill and the clear hover/focus states remain
  as the D1-exempt residue.
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
    import { cn } from '$lib/utils';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';
  import Calendar from '../date-picker/calendar.svelte';
  import Editor from '../color-picker/editor.svelte';
  import { parseColor, formatColor } from '$lib/color-utils';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import './input.css';

  interface Props extends HTMLInputAttributes {
    /** any native input type (default 'text') */
    type?: string;
    /** density policy: explicit, inherited, then default */
    density?: Density;
    /** field label; renders label[for] above the control.
        skipped when outerBlockStart takes the slot over */
    label?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** text-like only: × button in the inner-inline-end area */
    clearable?: boolean;
    /** inside the shell, left of the input (prefix icon / unit) */
    innerInlineStart?: Snippet;
    /** inside the shell, right of the input (suffix / unit / action) */
    innerInlineEnd?: Snippet;
    /** outside the shell, above — replaces the label prop when given */
    outerBlockStart?: Snippet;
    /** outside the shell, below — renders below the error line */
    outerBlockEnd?: Snippet;
    /** $bindable; bound ⇒ controlled, absent ⇒ purely uncontrolled */
    value?: string | number;
    /** caller-supplied validation relations — used only when the
        control's own error wiring is absent (the ItemField adapters
        own the error text; their computed chains must survive) */
    'aria-invalid'?: 'true' | 'false' | undefined;
    'aria-describedby'?: string | undefined;
    /** picker bridge: the custom Popover-API panel is the DEFAULT for
        the types that have one (date/datetime-local → the Calendar,
        color → the Swatches editor). The bare boolean attribute opts
        back into the platform popup — <Input type="date" native-picker />
        (the disabled-attribute philosophy: presence = true, absence =
        the library default). month/week/time keep the platform popup
        until a picker snippet is given. */
    nativePicker?: boolean;
    /** fires when the custom picker commits a value */
    onselect?: (value: string) => void;
    /** fine-grained panel content — takes precedence over the embedded
        default panel. Renders inside the popover; ctx = value/commit/close */
    picker?: Snippet<[PickerCtx]>;
  }

  /** the picker snippet's bridge context */
  export interface PickerCtx {
    /** the input's current value */
    value: string;
    /** commit: writes the input (controlled/uncontrolled alike), fires onselect */
    commit: (v: string) => void;
    /** close the panel (light dismiss/Escape stay native) */
    close: () => void;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    type = 'text',
    density,
    'data-density': _callerDensity,
    label,
    id = autoId,
    error,
    clearable = false,
    innerInlineStart,
    innerInlineEnd,
    outerBlockStart,
    outerBlockEnd,
    value = $bindable(),
    class: className = '',
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    nativePicker = false,
    onselect,
    picker,
    ...rest
  }: Props = $props();

  const errorId = $derived(`${id}-error`);
  const outerDensity = getDensityContext();
  const resolvedDensity = $derived(resolveDensity(density, outerDensity));
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : ariaDescribedBy);
  const invalidAttr = $derived(invalid ? 'true' : ariaInvalid);

  const isHidden = $derived(type === 'hidden');
  const isRange = $derived(type === 'range');
  const isColor = $derived(type === 'color');

  // ---- controlled / clearable plumbing ---------------------------------
  // liveValue mirrors the DOM only after real user input — the one piece
  // of state an uncontrolled field ever touches, never written back out.
  const controlled = $derived(value != null);
  let liveValue = $state<string | null>(null);
  let inputEl: HTMLInputElement | undefined = $state();

  const shownValue = $derived(liveValue ?? (controlled ? String(value) : ''));
  const slotted = $derived(Boolean(innerInlineStart || innerInlineEnd || clearable));
  const showClear = $derived(clearable && rest.disabled !== true && shownValue !== '');

  function syncValue(event: Event) {
    const el = event.currentTarget as HTMLInputElement;
    liveValue = el.value;
    if (controlled) value = el.value;
    // forward a caller-supplied input handler from the rest props
    (rest as { oninput?: (event: Event) => void }).oninput?.(event);
  }

  function clearValue() {
    if (!inputEl) return;
    inputEl.value = '';
    liveValue = '';
    if (controlled) value = '';
    // let bindings and plain listeners both see the reset
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new CustomEvent('clear', { bubbles: true }));
  }

  // ---- the picker bridge (input.css carries the intent ledger) ------
  // embedded default panels exist where a professional component
  // exports one; everything else needs the picker snippet
  const EMBEDDED_PICKER_TYPES = new Set(['date', 'datetime-local', 'color']);
  const customPicker = $derived(
    Boolean(picker) || (nativePicker === false && EMBEDDED_PICKER_TYPES.has(type)),
  );

  let pickerPanelEl = $state<HTMLDivElement | null>(null);
  let pickerAnchorEl = $state<HTMLElement | null>(null);
  let calendarRef = $state<{ focusGrid: () => void } | null>(null);
  let editorRef = $state<{ focusFirst: () => void } | null>(null);
  let swatchesRef = $state<{ focusFirst: () => void } | null>(null);
  // the shared surface motion kernel (popover.svelte wiring law):
  // WAAPI drives --jx-p; the axis tracks the control↔panel vector
  const motion = createSurfaceMotion(() => pickerPanelEl, { anchor: () => pickerAnchorEl });
  onDestroy(() => motion.destroy());
  const pickerAnchor = $derived(`--jx-input-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

  /** the date part of the current value ("YYYY-MM-DD" or undefined) */
  const datePart = $derived(/^\d{4}-\d{2}-\d{2}/.exec(String(shownValue ?? ''))?.[0]);

  function openPicker(): void {
    pickerPanelEl?.showPopover();
  }
  function closePicker(): void {
    pickerPanelEl?.hidePopover();
  }
  function commitFromPanel(v: string): void {
    if (!inputEl) return;
    inputEl.value = v;
    liveValue = v;
    if (controlled) value = v;
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    onselect?.(v);
  }
  /** the embedded Calendar's commit: datetime-local preserves the
      typed time part; date commits close the panel (snippet panels
      decide themselves through ctx.close) */
  function commitDay(iso: string): void {
    const timePart = /T(\d{2}:\d{2})/.exec(String(shownValue ?? ''))?.[1];
    commitFromPanel(type === 'datetime-local' ? `${iso}T${timePart ?? '00:00'}` : iso);
    closePicker();
  }
  /** one native event covers every open/close path (popovertarget,
      light dismiss, Escape, our own calls) — popover.svelte law */
  function onPickerToggle(e: ToggleEvent): void {
    if (e.newState === 'open') {
      motion.play(1);
      motion.startTracking();
      calendarRef?.focusGrid();
      editorRef?.focusFirst();
    } else {
      motion.play(0);
      motion.stopTracking();
      inputEl?.focus();
    }
  }
  /** the lane's indicator zone (≈ the last 2.5rem) opens OUR panel;
      the text zone keeps native focus/typing */
  function onLaneClick(e: MouseEvent): void {
    // forward a caller-supplied click handler from the rest props
    (rest as { onclick?: (event: MouseEvent) => void }).onclick?.(e);
    if (!customPicker || type === 'color') return;
    const r = (e.currentTarget as HTMLInputElement).getBoundingClientRect();
    if (e.clientX > r.right - 40) {
      e.preventDefault();
      openPicker();
    }
  }
  /** Alt+↓/↑ — the native picker-open gesture, rerouted to ours */
  function onLaneKeyDown(e: KeyboardEvent): void {
    if (customPicker && e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      openPicker();
    }
  }
  const pickerCtx = $derived<PickerCtx>({
    value: String(shownValue ?? ''),
    commit: commitFromPanel,
    close: closePicker,
  });
</script>

{#if isHidden}
  <!-- hidden: bare native passthrough (value rides as a plain attribute) -->
  <input {id} {type} {value} {...rest} data-density={resolvedDensity} />
{:else}
  <div class="jx-field" data-density={resolvedDensity}>
    {#if outerBlockStart}
      <div data-jx-outer data-jx-outer-start class="text-muted-foreground text-xs -mb-1">{@render outerBlockStart()}</div>
    {:else if label}<label class="jx-label" for={id}>{label}</label>{/if}
    {#if isRange}
      <input
        {id}
        {type}
        {...rest}
        value={controlled ? value : undefined}
        oninput={syncValue}
        class={'jx-html-range ' + className}
        aria-invalid={invalidAttr}
        aria-describedby={describedBy}
      />
    {:else if isColor}
      <!-- Tier-1 color field: the label wrapper opens the picker from the
           glyph zone too; the input is the locked square swatch lane.
           className lands on the WRAPPER (the shell-law owner, same as
           the text lane's .jx-control-shell) — pass jx-color-expand for
           the full-row field (default is the compact 5rem swatch). -->
      <label
        bind:this={pickerAnchorEl}
        class={'jx-color-shell ' + className}
        style={customPicker ? `anchor-name: ${pickerAnchor}` : undefined}
      >
        <input
          {id}
          {type}
          {...rest}
          value={controlled ? value : undefined}
          oninput={syncValue}
          class="jx-color-swatch"
          aria-invalid={invalidAttr}
          aria-describedby={describedBy}
          data-jx-custom-picker={customPicker ? '' : undefined}
          data-jx-picker-color={customPicker ? '' : undefined}
          tabindex={customPicker ? -1 : undefined}
        />
        {#if customPicker}
          <!-- the swatch's UA activation cannot be cancelled — the overlay
               button is the trigger; the input keeps the value/ARIA role -->
          <button
            type="button"
            class="jx-picker-overlay"
            aria-label="choose color"
            onclick={openPicker}
            onkeydown={(e) => e.key === 'ArrowDown' && e.altKey && openPicker()}
          ></button>
        {/if}
      </label>
    {:else}
      <!-- the shell owns the box law; the input inside is chromeless -->
      <div
        bind:this={pickerAnchorEl}
        class={'jx-html-control-shell ' + className}
        class:jx-slotted={slotted}
        class:jx-invalid={invalid}
        class:jx-clearable={clearable}
        data-jx-custom-picker={customPicker ? '' : undefined}
        style={customPicker ? `anchor-name: ${pickerAnchor}` : undefined}
      >
        {#if innerInlineStart}
          <span data-jx-slot class="flex-none inline-flex items-center gap-1.5 text-muted-foreground text-xs leading-none">{@render innerInlineStart()}</span>
        {/if}
        <!-- the interception selector anchors on the INPUT: the
             picker indicator pseudo belongs to it, not the shell -->
        <input
          bind:this={inputEl}
          {id}
          {type}
          {...rest}
          value={controlled ? value : undefined}
          oninput={syncValue}
          onclick={customPicker ? onLaneClick : undefined}
          onkeydown={customPicker ? onLaneKeyDown : undefined}
          class="jx-html-control-lane"
          aria-invalid={invalidAttr}
          aria-describedby={describedBy}
          data-jx-custom-picker={customPicker ? '' : undefined}
        />
        {#if innerInlineEnd}
          <span data-jx-slot class="flex-none inline-flex items-center gap-1.5 text-muted-foreground text-xs leading-none">{@render innerInlineEnd()}</span>
        {/if}
        {#if showClear}
          <button
            type="button"
            class="jx-html-clear"
            aria-label="clear value"
            onclick={clearValue}
          >
            <!-- the clear glyph = an ICON SLOT: the CSS mask reads
                 --jx-icon-clear (overridable via the plugin); the inline
                 lucide SVG fallback serves without the plugin -->
            <span class="jx-clear-glyph" aria-hidden="true"></span>
          </button>
        {/if}
      </div>
    {/if}
    {#if customPicker}
      <!-- the bridge panel: Popover API (light dismiss, Escape, top
           layer are the browser's); anchor-positioned under the
           control; the date-panel law paints it -->
      <div
        bind:this={pickerPanelEl}
        id="{id}-picker-panel"
        popover="auto"
        class={cn('jx-picker-panel jx-surface', motion.supported && 'jx-waapi')}
        data-variant="auto"
        style="position-anchor: {pickerAnchor}; inset-area: bottom span-all; position-area: bottom span-all;"
        ontoggle={onPickerToggle}
      >
        <!-- the REAL shadow layer: a DOM child because pseudo-elements
             are unreachable from WAAPI — the kernel animates it in
             lockstep (Owner ruling r18) -->
        <div data-jx-picker-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
        <!-- the floating-surface law (arch r3): the popover element is
             the PLATFORM (paints nothing); the bezel fill + border live
             on the surface-body child -->
        <div class="jx-surface-body px-3.5 py-3">
          {#if picker}
            {@render picker(pickerCtx)}
          {:else if type === 'color'}
            <!-- the PROFESSIONAL editor (SV pad + hue bar + format
                 switch + value input + Eye Dropper + presets) — editor
                 semantics: continuous commits, the panel stays open.
                 input[type=color] only accepts #hex — normalize for the
                 element, forward the raw notation to onselect -->
            <Editor
              bind:this={editorRef}
              value={/^#[0-9a-fA-F]{6}$/.test(String(shownValue ?? '')) ? String(shownValue) : undefined}
              onpick={(color) => {
                const parsed = parseColor(color);
                if (parsed) commitFromPanel(formatColor(parsed, 'hex'));
                onselect?.(color);
              }}
            />
          {:else}
            <Calendar
              bind:this={calendarRef}
              anchors={datePart ? [datePart] : []}
              min={(rest as { min?: string }).min}
              max={(rest as { max?: string }).max}
              initialView={datePart}
              idPrefix="{id}-pcal"
              onpick={commitDay}
            />
          {/if}
        </div>
      </div>
    {/if}
    {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
    {#if outerBlockEnd}<div data-jx-outer data-jx-outer-end class="text-muted-foreground text-xs -mt-1">{@render outerBlockEnd()}</div>{/if}
  </div>
{/if}
