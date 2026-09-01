<!--
  jixoai toggle group item — native-html edition
  (registry/files/ui/toggle-group/toggle-group-item.svelte).

  The leaf of the family: a label>input+span pair reading the
  group's context — the caller's `value` IS the identity (no
  ordinal, no registration; keyed reorders are inert). The input is
  the real form control (radio in single mode, checkbox in
  multiple), visually hidden by the shared Part A `.jx-tgroup` law;
  the label IS the segment face; `:has()` paints every state.

  Spread contract: {...rest} lands on the INPUT FIRST — the
  part's own type/name/value/checked/disabled bindings follow and
  win, so a consumer spread can never sever the value law; consumer
  attributes (title/data-*/aria-*) still flow verbatim. Interactive
  descendants are banned inside the content (a label owns exactly
  one labelable — the input). Duplicate values inside one group are
  a contract violation (breaks radio identity and the projection).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { TOGGLE_GROUP_KEY, type ToggleGroupApi } from './toggle-group.svelte';

  interface Props extends HTMLInputAttributes {
    /** the segment's identity — the value that joins the form payload */
    value: string;
    disabled?: boolean;
    class?: string;
    /** optional content snippets inside the segment's span */
    slotStart?: Snippet;
    slotEnd?: Snippet;
    children: Snippet;
  }

  let {
    value,
    disabled = false,
    class: className = '',
    slotStart,
    slotEnd,
    children,
    ...rest
  }: Props = $props();

  const group = getContext<ToggleGroupApi>(TOGGLE_GROUP_KEY);
  if (!group) {
    throw new Error('jxoai toggle-group: ToggleGroupItem must live inside a ToggleGroup');
  }

  const active = $derived(group.isActive(value));
</script>

<label
  class={cn(
    // slot-lane law (badge dialect, 2026-09-01): a leading/trailing
    // icon lane replaces its side's label inset — has() rides the
    // label (the padding owner); the utility beats the shared
    // components-layer paint by layer order
    'jx-tgroup-item',
    'has-[[data-icon=inline-start]]:pl-[calc(var(--jx-inset)/2)] has-[[data-icon=inline-end]]:pr-[calc(var(--jx-inset)/2)]',
    className,
  )}
>
  <input
    {...rest}
    type={group.type === 'single' ? 'radio' : 'checkbox'}
    name={group.name}
    value={value}
    checked={active}
    disabled={group.disabled || disabled}
    required={group.required || undefined}
    data-jx-tgroup={active ? 'on' : undefined}
  />
  <span
    class={cn(
      'jx-tgroup-content',
      // flex only when lanes exist — text-only items keep the exact
      // anonymous-box rendering the shared sheet paints today
      (slotStart || slotEnd) && 'inline-flex items-center gap-[calc(var(--jx-gap)/2)]',
    )}
  >
    {#if slotStart}<span data-icon="inline-start" class="inline-flex [&>svg]:size-[var(--jx-text-secondary)]">{@render slotStart()}</span>{/if}
    {@render children()}
    {#if slotEnd}<span data-icon="inline-end" class="inline-flex [&>svg]:size-[var(--jx-text-secondary)]">{@render slotEnd()}</span>{/if}
  </span>
</label>
