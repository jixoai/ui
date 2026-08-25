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
  import type { ItemFieldContext } from './item-field.svelte';
  import type { ItemLayout, ItemSize, ItemVariant } from './index';

  type ControlProps = Omit<
    ComponentProps<typeof Checkbox>,
    'label' | 'error' | 'labelSide' | 'id' | 'aria-labelledby' | 'aria-describedby' | 'class' | 'children' | 'size'
  >;

  interface Props extends Omit<ControlProps, 'checked' | 'indeterminate' | 'disabled'> {
    label: string;
    description?: string;
    error?: string;
    id?: string;
    labelMode?: 'for' | 'text';
    variant?: ItemVariant;
    size?: ItemSize;
    layout?: ItemLayout;
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
    variant = 'auto',
    size,
    layout = 'auto',
    disabled = false,
    class: className = '',
    checked = $bindable(false),
    indeterminate = false,
    ...controlProps
  }: Props = $props();
</script>

<ItemField
  {label}
  {description}
  {error}
  {id}
  {labelMode}
  {variant}
  {size}
  {layout}
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
