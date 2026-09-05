<!--
  jixoai ItemCheckbox (registry/files/ui/list-item/item-checkbox.svelte).
  The checkbox settings row: ItemField + the existing Checkbox —
  native tri-state (checked/indeterminate) untouched; the control's
  duplicate label/error/labelSide plumbing is reserved away.
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Checkbox from '$lib/ui/checkbox/checkbox.svelte';
  import ItemField from './item-field.svelte';
  import type { ItemEndFit, ItemEndInset } from './item-end.svelte';
  import type { ItemFieldContext } from './item-field.svelte';
  import type { ItemLayout, ItemVariant } from './index';
  import type { Density } from '$lib/density.svelte';
  import { ListItemDefaults } from './list-item-defaults.svelte';

  type ControlProps = Omit<
    ComponentProps<typeof Checkbox>,
    'label' | 'error' | 'labelSide' | 'id' | 'aria-labelledby' | 'aria-describedby' | 'class' | 'children' | 'density'
  >;

  interface Props extends Omit<ControlProps, 'checked' | 'indeterminate' | 'disabled'> {
    label: string;
    description?: string;
    error?: string;
    id?: string;
    labelMode?: 'for' | 'text';
    variant?: ItemVariant;
    density?: Density;
    layout?: ItemLayout;
    /** the declared end-lane width ladder (size contract 2026-09-05) */
    fit?: ItemEndFit;
    /** the trailing-inset contract, forwarded to the end lane */
    inset?: ItemEndInset;
    disabled?: boolean;
    class?: string;
    checked?: boolean;
    indeterminate?: boolean;
  }

  let {
    label,
    description,
    error,
    id,
    labelMode = 'for',
    variant,
    density,
    layout = 'auto',
    fit,
    inset,
    disabled = false,
    class: className = '',
    checked = $bindable(false),
    indeterminate = false,
    ...controlProps
  }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 3.4, the X2-11 restate shape): the adapter resolves the
  // ambient policy once and hands ItemField the RESOLVED values
  const d = $derived(ListItemDefaults.resolve({ variant, density }));
</script>

<ItemField
  {label}
  {description}
  {error}
  {id}
  {labelMode}
  variant={d.variant}
  density={d.density}
  {layout}
  {fit}
  {inset}
  class={className}
>
  {#snippet control(field: ItemFieldContext)}
    <Checkbox
      {...controlProps}
      bind:checked
      {indeterminate}
      {disabled}
      id={field.controlId}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={field.describedBy}
      aria-labelledby={labelMode === 'text' ? field.labelId : undefined}
    />
  {/snippet}
</ItemField>
