<!--
  jixoai ItemRadio (registry/files/ui/list-item/item-radio.svelte).
  The radio settings row: ItemField + the existing Radio — same-name
  grouping and arrow-key walking stay the native input's; the
  two-way channel is `group` (Svelte's radio law: bind:group carries
  the selected VALUE — checked alone cannot bind on radios;
  uncontrolled callers keep using name/value form participation).
  The duplicate label/error/labelSide plumbing is reserved away.
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Radio from '$lib/ui/radio/radio.svelte';
  import ItemField from './item-field.svelte';
  import type { ItemFieldContext } from './item-field.svelte';
  import type { ItemLayout, ItemVariant } from './index';
  import type { Density } from '$lib/density.svelte';

  type ControlProps = Omit<
    ComponentProps<typeof Radio>,
    'label' | 'error' | 'labelSide' | 'id' | 'aria-labelledby' | 'aria-describedby' | 'class' | 'children' | 'density' | 'group'
  >;

  interface Props extends ControlProps {
    label: string;
    description?: string;
    error?: string;
    id?: string;
    labelMode?: 'for' | 'text';
    variant?: ItemVariant;
    density?: Density;
    layout?: ItemLayout;
    disabled?: boolean;
    class?: string;
    group?: string | number;
  }

  let {
    label,
    description,
    error,
    id,
    labelMode = 'for',
    variant = 'auto',
    density,
    layout = 'auto',
    disabled = false,
    class: className = '',
    group = $bindable(),
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
  {density}
  {layout}
  class={className}
>
  {#snippet control(field: ItemFieldContext)}
    <Radio
      {...controlProps}
      bind:group
      {disabled}
      id={field.controlId}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={field.describedBy}
      aria-labelledby={labelMode === 'text' ? field.labelId : undefined}
    />
  {/snippet}
</ItemField>
