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
      <label class={'jx-color-shell ' + className}>
        <input
          {id}
          {type}
          {...rest}
          value={controlled ? value : undefined}
          oninput={syncValue}
          class="jx-color-swatch"
          aria-invalid={invalidAttr}
          aria-describedby={describedBy}
        />
      </label>
    {:else}
      <!-- the shell owns the box law; the input inside is chromeless -->
      <div
        class={'jx-html-control-shell ' + className}
        class:jx-slotted={slotted}
        class:jx-invalid={invalid}
        class:jx-clearable={clearable}
      >
        {#if innerInlineStart}
          <span data-jx-slot class="flex-none inline-flex items-center gap-1.5 text-muted-foreground text-xs leading-none">{@render innerInlineStart()}</span>
        {/if}
        <input
          bind:this={inputEl}
          {id}
          {type}
          {...rest}
          value={controlled ? value : undefined}
          oninput={syncValue}
          class="jx-html-control-lane"
          aria-invalid={invalidAttr}
          aria-describedby={describedBy}
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
    {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
    {#if outerBlockEnd}<div data-jx-outer data-jx-outer-end class="text-muted-foreground text-xs -mt-1">{@render outerBlockEnd()}</div>{/if}
  </div>
{/if}
