<!--
  jixoai radio (registry/files/ui/radio/radio.svelte).
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
  Uncontrolled when `group` is unbound — read submitted values with FormData; bind:group for the two-way selected value.

  tw4 (2026-08-24; mirror law 2026-08-27): static paint (the ring, the
  lane, the label voice) mirrors jx-pure.css Part B B5's radio law from
  radio.css (@layer components :where() mirror rules; sizes from
  --jx-icon, border-radius 50% per the dot law); the
  .jx-field/.jx-label/.jx-error scaffolding is CONSUMED from the jx-pure
  sheet's Part A (Tier-2 consume-only law). The dot build and the
  :checked/:hover state machine remain in radio.css's carve-out layers
  (D1-exempt residue under the layer law); the labelSide='left' posture
  rides the data-jx-check-left hook as a mirror modifier. Markup keeps
  only the css hooks and the consumer class merge point.
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
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
    /** $bindable two-way selected VALUE (Svelte's radio channel:
        bind:group — checked alone cannot bind on radios) */
    group?: string | number;
    /** density policy: explicit override, then inherited provider */
    density?: Density;
    'data-density'?: string;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    label,
    id = autoId,
    error,
    labelSide = 'right',
    group = $bindable(),
    density,
    'data-density': _callerDensity,
    class: className = '',
    ...rest
  }: Props = $props();

  const inheritedDensity = getDensityContext();
  const resolvedDensity: Density = $derived(resolveDensity(density, inheritedDensity));

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);
</script>

<!-- bare posture: with no label/error to stack, the field wrapper
     is dead weight — a w-fit inline host instead (inside list-item end
     lanes the control must sit at inline-END, not stretch the lane) -->
<div data-density={resolvedDensity} class={cn(!label && !error ? 'inline-flex w-fit' : 'jx-field')}>
  <span
    data-jx-check
    data-jx-check-left={labelSide === 'left' ? '' : undefined}
    class="jx-check-lane"
  >
    <input
      {id}
      type="radio"
      bind:group
      class={cn('jx-radio', className)}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      {...rest}
    />
    {#if label}<label data-jx-check-label for={id}>{label}</label>{/if}
  </span>
  {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
</div>
