<!--
  jixoai ItemInput (registry/files/ui/list-item/item-input.svelte).
  The input settings row: ItemField + the existing Input — native
  type/value/validation untouched; the duplicate label/error
  plumbing is reserved away.
-->
<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import Input from '$lib/ui/input/input.svelte';
  import ItemField from './item-field.svelte';
  import type { ItemEndFit, ItemEndInset } from './item-end.svelte';
  import type { ItemFieldContext } from './item-field.svelte';
  import type { ItemLayout, ItemVariant } from './index';
  import type { Density } from '$lib/density.svelte';
  import { densityRungOf } from '$lib/defaults.svelte';
  import { ListItemDefaults } from './list-item-defaults.svelte';

  type ControlProps = Omit<
    ComponentProps<typeof Input>,
    | 'label'
    | 'error'
    | 'id'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'class'
    | 'children'
    | 'density'
    | 'value'
    | 'type'
    | 'icon'
  >;

  interface Props extends Omit<ControlProps, 'disabled'> {
    label: string;
    /** decorative glyph inline-start of the LABEL (grindstone #17-2) —
     *  NOT the Input shell's semantic glyph, which is sealed away from
     *  the adapter surface (the family's one-name law: icon is the
     *  field lane's) */
    icon?: Snippet;
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
    type?: string;
    value?: string | number;
  }

  let {
    label,
    icon,
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
    type = 'text',
    value = $bindable(),
    ...controlProps
  }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 3.4, the X2-11 restate shape): the adapter resolves the
  // ambient policy once and hands ItemField the RESOLVED values
  const d = $derived(ListItemDefaults.resolve({ variant, density }));
</script>

<ItemField
  {label}
  {icon}
  {description}
  {error}
  {id}
  {labelMode}
  variant={d.variant}
  density={densityRungOf(d.density)}
  {layout}
  {fit}
  {inset}
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
