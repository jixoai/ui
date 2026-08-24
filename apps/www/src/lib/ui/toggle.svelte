<!--
  jixoai toggle (registry/files/ui/toggle.svelte).
  A checkbox in its other posture: where checkbox sits inline-start of
  its label, toggle is the inline-end form — the label reads on the
  LEFT, the control lands on the RIGHT, and the state is a slide, not a
  glyph. Pure CSS, zero deps:

    <label> wraps everything (click anywhere toggles)
      <input type="checkbox">  visually hidden, keyboard-reachable,
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
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

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
</script>

<label for={id} class="jx-switch-track jx-toggle-{size} {className}" class:jx-toggle-disabled={disabled}>
  {#if label}<span class="jx-toggle-label">{label}</span>{/if}
  <input {id} type="checkbox" class="jx-toggle-native" bind:checked {disabled} {...rest} />
  <span class="jx-toggle-track" aria-hidden="true"><span class="jx-toggle-knob"></span></span>
</label>

<style>
  .jx-switch-track {
    /* geometry knobs (see the size table in the header comment) */
    --jx-toggle-w: 40px;
    --jx-toggle-h: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.6rem;
    width: fit-content;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
  }
  .jx-toggle-sm {
    --jx-toggle-w: 32px;
    --jx-toggle-h: 20px;
  }
  .jx-toggle-lg {
    --jx-toggle-w: 48px;
    --jx-toggle-h: 28px;
  }
  .jx-toggle-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .jx-toggle-label {
    font-size: 0.8125rem;
    color: var(--foreground);
  }

  /* ---- the visually-hidden native input (file-lane clip) ----------- */
  .jx-toggle-native {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* ---- the track: rounded rail, inset ring instead of border -------- */
  .jx-toggle-track {
    position: relative;
    flex: none;
    box-sizing: border-box;
    width: var(--jx-toggle-w);
    height: var(--jx-toggle-h);
    padding: 2px;
    border-radius: 9999px;
    background: var(--muted);
    box-shadow: 0 0 0 1px var(--border) inset;
    transition: background-color 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* ---- the knob: circle, slides by width − height ------------------- */
  .jx-toggle-knob {
    display: block;
    width: calc(var(--jx-toggle-h) - 4px);
    height: calc(var(--jx-toggle-h) - 4px);
    border-radius: 50%;
    background: var(--muted-foreground);
    transition:
      transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
      background-color 200ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }

  /* ---- checked: primary rail + primary-foreground knob -------------- */
  .jx-toggle-native:checked + .jx-toggle-track {
    background: var(--primary);
  }
  .jx-toggle-native:checked + .jx-toggle-track .jx-toggle-knob {
    background: var(--primary-foreground);
    transform: translateX(calc(var(--jx-toggle-w) - var(--jx-toggle-h)));
  }

  /* ---- affordances ----------------------------------------------------
     hover leans the unchecked rail's ring toward primary; the hidden
     input's focus-visible moves the site's inset ring law onto the
     track (sibling pair, same as :checked). */
  .jx-switch-track:not(.jx-toggle-disabled):hover:has(.jx-toggle-native:not(:checked)) .jx-toggle-track {
    box-shadow: 0 0 0 1px var(--primary) inset;
  }
  .jx-toggle-native:focus-visible + .jx-toggle-track {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-toggle-track,
    .jx-toggle-knob {
      transition: none;
    }
  }
</style>
