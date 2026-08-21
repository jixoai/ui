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
-->
<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  interface Props extends HTMLTextareaAttributes {
    /** field label; renders label[for] above the control */
    label?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    label,
    id = autoId,
    error,
    rows = 4,
    class: className = '',
    ...rest
  }: Props = $props();

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);
</script>

<div class="jx-field">
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <textarea
    {id}
    {rows}
    class="jx-textarea {className}"
    aria-invalid={invalidAttr}
    aria-describedby={describedBy}
    {...rest}
  ></textarea>
  {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
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
  .jx-textarea {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
    color-scheme: light;
    resize: vertical;
    transition: box-shadow 150ms ease-out;
  }
  :global(.dark) .jx-textarea {
    color-scheme: dark;
  }
  .jx-textarea::placeholder {
    color: var(--muted-foreground);
    opacity: 1;
  }
  .jx-textarea:hover:not(:focus-visible) {
    box-shadow: var(--shadow-2xs);
  }
  /* the site focus law: inset 1px outline on the ring token */
  .jx-textarea:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
    box-shadow: none;
  }
  .jx-textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
  .jx-textarea[aria-invalid='true'] {
    border-style: dashed;
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
    .jx-textarea {
      transition: none;
    }
  }
</style>
