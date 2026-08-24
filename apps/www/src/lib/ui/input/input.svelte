<!--
  jixoai input (registry/files/ui/input.svelte).
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
      the Tier-1 pure-CSS slider (.jx-range in the jx-pure sheet):
      bordered thin track, square primary thumb, hover lift / press.
    color
      the Tier-1 color field (.jx-color-field wrapper + .jx-color
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
  wrapper is scoped, so override it with an important utility
  (text-foreground!) or an inline style. Overflow law for narrow hosts:
  the field shrinks (min-width 0) and the shell clamps (max-width
  100%) — inner slots keep flex:none while the input lane gives way,
  so a 390px viewport compresses the text lane, never the container.
  `clearable` adds an × button in
  the inline-end area: it clears the DOM value, syncs the bound value and
  re-emits `input` + a bubbling `clear` event. `value` is $bindable:
  bound ⇒ controlled; absent ⇒ the field stays purely uncontrolled
  (Svelte skips undefined writes, so FormData and form.reset() keep
  native behavior).
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { icons } from '$lib/icons';
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
</script>

{#if isHidden}
  <!-- hidden: bare native passthrough (value rides as a plain attribute) -->
  <input {id} {type} {value} {...rest} />
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
        class="jx-range {className}"
        aria-invalid={invalidAttr}
        aria-describedby={describedBy}
      />
    {:else if isColor}
      <!-- Tier-1 color field: the label wrapper opens the picker from the
           glyph zone too; the input is the locked square swatch lane.
           className lands on the WRAPPER (the shell-law owner, same as
           the text lane's .jx-field-shell) — pass jx-color-stretch for
           the full-row field (default is the compact 5rem swatch). -->
      <label class="jx-color-field {className}">
        <input
          {id}
          {type}
          {...rest}
          value={controlled ? value : undefined}
          oninput={syncValue}
          class="jx-color"
          aria-invalid={invalidAttr}
          aria-describedby={describedBy}
        />
      </label>
    {:else}
      <!-- the shell owns the box law; the input inside is chromeless -->
      <div class="jx-field-shell {className}" class:jx-slotted={slotted} class:jx-invalid={invalid} class:jx-clearable={clearable}>
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
          class="jx-input-lane"
          aria-invalid={invalidAttr}
          aria-describedby={describedBy}
        />
        {#if innerInlineEnd}
          <span class="jx-slot">{@render innerInlineEnd()}</span>
        {/if}
        {#if showClear}
          <button type="button" class="jx-clear" aria-label="clear value" onclick={clearValue}>
            <!-- the shared inline icon set — 10px inside the 1.125rem hit area -->
            {@html icons.x}
          </button>
        {/if}
      </div>
    {/if}
    {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
    {#if outerBlockEnd}<div class="jx-outer jx-outer-end">{@render outerBlockEnd()}</div>{/if}
  </div>
{/if}

<style>
  /* Tier rebase (2026-08-23): the field scaffolding (.jx-field /
     .jx-label / .jx-error), the shell laws (.jx-field-shell +
     slotted/invalid/disabled/focus states), the chromeless lane
     (.jx-input-lane), the range slider (.jx-range) and the color field
     (.jx-color-field / .jx-color) all live in the Tier-1 jx-pure
     sheet now. Component-owned below: the snippet-slot system, the
     clear button, and the outer slot spacing. */

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
  .jx-clear svg {
    width: 10px;
    height: 10px;
  }
  .jx-clear:hover {
    color: var(--foreground);
  }
  .jx-clear:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  /* the native search decoration bows out when our own × is on duty */
  .jx-field-shell.jx-clearable .jx-input-lane::-webkit-search-cancel-button {
    display: none;
  }
</style>
