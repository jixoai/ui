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
  import type { ItemEndFit, ItemEndInset } from './item-end.svelte';
  import type { ItemFieldContext } from './item-field.svelte';
  import type { ItemLayout, ItemVariant } from './index';
  import type { Density } from '$lib/density.svelte';
  import { ListItemDefaults } from './list-item-defaults.svelte';

  type ControlProps = Omit<
    ComponentProps<typeof NativeSelect>,
    'label' | 'error' | 'id' | 'aria-labelledby' | 'aria-describedby' | 'class' | 'children' | 'density' | 'value'
  >;

  interface Props extends Omit<ControlProps, 'disabled'> {
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
    variant,
    density,
    layout = 'auto',
    fit,
    inset,
    disabled = false,
    class: className = '',
    value = $bindable(),
    children,
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
