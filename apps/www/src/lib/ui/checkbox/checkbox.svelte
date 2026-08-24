<!--
  jixoai checkbox (registry/files/ui/checkbox.svelte).
  Pure-CSS redraw of the native checkbox, daisyUI-style: the native
  <input type="checkbox"> keeps every behavior (form participation,
  keyboard toggling, :checked/:indeterminate state) but appearance:none
  strips its paint, and a single ::before draws the glyph — a clip-path
  polygon on a 45°-rotated box (no font icon, no SVG, zero deps).

  States:
    unchecked    background shell + 1px border; hover leans the border
                 toward the brand primary
    :checked     primary fill + white check (the polygon grows from a
                 collapsed sliver, 150ms ease-out)
    :indeterminate  primary fill + white dash (rotate resets to 0deg,
                 same 6-vertex polygon — so it morphs cleanly)
    :disabled    opacity .5 + not-allowed
    focus-visible  the site law: inset 1px outline on the ring token

  Same semantics law as input.svelte: label[for] on the same row (side
  configurable via labelSide 'left' | 'right', default right), error
  string → aria-invalid + aria-describedby + "! message" line + dashed
  border. `indeterminate` is an IDL property, not a reflected attribute,
  so the prop lands on the element via $effect. Everything else (name,
  value, checked, disabled, required…) flows through restProps.
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
    /** tri-state: lands on the element's indeterminate IDL property */
    indeterminate?: boolean;
    /** $bindable; bound ⇒ controlled two-way, absent ⇒ uncontrolled */
    checked?: boolean;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    label,
    id = autoId,
    error,
    labelSide = 'right',
    indeterminate = false,
    checked = $bindable(),
    class: className = '',
    ...rest
  }: Props = $props();

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  // :indeterminate CSS needs the IDL property — the attribute never
  // reflects, so the prop is pushed onto the element on every change
  let el = $state<HTMLInputElement>();
  $effect(() => {
    if (el) el.indeterminate = indeterminate;
  });
</script>

<div class="jx-field">
  <span class="jx-check" class:jx-check-left={labelSide === 'left'}>
    <input
      bind:this={el}
      {id}
      type="checkbox"
      bind:checked
      class="jx-checkbox {className}"
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

  /* ---- the box: appearance-none, 16px square, 1px border ----------- */
  .jx-checkbox {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    width: 1rem;
    height: 1rem;
    margin: 0;
    flex: none;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    cursor: pointer;
    transition:
      background-color 150ms ease-out,
      border-color 150ms ease-out;
  }
  .jx-checkbox:hover:not(:checked):not(:disabled) {
    border-color: var(--primary);
  }
  .jx-checkbox:checked,
  .jx-checkbox:indeterminate {
    background: var(--primary);
    border-color: var(--primary);
  }
  /* the site focus law: inset 1px outline on the ring token */
  .jx-checkbox:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-checkbox:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .jx-checkbox[aria-invalid='true'] {
    border-style: dashed;
  }

  /* ---- the glyph: one ::before, clip-path + rotate ------------------
     a 10×10 box (inset 2px inside the 14px padding box) rotated 45°,
     clipped to a 6-vertex polygon. unchecked = collapsed sliver +
     opacity 0; checked = the check grows upward (vertices D/E travel
     80%→0%); indeterminate = rotate back to 0 and morph into a
     horizontal bar. Same vertex count everywhere so CSS interpolates. */
  .jx-checkbox::before {
    content: '';
    position: absolute;
    inset: 2px;
    display: block;
    background: var(--primary-foreground);
    opacity: 0;
    transform: rotate(45deg);
    clip-path: polygon(20% 100%, 20% 80%, 50% 80%, 50% 80%, 70% 80%, 70% 100%);
    transition:
      clip-path 150ms ease-out,
      opacity 150ms ease-out,
      transform 150ms ease-out;
  }
  .jx-checkbox:checked::before {
    opacity: 1;
    clip-path: polygon(20% 100%, 20% 80%, 50% 80%, 50% 0%, 70% 0%, 70% 100%);
  }
  .jx-checkbox:indeterminate::before {
    opacity: 1;
    transform: rotate(0deg);
    clip-path: polygon(10% 40%, 10% 60%, 45% 60%, 55% 60%, 90% 60%, 90% 40%);
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
    .jx-checkbox,
    .jx-checkbox::before {
      transition: none;
    }
  }
</style>
