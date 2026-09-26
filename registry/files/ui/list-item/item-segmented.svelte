<!--
  jixoai ItemSegmented (registry/files/ui/list-item/item-segmented.svelte,
  grindstone #17-3, 2026-09-13). The segmented settings row: ItemField +
  the existing ToggleGroup locked to single mode — the control keeps
  EVERY native radio behavior (arrow-walk, ONE tab stop, form
  participation, no re-press clear — an explicit none item is the
  pattern); this adapter wires ids/aria, the options lane, and the
  value callback. Reserved props are sealed by the compile-time Omit
  (openspec list-item-systemization design §3). The canvas-authored
  aria-pressed button rows retire INTO this adapter (native contract
  fusion — the dock's own comment called it "without a registry
  adapter yet").

  No labelMode prop: a radiogroup is not labelable — the wiring is
  ALWAYS 'text' (span label + aria-labelledby), ItemField's law for
  non-labelable controls.

  value channel: one-way down + onValueChange up (the group's value
  union is string | string[]; the adapter narrows to single's string
  without a cast seam — typeof guard, honest at runtime).
-->
<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';
  import ToggleGroup from '$lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '$lib/ui/toggle-group/toggle-group-item.svelte';
  import ItemField from './item-field.svelte';
  import type { ItemEndFit, ItemEndInset } from './item-end.svelte';
  import type { ItemFieldContext } from './item-field.svelte';
  import type { ItemLayout, ItemVariant } from './index';
  import type { Density } from '$lib/density.svelte';
  import { densityRungOf } from '$lib/defaults.svelte';
  import { ListItemDefaults } from './list-item-defaults.svelte';

  type ControlProps = Omit<
    ComponentProps<typeof ToggleGroup>,
    | 'label'
    | 'name'
    | 'type'
    | 'value'
    | 'class'
    | 'children'
    | 'onchange'
    | 'onValueChange'
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'density'
  >;

  interface Props extends Omit<ControlProps, 'disabled'> {
    label: string;
    /** decorative glyph inline-start of the label (grindstone #17-2) */
    icon?: Snippet;
    description?: string;
    error?: string;
    id?: string;
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
    /** the active segment's value; bind:value (single mode ⇒ string) */
    value?: string;
    /** data-driven segments (the enum ≤5 main path); the item's content
     *  IS its value — richer faces compose through children instead */
    options?: readonly { value: string }[];
    /** escape hatch: hand-composed ToggleGroupItem children
     *  (composition-first family syntax) */
    children?: Snippet;
    /** fires with the newly active value alongside the value write */
    onValueChange?: (value: string) => void;
  }

  let {
    label,
    icon,
    description,
    error,
    id,
    variant,
    density,
    layout = 'auto',
    fit,
    inset,
    disabled = false,
    class: className = '',
    value = $bindable(''),
    options,
    children,
    onValueChange,
    ...controlProps
  }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 3.4, the X2-11 restate shape): the adapter resolves the
  // ambient policy once and hands ItemField the RESOLVED values
  const d = $derived(ListItemDefaults.resolve({ variant, density }));

  // single mode's projection is always a string; the guard is the
  // honest narrowing (the group's union stays the group's)
  function forwardValue(next: string | string[]): void {
    if (typeof next !== 'string') return;
    value = next;
    onValueChange?.(next);
  }
</script>

<ItemField
  {label}
  {icon}
  {description}
  {error}
  {id}
  labelMode="text"
  variant={d.variant}
  density={densityRungOf(d.density)}
  {layout}
  {fit}
  {inset}
  class={className}
>
  {#snippet control(field: ItemFieldContext)}
    <ToggleGroup
      {...controlProps}
      type="single"
      name={field.controlId}
      value={value}
      {disabled}
      {label}
      aria-labelledby={field.labelId}
      aria-describedby={field.describedBy}
      aria-invalid={error ? 'true' : undefined}
      onValueChange={forwardValue}
    >
      {#if children}
        {@render children()}
      {:else}
        {#each options ?? [] as opt (opt.value)}
          <ToggleGroupItem value={opt.value}>{opt.value}</ToggleGroupItem>
        {/each}
      {/if}
    </ToggleGroup>
  {/snippet}
</ItemField>
