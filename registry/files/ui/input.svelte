<!--
  jixoai input (registry/files/ui/input.svelte).
  NativeHTML base field: the native <input> IS the contract — every type
  passes through untouched, no per-type wrappers. Rendering lanes by type:

    text-like (text/password/email/number/search/url/tel/date/time/...)
      1px var(--border) shell, var(--background) fill, radius 0; hover
      lifts one pixel (shadow-2xs), focus-visible takes the site's inset
      1px outline law (outline-offset: -1px on the ring token).
    checkbox / radio / toggle
      SPLIT OUT — the pure-CSS redraws live in their own components:
      checkbox.svelte, radio.svelte and toggle.svelte. Passing
      type="checkbox"/"radio" here renders the text shell, so route those
      types to the dedicated components.
    range
      native slider + accent-color, label above, full width.
    color
      native picker, height aligned with the text shell.
    file
      the native input stays in the tab order but visually hidden inside
      a wrapping label; a press-button-shaped trigger + filename echo
      stand in for it (focus-visible lights the trigger; Enter/Space on
      the hidden input opens the picker natively).
    hidden
      bare passthrough, no chrome, no slots.

  Semantics added on top: label[for] (auto id via $props.id() when not
  supplied), error string → aria-invalid + aria-describedby + "! message"
  line + dashed control border. Everything else (placeholder, disabled,
  name, required, checked, accept, min/max/step…) flows through
  restProps onto the native element.

  2026-08-20 · InputGroup slot system (original request: "实现 InputGroup
  槽位体系，升级 Input 和 TextArea 组件"). Four snippet slots around the
  lanes (the text-like shell takes all four; file/range/color take only
  the outer pair):

    outerBlockStart   outside, above — replaces the label row when given
    innerInlineStart  inside the shell, left (prefix icon / unit)
    innerInlineEnd    inside the shell, right (suffix / unit / action)
    outerBlockEnd     outside, below — the error line still renders above

  The shell — not the <input> — owns border/fill/hover/focus, so slots
  never repaint the box law. Inner slots land muted at 0.75rem; the
  wrapper is scoped, so override it with an important utility
  (text-foreground!) or an inline style. `clearable` adds an × button in
  the inline-end area: it clears the DOM value, syncs the bound value and
  re-emits `input` + a bubbling `clear` event. `value` is $bindable:
  bound ⇒ controlled; absent ⇒ the field stays purely uncontrolled
  (Svelte skips undefined writes, so FormData and form.reset() keep
  native behavior).
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  interface Props extends HTMLInputAttributes {
    /** any native input type (default 'text') */
    type?: string;
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
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    type = 'text',
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
    ...rest
  }: Props = $props();

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  const isFile = $derived(type === 'file');
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

  // file lane: filename echo (multiple files join with ", ")
  let fileLabel = $state('no file selected');

  function onFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    fileLabel =
      input.files && input.files.length > 0
        ? Array.from(input.files, (file) => file.name).join(', ')
        : 'no file selected';
    // forward a caller-supplied change handler from the rest props
    (rest as { onchange?: (event: Event) => void }).onchange?.(event);
  }
</script>

{#if isHidden}
  <!-- hidden: bare native passthrough (value rides as a plain attribute) -->
  <input {id} {type} {value} {...rest} />
{:else if isFile}
  <div class="jx-field">
    {#if outerBlockStart}
      <div class="jx-outer jx-outer-start">{@render outerBlockStart()}</div>
    {:else if label}<label class="jx-label" for={id}>{label}</label>{/if}
    <label class="jx-file" class:jx-invalid={invalid}>
      <input
        {id}
        {type}
        class="jx-file-native"
        onchange={onFileChange}
        aria-invalid={invalidAttr}
        aria-describedby={describedBy}
        {...rest}
      />
      <span class="jx-file-btn" aria-hidden="true">choose file</span>
      <span class="jx-file-name">{fileLabel}</span>
    </label>
    {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
    {#if outerBlockEnd}<div class="jx-outer jx-outer-end">{@render outerBlockEnd()}</div>{/if}
  </div>
{:else}
  <div class="jx-field">
    {#if outerBlockStart}
      <div class="jx-outer jx-outer-start">{@render outerBlockStart()}</div>
    {:else if label}<label class="jx-label" for={id}>{label}</label>{/if}
    {#if isRange}
      <input
        {id}
        {type}
        {...rest}
        value={controlled ? value : undefined}
        oninput={syncValue}
        class="jx-native jx-range {className}"
        aria-invalid={invalidAttr}
        aria-describedby={describedBy}
      />
    {:else if isColor}
      <input
        {id}
        {type}
        {...rest}
        value={controlled ? value : undefined}
        oninput={syncValue}
        class="jx-color {className}"
        aria-invalid={invalidAttr}
        aria-describedby={describedBy}
      />
    {:else}
      <!-- the shell owns the box law; the input inside is chromeless -->
      <div class="jx-shell {className}" class:jx-slotted={slotted} class:jx-invalid={invalid} class:jx-clearable={clearable}>
        {#if innerInlineStart}
          <span class="jx-slot">{@render innerInlineStart()}</span>
        {/if}
        <input
          bind:this={inputEl}
          {id}
          {type}
          {...rest}
          value={controlled ? value : undefined}
          oninput={syncValue}
          class="jx-input"
          aria-invalid={invalidAttr}
          aria-describedby={describedBy}
        />
        {#if innerInlineEnd}
          <span class="jx-slot">{@render innerInlineEnd()}</span>
        {/if}
        {#if showClear}
          <button type="button" class="jx-clear" aria-label="clear value" onclick={clearValue}>
            &times;
          </button>
        {/if}
      </div>
    {/if}
    {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
    {#if outerBlockEnd}<div class="jx-outer jx-outer-end">{@render outerBlockEnd()}</div>{/if}
  </div>
{/if}

<style>
  .jx-field {
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

  /* ---- outer snippet slots ------------------------------------------
     net 0.25rem (mb-1 / mt-1 law) away from the shell: they cancel half
     of the 0.5rem field gap so hint text hugs the control closer than
     a label does. */
  .jx-outer {
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
  .jx-outer-start {
    margin-bottom: -0.25rem;
  }
  .jx-outer-end {
    margin-top: -0.25rem;
  }

  /* ---- text-like shell ----------------------------------------------
     the shell owns border/fill/hover/focus; the <input> inside is
     chromeless and flexes. Without inner slots the pixels are identical
     to the old single-<input> shell. */
  .jx-shell {
    display: flex;
    align-items: center;
    gap: 0.5rem; /* gap-2 between inner slots and the input */
    width: 100%;
    min-height: 2.5rem;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color-scheme: light;
    transition: box-shadow 150ms ease-out;
  }
  :global(.dark) .jx-shell {
    color-scheme: dark;
  }
  .jx-shell:not(:has(input:disabled)):hover:not(:has(:focus-visible)) {
    box-shadow: var(--shadow-2xs);
  }
  /* the site focus law (terminal-header / language-switcher): an inset
     1px outline on the ring token — the shell carries it for the input
     AND for slot controls (clear button) alike */
  .jx-shell:has(:focus-visible) {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
    box-shadow: none;
  }
  .jx-shell.jx-invalid {
    border-style: dashed;
  }
  .jx-shell:has(input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
  /* inner slots present → the shell carries the horizontal padding and
     the input runs edge-to-edge between the gap-2 seams */
  .jx-shell.jx-slotted {
    padding-inline: 0.75rem;
  }
  .jx-input {
    flex: 1 1 0%;
    min-width: 0;
    min-height: calc(2.5rem - 2px);
    padding: 0.5rem 0.75rem;
    border: none;
    outline: none;
    background: transparent;
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.45;
  }
  .jx-shell.jx-slotted .jx-input {
    padding-inline: 0;
  }
  .jx-input::placeholder {
    color: var(--muted-foreground);
    opacity: 1;
  }
  /* the native search decoration bows out when our own × is on duty */
  .jx-shell.jx-clearable .jx-input::-webkit-search-cancel-button {
    display: none;
  }

  /* ---- inner snippet slots + clear button --------------------------- */
  .jx-slot {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--muted-foreground);
    font-size: 0.75rem;
    line-height: 1;
  }
  .jx-clear {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.125rem;
    height: 1.125rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--muted-foreground);
    font-family: inherit;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
  }
  .jx-clear:hover {
    color: var(--foreground);
  }
  .jx-clear:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  /* ---- accent-color family (range) --------------------------------- */
  .jx-native {
    accent-color: var(--primary);
    margin: 0;
    cursor: pointer;
  }
  /* the native control keeps its own rendering, so its focus outline
     sits OUTSIDE the slider — an inset ring would crowd the thumb */
  .jx-native:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: 1px;
  }
  .jx-native:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .jx-range {
    width: 100%;
    height: 1rem;
  }

  /* ---- color: native picker, height aligned with the text shell --- */
  .jx-color {
    width: 100%;
    height: 2.5rem;
    padding: 3px;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color-scheme: light;
    cursor: pointer;
  }
  :global(.dark) .jx-color {
    color-scheme: dark;
  }
  .jx-color:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-color:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .jx-color[aria-invalid='true'] {
    border-style: dashed;
  }

  /* ---- file: visually-hidden native inside a wrapping label ------- */
  .jx-file {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    width: fit-content;
    max-width: 100%;
    cursor: pointer;
  }
  .jx-file:has(input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .jx-file-native {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }
  /* press-button physics: hover lifts toward the viewer, active presses
     back into the page — the shadow is the affordance */
  .jx-file-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 0.9rem;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color: var(--foreground);
    font-size: 0.8125rem;
    font-weight: 500;
    box-shadow: var(--shadow-xs);
    transition:
      transform 150ms ease-out,
      box-shadow 150ms ease-out,
      background-color 150ms ease-out;
  }
  .jx-file:hover .jx-file-btn {
    transform: translate(-2px, -2px);
    background: var(--muted);
    box-shadow: var(--shadow-sm);
  }
  .jx-file:active .jx-file-btn {
    transform: translate(1px, 1px);
    box-shadow: none;
  }
  .jx-file-native:focus-visible + .jx-file-btn {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-file.jx-invalid .jx-file-btn {
    border-style: dashed;
  }
  .jx-file-name {
    min-width: 0;
    max-width: 24ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }

  /* ---- error line -------------------------------------------------- */
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
    .jx-shell,
    .jx-file-btn {
      transition: none;
    }
  }
</style>
