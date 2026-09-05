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
  import type { ItemEndFit, ItemEndInset } from './item-end.svelte';
  import type { ItemFieldContext } from './item-field.svelte';
  import type { ItemLayout, ItemVariant } from './index';
  import type { Density } from '$lib/density.svelte';
  import { ListItemDefaults } from './list-item-defaults.svelte';

  type ControlProps = Omit<
    ComponentProps<typeof Toggle>,
    'label' | 'id' | 'aria-labelledby' | 'aria-describedby' | 'class' | 'children' | 'size'
  >;

  interface Props extends Omit<ControlProps, 'checked' | 'disabled' | 'size' | 'density'> {
    label: string;
    description?: string;
    error?: string;
    id?: string;
    labelMode?: 'for' | 'text';
    variant?: ItemVariant;
    /** DENSITY override: omitted = nearest provider, then 'default' */
    density?: Density;
    layout?: ItemLayout;
    /** the declared end-lane width ladder (size contract 2026-09-05) */
    fit?: ItemEndFit;
    /** the trailing-inset contract, forwarded to the end lane */
    inset?: ItemEndInset;
    disabled?: boolean;
    class?: string;
    checked?: boolean;
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
    <Toggle
      {...controlProps}
      bind:checked
      {disabled}
      id={field.controlId}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={field.describedBy}
      aria-labelledby={labelMode === 'text' ? field.labelId : undefined}
    />
  {/snippet}
</ItemField>
