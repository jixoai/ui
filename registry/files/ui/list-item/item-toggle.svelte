<!--
  jixoai ItemToggle (registry/files/ui/list-item/item-toggle.svelte).
  The toggle settings row: ItemField + the existing Toggle — the
  control keeps EVERY native behavior (keyboard, form participation,
  $bindable); this adapter only wires ids/aria and suppresses the
  control's own visible label. Reserved props are sealed by the
  compile-time Omit (openspec list-item-systemization design §3).
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Toggle from '$lib/ui/toggle/toggle.svelte';
  import ItemField from './item-field.svelte';
  import type { ItemFieldContext } from './item-field.svelte';
  import type { ItemLayout, ItemSize, ItemVariant } from './index';

  type ControlProps = Omit<
    ComponentProps<typeof Toggle>,
    'label' | 'id' | 'aria-labelledby' | 'aria-describedby' | 'class' | 'children'
  >;

  interface Props extends Omit<ControlProps, 'checked' | 'disabled' | 'size'> {
    label: string;
    description?: string;
    error?: string;
    id?: string;
    labelMode?: 'for' | 'text';
    variant?: ItemVariant;
    /** field density: omitted = nearest group's, then 'default' */
    size?: ItemSize;
    layout?: ItemLayout;
    disabled?: boolean;
    /** the Toggle's own footprint (sm/md/lg) — the field's density is `size` */
    controlSize?: 'sm' | 'md' | 'lg';
    class?: string;
    checked?: boolean;
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
    controlSize = 'md',
    class: className = '',
    checked = $bindable(false),
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
    <Toggle
      {...controlProps}
      bind:checked
      {disabled}
      size={controlSize}
      id={field.controlId}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={field.describedBy}
      aria-labelledby={labelMode === 'text' ? field.labelId : undefined}
    />
  {/snippet}
</ItemField>
