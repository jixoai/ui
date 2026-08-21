<!--
  jixoai input (registry/files/ui/input.svelte).
  NativeHTML base field: the native <input> IS the contract — every type
  passes through untouched, no per-type wrappers. Rendering lanes by type:

    text-like (text/password/email/number/search/url/tel/date/time/...)
      1px var(--border) shell, var(--background) fill, radius 0; hover
      lifts one pixel (shadow-2xs), focus-visible takes the site's inset
      1px outline law (outline-offset: -1px on the ring token).
    checkbox / radio
      the NATIVE control kept verbatim + accent-color: var(--primary)
      (native a11y at zero cost). Label sits on the same row — side is
      configurable via labelSide ('left' | 'right', default right).
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
      bare passthrough, no chrome.

  Semantics added on top: label[for] (auto id via $props.id() when not
  supplied), error string → aria-invalid + aria-describedby + "! message"
  line + dashed control border. Everything else (placeholder, disabled,
  value, name, required, checked, accept, min/max/step…) flows through
  restProps onto the native element. Uncontrolled by design — read
  submitted values with FormData.
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends HTMLInputAttributes {
    /** any native input type (default 'text') */
    type?: string;
    /** field label; renders label[for] — same-row for checkbox/radio */
    label?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** checkbox/radio only: side of the control the label sits on */
    labelSide?: 'left' | 'right';
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    type = 'text',
    label,
    id = autoId,
    error,
    labelSide = 'right',
    class: className = '',
    ...rest
  }: Props = $props();

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  const isCheckable = $derived(type === 'checkbox' || type === 'radio');
  const isFile = $derived(type === 'file');
  const isHidden = $derived(type === 'hidden');
  const isRange = $derived(type === 'range');
  const isColor = $derived(type === 'color');

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
  <!-- hidden: bare native passthrough -->
  <input {id} {type} {...rest} />
{:else if isFile}
  <div class="jx-field">
    {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
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
  </div>
{:else if isCheckable}
  <div class="jx-field">
    <span class="jx-check" class:jx-check-left={labelSide === 'left'}>
      <input
        {id}
        {type}
        class="jx-native {className}"
        aria-invalid={invalidAttr}
        aria-describedby={describedBy}
        {...rest}
      />
      {#if label}<label class="jx-check-label" for={id}>{label}</label>{/if}
    </span>
    {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
  </div>
{:else}
  <div class="jx-field">
    {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
    {#if isRange}
      <input
        {id}
        {type}
        class="jx-native jx-range {className}"
        aria-invalid={invalidAttr}
        aria-describedby={describedBy}
        {...rest}
      />
    {:else if isColor}
      <input
        {id}
        {type}
        class="jx-color {className}"
        aria-invalid={invalidAttr}
        aria-describedby={describedBy}
        {...rest}
      />
    {:else}
      <input
        {id}
        {type}
        class="jx-text {className}"
        aria-invalid={invalidAttr}
        aria-describedby={describedBy}
        {...rest}
      />
    {/if}
    {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
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

  /* ---- text-like shell -------------------------------------------- */
  .jx-text {
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
    color-scheme: light;
    transition: box-shadow 150ms ease-out;
  }
  :global(.dark) .jx-text {
    color-scheme: dark;
  }
  .jx-text::placeholder {
    color: var(--muted-foreground);
    opacity: 1;
  }
  .jx-text:hover:not(:focus-visible) {
    box-shadow: var(--shadow-2xs);
  }
  /* the site focus law (terminal-header / language-switcher): an inset
     1px outline on the ring token — no layout shift, no clipping */
  .jx-text:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
    box-shadow: none;
  }
  .jx-text:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
  .jx-text[aria-invalid='true'] {
    border-style: dashed;
  }

  /* ---- native-accent family (checkbox / radio / range) ------------ */
  .jx-native {
    accent-color: var(--primary);
    margin: 0;
    cursor: pointer;
  }
  .jx-check .jx-native {
    width: 1rem;
    height: 1rem;
    flex: none;
  }
  /* the native control keeps its own rendering, so its focus outline
     sits OUTSIDE the tiny square — an inset ring would crowd the glyph */
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
  .jx-check {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    width: fit-content;
  }
  .jx-check-left {
    flex-direction: row-reverse;
  }
  .jx-check-label {
    font-size: 0.8125rem;
    color: var(--foreground);
    cursor: pointer;
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
    .jx-text,
    .jx-file-btn {
      transition: none;
    }
  }
</style>
