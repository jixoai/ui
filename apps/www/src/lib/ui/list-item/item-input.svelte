<!--
  jixoai ItemInput (registry/files/ui/list-item/item-input.svelte).
  The input settings row: ItemField + the existing Input — native
  type/value/validation untouched; the duplicate label/error
  plumbing is reserved away.
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Input from '$lib/ui/input/input.svelte';
  import ItemField from './item-field.svelte';
  import type { ItemFieldContext } from './item-field.svelte';
  import type { ItemLayout, ItemSize, ItemVariant } from './index';

  type ControlProps = Omit<
    ComponentProps<typeof Input>,
    'label' | 'error' | 'id' | 'aria-labelledby' | 'aria-describedby' | 'class' | 'children' | 'size' | 'value' | 'type'
  >;

  interface Props extends Omit<ControlProps, 'disabled'> {
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
    type?: string;
    value?: string | number;
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
    type = 'text',
    value = $bindable(),
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
  {disabled}
  class={className}
>
  {#snippet control(field: ItemFieldContext)}
    <Input
      {...controlProps}
      bind:value
      {type}
      {disabled}
      id={field.controlId}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={field.describedBy}
      aria-labelledby={labelMode === 'text' ? field.labelId : undefined}
    />
  {/snippet}
</ItemField>
