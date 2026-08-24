<!--
  jixoai radio (registry/files/ui/radio.svelte).
  Pure-CSS redraw of the native radio, daisyUI-style: the native
  <input type="radio"> keeps every behavior (same-name grouping, arrow-key
  walking, form participation) but appearance:none strips its paint, and a
  single ::after draws the selected dot — an 8px primary circle that
  scales 0 → 1 (150ms ease-out) inside the 16px ring. No font icon, no
  SVG, zero deps.

  States (same law as checkbox.svelte):
    unchecked    background shell + 1px border; hover leans the border
                 toward the brand primary
    :checked     primary border + 8px primary dot (::after scale-in)
    :disabled    opacity .5 + not-allowed
    focus-visible  the site law: inset 1px outline on the ring token

  Semantics: label[for] on the same row (side configurable via labelSide
  'left' | 'right', default right), error string → aria-invalid +
  aria-describedby + "! message" line + dashed border. Everything else
  (name, value, checked, disabled, required…) flows through restProps.
  Uncontrolled by design — read submitted values with FormData.
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends HTMLInputAttributes {
    /** same-row label; renders label[for] */
    label?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** side of the control the label sits on (default right) */
    labelSide?: 'left' | 'right';
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
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
</script>

<div class="jx-field">
  <span class="jx-check" class:jx-check-left={labelSide === 'left'}>
    <input
      {id}
      type="radio"
      class="jx-radio {className}"
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      {...rest}
    />
    {#if label}<label class="jx-check-label" for={id}>{label}</label>{/if}
  </span>
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

  /* ---- the ring: appearance-none, 16px circle, 1px border ---------- */
  .jx-radio {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    width: 1rem;
    height: 1rem;
    margin: 0;
    flex: none;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: var(--background);
    cursor: pointer;
    transition: border-color 150ms ease-out;
  }
  .jx-radio:hover:not(:checked):not(:disabled) {
    border-color: var(--primary);
  }
  .jx-radio:checked {
    border-color: var(--primary);
  }
  /* the site focus law: inset 1px outline on the ring token */
  .jx-radio:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-radio:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .jx-radio[aria-invalid='true'] {
    border-style: dashed;
  }

  /* ---- the dot: 8px primary circle, scale 0 → 1 -------------------- */
  .jx-radio::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    margin: -4px 0 0 -4px;
    border-radius: 50%;
    background: var(--primary);
    transform: scale(0);
    transition: transform 150ms ease-out;
  }
  .jx-radio:checked::after {
    transform: scale(1);
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
    .jx-radio,
    .jx-radio::after {
      transition: none;
    }
  }
</style>
