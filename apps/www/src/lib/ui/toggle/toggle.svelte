<!--
  jixoai toggle (registry/files/ui/toggle/toggle.svelte).
  A checkbox in its other posture: where checkbox sits inline-start of
  its label, toggle is the inline-end form — the label reads on the
  LEFT, the control lands on the RIGHT, and the state is a slide, not a
  glyph. Pure CSS, zero deps:

    <label> wraps everything (click anywhere toggles)
      <input type="checkbox">  visually hidden (sr-only), keyboard-reachable,
                               carries the native semantics + FormData
      <span class="jx-toggle-track">  the rounded rail, repainted through
                               the input:checked + track sibling pair
        <span class="jx-toggle-knob">  the circular slider, translateX'd
                               by track-width − track-height

  Geometry is two custom properties so sizes stay proportional:
               sm      md (default)   lg
    track      28×16    36×20          44×24
    knob       12       16             20     (= height − 4)
    travel     12       16             20     (= width − height)

  Colors: unchecked = muted rail + muted-foreground knob; checked =
  primary rail + primary-foreground knob. The 1px edge is an INSET
  box-shadow ring (not a border) so the knob keeps the full 2px inset.
  Slide motion 200ms cubic-bezier(0.22, 1, 0.36, 1); focus-visible
  moves the site's inset ring law onto the track; reduced-motion kills
  the transitions.

  checked is $bindable (controlled-friendly); everything else (name,
  value, required, onchange…) flows through restProps onto the hidden
  input — a named toggle participates in FormData like any checkbox.

  tw4 (2026-08-24): static paint is token utilities in the markup
  (sizes ride arbitrary-property utilities); ONLY the state machine
  (sibling :checked repaint, :has() hover lean, focus-visible ring,
  reduced-motion) remains in toggle.css — D1-exempt residue under the
  layer law.
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import './toggle.css';

  interface Props extends HTMLInputAttributes {
    /** toggle state; bindable (bind:checked) for controlled use */
    checked?: boolean;
    /** reads on the LEFT of the control (inline-end posture) */
    label?: string;
    /** lands on the hidden input; auto-generated when omitted */
    id?: string;
    disabled?: boolean;
    /** sm 28×16 · md 36×20 (default) · lg 44×24 */
    size?: 'sm' | 'md' | 'lg';
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    checked = $bindable(false),
    label,
    id = autoId,
    disabled = false,
    size = 'md',
    class: className = '',
    ...rest
  }: Props = $props();

  const sizeUtilities = {
    sm: '[--jx-toggle-w:32px] [--jx-toggle-h:20px]',
    md: '[--jx-toggle-w:36px] [--jx-toggle-h:20px]',
    lg: '[--jx-toggle-w:44px] [--jx-toggle-h:24px]',
  } as const;
</script>

<label
  for={id}
  class={cn(
    'jx-switch-track inline-flex items-center justify-end gap-[0.6rem] w-fit cursor-pointer select-none',
    sizeUtilities[size],
    'jx-toggle-{size}',
    disabled && 'jx-toggle-disabled opacity-50 cursor-not-allowed',
    className,
  )}
>
  {#if label}<span class="jx-toggle-label text-[0.8125rem] text-foreground">{label}</span>{/if}
  <input {id} type="checkbox" class="jx-toggle-native sr-only" bind:checked {disabled} {...rest} />
  <span
    class="jx-toggle-track relative flex-none box-border p-[2px] rounded-full bg-muted w-(--jx-toggle-w) h-(--jx-toggle-h) shadow-[inset_0_0_0_1px_var(--border)] transition-[background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
    aria-hidden="true"
    ><span
      class="jx-toggle-knob block rounded-full bg-muted-foreground w-[calc(var(--jx-toggle-h)-4px)] h-[calc(var(--jx-toggle-h)-4px)] transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
    ></span></span>
</label>
