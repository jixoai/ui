<!--
  jixoai textarea (registry/files/ui/textarea.svelte).
  NativeHTML base textarea: the same text-shell law as input.svelte —
  1px var(--border), var(--background) fill, radius 0, hover lifts one
  pixel (shadow-2xs), focus-visible takes the site's inset 1px outline
  law (outline-offset: -1px on the ring token). resize: vertical is the
  ONLY allowed axis (never horizontal — it would break column rhythm).

  Same semantics law: label[for] block (auto id via $props.id()), error
  string → aria-invalid + aria-describedby + "! message" line + dashed
  border. rows defaults to 4; everything else (placeholder, maxlength,
  disabled, name, required…) flows through restProps.

  2026-08-20 · InputGroup slot system (original request: "实现 InputGroup
  槽位体系，升级 Input 和 TextArea 组件"). Six snippet slots — the block
  axis runs INSIDE the shell, the outer pair wraps it:

    outerBlockStart  outside, above — replaces the label row when given
    innerBlockStart  inside the shell, above the textarea (toolbar row,
                     behind a 1px var(--border) hairline)
    innerBlockEnd    inside the shell, below the textarea (status row /
                     count readout, behind its own hairline)
    outerBlockEnd    outside, below — the error line still renders above

  The shell — not the <textarea> — owns border/fill/hover/focus, so slot
  rows never repaint the box law; without inner slots the pixels are
  identical to the old single-<textarea> shell. Inner rows land muted at
  0.75rem; the wrapper is scoped, so override it with an important
  utility (text-foreground!) or an inline style. `count` appends a
  "N / maxLength" readout to inner-block-end (plain N without maxlength).
  `value` is $bindable: bound ⇒ controlled; absent ⇒ the field stays
  purely uncontrolled (Svelte skips undefined writes, so FormData and
  form.reset() keep native behavior); the count mirrors the DOM either
  way.
-->
<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  interface Props extends HTMLTextareaAttributes {
    /** field label; renders label[for] above the control.
        skipped when outerBlockStart takes the slot over */
    label?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** inner-block-end right side: "N / maxLength" readout */
    count?: boolean;
    /** inside the shell, above the textarea (toolbar row) */
    innerBlockStart?: Snippet;
    /** inside the shell, below the textarea (status row) */
    innerBlockEnd?: Snippet;
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
    label,
    id = autoId,
    error,
    count = false,
    innerBlockStart,
    innerBlockEnd,
    outerBlockStart,
    outerBlockEnd,
    value = $bindable(),
    rows = 4,
    class: className = '',
    ...rest
  }: Props = $props();

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  // ---- controlled / count plumbing --------------------------------------
  // liveValue mirrors the DOM only after real user input — the one piece
  // of state an uncontrolled field ever touches, never written back out.
  const controlled = $derived(value != null);
  let liveValue = $state<string | null>(null);

  const shownValue = $derived(liveValue ?? (controlled ? String(value) : ''));
  const slotted = $derived(Boolean(innerBlockStart || innerBlockEnd || count));
  const maxLen = $derived(typeof rest.maxlength === 'number' && rest.maxlength > 0 ? rest.maxlength : null);
  const countLabel = $derived(maxLen != null ? `${shownValue.length} / ${maxLen}` : `${shownValue.length}`);

  function syncValue(event: Event) {
    const el = event.currentTarget as HTMLTextAreaElement;
    liveValue = el.value;
    if (controlled) value = el.value;
    // forward a caller-supplied input handler from the rest props
    (rest as { oninput?: (event: Event) => void }).oninput?.(event);
  }
</script>

<div class="jx-field">
  {#if outerBlockStart}
    <div class="jx-outer jx-outer-start">{@render outerBlockStart()}</div>
  {:else if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <!-- the shell owns the box law; the textarea inside is chromeless -->
  <div class="jx-shell {className}" class:jx-slotted={slotted} class:jx-invalid={invalid}>
    {#if innerBlockStart}
      <div class="jx-inner jx-inner-start">{@render innerBlockStart()}</div>
    {/if}
    <textarea
      {id}
      {rows}
      {...rest}
      value={controlled ? value : undefined}
      oninput={syncValue}
      class="jx-textarea"
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
    ></textarea>
    {#if innerBlockEnd || count}
      <div class="jx-inner jx-inner-end">
        {#if innerBlockEnd}{@render innerBlockEnd()}{/if}
        {#if count}<span class="jx-count">{countLabel}</span>{/if}
      </div>
    {/if}
  </div>
  {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
  {#if outerBlockEnd}<div class="jx-outer jx-outer-end">{@render outerBlockEnd()}</div>{/if}
</div>

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

  /* ---- the shell ------------------------------------------------------
     owns border/fill/hover/focus; the <textarea> inside is chromeless.
     Without inner rows the pixels are identical to the old shell. */
  .jx-shell {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color-scheme: light;
    transition: box-shadow 150ms ease-out;
  }
  :global(.dark) .jx-shell {
    color-scheme: dark;
  }
  .jx-shell:not(:has(textarea:disabled)):hover:not(:has(:focus-visible)) {
    box-shadow: var(--shadow-2xs);
  }
  /* the site focus law: inset 1px outline on the ring token — the shell
     carries it for the textarea AND for slot controls alike */
  .jx-shell:has(:focus-visible) {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
    box-shadow: none;
  }
  .jx-shell.jx-invalid {
    border-style: dashed;
  }
  .jx-shell:has(textarea:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
  /* inner rows present → the shell carries the horizontal padding and
     the textarea runs edge-to-edge above/below the hairlines */
  .jx-shell.jx-slotted {
    padding-inline: 0.75rem;
  }
  .jx-textarea {
    width: 100%;
    flex: 1 1 auto;
    padding: 0.5rem 0.75rem;
    border: none;
    outline: none;
    background: transparent;
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
    resize: vertical;
  }
  .jx-shell.jx-slotted .jx-textarea {
    padding-inline: 0;
  }
  .jx-textarea::placeholder {
    color: var(--muted-foreground);
    opacity: 1;
  }
  .jx-textarea:disabled {
    cursor: not-allowed;
  }

  /* ---- inner snippet rows --------------------------------------------
     toolbar above / status below, each behind its own 1px hairline */
  .jx-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-block: 0.375rem;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
  .jx-inner-start {
    border-bottom: 1px solid var(--border);
  }
  .jx-inner-end {
    border-top: 1px solid var(--border);
  }
  .jx-count {
    margin-inline-start: auto;
    font-family: var(--font-nav);
    font-size: 11px;
    letter-spacing: 0.08em;
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
    .jx-shell {
      transition: none;
    }
  }
</style>
