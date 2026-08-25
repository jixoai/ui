<!--
  jixoai toggle group item
  (registry/files/ui/toggle-group/toggle-group-item.svelte).
  The leaf of the family: a real <button aria-pressed> reading the
  group's context — the caller's `value` IS the identity (no ordinal,
  no registration; keyed reorders are inert). Space/Enter toggle
  natively through the group's value law (single swaps, multiple
  stacks); per-item `disabled` dims only this button on top of any
  group-level disable.

  tw4 (2026-08-24): static paint + hover/disabled states as token
  utilities (deterministic per-state strings — the pressed repaint is
  a full branch, never two colliding utilities); the focus-visible
  ring stays in toggle-group.css (D1-exempt residue).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { TOGGLE_GROUP_KEY, type ToggleGroupApi } from './toggle-group.svelte';
  import './toggle-group.css';

  interface Props extends HTMLButtonAttributes {
    /** the button's identity — the value that joins the form payload */
    value: string;
    disabled?: boolean;
    class?: string;
    children: Snippet;
  }

  let { value, disabled = false, class: className = '', children, ...rest }: Props = $props();

  const group = getContext<ToggleGroupApi>(TOGGLE_GROUP_KEY);
  if (!group) {
    throw new Error('jxoai toggle-group: ToggleGroupItem must live inside a ToggleGroup');
  }

  const active = $derived(group.isActive(value));
</script>

<button
  type="button"
  data-jx-tgroup={active ? 'on' : undefined}
  class={cn(
    'jx-tgroup-btn appearance-none cursor-pointer border-r border-border px-[0.875rem] py-[0.4375rem] font-nav text-xs uppercase tracking-[0.1em] last:border-r-0 transition-[color,background-color] duration-150 ease-out',
    active
      ? 'bg-primary text-primary-foreground hover:not-disabled:text-primary-foreground'
      : 'bg-transparent text-muted-foreground hover:not-disabled:text-foreground',
    'disabled:cursor-not-allowed disabled:opacity-45',
    className,
  )}
  aria-pressed={active}
  disabled={group.disabled || disabled}
  onclick={() => group.toggle(value)}
  {...rest}
>
  {@render children()}
</button>
