<!--
  jixoai native-select (registry/files/ui/native-select.svelte).
  The SIMPLE-SCENARIO recommendation of the form family: form submission
  (a real name/value pair rides into FormData) and mobile (the platform's
  overlay picker beats any custom panel on touch). The native <select>
  stays fully native — the popup list, keyboard navigation, and type-ahead
  belong to the platform. The only paint is on the closed control:
  appearance-none strips the UA chrome and an absolutely-positioned inline
  SVG chevron (the same chevron path as language-switcher) stands in; the
  option popup keeps its native rendering (color-scheme follows the site
  theme). For a description-rich, fully-styled listbox see select.svelte
  (the Popover-based sibling); reach for that one only when the native
  popup can't say what you need.

  Same semantics law as input.svelte: label[for] block (auto id via
  $props.id()), error string → aria-invalid + aria-describedby +
  "! message" line + dashed border, inset 1px focus-visible outline on
  the ring token, hover lifts one pixel. Options arrive as the children
  snippet (<option>/<optgroup>); everything else (name, disabled,
  required, multiple, value…) flows through restProps.

  multiple: a native multiple select is a LIST BOX, not a button — the
  chevron and its right gutter disappear (:has(select[multiple])) and the
  control takes listbox geometry: taller default (about three visible
  rows — the rows attribute still sizes it through restProps), tighter
  block padding around the option stack, and a default cursor. Set
  <NativeSelect multiple size={n}> to control exactly how many rows the
  platform shows.
-->
<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  interface Props extends HTMLSelectAttributes {
    /** field label; renders label[for] above the control */
    label?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** the <option> / <optgroup> list, authored by the caller */
    children: Snippet;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    label,
    id = autoId,
    error,
    children,
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
  <span class="jx-select-wrap">
    <select
      {id}
      class="jx-select {className}"
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      {...rest}
    >
      {@render children()}
    </select>
    <svg
      class="jx-select-chevron"
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
  .jx-label {
    width: fit-content;
    font-family: var(--font-nav);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted-foreground);
    cursor: pointer;
  }
  .jx-select-wrap {
    position: relative;
    display: block;
    width: 100%;
  }
  .jx-select {
    width: 100%;
    min-height: 2.5rem;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    appearance: none;
    -webkit-appearance: none;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.45;
    color-scheme: light;
    cursor: pointer;
    transition: box-shadow 150ms ease-out;
  }
  :global(.dark) .jx-select {
    color-scheme: dark;
  }
  .jx-select:hover:not(:focus-visible) {
    box-shadow: var(--shadow-2xs);
  }
  /* the site focus law: inset 1px outline on the ring token */
  .jx-select:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
    box-shadow: none;
  }
  .jx-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .jx-select[aria-invalid='true'] {
    border-style: dashed;
  }
  .jx-select-chevron {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    width: 0.75rem;
    height: 0.75rem;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--muted-foreground);
  }
  /* a multiple select is a list box, not a button — no chevron, no right
     gutter, listbox geometry instead: ~3 visible rows tall by default
     (the rows attribute still sizes it through restProps), tighter block
     padding hugging the option stack, and a default cursor */
  .jx-select-wrap:has(select[multiple]) .jx-select-chevron {
    display: none;
  }
  .jx-select-wrap:has(select[multiple]) .jx-select {
    min-height: 5.75rem;
    padding: 0.375rem 0.5rem;
    cursor: default;
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
    .jx-select {
      transition: none;
    }
  }
</style>
