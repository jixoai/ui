<!--
  jixoai input group — the INPUT part (registry/files/ui/input-group/
  input-group-input.svelte, OpenSpec 2026-08-30-expand-form-family F2).

  The real <input> of the group — chromeless by construction: the
  Tier-2 lane (.jx-html-control-lane, consumed-only from the shared
  sheet) gives the bare field paint; the GROUP root owns the one bezel
  and its state machines, the addons own the seams. No per-part
  border, no focus ring, no shadow — the lane is the give-way child
  (min-width 0) in a flex row of add-ons.

  The house value law, verbatim: `value` is $bindable — bound ⇒
  controlled, absent ⇒ purely uncontrolled (Svelte skips undefined
  writes, so FormData and form.reset() keep native behavior). A
  caller-supplied oninput observes alongside the internal law (never
  instead of it).

  Disabled propagation: the group root's `disabled` forces this input
  native-disabled through the context; the input's OWN `disabled`
  stays per-part (addons keep working beside a disabled lane — the
  copy/check-button composition).
-->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { INPUT_GROUP_KEY, type InputGroupApi } from './input-group.svelte';

  interface Props extends HTMLInputAttributes {
    /** $bindable; bound ⇒ controlled, absent ⇒ purely uncontrolled */
    value?: string | number;
    class?: string;
  }

  let {
    value = $bindable<string | number>(),
    class: className = '',
    disabled,
    ...rest
  }: Props = $props();

  const group = getContext<InputGroupApi | undefined>(INPUT_GROUP_KEY);
  /** the ONE propagation rule meets the per-part rule: either the
      group or the input itself disables the lane */
  const effectiveDisabled = $derived(disabled === true || group?.disabled === true);

  const controlled = $derived(value != null);

  function syncValue(event: Event) {
    if (controlled) value = (event.currentTarget as HTMLInputElement).value;
    // forward a caller-supplied input handler from the rest props
    (rest as { oninput?: (event: Event) => void }).oninput?.(event);
  }
</script>

<input
  {...rest}
  data-jx-igroup-input
  class={cn('jx-html-control-lane min-w-0 flex-1 px-[var(--jx-inset)] py-0', className)}
  value={controlled ? value : undefined}
  disabled={effectiveDisabled || undefined}
  oninput={syncValue}
/>
