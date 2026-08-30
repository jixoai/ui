<!--
  jixoai combobox (registry/files/ui/combobox/combobox.svelte).
  Original request (2026-08-20): “开发 Combobox 和 TagsInput 两个高级 Form
  组件” — the searchable sibling of select.svelte: the trigger IS an <input>,
  so the popup is no longer a jump but a conversation. Orthogonal intents:

  1. filtering — typing filters options by label (case-insensitive
     contains); the filter text is INPUT state, never committed state: the
     committed `value` only ever changes through an explicit commit.
  2. commit paths — Enter commits the highlighted row (or the raw text);
     blur / Tab commits the typed text by resolving it: exact option
     (label or value, case-insensitive) → that option, else allowCustom →
     the raw text as the value, else revert. Escape reverts to the
     committed display. The “Use “xxx”” row appears only when nothing
     matched, exactly the no-results affordance.
  3. popover orchestration — select.svelte law on an input trigger: the
     panel is popover="auto" (light dismiss, Escape close request,
     one-at-a-time, top layer are the browser's); the chevron keeps a real
     popovertarget button; focus NEVER enters the panel — it stays in the
     input the whole time, so the roving highlight is aria-activedescendant
     + aria-owns (the listbox is a DOM sibling, top-layer promoted) with
     zero focus restitution to manage. mousedown is prevented inside the
     panel and on the chevron so click-to-choose never blurs the input
     into a premature blur-commit.
  4. family law — input.svelte shell paint (1px border, radius 0, inset
     focus outline, hover lift, dashed invalid), label[for] + error
     wiring, terminal-bezel panel with the 2px primary selected edge on
     border-inline-start, logical properties only (RTL flips itself),
     reduced-motion kills the transitions.

  Open/close race fix (2026-08-23, “聚焦后闪开即关，开关与否只能和…” —
  open-on-focus flashed shut, toggling was uncontrollable around focus):
  the popover's DOM state flips synchronously, but its `toggle` EVENT is
  queued a task later. A re-click lands exactly in that gap — pointerdown
  light-dismisses the panel, click fires before the queued toggle — so
  the old `!open` guard read the stale mirror, skipped the re-show, and
  the panel ended up slammed shut. Interaction decisions now read the
  LIVE :popover-open state (panelOpenLive()); `open` is demoted to the
  aria-expanded mirror (set optimistically by our show/hide, confirmed by
  ontoggle). A re-click keeps the in-progress filter (freshOpen re-seeds
  fresh focus only), and blur clears the focus-scoped query so a closed
  panel can never hold a stale filter.

  The input's DOM text is display state, owned imperatively: while focused
  the user owns it; on blur / external `value` change an $effect resyncs
  it to the committed display (selected label, else the custom value).

  NativeHTML base audit (2026-08-20, updated by the form-field bridge the
  same day): the trigger IS a native <input type="text">, but its DOM
  text is DISPLAY state — a caller-supplied name must never submit it.
  The name prop is intercepted and rides the FACELESS jx-form-field
  bridge (registry/files/lib/form-field.ts) instead, which submits the
  committed VALUE (a listed option's value, or the allowCustom string)
  through ElementInternals — never the display label. form reset bubbles
  back as jx-reset, form/fieldset disable as jx-disabled. Style,
  structure and ARIA stay in this file — the bridge owns no paint.

  tw4 (2026-08-24): trigger/shell/rows/scroll static paint is token
  utilities in the markup (markup-known states — the invalid dash, the
  open chevron flip, selected/active/disabled rows — ride conditional
  utilities); the .jx-field scaffold is consumed from jx-pure Part A.
  Only the anchor-positioned panel (static residue with its @supports
  fallback + ::backdrop), the shell's :has() hover/focus/disabled
  machines, the toggle/row hover states and the reduced-motion kill
  remain in combobox.css (D1-exempt residue under the layer law).

  Surface motion kernel (2026-08-25): popover.svelte law adopted — the
  toggle seam drives the shared WAAPI kernel (lib/surface-motion.ts)
  against the live wrap anchor; the panel carries jx-waapi behind
  motion.supported plus the REAL .jx-surface-shadow child; jixoai.css
  owns every visible formula.

  MULTIPLE + SHOWCLEAR (2026-08-30, expand-form-family F1):

  5. multiple — `multiple` flips the $bindable contract to string[]
     (a discriminated GENERIC: `Multiple extends boolean`, no compat
     shim — the breaking change is documented). Options TOGGLE
     membership in SELECTION ORDER (pick a, b, c → getAll = a, b, c;
     re-pick removes). The selection renders as trigger CHIPS (the
     tags-input chip law: muted fill, 1px border, 12px text, per-chip
     remove ×); the panel rows carry aria-multiselectable + a check
     glyph on the picked rows, and picking keeps the panel OPEN (multi-
     pick is a conversation, not a shot). Submission rides the form-
     field bridge's MULTIVALUE seam (design.md, the exclusively-lossless
     transport): the committed array is handed to <jx-form-field> via
     the `values` PROPERTY (setValues) — never the string value
     attribute — and commits as FormData with repeated same-name
     entries, so getAll(name) returns the values in order byte-for-byte;
     form.reset() restores the mount array, disabled/fieldset omission
     stay the platform's. Blur no longer commits raw text in multiple
     mode (chips commit through explicit Enter/click only).
  6. showClear — × in the trigger lane (before the chevron) when
     something is committed; clears the selection and submits honestly
     empty (the bridge's empty law: no entry). The glyphs (chip ×, clear
     ×, panel check) are CSS-mask icon slots with inline fallbacks —
     --jx-icon-clear for the ×s — so the item needs no icon dependency.
-->
<script module lang="ts">
  /** One row of the Combobox listbox. */
  export interface ComboboxOption {
    /** the committed value ($bindable value on the field) */
    value: string;
    /** the row's (and the trigger's) display text — also the filter target */
    label: string;
    /** optional muted second line rendered inside the panel only */
    description?: string;
    /** unselectable row — skipped by keyboard navigation and click */
    disabled?: boolean;
  }
</script>

<script lang="ts" generics="Multiple extends boolean = false">
  // side-effect import: registers the faceless <jx-form-field> element
  // (client-only, idempotent) that carries this field's form association
  import '$lib/form-field';
  import type { FormField } from '$lib/form-field';
  import { onDestroy } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import './combobox.css';

  interface Props extends Omit<HTMLInputAttributes, 'value'> {
    /** the full option list (order = panel order) */
    options: ComboboxOption[];
    /** committed value; bind:value — SINGLE mode: a listed option's
        value or a custom string. MULTIPLE: the selected string[] in
        SELECTION ORDER (the discriminated generic swaps the contract;
        no backward-compat shim — the docs call the breaking change) */
    value?: Multiple extends true ? string[] : string;
    /** multi-select mode: options toggle membership (chips + check
        states + the bridge's MULTIVALUE FormData submission) */
    multiple?: Multiple;
    /** input placeholder while nothing is committed */
    placeholder?: string;
    /** field label; renders label[for] above the control */
    label?: string;
    /** form field name — intercepted OFF the native input; the bridge
        submits the committed VALUE under it, never the display text
        (multiple: repeated same-name FormData entries via setValues) */
    name?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** accept typed text that matches no option as the committed value */
    allowCustom?: boolean;
    /** × in the trigger lane when something is committed — clears the
        selection; the field then submits honestly empty */
    showClear?: boolean;
    /** disable the input and the chevron together */
    disabled?: boolean;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency; the bezel fill
        follows the variant through the jx-surface fill props) */
    variant?: 'solid' | 'acrylic' | 'auto';
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    options,
    value = $bindable(),
    multiple = false,
    placeholder = 'Search or type...',
    label,
    name,
    error,
    id = autoId,
    allowCustom = true,
    showClear = false,
    disabled = false,
    variant = 'auto',
    class: className = '',
    ...rest
  }: Props = $props();

  // form lifecycle: what jx-reset restores, and the form-disable mirror.
  // An array mount value is SNAPSHOT — the reset target never aliases
  // the caller's array.
  const initialValue = Array.isArray(value) ? [...value] : value;
  let formDisabled = $state(false);
  const isDisabled = $derived(disabled || formDisabled);

  /** one cast point between the discriminated contract halves */
  type Val = Multiple extends true ? string[] : string | undefined;
  const commitValue = (next: string | string[] | undefined): void => {
    value = next as Val;
  };

  // ---- committed vs typing state ------------------------------------------
  // single mode: the committed string; multiple: the ordered selection.
  const multiValues = $derived(
    multiple && Array.isArray(value) ? (value as string[]) : [],
  );
  const selected = $derived(
    multiple ? undefined : options.find((option) => option.value === value),
  );
  const display = $derived(multiple ? '' : (selected?.label ?? value ?? ''));
  const hasSelection = $derived(multiple ? multiValues.length > 0 : (value ?? '') !== '');
  const showClearButton = $derived(showClear && !isDisabled && hasSelection);

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  const panelId = $derived(`${id}-panel`);
  const listboxId = $derived(`${id}-listbox`);
  // Anchor names are CSS custom-ident-ish: sanitize the id into a stable
  // dashed token so any consumer id yields a valid --jx-cbx-* name.
  const anchorName = $derived(`--jx-cbx-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const optionId = (index: number): string => `${id}-opt-${index}`;

  /** the live filter text — typing state, never the committed value */
  let query = $state('');
  let open = $state(false);
  /** roving highlight index into `rows` (-1 = none) — the keyboard/aria cursor */
  let active = $state(-1);
  let focused = $state(false);
  let inputEl = $state<HTMLInputElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);
  // the wrap span carrying anchor-name — the motion kernel measures the
  // slide axis panel↔anchor against it, live
  let anchorEl = $state<HTMLElement | null>(null);

  /** a panel row: a filtered option, or the appended "Use “xxx”" affordance */
  type Row = { kind: 'option'; option: ComboboxOption } | { kind: 'custom'; text: string };

  const matching = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (q === '') return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  });
  // the "Use “xxx”" row appears ONLY when nothing matched (2026-08-20 fix,
  // back to the file's own law): while matches exist they are the answer —
  // an extra custom affordance next to a live match is noise. The blur
  // commit path still resolves unmatched text through allowCustom.
  const rows = $derived.by(() => {
    const list: Row[] = matching.map((option) => ({ kind: 'option', option }));
    if (allowCustom && matching.length === 0 && query.trim() !== '') {
      list.push({ kind: 'custom', text: query.trim() });
    }
    return list;
  });

  const activeId = $derived(open && active >= 0 ? optionId(active) : undefined);

  function rowEnabled(index: number): boolean {
    const row = rows[index];
    if (!row) return false;
    return row.kind === 'custom' || !row.option.disabled;
  }
  function firstEnabledRow(): number {
    return rows.findIndex((_, index) => rowEnabled(index));
  }
  /** fresh-open highlight: continue from context like the native select
      (multiple: the first selected member's row) */
  function freshActive(): number {
    const picked: unknown[] = multiple ? multiValues : [value];
    const selectedRow = rows.findIndex(
      (row) => row.kind === 'option' && picked.includes(row.option.value)
    );
    return selectedRow >= 0 ? selectedRow : firstEnabledRow();
  }

  /** step the highlight by delta, skipping disabled rows, clamped at the
      ends (APG listbox: no wrap — the filter is the jump) */
  function moveActive(delta: 1 | -1): void {
    let i = active;
    for (let steps = 0; steps < rows.length; steps++) {
      i += delta;
      if (i < 0 || i >= rows.length) return;
      if (rowEnabled(i)) {
        active = i;
        return;
      }
    }
  }

  // ---- popover plumbing ----------------------------------------------------
  // The native toggle event is the ONE open/close seam (typing-show,
  // chevron popovertarget, light dismiss, Escape close request, our hides).
  // It syncs the `open` flag — read LIVE from :popover-open (ToggleEvent
  // fields are never trusted, the popover.svelte law) — and drives the
  // shared surface-motion kernel: focus never enters the panel, so there
  // is no focus-in/restitution to orchestrate, and query/active are set by
  // the call site that knows the intent (typing vs fresh open).
  // 2026-08-23 race law: the DOM popover state flips synchronously inside
  // showPopover/hidePopover/light-dismiss, but the toggle EVENT trails a
  // task behind it. Any decision taken inside that gap (a re-click sits
  // exactly there: pointerdown light-dismisses, click runs before the
  // queued toggle) must read the LIVE state via panelOpenLive(), never
  // the `open` mirror — stale truth is how the panel slammed shut.
  function panelOpenLive(): boolean {
    return panelEl != null && panelEl.isConnected && panelEl.matches(':popover-open');
  }

  function onPanelToggle(): void {
    open = panelEl?.matches(':popover-open') ?? false;
    if (open) {
      motion.play(1);
      motion.startTracking();
    } else {
      panelEl?.classList.remove('jx-rest');
      motion.play(0);
      motion.stopTracking();
    }
  }

  // ── MOTION KERNEL — the shared declarative half (popover.svelte law,
  // lib/surface-motion.ts): WAAPI animates ONE @property number (--jx-p);
  // every visible property is a CSS formula of it (jixoai.css). Here it
  // wires only this panel's toggle seam and live wrap anchor
  const motion = createSurfaceMotion(() => panelEl, { anchor: () => anchorEl });
  onDestroy(() => motion.destroy());

  function showPanel(): void {
    if (panelEl?.isConnected && !panelEl.matches(':popover-open')) {
      try {
        panelEl.showPopover();
        open = true; // optimistic aria mirror — onPanelToggle confirms it
      } catch {
        // no transient activation (programmatic focus) — the next keystroke opens
      }
    }
  }
  function hidePanel(): void {
    if (panelEl?.matches(':popover-open')) {
      panelEl.hidePopover();
      open = false;
    }
  }
  function freshOpen(): void {
    query = '';
    active = freshActive();
    showPanel();
  }

  // ---- commit paths ----------------------------------------------------------
  /** membership test for the panel's aria-selected / check / edge paint */
  function isSelected(v: string): boolean {
    return multiple ? multiValues.includes(v) : value === v;
  }

  function chooseRow(row: Row): void {
    if (row.kind === 'option') {
      if (row.option.disabled) return; // a disabled row neither selects nor closes
      if (multiple) {
        // toggle membership — SELECTION ORDER is the commit order
        commitValue(
          multiValues.includes(row.option.value)
            ? multiValues.filter((v) => v !== row.option.value)
            : [...multiValues, row.option.value],
        );
      } else {
        commitValue(row.option.value);
      }
    } else {
      // the "Use "xxx"" affordance: custom text joins the selection
      if (multiple) {
        if (!multiValues.includes(row.text)) commitValue([...multiValues, row.text]);
      } else {
        commitValue(row.text);
      }
    }
    query = '';
    if (inputEl) inputEl.value = display; // derived re-evaluates after the write
    if (!multiple) hidePanel(); // multi-pick keeps the panel open
  }

  /** chip ×: remove one member, keep the panel/flow as it is */
  function removeValue(v: string): void {
    if (isDisabled) return;
    commitValue(multiValues.filter((member) => member !== v));
    inputEl?.focus();
  }

  /** the trigger ×: clear the whole selection — the field then submits
      honestly empty (the bridge contributes nothing) */
  function clearSelection(): void {
    if (isDisabled) return;
    commitValue(multiple ? [] : undefined);
    query = '';
    if (inputEl) inputEl.value = display;
    inputEl?.focus();
  }

  /** resolve typed text (SINGLE mode): exact option → that value; else
      allowCustom → raw; else no commit (the blur-sync effect reverts
      the stray text) */
  function commitFromText(): void {
    const text = (inputEl?.value ?? '').trim();
    if (text === '') {
      if (value !== undefined) commitValue(undefined);
      return;
    }
    const lower = text.toLowerCase();
    const exact = options.find(
      (option) => !option.disabled && (option.value.toLowerCase() === lower || option.label.toLowerCase() === lower)
    );
    if (exact) {
      if (value !== exact.value) commitValue(exact.value);
    } else if (allowCustom) {
      if (value !== text) commitValue(text);
    }
  }

  /** resolve typed text (MULTIPLE mode): Enter with nothing highlighted —
      an exact option toggles, else allowCustom appends the raw text as a
      chip. Blur never commits raw text in multiple mode. */
  function commitMultiFromText(): void {
    const text = (inputEl?.value ?? '').trim();
    if (text === '') return;
    const lower = text.toLowerCase();
    const exact = options.find(
      (option) => !option.disabled && (option.value.toLowerCase() === lower || option.label.toLowerCase() === lower)
    );
    if (exact) {
      chooseRow({ kind: 'option', option: exact });
    } else if (allowCustom && !multiValues.includes(text)) {
      commitValue([...multiValues, text]);
    }
  }

  // ---- the MULTIVALUE bridge handoff (design.md) --------------------------
  // The committed array crosses to <jx-form-field> as a PROPERTY
  // (setValues) — never the string value attribute — and commits as
  // FormData with repeated same-name entries: getAll(name) returns the
  // selection in order, byte-for-byte. Single mode DISARMS the seam
  // (null): the value attribute governs again. The element ref is bound
  // in the markup; $effect keeps the handoff on every commit + reset.
  let bridgeEl = $state<FormField | null>(null);
  $effect(() => {
    if (!bridgeEl || typeof bridgeEl.setValues !== 'function') return;
    bridgeEl.setValues(multiple ? multiValues : null);
  });

  // ---- input events ----------------------------------------------------------
  function onInput(event: Event): void {
    const el = event.currentTarget as HTMLInputElement;
    query = el.value;
    active = firstEnabledRow(); // filtering auto-highlights the first match
    showPanel();
    // forward a caller-supplied input handler from the rest props
    (rest as { oninput?: (event: Event) => void }).oninput?.(event);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!panelOpenLive()) {
        freshOpen(); // native-select muscle memory: ↑/↓ opens it
        return;
      }
      moveActive(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const row = rows[active];
      if (row && rowEnabled(active)) chooseRow(row);
      else if (multiple) commitMultiFromText(); // nothing highlighted → resolve the raw text into the selection
      else commitFromText(); // nothing highlighted → resolve the raw text
    } else if (event.key === 'Escape') {
      // no preventDefault: the popover's native close request runs; we only revert
      query = '';
      if (inputEl) inputEl.value = display;
    }
    // Tab needs no handler: focus moves, focusout commits + closes
  }

  function onFocus(): void {
    focused = true;
    if (!panelOpenLive()) freshOpen(); // a live panel keeps its in-progress filter
    inputEl?.select(); // re-focus selects all — ready to retype
  }
  function onClick(): void {
    // Re-click on the focused field: pointerdown already light-dismissed
    // the panel and its toggle event lands AFTER this click — only the
    // live read sees the truth, so the panel stays up as intended. The
    // in-progress filter survives (freshOpen re-seeds fresh focus only);
    // the highlight is merely re-validated against the current rows.
    if (!panelOpenLive() && focused) {
      if (!rowEnabled(active)) active = freshActive();
      showPanel();
    }
  }
  function onFocusOut(): void {
    focused = false; // the display-sync effect below reverts/refreshes the text
    hidePanel();
    // multiple mode: blur never commits raw text — chips join through
    // explicit Enter / row click only
    if (!multiple) commitFromText();
    query = ''; // the filter is focus-scoped — a closed panel never holds a stale one
  }

  // keep the displayed text honest whenever it is not being edited: on
  // mount, on blur, and on an external value/options change
  $effect(() => {
    if (!focused && inputEl) inputEl.value = display;
  });

  // keep the highlight row visible when it moves off-panel
  $effect(() => {
    if (open && active >= 0) {
      document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
    }
  });
</script>

<div class="jx-field">
  <!-- faceless form bridge (form-field.ts law): the committed VALUE (not
       the display text) rides ElementInternals into FormData; the native
       input carries NO name of its own. jx-reset / jx-disabled bubble the
       form lifecycle back into this component. Owns no box, no content —
       the `contents` utility keeps the prerendered HTML from flashing an
       extra flex gap pre-upgrade.
       MULTIPLE: the string value attribute stays EMPTY — the committed
       array crosses through the `values` PROPERTY (setValues, the
       MULTIVALUE seam) instead, which commits repeated same-name FormData
       entries (design.md: no joined-string channel exists).
       disabled passes `|| undefined`: Svelte has no boolean-attribute
       semantics for custom elements and would render disabled="false"
       as a PRESENT attribute (presence = true in HTML). -->
  <jx-form-field
    bind:this={bridgeEl}
    class="contents"
    aria-hidden="true"
    {name}
    value={multiple ? undefined : (value ?? '')}
    disabled={isDisabled || undefined}
    onjx-reset={() => commitValue(Array.isArray(initialValue) ? [...initialValue] : initialValue)}
    onjx-disabled={(event: CustomEvent<boolean>) => (formDisabled = event.detail)}
  ></jx-form-field>
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <span data-jx-combobox-wrap class="relative block w-full max-w-full" style="anchor-name: {anchorName}" bind:this={anchorEl}>
    <div
      data-jx-combobox-invalid={invalid ? '' : undefined}
      class={cn(
        'jx-combobox-shell flex items-center gap-2 w-full max-w-full min-h-10 px-3 border border-border rounded-none bg-background scheme-light dark:scheme-dark transition-[box-shadow] duration-150 ease-out',
        multiple && 'flex-wrap',
        invalid && 'border-dashed',
        className,
      )}
    >
      {#if multiple}
        {#each multiValues as member (member)}
          <!-- the trigger chips: the tags-input chip law (muted fill, 1px
               border, 12px text, per-chip remove ×). The × keeps the
               pointer from blurring the input (the panel law) so removal
               never trips a blur-commit. -->
          <span data-jx-combobox-chip class="inline-flex flex-none items-center gap-1 ps-2 border border-border bg-muted text-foreground text-xs leading-none h-6">
            <span data-jx-combobox-chip-label class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{options.find((option) => option.value === member)?.label ?? member}</span>
            <button
              type="button"
              class="jx-combobox-x inline-flex items-center justify-center self-stretch w-6 p-0 border-0 bg-transparent cursor-pointer text-muted-foreground transition-colors duration-100 ease-out hover:text-foreground disabled:cursor-not-allowed"
              aria-label="remove {options.find((option) => option.value === member)?.label ?? member}"
              disabled={isDisabled}
              onmousedown={(event) => event.preventDefault()}
              onclick={() => removeValue(member)}
            >
              <span class="jx-combobox-x-glyph" aria-hidden="true"></span>
            </button>
          </span>
        {/each}
      {/if}
      <!-- jx-html-control-lane (B2, ui-plugin-followup): the input is a
           LANE inside the shell (the shell owns the box law), so the
           standard layer's lane utility is the appropriate form-lane
           adoption — flex/min-width/min-height/border-0/outline/
           transparent/foreground/font-size/placeholder all
           single-sourced there. p-0 stays: the UA input padding reset
           the Part A shell-pair rule normally carries. multiple: the
           lane shares the wrapped row with the chips (a small floor so
           the typing lane never collapses). -->
      <input
        bind:this={inputEl}
        {...rest}
        {id}
        type="text"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-owns={listboxId}
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        aria-invalid={invalidAttr}
        aria-describedby={describedBy}
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        data-jx-combobox-input
        class={cn(
          'jx-html-control-lane p-0',
          multiple && 'flex-[1_1_6rem] min-w-[6rem]',
        )}
        {placeholder}
        disabled={isDisabled}
        oninput={onInput}
        onkeydown={onKeydown}
        onfocus={onFocus}
        onclick={onClick}
        onfocusout={onFocusOut}
      />
      {#if showClearButton}
        <!-- the trigger × (showClear): clears the whole selection — the
             bridge then contributes NOTHING (honest empty submit). Same
             pointer law as the chip ×: mousedown is prevented so the
             input keeps focus. -->
        <button
          type="button"
          class="jx-combobox-x flex-none inline-flex items-center justify-center w-5 h-5 p-0 border-0 bg-transparent text-muted-foreground cursor-pointer transition-colors duration-100 ease-out hover:text-foreground disabled:cursor-not-allowed"
          tabindex="-1"
          aria-label="clear selection"
          disabled={isDisabled}
          onmousedown={(event) => event.preventDefault()}
          onclick={clearSelection}
        >
          <span class="jx-combobox-x-glyph" aria-hidden="true"></span>
        </button>
      {/if}
      <button
        type="button"
        class="jx-combobox-toggle flex-none inline-flex items-center justify-center w-5 h-5 p-0 border-0 bg-transparent text-muted-foreground cursor-pointer disabled:cursor-not-allowed"
        tabindex="-1"
        aria-hidden="true"
        popovertarget={panelId}
        onclick={() => {
          query = '';
          active = freshActive();
        }}
        onmousedown={(event) => event.preventDefault()}
        disabled={isDisabled}
      >
        <!-- the chevron = an ICON SLOT (B2): the span paints currentColor
             through the mask on --jx-icon-chevron (the same slot
             jx-html-select reads), so a face/plugin override re-skins the
             composite and the native control with one variable. The
             inline lucide SVG fallback default keeps the glyph without
             the sheet. -->
        <span
          class={cn(
            'jx-combobox-chevron w-3 h-3 pointer-events-none transition-transform duration-150 ease-out',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        ></span>
      </button>
    </div>
  </span>

  <div
    bind:this={panelEl}
    id={panelId}
    popover="auto"
    class={cn('jx-combobox-panel jx-surface', motion.supported && 'jx-waapi')}
    data-variant={variant}
    style="position-anchor: {anchorName}; inset-area: bottom span-all; position-area: bottom span-all;"
    ontoggle={onPanelToggle}
  >
    <!-- surface body (bezel paint + ::after shadow) + scroll ring
         (floating-surface law arch r3) -->
    <div data-jx-combobox-panel-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
    <!-- the REAL shadow layer: a DOM child because pseudo-elements are
         unreachable from WAAPI — the kernel animates it in lockstep
         (Owner ruling r18) -->
    <div data-jx-combobox-panel-body class="jx-surface-body">
    <div data-jx-combobox-scroll class="max-h-[60vh] overflow-auto overscroll-contain [scrollbar-gutter:stable_both-edges] py-1 px-[max(4px_-_var(--jx-scrollbar-thin,0px),0px)]">
    {#if rows.length > 0}
      <!-- mousedown is prevented so click-to-choose never blurs the input
           into a premature blur-commit -->
      <ul
        id={listboxId}
        data-jx-combobox-list
        class="m-0 p-0 list-none"
        role="listbox"
        aria-label={label ?? placeholder}
        aria-multiselectable={multiple ? 'true' : undefined}
        onmousedown={(event) => event.preventDefault()}
      >
        {#each rows as row, index (row.kind === 'option' ? row.option.value : `custom:${row.text}`)}
          <!-- option rows are click-only BY PATTERN (select.svelte law): the
               keyboard path rides the input + aria-activedescendant roving
               highlight, never the row itself -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <li
            id={optionId(index)}
            role="option"
            aria-selected={row.kind === 'option' && isSelected(row.option.value) ? 'true' : 'false'}
            aria-disabled={row.kind === 'option' && row.option.disabled ? 'true' : undefined}
            data-jx-combobox-active={index === active ? '' : undefined}
            data-jx-combobox-selected={row.kind === 'option' && isSelected(row.option.value) ? '' : undefined}
            data-jx-combobox-disabled={row.kind === 'option' && row.option.disabled ? '' : undefined}
            class={cn(
              'jx-combobox-option relative flex flex-col gap-0.5 px-[10px] py-[6px] text-[13px] leading-[1.45] text-[color-mix(in_oklab,var(--terminal-foreground)_72%,transparent)] cursor-pointer border-s-2 [border-inline-start-color:transparent] transition-[background-color,color] duration-100 ease-out',
              index === active && 'bg-terminal-hover text-terminal-foreground',
              row.kind === 'option' && isSelected(row.option.value) && 'bg-terminal-hover text-terminal-foreground [border-inline-start-color:var(--primary)]',
              row.kind === 'option' && row.option.disabled && 'opacity-50 pointer-events-none',
            )}
            onclick={() => chooseRow(row)}
          >
            {#if row.kind === 'option'}
              <span data-jx-combobox-option-label class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{row.option.label}</span>
              {#if row.option.description}
                <span data-jx-combobox-option-desc class="text-[11px] leading-[1.4] text-[color-mix(in_oklab,var(--terminal-foreground)_55%,transparent)]">{row.option.description}</span>
              {/if}
            {:else}
              <span data-jx-combobox-use class="text-primary">Use “{row.text}”</span>
            {/if}
            {#if multiple && row.kind === 'option' && isSelected(row.option.value)}
              <!-- the multiple check glyph: a CSS-mask icon slot
                   (--jx-icon-check with the inline fallback) pinned to
                   the row's inline end — the pick state readable at a
                   glance, aria-hidden (aria-selected carries the state) -->
              <span class="jx-combobox-check" aria-hidden="true"></span>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <p data-jx-combobox-empty class="m-0 px-[10px] py-[6px] text-[13px] text-[color-mix(in_oklab,var(--terminal-foreground)_55%,transparent)]">No results for “{query}”</p>
    {/if}
    </div>
    </div>
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>
