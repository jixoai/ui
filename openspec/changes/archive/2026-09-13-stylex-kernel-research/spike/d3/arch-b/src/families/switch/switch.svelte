<script lang="ts">
  // switch.svelte — the toggle family re-authored. DOM isomorphism kept
  // (the state-machine carve-out family): ONE input[type=checkbox]
  // [role=switch], label rendered as a sibling <label for>.
  import * as stylex from '@stylexjs/stylex';

  // class-string composition: 0.19.0 exposes no callable type on the
  // namespace (runtime-only call signature); attrs().class is the typed form
  const sx = (...args: Parameters<typeof stylex.attrs>) => stylex.attrs(...args).class;
  import { switchStyles as s } from './switch.stylex';
  const labelClass = sx(s.label);

  interface Props {
    checked?: boolean;
    label?: string;
    id?: string;
    disabled?: boolean;
    onchange?: (e: Event) => void;
    [key: string]: unknown;
  }

  let { checked = $bindable(false), label, id, disabled = false, ...rest }: Props = $props();
  const autoId = $props.id();
  const resolvedId = $derived(id ?? autoId);
</script>

{#if label}
  <label for={resolvedId} data-jx-toggle-label class={labelClass}>{label}</label>
{/if}
<input
  {...rest}
  id={resolvedId}
  type="checkbox"
  role="switch"
  data-jx-switch=""
  data-jx-switch-state={checked ? 'checked' : 'unchecked'}
  class={sx(s.track, s.knob)}
  bind:checked
  {disabled}
/>
