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

  tw4 (2026-08-24): static paint is token utilities in the markup; the
  .jx-field/.jx-label/.jx-error scaffolding is CONSUMED from the jx-pure
  sheet's Part A (Tier-2 consume-only law); only the glyph build and the
  :checked/:indeterminate/:hover state machine remain in checkbox.css
  (D1-exempt residue under the layer law).
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import './checkbox.css';

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

<!-- bare posture: with no label/error to stack, the field wrapper
     is dead weight — a w-fit inline host instead (inside list-item end
     lanes the control must sit at inline-END, not stretch the lane) -->
<div class={cn(!label && !error ? 'inline-flex w-fit' : 'jx-field')}>
  <span
    data-jx-check
    data-jx-check-left={labelSide === 'left' ? '' : undefined}
    class={cn(
      'inline-flex items-center gap-[0.6rem] w-fit',
      labelSide === 'left' && 'flex-row-reverse',
    )}
  >
    <input
      bind:this={el}
      {id}
      type="checkbox"
      bind:checked
      class={cn(
        'jx-checkbox appearance-none relative box-border w-4 h-4 m-0 flex-none border border-border rounded-none bg-background cursor-pointer transition-[background-color,border-color] duration-150 ease-out',
        className,
      )}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      {...rest}
    />
    {#if label}<label data-jx-check-label class="text-[0.8125rem] text-foreground cursor-pointer" for={id}>{label}</label>{/if}
  </span>
  {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
</div>
