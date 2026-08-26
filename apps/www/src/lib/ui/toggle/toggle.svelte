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

  tw4 (2026-08-24; mirror law 2026-08-27): the static paint (lane
  posture, sr-hidden driver, rail + knob builds, disabled dim) mirrors
  B13's switch law from toggle.css (@layer components :where(); the
  input carries role=switch — the B13 discriminator); the state
  machine (sibling :checked repaint, :has() hover lean, focus-visible
  ring, reduced-motion) rides the unlayered carve-out.
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
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
    /** density policy: explicit override, then inherited provider */
    density?: Density;
    'data-density'?: string;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    checked = $bindable(false),
    label,
    id = autoId,
    disabled = false,
    density,
    'data-density': _callerDensity,
    class: className = '',
    ...rest
  }: Props = $props();

  const inheritedDensity = getDensityContext();
  const resolvedDensity: Density = $derived(resolveDensity(density, inheritedDensity));
</script>

<label
  for={id}
  data-density={resolvedDensity}
  class={cn('jx-switch-track', disabled && 'jx-toggle-disabled', className)}
>
  {#if label}<span data-jx-toggle-label class="text-foreground">{label}</span>{/if}
  <input {id} type="checkbox" role="switch" class="jx-toggle-native" bind:checked {disabled} {...rest} />
  <span class="jx-toggle-track" aria-hidden="true"><span class="jx-toggle-knob"></span></span>
</label>
