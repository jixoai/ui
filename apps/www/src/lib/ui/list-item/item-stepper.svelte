<!--
  jixoai ItemStepper (registry/files/ui/list-item/item-stepper.svelte,
  grindstone #17-3, 2026-09-13). The quantity settings row: ItemField +
  the existing NumberInput — the control keeps EVERY stepper behavior
  (hold acceleration 300ms→100ms, min/max clamp, step snap at the
  step's decimal precision, direct typing + native ↑/↓ as FIRST-CLASS
  paths — an upgrade over the display-only dock idiom, Owner ruling),
  disabled → readonly-not-disabled (AT stays able to read); this
  adapter wires ids/aria and the bounds. Reserved props are sealed by
  the compile-time Omit (openspec list-item-systemization design §3).
  The canvas-authored stepper trio retires INTO this adapter.

  No unit prop: the unit folds into the label ("Radius (px)" — the
  panel convention); min/max are explicit schema bounds, and the
  NumberInput's clamp absorbs the panel's step() helper.
-->
<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import NumberInput from '$lib/ui/number-input/number-input.svelte';
  import ItemField from './item-field.svelte';
  import type { ItemEndFit, ItemEndInset } from './item-end.svelte';
  import type { ItemFieldContext } from './item-field.svelte';
  import type { ItemLayout, ItemVariant } from './index';
  import type { Density } from '$lib/density.svelte';
  import { densityRungOf } from '$lib/defaults.svelte';
  import { ListItemDefaults } from './list-item-defaults.svelte';

  type ControlProps = Omit<
    ComponentProps<typeof NumberInput>,
    | 'label'
    | 'error'
    | 'id'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'class'
    | 'density'
    | 'value'
    | 'min'
    | 'max'
  >;

  interface Props extends Omit<ControlProps, 'disabled'> {
    label: string;
    /** decorative glyph inline-start of the label (grindstone #17-2) */
    icon?: Snippet;
    description?: string;
    error?: string;
    id?: string;
    /** 'for' (default — input[type=number] is labelable) | 'text' */
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
    /** committed quantity; bind:value — undefined renders empty */
    value?: number;
    /** lower bound; stepping and the change-commit clamp into it */
    min?: number;
    /** upper bound; stepping and the change-commit clamp into it */
    max?: number;
    /** step increment (default 1) */
    step?: number;
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
    value = $bindable(),
    min,
    max,
    step = 1,
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
    <NumberInput
      {...controlProps}
      bind:value
      {disabled}
      id={field.controlId}
      {min}
      {max}
      {step}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={field.describedBy}
      aria-labelledby={labelMode === 'text' ? field.labelId : undefined}
    />
  {/snippet}
</ItemField>
