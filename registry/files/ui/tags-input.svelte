<!--
  jixoai tags-input (registry/files/ui/tags-input.svelte).
  Original request (2026-08-20): “开发 Combobox 和 TagsInput 两个高级 Form
  组件” — input × multiselect: the input.svelte shell becomes a flex-wrap
  host for tag chips plus one borderless input. Orthogonal intents:

  1. tag set — Tag[] is the $bindable contract; chips render bg-muted +
     1px border + 12px text + a press-physics × (removable defaults true);
     the container carries role="listbox" aria-orientation="horizontal"
     with each chip role="option" aria-selected="true".
  2. commit rules — Enter / comma / Tab (via blur) turn the typed text
     into a tag; a typed comma ALSO splits (paste "a,b,c" works); typed
     text resolving to a suggestion (label or value) commits the
     suggestion's value; Backspace on an empty input deletes the last
     removable tag; maxTags hides the input at the cap ("N/N tags").
  3. duplicates — allowDuplicates=false (default) flashes the EXISTING
     chip instead of adding: 200ms primary border + a 150ms shake,
     reduced-motion keeps the border flash only.
  4. suggestion popover — combobox.svelte law on a smaller scale: typing
     filters `suggestions` (label-or-value contains, case-insensitive,
     already-present ones hidden when duplicates are off) into a
     popover="auto" terminal-bezel listbox; focus stays in the input,
     ↑/↓ ride aria-activedescendant + aria-owns, Enter commits the
     highlighted suggestion, mousedown inside the panel is prevented so
     click-to-choose never blurs the input into a premature blur-commit.

  Family law throughout: label[for] + error wiring (aria-invalid +
  aria-describedby + dashed shell), inset 1px focus outline on the shell,
  hover lift, logical properties only (RTL flips itself), reduced-motion
  kills transitions and the shake.

  Disabled law (2026-08-20): the prop is intercepted and lands on the
  typing input AND every chip × — a disabled field must not stay edible
  through its chips — with addTag/removeAt entry guards behind them.
  The chips stay readable under the shell's 0.5 opacity.

  Chip end-padding fix (2026-08-23, “when there is NO suffix-icon,
  rendered tags lose their padding-inline-end”): the × button doubles as
  the chip's end inset — a removable:false chip rendered none, slamming
  the label onto the end border. The end padding is now authored on the
  chip itself for the no-× case (:not(:has(.jx-tags-remove))); chips
  with the × keep their exact previous metrics.

  NativeHTML base audit (2026-08-20, updated by the form-field bridge the
  same day): the typing input IS a native <input type="text">, but it
  must never submit — its name is intercepted away. Chips reach FormData
  through the FACELESS jx-form-field bridge
  (registry/files/lib/form-field.ts): pass name= and the tag VALUES ride
  ElementInternals as ONE JSON array string (["a","b"] — lossless when a
  tag itself contains a comma; an empty set contributes nothing). form
  reset bubbles back as jx-reset, form/fieldset disable as jx-disabled.
  The bridge owns no box, no content, no paint.
  Height law: shell padding-block 0.375rem + 1.625rem
  chip/input min-heights + 1px borders = the 40px (2.5rem) row every
  text-like family control renders at — the chips must shrink with the
  row, not push it past the family height.
-->
<script module lang="ts">
  /** One chip of the tags input; suggestions reuse the same shape. */
  export interface Tag {
    /** the committed tag identity — duplicates compare on this */
    value: string;
    /** display text (defaults to the value) */
    label?: string;
    /** hide the × button; default true */
    removable?: boolean;
  }
</script>

<script lang="ts">
  // side-effect import: registers the faceless <jx-form-field> element
  // (client-only, idempotent) that carries this field's form association
  import '$lib/form-field';
  import { tick } from 'svelte';
  import { icons } from '$lib/icons';
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLInputAttributes, 'value' | 'type'> {
    /** the committed tag set; bind:tags */
    tags?: Tag[];
    /** optional suggestion list filtered into the popover while typing */
    suggestions?: Tag[];
    /** form field name — the bridge submits the tag VALUES as one JSON
        array string; the typing input itself carries no name */
    name?: string;
    /** input placeholder while empty */
    placeholder?: string;
    /** field label; renders label[for] above the control */
    label?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** cap on the tag count; at the cap the input hides ("N/N tags") */
    maxTags?: number;
    /** allow the same value twice; default false flashes the existing chip */
    allowDuplicates?: boolean;
    /** disable the input AND every chip ×; entry guards back the buttons */
    disabled?: boolean;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency; the bezel fill
        follows the variant through the jx-surface fill props) */
    variant?: 'solid' | 'acrylic' | 'auto';
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    tags = $bindable([]),
    suggestions = [],
    name,
    placeholder = 'Add tag...',
    label,
    error,
    id = autoId,
    maxTags,
    allowDuplicates = false,
    disabled = false,
    variant = 'auto',
    class: className = '',
    ...rest
  }: Props = $props();

  // form lifecycle: what jx-reset restores, and the form-disable mirror
  const initialTags = tags;
  let formDisabled = $state(false);
  const isDisabled = $derived(disabled || formDisabled);

  /** the form contribution: ONE JSON array of tag values (lossless when a
      value contains a comma); an empty set contributes nothing */
  const formValue = $derived(
    tags.length > 0 ? JSON.stringify(tags.map((tag) => tag.value)) : ''
  );

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  const panelId = $derived(`${id}-panel`);
  const listboxId = $derived(`${id}-listbox`);
  // Anchor names are CSS custom-ident-ish: sanitize the id into a stable
  // dashed token so any consumer id yields a valid --jx-tags-* name.
  const anchorName = $derived(`--jx-tags-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const suggestionId = (index: number): string => `${id}-sug-${index}`;

  /** the live input text — typing state, committed only through addTag */
  let query = $state('');
  let open = $state(false);
  /** roving highlight index into `filtered` (-1 = none) */
  let active = $state(-1);
  let flashValue = $state<string | null>(null);
  let flashTimer: ReturnType<typeof setTimeout> | undefined;
  let inputEl = $state<HTMLInputElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  const full = $derived(maxTags != null && tags.length >= maxTags);

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (q === '') return [];
    return suggestions.filter((suggestion) => {
      if (!allowDuplicates && tags.some((tag) => tag.value === suggestion.value)) return false;
      const haystack = (suggestion.label ?? suggestion.value).toLowerCase();
      return haystack.includes(q) || suggestion.value.toLowerCase().includes(q);
    });
  });

  const activeId = $derived(open && active >= 0 ? suggestionId(active) : undefined);

  // ---- popover plumbing ----------------------------------------------------
  // The native toggle event is the ONE open/close seam; it only syncs the
  // `open` flag — focus never enters the panel, so there is nothing to
  // restitute. Panel visibility follows the filter: matches → show, none →
  // hide (no empty state; the chips themselves are the current state).
  function onPanelToggle(event: ToggleEvent): void {
    open = event.newState === 'open';
  }

  function syncPanel(): void {
    if (filtered.length > 0) {
      if (panelEl?.isConnected && !panelEl.matches(':popover-open')) {
        try {
          panelEl.showPopover();
        } catch {
          // no transient activation — the next keystroke opens
        }
      }
    } else if (panelEl?.matches(':popover-open')) {
      panelEl.hidePopover();
    }
  }
  function hidePanel(): void {
    if (panelEl?.matches(':popover-open')) panelEl.hidePopover();
  }

  /** step the highlight by delta, clamped at the ends (APG: no wrap) */
  function moveActive(delta: 1 | -1): void {
    const next = active + delta;
    if (next >= 0 && next < filtered.length) active = next;
  }

  // ---- commit paths ----------------------------------------------------------
  /** typed text resolving to a suggestion commits the suggestion's value */
  function resolveSuggestion(text: string): Tag | undefined {
    const lower = text.trim().toLowerCase();
    if (lower === '') return undefined;
    return suggestions.find(
      (suggestion) =>
        suggestion.value.toLowerCase() === lower || (suggestion.label ?? '').toLowerCase() === lower
    );
  }

  function addTag(tag: Tag): void {
    if (isDisabled) return; // a disabled field neither adds nor flashes
    if (maxTags != null && tags.length >= maxTags) return;
    if (!allowDuplicates && tags.some((existing) => existing.value === tag.value)) {
      flashExisting(tag.value);
    } else {
      tags = [...tags, tag];
    }
    resetInput();
  }

  function commitRaw(text: string): void {
    const trimmed = text.trim();
    if (trimmed === '') return;
    addTag(resolveSuggestion(trimmed) ?? { value: trimmed });
  }

  /** duplicates flash the EXISTING chip: 200ms primary border + shake */
  function flashExisting(value: string): void {
    flashValue = value;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => (flashValue = null), 200);
  }

  function resetInput(): void {
    query = '';
    active = -1;
    if (inputEl) inputEl.value = '';
    hidePanel();
  }

  async function removeAt(index: number): Promise<void> {
    if (isDisabled) return; // chips are read-only in a disabled field
    tags = tags.filter((_, i) => i !== index);
    // keep the flow in the input after a × click (the input may just have
    // remounted when the removal dropped the field below maxTags)
    await tick();
    inputEl?.focus();
  }

  // ---- input events ----------------------------------------------------------
  function onInput(event: Event): void {
    const el = event.currentTarget as HTMLInputElement;
    // a comma (typed OR pasted) splits into one commit per part
    if (el.value.includes(',')) {
      for (const part of el.value.split(',')) {
        const trimmed = part.trim();
        if (trimmed !== '') commitRaw(trimmed);
      }
      query = '';
      el.value = '';
      active = -1;
    } else {
      query = el.value;
      active = filtered.length > 0 ? 0 : -1; // filtering auto-highlights the first match
    }
    syncPanel();
    // forward a caller-supplied input handler from the rest props
    (rest as { oninput?: (event: Event) => void }).oninput?.(event);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!open) return; // arrows in a closed field keep their caret duties
      event.preventDefault();
      moveActive(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter') {
      event.preventDefault(); // never submit the surrounding form
      if (open && active >= 0 && filtered[active]) addTag(filtered[active]);
      else commitRaw(query);
    } else if (event.key === 'Backspace' && query === '') {
      // empty input → Backspace deletes the last removable tag
      const last = tags[tags.length - 1];
      if (last && last.removable !== false) {
        event.preventDefault();
        tags = tags.slice(0, -1);
      }
    } else if (event.key === 'Escape') {
      // no preventDefault: the popover's native close request runs
      active = -1;
    }
    // Tab needs no handler: focus moves, focusout commits + closes
  }

  function onFocusOut(): void {
    hidePanel();
    commitRaw(query); // Tab/click-away commits the pending text as a tag
  }

  // release the flash timer on teardown
  $effect(() => {
    return () => {
      if (flashTimer) clearTimeout(flashTimer);
    };
  });

  // keep the highlight suggestion visible when it moves off-panel
  $effect(() => {
    if (open && active >= 0) {
      document.getElementById(suggestionId(active))?.scrollIntoView({ block: 'nearest' });
    }
  });
</script>

<div class="jx-field">
  <!-- faceless form bridge (form-field.ts law): the tag VALUES ride
       ElementInternals into FormData as one JSON array string; the
       typing input carries NO name. jx-reset / jx-disabled bubble the
       form lifecycle back into this component. Owns no box, no content.
       disabled passes `|| undefined`: Svelte has no boolean-attribute
       semantics for custom elements and would render disabled="false"
       as a PRESENT attribute (presence = true in HTML). -->
  <jx-form-field
    aria-hidden="true"
    {name}
    value={formValue}
    disabled={isDisabled || undefined}
    onjx-reset={() => (tags = [...initialTags])}
    onjx-disabled={(event: CustomEvent<boolean>) => (formDisabled = event.detail)}
  ></jx-form-field>
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <span class="jx-tags-wrap" style="anchor-name: {anchorName}">
    <div
      class="jx-tags-shell {className}"
      class:jx-tags-invalid={invalid}
      role="listbox"
      aria-orientation="horizontal"
      aria-label={label ?? 'tags'}
    >
      {#each tags as tag, index (`${tag.value}#${index}`)}
        <span
          role="option"
          aria-selected="true"
          class="jx-tags-tag"
          class:jx-tags-flash={tag.value === flashValue}
        >
          <span class="jx-tags-tag-label">{tag.label ?? tag.value}</span>
          {#if tag.removable !== false}
            <button
              type="button"
              class="jx-tags-remove"
              aria-label={`remove ${tag.label ?? tag.value}`}
              disabled={isDisabled}
              onclick={() => removeAt(index)}
            >
              <!-- the shared inline icon set — 10px inside the chip row -->
              {@html icons.x}
            </button>
          {/if}
        </span>
      {/each}
      {#if full}
        <span class="jx-tags-full">{tags.length}/{maxTags} tags</span>
      {:else}
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
          class="jx-tags-input"
          {placeholder}
          disabled={isDisabled}
          oninput={onInput}
          onkeydown={onKeydown}
          onfocusout={onFocusOut}
        />
      {/if}
    </div>
  </span>

  <div
    bind:this={panelEl}
    id={panelId}
    popover="auto"
    class="jx-tags-panel jx-surface"
    data-variant={variant}
    style="position-anchor: {anchorName}; inset-area: bottom span-all; position-area: bottom span-all;"
    ontoggle={onPanelToggle}
  >
    <!-- surface body (bezel paint + ::after shadow) + scroll ring
         (floating-surface law arch r3) -->
    <div class="jx-tags-panel-body jx-surface-body">
    <div class="jx-tags-scroll">
    {#if filtered.length > 0}
      <!-- mousedown is prevented so click-to-choose never blurs the input
           into a premature blur-commit -->
      <ul
        id={listboxId}
        class="jx-tags-list"
        role="listbox"
        aria-label={label ? `${label} suggestions` : 'suggestions'}
        onmousedown={(event) => event.preventDefault()}
      >
        {#each filtered as suggestion, index (suggestion.value)}
          <!-- suggestion rows are click-only BY PATTERN (combobox law): the
               keyboard path rides the input + aria-activedescendant roving
               highlight, never the row itself -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <li
            id={suggestionId(index)}
            role="option"
            aria-selected={tags.some((tag) => tag.value === suggestion.value) ? 'true' : 'false'}
            class="jx-tags-suggestion"
            class:jx-tags-suggestion-active={index === active}
            onclick={() => addTag(suggestion)}
          >
            {suggestion.label ?? suggestion.value}
          </li>
        {/each}
      </ul>
    {/if}
    </div>
    </div>
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

  /* ---- shell: the input.svelte box law as a flex-wrap chip host -------
     height law: padding-block 0.375rem + 1.625rem content (chip/input
     min-heights) + 1px borders = 2.5rem — the 40px row every text-like
     family control renders at; taller chips would push the shell past
     the family height, so they shrink with the row instead. */
  .jx-tags-wrap {
    position: relative;
    display: block;
    width: 100%;
    max-width: 100%; /* InputGroup hardening: never push past the host row */
  }
  .jx-tags-shell {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem; /* gap-1 between chips and wrap lines */
    width: 100%;
    max-width: 100%;
    min-height: 2.5rem;
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color-scheme: light;
    transition: box-shadow 150ms ease-out;
  }
  :global(.dark) .jx-tags-shell {
    color-scheme: dark;
  }
  .jx-tags-shell:not(:has(input:disabled)):hover:not(:has(:focus-visible)) {
    box-shadow: var(--shadow-2xs);
  }
  /* the site focus law (input.svelte): the shell carries the inset 1px
     outline on the ring token for the input inside */
  .jx-tags-shell:has(:focus-visible) {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
    box-shadow: none;
  }
  .jx-tags-shell:has(input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
  .jx-tags-shell.jx-tags-invalid {
    border-style: dashed;
  }

  /* ---- chips: bg-muted, 1px border, 12px text, press-physics × --------
     1.625rem min-height: fits the 40px shell (0.375rem padding ×2 + 2px
     borders) exactly — the × stretches to the chip, not past the row */
  .jx-tags-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    min-height: 1.625rem;
    padding-inline-start: 0.5rem;
    border: 1px solid var(--border);
    background: var(--muted);
    color: var(--foreground);
    font-size: 12px;
    line-height: 1.2;
    transition: border-color 100ms ease-out;
  }
  .jx-tags-tag-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* the × is the chip's end inset when present; without it (removable:
     false) the chip authors its own, mirroring the start padding */
  .jx-tags-tag:not(:has(.jx-tags-remove)) {
    padding-inline-end: 0.5rem;
  }
  .jx-tags-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: stretch;
    width: 1.375rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--muted-foreground);
    font-family: inherit;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    transition: color 100ms ease-out, transform 100ms ease-out;
  }
  .jx-tags-remove:hover {
    color: var(--foreground);
  }
  /* press physics: the × presses in one pixel */
  .jx-tags-remove:active {
    transform: translateY(1px);
  }
  .jx-tags-remove svg {
    width: 10px;
    height: 10px;
  }
  .jx-tags-remove:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-tags-remove:disabled {
    cursor: not-allowed;
  }
  /* duplicate feedback: primary border for 200ms + a 150ms shake */
  .jx-tags-tag.jx-tags-flash {
    border-color: var(--primary);
    animation: jx-tags-shake 150ms ease-in-out;
  }
  @keyframes jx-tags-shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-2px);
    }
    75% {
      transform: translateX(2px);
    }
  }

  /* ---- the input: borderless, flexes, wraps when crowded -------------- */
  .jx-tags-input {
    flex: 1 1 0%;
    min-width: 120px;
    min-height: 1.625rem; /* 40px shell law — see .jx-tags-shell */
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.45;
  }
  .jx-tags-input::placeholder {
    color: var(--muted-foreground);
    opacity: 1;
  }
  .jx-tags-full {
    color: var(--muted-foreground);
    font-size: 12px;
    line-height: 1.625rem;
  }

  /* ---- suggestion panel: terminal bezel (combobox panel law) ---------- */
  /* bezel surface on the jx-surface law (arch r3): the panel is the
     PLATFORM element (no paint); the body ring carries the bezel fill
     and the ::after shadow layer; the scroll ring sits inside. */
  .jx-tags-panel {
    --jx-surface-acrylic-fill: color-mix(in oklab, var(--terminal) 72%, transparent);
    --jx-surface-solid-fill: var(--terminal);
    position: fixed;
    margin: 0;
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    width: anchor-size(width); /* exactly the shell */
    max-width: min(92vw, 30rem);
    color: var(--terminal-foreground);
  }
  .jx-tags-scroll {
    max-height: 60vh;
    overflow: auto;
    overscroll-behavior: contain;
    /* scrollbar law: both-edges gutters; padding-inline hands the gutter
       back so the visual inset stays 4px */
    scrollbar-gutter: stable both-edges;
    padding-block: 4px;
    padding-inline: max(4px - var(--jx-scrollbar-thin, 0px), 0px);
  }
  /* Engines without CSS Anchor Positioning: authored viewport-center —
     the popover.svelte fallback visual, never worse. */
  @supports not (anchor-name: --jx-tags-fallback) {
    .jx-tags-panel {
      position-anchor: auto !important;
      inset-area: none !important;
      inset: 0;
      margin: auto;
      width: min(92vw, 22rem);
    }
  }
  /* Popovers get a ::backdrop too; light dismiss must never dim the page. */
  .jx-tags-panel::backdrop {
    background: transparent;
  }

  .jx-tags-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .jx-tags-suggestion {
    padding: 6px 10px;
    font-size: 13px;
    line-height: 1.45;
    color: color-mix(in oklab, var(--terminal-foreground) 72%, transparent);
    /* the already-added edge line is reserved as transparent so it never
       shifts — and border-inline-start flips under rtl */
    border-inline-start: 2px solid transparent;
    cursor: pointer;
    transition: background-color 100ms ease-out, color 100ms ease-out;
  }
  .jx-tags-suggestion:hover,
  .jx-tags-suggestion.jx-tags-suggestion-active {
    background: var(--terminal-hover);
    color: var(--terminal-foreground);
  }
  .jx-tags-suggestion[aria-selected='true'] {
    background: var(--terminal-hover);
    color: var(--terminal-foreground);
    border-inline-start-color: var(--primary);
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
    .jx-tags-shell,
    .jx-tags-tag,
    .jx-tags-remove,
    .jx-tags-suggestion {
      transition: none;
    }
    .jx-tags-tag.jx-tags-flash {
      animation: none; /* the border flash survives; the shake does not */
    }
  }
</style>
