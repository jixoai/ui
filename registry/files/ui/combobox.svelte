<!--
  jixoai combobox (registry/files/ui/combobox.svelte).
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

  The input's DOM text is display state, owned imperatively: while focused
  the user owns it; on blur / external `value` change an $effect resyncs
  it to the committed display (selected label, else the custom value).

  NativeHTML base audit (2026-08-20): the trigger IS a native
  <input type="text"> — a caller-supplied name rides through restProps
  and the field submits, but the FormData value is the DISPLAY text
  (label or custom string), not a code; commit-value submission needs a
  hidden input. Select (button trigger) has no form leg at all — the
  ElementInternals direction for both is noted, not designed here.
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

<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLInputAttributes, 'value'> {
    /** the full option list (order = panel order) */
    options: ComboboxOption[];
    /** committed value; bind:value — a listed option's value or a custom string */
    value?: string;
    /** input placeholder while nothing is committed */
    placeholder?: string;
    /** field label; renders label[for] above the control */
    label?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** accept typed text that matches no option as the committed value */
    allowCustom?: boolean;
    /** disable the input and the chevron together */
    disabled?: boolean;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    options,
    value = $bindable(),
    placeholder = 'Search or type...',
    label,
    error,
    id = autoId,
    allowCustom = true,
    disabled = false,
    class: className = '',
    ...rest
  }: Props = $props();

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

  // ---- committed vs typing state ------------------------------------------
  const selected = $derived(options.find((option) => option.value === value));
  const display = $derived(selected?.label ?? value ?? '');

  /** the live filter text — typing state, never the committed value */
  let query = $state('');
  let open = $state(false);
  /** roving highlight index into `rows` (-1 = none) — the keyboard/aria cursor */
  let active = $state(-1);
  let focused = $state(false);
  let inputEl = $state<HTMLInputElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

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
  /** fresh-open highlight: continue from context like the native select */
  function freshActive(): number {
    const selectedRow = rows.findIndex(
      (row) => row.kind === 'option' && row.option.value === value
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
  // It only syncs the `open` flag: focus never enters the panel, so there
  // is no focus-in/restitution to orchestrate, and query/active are set by
  // the call site that knows the intent (typing vs fresh open).
  function onPanelToggle(event: ToggleEvent): void {
    open = event.newState === 'open';
  }

  function showPanel(): void {
    if (panelEl?.isConnected && !panelEl.matches(':popover-open')) {
      try {
        panelEl.showPopover();
      } catch {
        // no transient activation (programmatic focus) — the next keystroke opens
      }
    }
  }
  function hidePanel(): void {
    if (panelEl?.matches(':popover-open')) panelEl.hidePopover();
  }
  function freshOpen(): void {
    query = '';
    active = freshActive();
    showPanel();
  }

  // ---- commit paths ----------------------------------------------------------
  function chooseRow(row: Row): void {
    if (row.kind === 'option') {
      if (row.option.disabled) return; // a disabled row neither selects nor closes
      value = row.option.value;
    } else {
      value = row.text;
    }
    query = '';
    if (inputEl) inputEl.value = display; // derived re-evaluates after the write
    hidePanel();
  }

  /** resolve typed text: exact option → that value; else allowCustom → raw;
      else no commit (the blur-sync effect reverts the stray text) */
  function commitFromText(): void {
    const text = (inputEl?.value ?? '').trim();
    if (text === '') {
      if (value !== undefined) value = undefined;
      return;
    }
    const lower = text.toLowerCase();
    const exact = options.find(
      (option) => !option.disabled && (option.value.toLowerCase() === lower || option.label.toLowerCase() === lower)
    );
    if (exact) {
      if (value !== exact.value) value = exact.value;
    } else if (allowCustom) {
      if (value !== text) value = text;
    }
  }

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
      if (!open) {
        freshOpen(); // native-select muscle memory: ↑/↓ opens it
        return;
      }
      moveActive(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const row = rows[active];
      if (row && rowEnabled(active)) chooseRow(row);
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
    freshOpen();
    inputEl?.select(); // re-focus selects all — ready to retype
  }
  function onClick(): void {
    if (!open && focused) freshOpen(); // re-clicking the input keeps the panel up
  }
  function onFocusOut(): void {
    focused = false; // the display-sync effect below reverts/refreshes the text
    hidePanel();
    commitFromText();
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
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <span class="jx-combobox-wrap" style="anchor-name: {anchorName}">
    <div class="jx-combobox-shell {className}" class:jx-combobox-invalid={invalid}>
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
        class="jx-combobox-input"
        {placeholder}
        {disabled}
        oninput={onInput}
        onkeydown={onKeydown}
        onfocus={onFocus}
        onclick={onClick}
        onfocusout={onFocusOut}
      />
      <button
        type="button"
        class="jx-combobox-toggle"
        tabindex="-1"
        aria-hidden="true"
        popovertarget={panelId}
        onclick={() => {
          query = '';
          active = freshActive();
        }}
        onmousedown={(event) => event.preventDefault()}
        {disabled}
      >
        <svg
          class="jx-combobox-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>
  </span>

  <div
    bind:this={panelEl}
    id={panelId}
    popover="auto"
    class="jx-combobox-panel"
    style="position-anchor: {anchorName}; inset-area: bottom span-all; position-area: bottom span-all;"
    ontoggle={onPanelToggle}
  >
    {#if rows.length > 0}
      <!-- mousedown is prevented so click-to-choose never blurs the input
           into a premature blur-commit -->
      <ul
        id={listboxId}
        class="jx-combobox-list"
        role="listbox"
        aria-label={label ?? placeholder}
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
            aria-selected={row.kind === 'option' && row.option.value === value ? 'true' : 'false'}
            aria-disabled={row.kind === 'option' && row.option.disabled ? 'true' : undefined}
            class="jx-combobox-option"
            class:jx-combobox-selected={row.kind === 'option' && row.option.value === value}
            class:jx-combobox-active={index === active}
            class:jx-combobox-disabled={row.kind === 'option' && row.option.disabled}
            onclick={() => chooseRow(row)}
          >
            {#if row.kind === 'option'}
              <span class="jx-combobox-option-label">{row.option.label}</span>
              {#if row.option.description}
                <span class="jx-combobox-option-desc">{row.option.description}</span>
              {/if}
            {:else}
              <span class="jx-combobox-use">Use “{row.text}”</span>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <p class="jx-combobox-empty">No results for “{query}”</p>
    {/if}
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>

<style>
  .jx-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    width: 100%;
    min-width: 0; /* InputGroup hardening: shrink inside grid/flex hosts */
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

  /* ---- trigger: the input.svelte shell, chromeless input + chevron ----- */
  .jx-combobox-wrap {
    position: relative;
    display: block;
    width: 100%;
    max-width: 100%; /* InputGroup hardening: never push past the host row */
  }
  .jx-combobox-shell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    max-width: 100%;
    min-height: 2.5rem;
    padding-inline: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color-scheme: light;
    transition: box-shadow 150ms ease-out;
  }
  :global(.dark) .jx-combobox-shell {
    color-scheme: dark;
  }
  .jx-combobox-shell:not(:has(input:disabled)):hover:not(:has(:focus-visible)) {
    box-shadow: var(--shadow-2xs);
  }
  /* the site focus law (input.svelte): the shell carries the inset 1px
     outline on the ring token for the input inside */
  .jx-combobox-shell:has(:focus-visible) {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
    box-shadow: none;
  }
  .jx-combobox-shell:has(input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
  .jx-combobox-shell.jx-combobox-invalid {
    border-style: dashed;
  }
  .jx-combobox-input {
    flex: 1 1 0%;
    min-width: 0;
    min-height: calc(2.5rem - 2px);
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.45;
  }
  .jx-combobox-input::placeholder {
    color: var(--muted-foreground);
    opacity: 1;
  }
  /* the toggle is a decorative affordance (tabindex -1, aria-hidden): the
     keyboard opens the panel by typing or with ↑/↓, like the native combobox */
  .jx-combobox-toggle {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }
  .jx-combobox-toggle:hover:not(:disabled) {
    color: var(--foreground);
  }
  .jx-combobox-toggle:disabled {
    cursor: not-allowed;
  }
  .jx-combobox-chevron {
    width: 0.75rem;
    height: 0.75rem;
    pointer-events: none;
    transition: transform 150ms ease-out;
  }
  .jx-combobox-input[aria-expanded='true'] ~ .jx-combobox-toggle .jx-combobox-chevron {
    transform: rotate(180deg);
  }

  /* ---- panel: terminal bezel dropdown (select.svelte panel law) -------- */
  .jx-combobox-panel {
    position: fixed;
    margin: 0;
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    width: anchor-size(width); /* exactly the trigger — the select look */
    max-width: min(92vw, 30rem);
    max-height: 60vh;
    overflow: auto;
    overscroll-behavior: contain;
    padding: 4px;
    border: 1px solid var(--border);
    background: var(--terminal);
    color: var(--terminal-foreground);
    box-shadow: var(--shadow);
  }
  /* Engines without CSS Anchor Positioning: authored viewport-center —
     the popover.svelte fallback visual, never worse. */
  @supports not (anchor-name: --jx-cbx-fallback) {
    .jx-combobox-panel {
      position-anchor: auto !important;
      inset-area: none !important;
      inset: 0;
      margin: auto;
      width: min(92vw, 22rem);
    }
  }
  /* Popovers get a ::backdrop too; light dismiss must never dim the page. */
  .jx-combobox-panel::backdrop {
    background: transparent;
  }

  .jx-combobox-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .jx-combobox-option {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px 10px;
    font-size: 13px;
    line-height: 1.45;
    color: color-mix(in oklab, var(--terminal-foreground) 72%, transparent);
    /* the selected edge line is reserved as transparent so selecting a
       row never shifts it — and border-inline-start flips under rtl */
    border-inline-start: 2px solid transparent;
    cursor: pointer;
    transition: background-color 100ms ease-out, color 100ms ease-out;
  }
  .jx-combobox-option:hover,
  .jx-combobox-option.jx-combobox-active {
    background: var(--terminal-hover);
    color: var(--terminal-foreground);
  }
  .jx-combobox-option.jx-combobox-selected {
    background: var(--terminal-hover);
    color: var(--terminal-foreground);
    border-inline-start-color: var(--primary);
  }
  .jx-combobox-option.jx-combobox-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  .jx-combobox-option-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jx-combobox-option-desc {
    font-size: 11px;
    line-height: 1.4;
    color: color-mix(in oklab, var(--terminal-foreground) 55%, transparent);
  }
  .jx-combobox-use {
    color: var(--primary);
  }
  .jx-combobox-empty {
    margin: 0;
    padding: 6px 10px;
    font-size: 13px;
    color: color-mix(in oklab, var(--terminal-foreground) 55%, transparent);
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
  .jx-error-mark {
    font-weight: 700;
    color: var(--destructive);
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-combobox-shell,
    .jx-combobox-chevron,
    .jx-combobox-option {
      transition: none;
    }
  }
</style>
