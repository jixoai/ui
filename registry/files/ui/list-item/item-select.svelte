<!--
  jxoai ItemSelect (registry/files/ui/list-item/item-select.svelte).
  The select settings row: ItemField + the existing NativeSelect —
  the native popup, options snippet and keyboard story stay the
  select's; its duplicate label/error plumbing is reserved away.
-->
<script lang="ts" generics="T extends string | number">
  import type { ComponentProps, Snippet } from 'svelte';
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';
  import ItemField from './item-field.svelte';
  import type { ItemFieldContext } from './item-field.svelte';
  import type { ItemLayout, ItemVariant } from './index';
  import type { Density } from '$lib/density.svelte';

  type ControlProps = Omit<
    ComponentProps<typeof NativeSelect>,
    'label' | 'error' | 'id' | 'aria-labelledby' | 'aria-describedby' | 'class' | 'children' | 'size' | 'value'
  >;

  interface Props extends Omit<ControlProps, 'disabled'> {
    label: string;
    description?: string;
    error?: string;
    id?: string;
    labelMode?: 'for' | 'text';
    variant?: ItemVariant;
    size?: Density;
    layout?: ItemLayout;
    disabled?: boolean;
    class?: string;
    value?: T;
    /** the <option>/<optgroup> list, authored by the caller */
    children: Snippet;
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
    value = $bindable(),
    children,
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
    <NativeSelect
      {...controlProps}
      bind:value
      {disabled}
      id={field.controlId}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={field.describedBy}
      aria-labelledby={labelMode === 'text' ? field.labelId : undefined}
    >
      {@render children()}
    </NativeSelect>
  {/snippet}
</ItemField>
