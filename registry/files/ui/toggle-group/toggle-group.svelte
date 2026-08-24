<!--
  jixoai toggle group (registry/files/ui/toggle-group.svelte).
  The joined-button set: a row of press-state buttons that submits as
  ONE form field. The group is not a single native control — exactly
  the case the jx-form-field bridge exists for:

    type="single"   one active button; the form receives its value
                    (or '' when none pressed)
    type="multiple" several active buttons; the form receives every
                    active value (FormData multi-entry, like a fieldset
                    of checkboxes)

  ARIA: role=group + aria-pressed buttons for BOTH modes — the valid,
  simple contract (arrow-key segmented walking is tabs' job, not a
  toggle set's). The single/multiple difference lives in the form
  payload and the press behavior, not in mismatched roles.

  Buttons are real <button aria-pressed> (the toolbar-toggle voice):
  Space/Enter toggle natively, Tab walks the row (a group is not a
  focus trap — arrows belong to tablists and menus, this is a simple
  control set). disabled dims the whole set; jx-reset clears it.

  tw4 (2026-08-24): static paint + hover/disabled states ride token
  utilities (deterministic per-state strings — the pressed repaint is
  a full branch, never two colliding utilities); ONLY the focus-visible
  ring stays in toggle-group.css — D1-exempt residue on the unlayered
  :where() carve-out (the toggle/Part A precedent).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import '$lib/form-field';
  import './toggle-group.css';

  interface ToggleGroupOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    /** form field name — the pressed value(s) submit under this name */
    name?: string;
    /** one value (single) or many (multiple) */
    type?: 'single' | 'multiple';
    options: ToggleGroupOption[];
    /** active value(s); bindable (bind:value) for controlled use */
    value?: string | string[];
    disabled?: boolean;
    /** nav landmark label — announced to assistive tech */
    label: string;
    class?: string;
    /** per-button content override (defaults to the option label) */
    item?: Snippet<[ToggleGroupOption, boolean]>;
    onchange?: (value: string | string[]) => void;
  }

  let {
    name,
    type = 'single',
    options,
    value = $bindable<string | string[]>([]),
    disabled = false,
    label,
    class: className = '',
    item,
    onchange,
  }: Props = $props();

  /** form/fieldset disable propagation (the bridge's jx-disabled) */
  let formDisabled = $state(false);
  const isDisabled = $derived(disabled || formDisabled);

  const activeValues = $derived(
    type === 'single'
      ? typeof value === 'string' && value !== ''
        ? [value]
        : []
      : Array.isArray(value)
        ? value
        : [],
  );

  const isActive = (option: ToggleGroupOption): boolean => activeValues.includes(option.value);

  function press(option: ToggleGroupOption): void {
    if (type === 'single') {
      const next = isActive(option) ? '' : option.value;
      value = next;
      onchange?.(next);
      return;
    }
    const next = isActive(option)
      ? activeValues.filter((v) => v !== option.value)
      : [...activeValues, option.value];
    value = next;
    onchange?.(next);
  }

  /** the bridge payload: single → one entry ('' when none); multiple →
   *  newline-joined, with multivalue so the bridge submits one FormData
   *  entry per active value (checkbox-set semantics) */
  const formValue = $derived(
    type === 'single' ? (activeValues[0] ?? '') : activeValues.join('\n'),
  );
</script>

<jx-form-field
  aria-hidden="true"
  {name}
  value={formValue}
  multivalue={type === 'multiple' || undefined}
  disabled={isDisabled || undefined}
  onjx-disabled={(e: CustomEvent<boolean>) => (formDisabled = e.detail)}
  onjx-reset={() => ((value = type === 'single' ? '' : []), undefined)}
></jx-form-field>

<div data-jx-tgroup class={cn('inline-flex flex-wrap border border-border rounded-(--radius) bg-card shadow-2xs w-fit', className)} role="group" aria-label={label}>
    {#each options as option (option.value)}
      <button
        type="button"
        data-jx-tgroup={isActive(option) ? 'on' : undefined}
        class={cn(
          'jx-tgroup-btn appearance-none cursor-pointer px-[0.875rem] py-[0.4375rem] border-r border-border font-nav text-xs tracking-[0.1em] uppercase last:border-r-0 transition-[color,background-color] duration-150 ease-out',
          isActive(option)
            ? 'bg-primary text-primary-foreground hover:not-disabled:text-primary-foreground'
            : 'bg-transparent text-muted-foreground hover:not-disabled:text-foreground',
          'disabled:opacity-45 disabled:cursor-not-allowed',
        )}
        aria-pressed={isActive(option)}
        disabled={isDisabled || option.disabled}
        onclick={() => press(option)}
      >
        {#if item}
          {@render item(option, isActive(option))}
        {:else}
          {option.label}
        {/if}
      </button>
    {/each}
  </div>
