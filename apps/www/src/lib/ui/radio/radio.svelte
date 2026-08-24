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

  tw4 (2026-08-24): static paint is token utilities in the markup; the
  .jx-field/.jx-label/.jx-error scaffolding is CONSUMED from the jx-pure
  sheet's Part A (Tier-2 consume-only law); only the dot build and the
  :checked/:hover state machine remain in radio.css (D1-exempt residue
  under the layer law).
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import './radio.css';

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
  <span
    class={cn(
      'jx-check inline-flex items-center gap-[0.6rem] w-fit',
      labelSide === 'left' && 'jx-check-left flex-row-reverse',
    )}
  >
    <input
      {id}
      type="radio"
      class={cn(
        'jx-radio appearance-none relative box-border w-4 h-4 m-0 flex-none border border-border rounded-full bg-background cursor-pointer transition-[border-color] duration-150 ease-out',
        className,
      )}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      {...rest}
    />
    {#if label}<label class="jx-check-label text-[0.8125rem] text-foreground cursor-pointer" for={id}>{label}</label>{/if}
  </span>
  {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
</div>
