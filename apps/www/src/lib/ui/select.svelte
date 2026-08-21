<!--
  jixoai select (registry/files/ui/select.svelte).
  The RICH sibling of native-select.svelte: a custom listbox for when the
  native popup can't say what you need — per-option descriptions, a fully
  painted panel, presentation that must match the site, not the UA. For
  plain form submission or mobile reach for NativeSelect instead (a real
  name/value pair in FormData, the platform's overlay picker on touch).

  NativeHTML orchestration on the Popover base (popover.svelte law): the
  panel carries popover="auto" and the trigger is wired with
  popovertarget, so light dismiss (outside click), Escape, one-auto-
  popover-at-a-time, and top-layer rendering are ALL browser-native; the
  anchor is CSS Anchor Positioning (anchor-name on the wrapper,
  position-anchor + position-area + position-try-fallbacks on the panel;
  engines without it fall back to authored viewport-center). The JS on
  top is orchestration only: aria-expanded sync + focus restitution via
  the native toggle event, focus into the list, and roving highlight
  (aria-activedescendant) for ↑/↓/Home/End/Enter — exactly the parts the
  platform doesn't give a listbox.

  Panel surface law (language-switcher menu + tree-view row precedent):
  the panel is a terminal bezel — background var(--terminal), foreground
  var(--terminal-foreground) in BOTH modes — so the selected row
  (var(--terminal-hover) fill + 2px var(--primary) edge line) stays
  readable in light and dark alike. The edge line uses LOGICAL
  border-inline-start, so under dir="rtl" it flips to the inline-start
  (right) edge automatically; every other offset in this file is logical
  too.

  Trigger: visually the closed native select (1px var(--border) shell,
  radius 0, chevron that flips while open, inset focus law) but a real
  <button> — label[for] binds to it, aria-haspopup="listbox" +
  aria-expanded ride along, and ↑/↓ open it like the native control.

  NativeHTML base audit (2026-08-20, updated by the form-field bridge the
  same day): NO native <select> hides inside — a <button> trigger carries
  no name/value pair of its own (NativeSelect keeps the plain-native
  route). Form association rides the FACELESS jx-form-field bridge
  (registry/files/lib/form-field.ts): a display:contents form-associated
  custom element fed name/value/disabled attributes; the committed VALUE
  (never the label) reaches FormData through ElementInternals, form reset
  bubbles back as jx-reset, form/fieldset disable as jx-disabled. Style,
  structure and ARIA stay in this file — the bridge owns no paint.
-->
<script module lang="ts">
  /** One row of the Select listbox. */
  export interface SelectOption {
    /** the committed value ($bindable value on the field) */
    value: string;
    /** the row's (and the trigger's) display text */
    label: string;
    /** optional muted second line rendered inside the panel only */
    description?: string;
    /** unselectable row — skipped by keyboard navigation and click */
    disabled?: boolean;
  }
</script>

<script lang="ts">
  // side-effect import: registers the faceless <jx-form-field> element
  // (client-only, idempotent) that carries this field's form association
  import '$lib/form-field';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    /** the full option list (order = panel order) */
    options: SelectOption[];
    /** committed value; bind:value — undefined shows the placeholder */
    value?: string;
    /** trigger text when nothing is selected */
    placeholder?: string;
    /** field label; renders label[for] above the control */
    label?: string;
    /** form field name — the bridge submits the committed VALUE under it */
    name?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** NOT implemented in v1 — reserved extension direction (multi-
        select listbox); accepted for API stability, ignored with a
        console warning */
    multiple?: boolean;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    options,
    value = $bindable(),
    placeholder = 'Select...',
    label,
    name,
    id = autoId,
    error,
    disabled = false,
    multiple = false,
    class: className = '',
    ...rest
  }: Props = $props();

  // form lifecycle: what jx-reset restores, and the form-disable mirror
  const initialValue = value;
  let formDisabled = $state(false);
  const isDisabled = $derived(disabled || formDisabled);

  const panelId = $derived(`${id}-panel`);
  const listboxId = $derived(`${id}-listbox`);
  // Anchor names are CSS custom-ident-ish: sanitize the id into a stable
  // dashed token so any consumer id yields a valid --jx-sel-* name.
  const anchorName = $derived(`--jx-sel-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const optionId = (index: number): string => `${id}-opt-${index}`;

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  const selected = $derived(options.find((option) => option.value === value));

  let open = $state(false);
  /** roving highlight index (-1 = none) — the keyboard/aria cursor */
  let active = $state(-1);
  let triggerEl = $state<HTMLButtonElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);
  let listEl = $state<HTMLUListElement | null>(null);

  // v1: `multiple` is a reserved extension direction — say so loudly
  // instead of silently ignoring a prop the caller believes in.
  $effect(() => {
    if (multiple) {
      console.warn(
        'jixoai Select: the multiple prop is not implemented in v1 (reserved extension direction) and is ignored.'
      );
    }
  });

  function firstEnabled(): number {
    return options.findIndex((option) => !option.disabled);
  }
  function lastEnabled(): number {
    for (let i = options.length - 1; i >= 0; i--) if (!options[i].disabled) return i;
    return -1;
  }

  /** step the highlight by delta, skipping disabled rows, clamped at the
      ends (APG listbox: no wrap — Home/End cover the jumps) */
  function moveActive(delta: 1 | -1): void {
    let i = active;
    for (let steps = 0; steps < options.length; steps++) {
      i += delta;
      if (i < 0 || i >= options.length) return;
      if (!options[i].disabled) {
        active = i;
        return;
      }
    }
  }

  function choose(option: SelectOption): void {
    if (option.disabled) return; // a disabled row neither selects nor closes
    value = option.value;
    panelEl?.hidePopover(); // the toggle handler restitutes focus
  }

  // THE orchestration seam: one native event covers every open/close path
  // (popovertarget click, light dismiss, Escape, our own hide/show calls).
  function onPanelToggle(event: ToggleEvent): void {
    open = event.newState === 'open';
    if (open) {
      // continue from context, like the native select: highlight the
      // selected row, else the first enabled one
      const selectedIndex = options.findIndex((option) => option.value === value);
      active = selectedIndex >= 0 ? selectedIndex : firstEnabled();
      // APG listbox-in-popover: focus moves into the list; the panel is
      // already in the top layer when toggle fires
      listEl?.focus();
    } else {
      // focus restitution on EVERY close path — light dismiss and Escape
      // are free from popover="auto"; this line covers the focus part
      triggerEl?.focus();
    }
  }

  function onListKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      const first = firstEnabled();
      if (first >= 0) active = first;
    } else if (event.key === 'End') {
      event.preventDefault();
      const last = lastEnabled();
      if (last >= 0) active = last;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = options[active];
      if (option && !option.disabled) choose(option);
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

  // keep the highlight row visible when it moves off-panel
  $effect(() => {
    if (open && active >= 0) {
      document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
    }
  });
</script>

<div class="jx-field">
  <!-- faceless form bridge (form-field.ts law): the committed value rides
       ElementInternals into FormData; jx-reset / jx-disabled bubble the
       form lifecycle back into this component. Owns no box, no content.
       disabled passes `|| undefined`: Svelte has no boolean-attribute
       semantics for custom elements and would render disabled="false"
       as a PRESENT attribute (presence = true in HTML). -->
  <jx-form-field
    aria-hidden="true"
    {name}
    value={value ?? ''}
    disabled={isDisabled || undefined}
    onjx-reset={() => (value = initialValue)}
    onjx-disabled={(event: CustomEvent<boolean>) => (formDisabled = event.detail)}
  ></jx-form-field>
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <span class="jx-sel-wrap" style="anchor-name: {anchorName}">
    <!-- aria-invalid rides the trigger although the checker's per-role
         list doesn't include it: it IS a WAI-ARIA global state, and the
         family law wires invalid state on the control itself -->
    <!-- svelte-ignore a11y_role_supports_aria_props_implicit -->
    <button
      bind:this={triggerEl}
      type="button"
      id={id}
      class="jx-sel-trigger {className}"
      popovertarget={panelId}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      disabled={isDisabled}
      onkeydown={onTriggerKeydown}
      {...rest}
    >
      <span class="jx-sel-value" class:jx-sel-placeholder={!selected}>
        {selected?.label ?? placeholder}
      </span>
      <svg
        class="jx-sel-chevron"
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
  </span>

  <div
    bind:this={panelEl}
    id={panelId}
    popover="auto"
    class="jx-sel-panel"
    style="position-anchor: {anchorName}; inset-area: bottom span-all; position-area: bottom span-all;"
    ontoggle={onPanelToggle}
  >
    <ul
      bind:this={listEl}
      id={listboxId}
      class="jx-sel-list"
      role="listbox"
      tabindex="-1"
      aria-label={label ?? placeholder}
      aria-activedescendant={active >= 0 ? optionId(active) : undefined}
      onkeydown={onListKeydown}
    >
      {#each options as option, index (option.value)}
        <!-- option rows are click-only BY PATTERN: the keyboard path rides
             the focusable list (jx-sel-list keydown + aria-activedescendant
             roving highlight), never the row itself -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          id={optionId(index)}
          role="option"
          aria-selected={option.value === value ? 'true' : 'false'}
          aria-disabled={option.disabled ? 'true' : undefined}
          class="jx-sel-option"
          class:jx-sel-selected={option.value === value}
          class:jx-sel-active={index === active}
          class:jx-sel-disabled={option.disabled}
          onclick={() => choose(option)}
        >
          <span class="jx-sel-option-label">{option.label}</span>
          {#if option.description}
            <span class="jx-sel-option-desc">{option.description}</span>
          {/if}
        </li>
      {/each}
    </ul>
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
  /* the faceless bridge owns no box — pre-hydration included, so the
     prerendered HTML never flashes an extra flex gap before upgrade */
  .jx-field > :global(jx-form-field) {
    display: contents;
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

  /* ---- trigger: the closed native select's paint, on a real <button> -- */
  .jx-sel-wrap {
    position: relative;
    display: block;
    width: 100%;
    max-width: 100%; /* InputGroup hardening: never push past the host row */
  }
  .jx-sel-trigger {
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
  .jx-sel-trigger:hover:not(:focus-visible) {
    box-shadow: var(--shadow-2xs);
  }
  /* the site focus law: inset 1px outline on the ring token */
  .jx-sel-trigger:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
    box-shadow: none;
  }
  .jx-sel-trigger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .jx-sel-trigger[aria-invalid='true'] {
    border-style: dashed;
  }
  .jx-sel-value {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: start;
  }
  .jx-sel-placeholder {
    color: var(--muted-foreground);
  }
  .jx-sel-chevron {
    flex: none;
    width: 0.75rem;
    height: 0.75rem;
    pointer-events: none;
    color: var(--muted-foreground);
    transition: transform 150ms ease-out;
  }
  .jx-sel-trigger[aria-expanded='true'] .jx-sel-chevron {
    transform: rotate(180deg);
  }

  /* ---- panel: terminal bezel dropdown (language-switcher menu law) -- */
  .jx-sel-panel {
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
  @supports not (anchor-name: --jx-sel-fallback) {
    .jx-sel-panel {
      position-anchor: auto !important;
      inset-area: none !important;
      inset: 0;
      margin: auto;
      width: min(92vw, 22rem);
    }
  }
  /* Popovers get a ::backdrop too; light dismiss must never dim the page. */
  .jx-sel-panel::backdrop {
    background: transparent;
  }

  .jx-sel-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* the list itself is the programmatic focus stop (aria-activedescendant
     roving pattern) — the highlighted row IS the focus indication */
  .jx-sel-list:focus-visible {
    outline: none;
  }
  .jx-sel-option {
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
  .jx-sel-option:hover,
  .jx-sel-option.jx-sel-active {
    background: var(--terminal-hover);
    color: var(--terminal-foreground);
  }
  .jx-sel-option.jx-sel-selected {
    background: var(--terminal-hover);
    color: var(--terminal-foreground);
    border-inline-start-color: var(--primary);
  }
  .jx-sel-option.jx-sel-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  .jx-sel-option-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jx-sel-option-desc {
    font-size: 11px;
    line-height: 1.4;
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
    .jx-sel-trigger,
    .jx-sel-chevron,
    .jx-sel-option {
      transition: none;
    }
  }
</style>
